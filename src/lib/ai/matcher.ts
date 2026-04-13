import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/openai'

const BATCH_SIZE = parseInt(process.env.MATCH_BATCH_SIZE || '20')

export async function runJobMatching(userId: string) {
  const profile = await prisma.userProfile.findUnique({ where: { userId } })
  const cv = await prisma.cV.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } })

  if (!profile) return { matched: 0, error: 'No profile found' }

  // Get jobs not yet matched to this user
  const existingMatchJobIds = await prisma.jobMatch.findMany({
    where: { userId },
    select: { jobId: true },
  }).then(matches => matches.map(m => m.jobId))

  const jobs = await prisma.job.findMany({
    where: {
      isExpired: false,
      id: { notIn: existingMatchJobIds },
    },
    take: BATCH_SIZE,
    orderBy: { scrapedAt: 'desc' },
  })

  if (jobs.length === 0) return { matched: 0 }

  const candidateContext = `
Profile:
- Target Role: ${profile.targetRole || 'Not specified'}
- Industry: ${profile.industry || 'Not specified'}
- Years of Experience: ${profile.yearsOfExperience || 'Not specified'}
- Skills: ${profile.skills.join(', ') || 'Not specified'}
- Target Countries: ${profile.targetCountry.join(', ') || 'Any'}
- Preferred Salary: ${profile.preferredSalaryMin ? `$${profile.preferredSalaryMin}-$${profile.preferredSalaryMax}` : 'Not specified'}
- Visa Status: ${profile.visaStatus || 'Needs sponsorship'}

${cv ? `CV Summary:\n${cv.extractedText?.slice(0, 2000)}` : ''}
`.trim()

  let matched = 0

  for (const job of jobs) {
    try {
      const prompt = `Given this candidate profile and job listing, calculate match quality.

Candidate:
${candidateContext}

Job:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location || job.country || 'Not specified'}
Remote: ${job.isRemote}
Salary: ${job.salaryMin ? `$${job.salaryMin}-$${job.salaryMax}` : 'Not specified'}
Type: ${job.jobType || 'Not specified'}
Experience Required: ${job.experienceLevel || 'Not specified'}
Description: ${job.description.slice(0, 1000)}

Return ONLY valid JSON (no markdown):
{
  "matchScore": number (0-100),
  "matchReason": "2-3 sentence explanation",
  "strengths": ["strength1", "strength2", "strength3"],
  "gaps": ["gap1", "gap2"],
  "salaryMatch": "within" | "below" | "above" | "unknown",
  "locationMatch": boolean,
  "experienceMatch": "exact" | "over" | "under" | "unknown"
}`

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 500,
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')

      await prisma.jobMatch.upsert({
        where: { userId_jobId: { userId, jobId: job.id } },
        create: {
          userId,
          jobId: job.id,
          matchScore: Math.min(100, Math.max(0, result.matchScore || 0)),
          matchReason: result.matchReason,
          strengths: result.strengths || [],
          gaps: result.gaps || [],
          salaryMatch: result.salaryMatch,
          locationMatch: result.locationMatch,
          experienceMatch: result.experienceMatch,
          status: 'new',
        },
        update: {
          matchScore: Math.min(100, Math.max(0, result.matchScore || 0)),
          matchReason: result.matchReason,
          strengths: result.strengths || [],
          gaps: result.gaps || [],
          salaryMatch: result.salaryMatch,
          locationMatch: result.locationMatch,
          experienceMatch: result.experienceMatch,
        },
      })

      await prisma.agentActivity.create({
        data: {
          agentType: 'matcher',
          action: `Matched user ${userId} to job ${job.id}`,
          status: 'success',
          details: { matchScore: result.matchScore, jobTitle: job.title },
        },
      })

      matched++
    } catch (err) {
      console.error(`Failed to match job ${job.id}:`, err)
    }
  }

  return { matched }
}
