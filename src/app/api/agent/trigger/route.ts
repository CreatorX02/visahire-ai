import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Trigger scrape in background (non-blocking)
    import('@/lib/scraper/runner').then(({ runScrapers }) => {
      runScrapers().catch(console.error)
    })

    return NextResponse.json({ message: 'Scrape triggered' })
  } catch (err) {
    console.error('[Trigger]', err)
    return NextResponse.json({ error: 'Failed to trigger' }, { status: 500 })
  }
}
