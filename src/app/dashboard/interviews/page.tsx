'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { MessageSquare, Plus, Clock, Building2, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'
import { timeAgo } from '@/lib/utils'
import { Suspense } from 'react'

interface InterviewPrep {
  id: string
  jobId: string
  createdAt: string
  job: {
    id: string
    title: string
    company: string
    location: string | null
    country: string | null
  }
  questions: unknown[]
}

function InterviewsContent() {
  const searchParams = useSearchParams()
  const [preps, setPreps] = useState<InterviewPrep[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchPreps()
  }, [])

  useEffect(() => {
    const jobId = searchParams.get('jobId')
    if (jobId) {
      generatePrep(jobId) // eslint-disable-line react-hooks/exhaustive-deps
    }
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPreps = async () => {
    try {
      const res = await fetch('/api/interviews')
      const data = await res.json()
      setPreps(data.preps || [])
    } catch {
      toast.error('Failed to load interview preps')
    } finally {
      setLoading(false)
    }
  }

  const generatePrep = async (jobId: string) => {
    setGenerating(true)
    try {
      const res = await fetch('/api/interviews/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Interview prep generated!')
      await fetchPreps()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-[#1A1D27] border border-[#2A2D3A] rounded-xl animate-pulse" />)}</div>
  }

  return (
    <div className="space-y-4">
      {generating && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
          <p className="text-sm text-[#F1F5F9]">Generating interview prep with AI... This may take 30 seconds.</p>
        </div>
      )}
      {preps.length === 0 ? (
        <div className="text-center py-16 bg-[#1A1D27] border border-[#2A2D3A] rounded-xl">
          <MessageSquare className="w-12 h-12 text-[#2A2D3A] mx-auto mb-4" />
          <p className="text-[#94A3B8] text-lg mb-2">No interview prep sessions yet</p>
          <p className="text-[#94A3B8] text-sm mb-6">Go to your matches and click "Prep Interview" on any job</p>
          <Link href="/dashboard/matches">
            <Button variant="outline">View My Matches</Button>
          </Link>
        </div>
      ) : (
        preps.map(prep => {
          const questions = Array.isArray(prep.questions) ? prep.questions : []
          return (
            <Link key={prep.id} href={`/dashboard/interviews/${prep.id}`}>
              <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-5 hover:border-emerald-500/20 hover:-translate-y-0.5 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#2A2D3A] flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-[#94A3B8]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#F1F5F9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {prep.job.title}
                      </h3>
                      <p className="text-sm text-[#94A3B8]">{prep.job.company}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge>{questions.length} questions</Badge>
                        <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {timeAgo(prep.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#94A3B8]" />
                </div>
              </div>
            </Link>
          )
        })
      )}
    </div>
  )
}

export default function InterviewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F1F5F9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Interview Prep
          </h1>
          <p className="text-[#94A3B8] mt-1">AI-generated interview questions tailored to your background</p>
        </div>
        <Link href="/dashboard/matches">
          <Button variant="outline">
            <Plus className="w-4 h-4" />
            New Session
          </Button>
        </Link>
      </div>
      <Suspense fallback={<div className="animate-pulse h-24 bg-[#1A1D27] rounded-xl" />}>
        <InterviewsContent />
      </Suspense>
    </div>
  )
}
