import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [totalJobs, newToday, expiredToday, lastLog, sourceLogs] = await Promise.all([
      prisma.job.count({ where: { isExpired: false } }),
      prisma.job.count({ where: { scrapedAt: { gte: todayStart } } }),
      prisma.job.count({ where: { expiredAt: { gte: todayStart } } }),
      prisma.scrapeLog.findFirst({ where: { status: { in: ['success', 'partial'] } }, orderBy: { completedAt: 'desc' } }),
      prisma.scrapeLog.groupBy({
        by: ['source'],
        _sum: { jobsFound: true },
        _max: { completedAt: true },
        orderBy: { _max: { completedAt: 'desc' } },
      }),
    ])

    const sources = await Promise.all(
      sourceLogs.map(async (s) => {
        const logs = await prisma.scrapeLog.findMany({ where: { source: s.source }, take: 10, orderBy: { startedAt: 'desc' } })
        const successCount = logs.filter(l => l.status === 'success').length
        const lastSuccessLog = logs.find(l => l.status === 'success')
        const lastLogEntry = logs[0]
        return {
          source: s.source,
          jobsFound: s._sum.jobsFound || 0,
          lastSuccess: lastSuccessLog?.completedAt?.toISOString() || null,
          successRate: logs.length > 0 ? Math.round((successCount / logs.length) * 100) : 0,
          status: lastLogEntry?.status || 'unknown',
        }
      })
    )

    const schedule = process.env.SCRAPING_SCHEDULE || '0 6 * * *'
    const nextScrapeTime = getNextCronTime(schedule)

    return NextResponse.json({
      isRunning: false,
      lastScrapeTime: lastLog?.completedAt?.toISOString() || null,
      nextScrapeTime: nextScrapeTime.toISOString(),
      totalJobs,
      newToday,
      expiredToday,
      sources,
    })
  } catch (err) {
    console.error('[Agent Status]', err)
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 })
  }
}

function getNextCronTime(cron: string): Date {
  const parts = cron.split(' ')
  const minute = parseInt(parts[0]) || 0
  const hour = parseInt(parts[1]) || 6
  const now = new Date()
  const next = new Date(now)
  next.setHours(hour, minute, 0, 0)
  if (next <= now) next.setDate(next.getDate() + 1)
  return next
}
