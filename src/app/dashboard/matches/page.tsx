'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MessageSquare, ExternalLink, CheckCircle2, MapPin, DollarSign, Building2, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatSalary, getScoreBg } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Match {
  id: string
  matchScore: number
  matchReason: string | null
  strengths: string[]
  gaps: string[]
  status: string
  createdAt: string
  job: {
    id: string
    title: string
    company: string
    companyLogo: string | null
    location: string | null
    country: string | null
    isRemote: boolean
    salaryMin: number | null
    salaryMax: number | null
    currency: string | null
    jobUrl: string
    jobType: string | null
    experienceLevel: string | null
    postedDate: string | null
    source: string
    visaSponsorshipConfirmed: boolean
    tags: string[]
  }
}

const STATUS_OPTIONS = ['all', 'new', 'reviewed', 'applied', 'rejected']
const SCORE_OPTIONS = [
  { label: 'All', min: 0 },
  { label: '80%+', min: 80 },
  { label: '60-79%', min: 60, max: 79 },
  { label: 'Below 60%', max: 59 },
]

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [scoreFilter, setScoreFilter] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/matches')
      const data = await res.json()
      setMatches(data.matches || [])
    } catch {
      toast.error('Failed to load matches')
    } finally {
      setLoading(false)
    }
  }

  const runMatching = async () => {
    setRunning(true)
    try {
      const res = await fetch('/api/matches/run', { method: 'POST' })
      const data = await res.json()
      toast.success(`Found ${data.matched || 0} new matches!`)
      await fetchMatches()
    } catch {
      toast.error('Matching failed')
    } finally {
      setRunning(false)
    }
  }

  const updateStatus = async (matchId: string, status: string) => {
    try {
      await fetch(`/api/matches/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status } : m))
    } catch {
      toast.error('Failed to update status')
    }
  }

  const filtered = matches.filter(m => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false
    if (scoreFilter && m.matchScore < scoreFilter) return false
    if (search && !m.job.title.toLowerCase().includes(search.toLowerCase()) && !m.job.company.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const highCount = matches.filter(m => m.matchScore >= 80).length
  const newCount = matches.filter(m => m.status === 'new').length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F1F5F9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>My Matches</h1>
          <p className="text-[#94A3B8] mt-1">AI-powered job matches based on your profile</p>
        </div>
        <Button onClick={runMatching} loading={running} variant="outline">
          <RefreshCw className="w-4 h-4" />
          Find New Matches
        </Button>
      </div>

      {/* Banner */}
      {(newCount > 0 || highCount > 0) && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-sm text-[#F1F5F9]">
            You have <strong className="text-emerald-400">{newCount} new matches</strong> this week
            {highCount > 0 && <>, including <strong className="text-amber-400">{highCount} above 80% match</strong></>}
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            placeholder="Search job titles or companies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#1A1D27] border border-[#2A2D3A] rounded-xl pl-10 pr-4 py-2.5 text-[#F1F5F9] placeholder:text-[#94A3B8] text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-sm border capitalize transition-colors ${statusFilter === s ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#1A1D27] border-[#2A2D3A] text-[#94A3B8] hover:border-[#3A3D4A]'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Score filters */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-sm text-[#94A3B8] self-center">Score:</span>
        {SCORE_OPTIONS.map(({ label, min }) => (
          <button
            key={label}
            onClick={() => setScoreFilter(min || 0)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${scoreFilter === (min || 0) ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-[#2A2D3A] text-[#94A3B8] hover:border-[#3A3D4A]'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-sm text-[#94A3B8]">{filtered.length} matches found</p>

      {/* Matches list */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-5 animate-pulse h-36" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#1A1D27] border border-[#2A2D3A] rounded-xl">
          <Building2 className="w-12 h-12 text-[#2A2D3A] mx-auto mb-4" />
          <p className="text-[#94A3B8] text-lg mb-2">No matches found</p>
          <p className="text-[#94A3B8] text-sm mb-6">Click &quot;Find New Matches&quot; to run the AI matching engine</p>
          <Button onClick={runMatching} loading={running}>
            <RefreshCw className="w-4 h-4" /> Find Matches Now
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(match => (
            <div key={match.id} className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl overflow-hidden hover:border-emerald-500/20 transition-colors">
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#2A2D3A] flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-[#94A3B8]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[#F1F5F9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {match.job.title}
                        </h3>
                        <p className="text-sm text-[#94A3B8]">{match.job.company}</p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${getScoreBg(match.matchScore)}`}>
                        {match.matchScore}%
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-[#94A3B8]">
                      {(match.job.location || match.job.country) && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{match.job.isRemote ? 'Remote' : (match.job.location || match.job.country)}</span>
                      )}
                      {(match.job.salaryMin || match.job.salaryMax) && (
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{formatSalary(match.job.salaryMin, match.job.salaryMax, match.job.currency)}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {match.job.visaSponsorshipConfirmed && <Badge variant="visa"><CheckCircle2 className="w-3 h-3" />Visa</Badge>}
                      {match.job.isRemote && <Badge variant="info">Remote</Badge>}
                      {match.job.jobType && <Badge>{match.job.jobType}</Badge>}
                    </div>
                  </div>
                </div>

                {/* Match reason */}
                {match.matchReason && (
                  <div className="mt-3 p-3 bg-[#0F1117] rounded-lg">
                    <p className="text-xs text-[#94A3B8] leading-relaxed">{match.matchReason}</p>
                  </div>
                )}

                {/* Strengths & gaps */}
                {(match.strengths?.length > 0 || match.gaps?.length > 0) && expandedId === match.id && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {match.strengths?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-emerald-400 mb-1.5">✓ Strengths</p>
                        <div className="space-y-1">
                          {match.strengths.slice(0, 3).map(s => (
                            <p key={s} className="text-xs text-[#94A3B8] flex items-start gap-1">
                              <span className="text-emerald-400 mt-0.5">•</span> {s}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                    {match.gaps?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-amber-400 mb-1.5">⚠ Gaps</p>
                        <div className="space-y-1">
                          {match.gaps.slice(0, 3).map(g => (
                            <p key={g} className="text-xs text-[#94A3B8] flex items-start gap-1">
                              <span className="text-amber-400 mt-0.5">•</span> {g}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-[#2A2D3A] flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={match.status}
                      onChange={e => updateStatus(match.id, e.target.value)}
                      className="bg-[#0F1117] border border-[#2A2D3A] rounded-lg px-2 py-1.5 text-xs text-[#94A3B8] focus:outline-none focus:border-emerald-500"
                    >
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="applied">Applied</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <button
                      onClick={() => setExpandedId(expandedId === match.id ? null : match.id)}
                      className="text-xs text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
                    >
                      {expandedId === match.id ? 'Less' : 'More details'}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/interviews?jobId=${match.job.id}`}>
                      <Button size="sm" variant="secondary">
                        <MessageSquare className="w-3 h-3" /> Prep Interview
                      </Button>
                    </Link>
                    <a href={match.job.jobUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm">
                        <ExternalLink className="w-3 h-3" /> Apply
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
