'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Activity, CheckCircle2, XCircle, Clock, Database, TrendingUp, RefreshCw, Zap, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'
import { timeAgo } from '@/lib/utils'

interface AgentStatus {
  isRunning: boolean
  lastScrapeTime: string | null
  nextScrapeTime: string | null
  totalJobs: number
  newToday: number
  expiredToday: number
  sources: {
    source: string
    jobsFound: number
    lastSuccess: string | null
    successRate: number
    status: string
  }[]
}

interface Activity {
  id: string
  agentType: string
  action: string
  status: string
  details: any
  timestamp: string
}

interface ScrapeLog {
  id: string
  source: string
  status: string
  jobsFound: number
  jobsAdded: number
  jobsUpdated: number
  jobsExpired: number
  errorLog: string | null
  startedAt: string
  completedAt: string | null
}

export default function AgentPage() {
  const [status, setStatus] = useState<AgentStatus | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [logs, setLogs] = useState<ScrapeLog[]>([])
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [statusRes, activityRes, logsRes] = await Promise.all([
        fetch('/api/agent/status'),
        fetch('/api/agent/activity'),
        fetch('/api/agent/logs'),
      ])
      const [statusData, activityData, logsData] = await Promise.all([
        statusRes.json(),
        activityRes.json(),
        logsRes.json(),
      ])
      setStatus(statusData)
      setActivities(activityData.activities || [])
      setLogs(logsData.logs || [])
    } catch {
      // Silently fail on polling errors
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [fetchData])

  const triggerScrape = async () => {
    setTriggering(true)
    try {
      const res = await fetch('/api/agent/trigger', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Scraping job triggered! It will run in the background.')
      setTimeout(fetchData, 3000)
    } catch (err: any) {
      toast.error(err.message || 'Failed to trigger scrape')
    } finally {
      setTriggering(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-[#1A1D27] border border-[#2A2D3A] rounded-xl animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F1F5F9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>AI Agent Monitor</h1>
          <p className="text-[#94A3B8] mt-1">Real-time status of your autonomous job scraping agent</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          <Button onClick={triggerScrape} loading={triggering}>
            <Zap className="w-4 h-4" />
            Trigger Scrape
          </Button>
        </div>
      </div>

      {/* Agent status */}
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-[#F1F5F9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Agent Status</h2>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status?.isRunning ? 'bg-emerald-400' : 'bg-[#94A3B8]'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${status?.isRunning ? 'bg-emerald-400' : 'bg-[#94A3B8]'}`}></span>
            </span>
            <span className={`text-sm font-medium ${status?.isRunning ? 'text-emerald-400' : 'text-[#94A3B8]'}`}>
              {status?.isRunning ? 'Active' : 'Idle'}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[#0F1117] rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-[#94A3B8]">Total Jobs</span>
            </div>
            <p className="text-2xl font-bold text-[#F1F5F9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {status?.totalJobs?.toLocaleString() || 0}
            </p>
          </div>
          <div className="p-4 bg-[#0F1117] rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-[#94A3B8]">New Today</span>
            </div>
            <p className="text-2xl font-bold text-[#F1F5F9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {status?.newToday || 0}
            </p>
          </div>
          <div className="p-4 bg-[#0F1117] rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-[#94A3B8]">Last Scrape</span>
            </div>
            <p className="text-sm text-[#F1F5F9]">
              {status?.lastScrapeTime ? timeAgo(status.lastScrapeTime) : 'Never'}
            </p>
          </div>
          <div className="p-4 bg-[#0F1117] rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-[#94A3B8]">Next Scrape</span>
            </div>
            <p className="text-sm text-[#F1F5F9]">
              {status?.nextScrapeTime ? new Date(status.nextScrapeTime).toLocaleTimeString() : 'Not scheduled'}
            </p>
          </div>
        </div>
      </div>

      {/* Source stats */}
      {status?.sources && status.sources.length > 0 && (
        <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl overflow-hidden">
          <div className="p-5 border-b border-[#2A2D3A]">
            <h2 className="font-semibold text-[#F1F5F9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Source Statistics</h2>
          </div>
          <div className="divide-y divide-[#2A2D3A]">
            {status.sources.map(source => (
              <div key={source.source} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${source.status === 'success' ? 'bg-emerald-400' : source.status === 'failed' ? 'bg-rose-400' : 'bg-amber-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-[#F1F5F9] capitalize">{source.source}</p>
                    <p className="text-xs text-[#94A3B8]">Last: {source.lastSuccess ? timeAgo(source.lastSuccess) : 'Never'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-[#F1F5F9]">{source.jobsFound} jobs</p>
                    <p className="text-xs text-[#94A3B8]">{source.successRate}% success</p>
                  </div>
                  <Badge variant={source.status === 'success' ? 'success' : source.status === 'failed' ? 'error' : 'warning'}>
                    {source.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent scrape logs */}
      {logs.length > 0 && (
        <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl overflow-hidden">
          <div className="p-5 border-b border-[#2A2D3A]">
            <h2 className="font-semibold text-[#F1F5F9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Scrape History</h2>
          </div>
          <div className="divide-y divide-[#2A2D3A]">
            {logs.slice(0, 10).map(log => (
              <div key={log.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {log.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : log.status === 'failed' ? (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="text-sm font-medium text-[#F1F5F9] capitalize">{log.source}</span>
                    <Badge variant={log.status === 'success' ? 'success' : log.status === 'failed' ? 'error' : 'warning'} className="text-xs">
                      {log.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-[#94A3B8]">{timeAgo(log.startedAt)}</span>
                </div>
                <div className="flex gap-4 text-xs text-[#94A3B8]">
                  <span>Found: <strong className="text-[#F1F5F9]">{log.jobsFound}</strong></span>
                  <span>Added: <strong className="text-emerald-400">{log.jobsAdded}</strong></span>
                  <span>Updated: <strong className="text-amber-400">{log.jobsUpdated}</strong></span>
                  <span>Expired: <strong className="text-[#94A3B8]">{log.jobsExpired}</strong></span>
                </div>
                {log.errorLog && (
                  <p className="mt-2 text-xs text-rose-400 bg-rose-500/5 rounded p-2 font-mono">{log.errorLog.slice(0, 200)}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity feed */}
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl overflow-hidden">
        <div className="p-5 border-b border-[#2A2D3A]">
          <h2 className="font-semibold text-[#F1F5F9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Live Activity Feed</h2>
        </div>
        {activities.length === 0 ? (
          <div className="p-8 text-center">
            <Activity className="w-8 h-8 text-[#2A2D3A] mx-auto mb-3" />
            <p className="text-[#94A3B8] text-sm">No recent activity. Trigger a scrape to see the agent in action.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#2A2D3A] max-h-96 overflow-y-auto">
            {activities.map(activity => (
              <div key={activity.id} className="p-4 flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${activity.status === 'success' ? 'bg-emerald-400' : activity.status === 'failed' ? 'bg-rose-400' : 'bg-amber-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-emerald-400 capitalize font-medium">[{activity.agentType}]</span>
                    <span className="text-xs text-[#94A3B8]">{timeAgo(activity.timestamp)}</span>
                  </div>
                  <p className="text-sm text-[#94A3B8] mt-0.5">{activity.action}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
