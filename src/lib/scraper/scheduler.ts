import cron from 'node-cron'
import { runScrapers } from './runner'

let schedulerStarted = false

export function startScheduler() {
  if (schedulerStarted) return
  schedulerStarted = true

  const schedule = process.env.SCRAPING_SCHEDULE || '0 6 * * *'
  console.log(`[Scheduler] Starting with schedule: ${schedule}`)

  cron.schedule(schedule, async () => {
    console.log('[Scheduler] Running scheduled scrape...')
    try {
      await runScrapers()
    } catch (err) {
      console.error('[Scheduler] Scrape failed:', err)
    }
  })
}
