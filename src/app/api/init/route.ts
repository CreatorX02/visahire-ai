import { NextResponse } from 'next/server'

let initialized = false

export async function GET() {
  if (!initialized && process.env.NODE_ENV === 'production') {
    initialized = true
    const { startScheduler } = await import('@/lib/scraper/scheduler')
    startScheduler()
  }
  return NextResponse.json({ status: 'ok' })
}
