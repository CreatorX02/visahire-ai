import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/openai'

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
]

const VISA_KEYWORDS = [
  'visa sponsorship', 'will sponsor', 'h-1b', 'h1b', 'tier 2 visa', 'work permit',
  'relocation package', 'sponsorship available', 'visa supported', 'immigration support',
  'work authorization', 'sponsor work', 'visa provided', 'h1 sponsor',
]

interface ScrapedJob {
  title: string
  company: string
  location?: string
  country?: string
  isRemote: boolean
  jobUrl: string
  description: string
  requirements?: string
  jobType?: string
  experienceLevel?: string
  postedDate?: string
  tags: string[]
  category?: string
}

export async function runScrapers() {
  console.log('[Scraper] Starting scrape cycle...')

  await prisma.agentActivity.create({
    data: { agentType: 'scraper', action: 'Starting scrape cycle', status: 'running', details: {} },
  })

  const sources = ['greenhouse', 'lever']
  const results: Record<string, { added: number; found: number }> = {}

  for (const source of sources) {
    const log = await prisma.scrapeLog.create({
      data: { source, status: 'running', startedAt: new Date() },
    })

    try {
      let jobs: ScrapedJob[] = []
      if (source === 'greenhouse') {
        jobs = await scrapeGreenhouse()
      } else if (source === 'lever') {
        jobs = await scrapeLever()
      }

      let added = 0
      let updated = 0
      const validated: ScrapedJob[] = []

      for (const job of jobs) {
        const hasKeyword = VISA_KEYWORDS.some(kw =>
          job.description.toLowerCase().includes(kw) ||
          job.title.toLowerCase().includes(kw)
        )
        if (hasKeyword) {
          const confirmed = await validateVisaSponsorship(job)
          if (confirmed) validated.push(job)
        }
        await sleep(500)
      }

      for (const job of validated) {
        try {
          const existing = await prisma.job.findUnique({ where: { jobUrl: job.jobUrl } })
          if (existing) {
            await prisma.job.update({ where: { jobUrl: job.jobUrl }, data: { isExpired: false, scrapedAt: new Date() } })
            updated++
          } else {
            await prisma.job.create({
              data: {
                title: job.title,
                company: job.company,
                location: job.location,
                country: job.country,
                isRemote: job.isRemote,
                jobUrl: job.jobUrl,
                description: job.description,
                requirements: job.requirements,
                visaSponsorshipConfirmed: true,
                source,
                jobType: job.jobType,
                experienceLevel: job.experienceLevel,
                postedDate: job.postedDate ? new Date(job.postedDate) : null,
                tags: job.tags,
                category: job.category,
              },
            })
            added++
          }
        } catch (err) {
          console.error(`[Scraper] Error saving job:`, err)
        }
      }

      results[source] = { added, found: jobs.length }

      await prisma.scrapeLog.update({
        where: { id: log.id },
        data: { status: 'success', jobsFound: jobs.length, jobsAdded: added, jobsUpdated: updated, completedAt: new Date() },
      })

      await prisma.agentActivity.create({
        data: {
          agentType: 'scraper',
          action: `Scraped ${source}: found ${jobs.length}, added ${added}`,
          status: 'success',
          details: { source, found: jobs.length, added, updated },
        },
      })
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      console.error(`[Scraper] ${source} failed:`, err)
      results[source] = { added: 0, found: 0 }
      await prisma.scrapeLog.update({
        where: { id: log.id },
        data: { status: 'failed', errorLog: errMsg, completedAt: new Date() },
      })
    }

    await sleep(2000 + Math.random() * 6000)
  }

  await markExpiredJobs()
  console.log('[Scraper] Scrape cycle complete:', results)
  return results
}

async function scrapeGreenhouse(): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = []
  try {
    const res = await fetchWithRetry('https://boards-api.greenhouse.io/v1/boards/anthropic/jobs', getRandomUserAgent())
    const data = await res.json() as { jobs?: Array<{ title?: string; content?: string; location?: { name?: string }; absolute_url?: string; id?: string }> }
    for (const job of (data.jobs || []).slice(0, 50)) {
      const text = `${job.title || ''} ${job.content || ''}`
      if (!VISA_KEYWORDS.some(kw => text.toLowerCase().includes(kw))) continue
      const locationName = job.location?.name || ''
      jobs.push({
        title: job.title || 'Unknown Role',
        company: 'Anthropic',
        location: locationName,
        country: extractCountry(locationName),
        isRemote: locationName.toLowerCase().includes('remote'),
        jobUrl: job.absolute_url || `https://boards.greenhouse.io/anthropic/jobs/${job.id}`,
        description: stripHtml(job.content || ''),
        jobType: 'fulltime',
        tags: extractTags(job.title || '', job.content || ''),
        category: extractCategory(job.title || ''),
      })
    }
  } catch (err) {
    console.error('[Greenhouse]', err)
  }
  return jobs
}

