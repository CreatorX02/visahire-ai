'use client'
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, ChevronUp, Eye, EyeOff, RefreshCw, BookOpen, Shield, AlertTriangle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'

interface Question {
  question: string
  category: string
  difficulty: string
  suggestedAnswer: string
  followUps: string[]
}

interface Prep {
  id: string
  jobId: string
  questions: Question[]
  companyResearchNotes: string | null
  visaSpecificTips: string[]
  redFlags: string[]
  createdAt: string
  job: {
    id: string
    title: string
    company: string
  }
}

const CATEGORIES = ['behavioral', 'technical', 'situational', 'role-specific', 'visa/authorization']
const DIFFICULTIES: Record<string, string> = {
  easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  hard: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

export default function InterviewPrepDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [prep, setPrep] = useState<Prep | null>(null)
  const [loading, setLoading] = useState(true)
  const [practiceMode, setPracticeMode] = useState(false)
  const [expandedQ, setExpandedQ] = useState<number | null>(null)
  const [revealedQ, setRevealedQ] = useState<Set<number>>(new Set())
  const [studiedQ, setStudiedQ] = useState<Set<number>>(new Set())
  const [activeCategory, setActiveCategory] = useState('all')
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    fetchPrep() // eslint-disable-line react-hooks/exhaustive-deps
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPrep = async () => {
    try {
      const res = await fetch(`/api/interviews/${id}`)
      const data = await res.json()
      setPrep(data.prep)
    } catch {
      toast.error('Failed to load interview prep')
    } finally {
      setLoading(false)
    }
  }

  const regenerate = async () => {
    if (!prep) return
    setRegenerating(true)
    try {
      const res = await fetch('/api/interviews/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: prep.jobId, regenerate: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await fetchPrep()
      toast.success('Questions regenerated!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Regeneration failed')
    } finally {
      setRegenerating(false)
    }
  }

  if (loading) {
    return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-[#1A1D27] rounded-xl animate-pulse" />)}</div>
  }

  if (!prep) return <div className="text-center py-16 text-[#94A3B8]">Interview prep not found</div>

  const questions = Array.isArray(prep.questions) ? prep.questions : []
  const filtered = activeCategory === 'all' ? questions : questions.filter(q => q.category === activeCategory)

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/interviews" className="inline-flex items-center gap-2 text-[#94A3B8] hover:text-[#F1F5F9] text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Sessions
        </Link>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { setPracticeMode(!practiceMode); setRevealedQ(new Set()) }}
          >
            {practiceMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {practiceMode ? 'Show Answers' : 'Practice Mode'}
          </Button>
          <Button variant="secondary" size="sm" onClick={regenerate} loading={regenerating}>
            <RefreshCw className="w-4 h-4" /> Regenerate
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#F1F5F9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {prep.job.title} at {prep.job.company}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <p className="text-[#94A3B8] text-sm">{questions.length} questions</p>
          <span className="text-[#2A2D3A]">•</span>
          <p className="text-[#94A3B8] text-sm">{studiedQ.size} studied</p>
          {practiceMode && <Badge variant="info">Practice Mode Active</Badge>}
        </div>
      </div>

      {/* Company research */}
      {prep.companyResearchNotes && (
        <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h2 className="font-semibold text-[#F1F5F9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Company Research
            </h2>
          </div>
          <p className="text-sm text-[#94A3B8] leading-relaxed whitespace-pre-wrap">{prep.companyResearchNotes}</p>
        </div>
      )}

      {/* Visa tips */}
      {prep.visaSpecificTips?.length > 0 && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h2 className="font-semibold text-emerald-400">Visa &amp; Sponsorship Tips</h2>
          </div>
          <ul className="space-y-2">
            {prep.visaSpecificTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#94A3B8]">
                <span className="text-emerald-400 mt-0.5">•</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Red flags */}
      {prep.redFlags?.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="font-semibold text-amber-400">Watch Out For</h2>
          </div>
          <ul className="space-y-2">
            {prep.redFlags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#94A3B8]">
                <span className="text-amber-400 mt-0.5">⚠</span> {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${activeCategory === 'all' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-[#2A2D3A] text-[#94A3B8]'}`}
        >
          All ({questions.length})
        </button>
        {CATEGORIES.filter(c => questions.some(q => q.category === c)).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs border capitalize transition-colors ${activeCategory === cat ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-[#2A2D3A] text-[#94A3B8]'}`}
          >
            {cat} ({questions.filter(q => q.category === cat).length})
          </button>
        ))}
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {filtered.map((q, i) => {
          const qIndex = questions.indexOf(q)
          const isExpanded = expandedQ === qIndex
          const isRevealed = revealedQ.has(qIndex)
          const isStudied = studiedQ.has(qIndex)

          return (
            <div key={qIndex} className={`bg-[#1A1D27] border rounded-xl overflow-hidden transition-colors ${isStudied ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-[#2A2D3A]'}`}>
              <button
                className="w-full flex items-start justify-between gap-3 p-5 text-left"
                onClick={() => setExpandedQ(isExpanded ? null : qIndex)}
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      setStudiedQ(prev => {
                        const next = new Set(prev)
                        isStudied ? next.delete(qIndex) : next.add(qIndex)
                        return next
                      })
                    }}
                    className={`w-5 h-5 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${isStudied ? 'bg-emerald-500 border-emerald-500' : 'border-[#2A2D3A]'}`}
                  >
                    {isStudied && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${DIFFICULTIES[q.difficulty] || DIFFICULTIES.medium}`}>
                        {q.difficulty}
                      </span>
                      <span className="text-xs text-[#94A3B8] capitalize">{q.category}</span>
                    </div>
                    <p className="text-sm font-medium text-[#F1F5F9]">{q.question}</p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-[#94A3B8] flex-shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-[#94A3B8] flex-shrink-0 mt-0.5" />}
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 border-t border-[#2A2D3A] pt-4 space-y-4">
                  {practiceMode && !isRevealed ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRevealedQ(prev => new Set([...prev, qIndex]))}
                    >
                      <Eye className="w-3 h-3" /> Reveal Answer
                    </Button>
                  ) : (
                    <>
                      <div>
                        <p className="text-xs font-medium text-emerald-400 mb-2">Suggested Answer</p>
                        <p className="text-sm text-[#94A3B8] leading-relaxed whitespace-pre-wrap">{q.suggestedAnswer}</p>
                      </div>
                      {q.followUps?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-amber-400 mb-2">Possible Follow-up Questions</p>
                          <ul className="space-y-1">
                            {q.followUps.map((fu, j) => (
                              <li key={j} className="text-xs text-[#94A3B8] flex items-start gap-1">
                                <span className="text-amber-400">→</span> {fu}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