async function scrapeLever(): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = []
  const companies = ['openai', 'stripe', 'figma']
  for (const company of companies) {
    try {
      await sleep(1000 + Math.random() * 2000)
      const res = await fetchWithRetry(`https://api.lever.co/v0/postings/${company}?mode=json`, getRandomUserAgent())
      const postings = await res.json() as Array<{ text?: string; description?: string; additional?: string; categories?: { location?: string }; hostedUrl?: string; applyUrl?: string }>
      if (!Array.isArray(postings)) continue
      for (const job of postings.slice(0, 20)) {
        const text = `${job.text || ''} ${job.description || ''} ${job.additional || ''}`
        if (!VISA_KEYWORDS.some(kw => text.toLowerCase().includes(kw))) continue
        const loc = job.categories?.location || ''
        jobs.push({
          title: job.text || 'Unknown Role',
          company: company.charAt(0).toUpperCase() + company.slice(1),
          location: loc,
          country: extractCountry(loc),
          isRemote: loc.toLowerCase().includes('remote'),
          jobUrl: job.hostedUrl || job.applyUrl || '',
          description: stripHtml(job.description || ''),
          requirements: stripHtml(job.additional || ''),
          jobType: 'fulltime',
          tags: extractTags(job.text || '', job.description || ''),
          category: extractCategory(job.text || ''),
        })
      }
    } catch (err) {
      console.error(`[Lever/${company}]`, err)
    }
  }
  return jobs
}

async function validateVisaSponsorship(job: ScrapedJob): Promise<boolean> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `Does this job offer visa sponsorship? Return ONLY valid JSON: {"sponsors": boolean, "confidence": number (0-100)}
Job: ${job.title} at ${job.company}
Description: ${job.description.slice(0, 800)}`,
      }],
      response_format: { type: 'json_object' },
      max_tokens: 100,
    })
    const result = JSON.parse(response.choices[0].message.content || '{}') as { sponsors?: boolean; confidence?: number }
    return result.sponsors === true && (result.confidence || 0) >= 70
  } catch {
    return true
  }
}

async function markExpiredJobs() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const result = await prisma.job.updateMany({
    where: { scrapedAt: { lt: sevenDaysAgo }, isExpired: false },
    data: { isExpired: true, expiredAt: new Date() },
  })
  if (result.count > 0) {
    await prisma.agentActivity.create({
      data: { agentType: 'scraper', action: `Marked ${result.count} jobs as expired`, status: 'success', details: { expiredCount: result.count } },
    })
  }
}

async function fetchWithRetry(url: string, userAgent: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': userAgent, 'Accept': 'application/json, text/html' },
        signal: AbortSignal.timeout(15000),
      })
      if (res.ok) return res
      if (res.status === 429) await sleep(Math.pow(2, i) * 2000)
    } catch (err) {
      if (i === retries - 1) throw err
      await sleep(Math.pow(2, i) * 1000)
    }
  }
  throw new Error(`Failed after ${retries} retries: ${url}`)
}

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
}

function extractCountry(location: string): string {
  const map: Record<string, string> = {
    'united states': 'United States', 'usa': 'United States', ' us ': 'United States',
    'united kingdom': 'United Kingdom', 'uk': 'United Kingdom',
    'canada': 'Canada', 'germany': 'Germany', 'australia': 'Australia',
    'netherlands': 'Netherlands', 'singapore': 'Singapore', 'france': 'France',
  }
  const lower = location.toLowerCase()
  for (const [key, country] of Object.entries(map)) {
    if (lower.includes(key)) return country
  }
  return ''
}

function extractTags(title: string, description: string): string[] {
  const techTags = ['React', 'Python', 'JavaScript', 'TypeScript', 'Node.js', 'AWS', 'GCP', 'Azure',
    'Docker', 'Kubernetes', 'Machine Learning', 'AI', 'SQL', 'PostgreSQL', 'MongoDB', 'Java', 'Go']
  const text = `${title} ${description}`.toLowerCase()
  return techTags.filter(tag => text.includes(tag.toLowerCase())).slice(0, 5)
}

function extractCategory(title: string): string {
  const categories: Record<string, string[]> = {
    'Engineering': ['engineer', 'developer', 'architect', 'sre', 'devops'],
    'Data & AI': ['data', 'machine learning', 'ai', 'scientist'],
    'Product': ['product manager', 'product owner'],
    'Design': ['designer', 'ux', 'ui'],
    'Management': ['manager', 'director', 'head of'],
  }
  const lower = title.toLowerCase()
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(kw => lower.includes(kw))) return category
  }
  return 'Other'
}
