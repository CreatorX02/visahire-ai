'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Upload, FileText, Download, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScoreRing } from '@/components/ui/score-ring'
import toast from 'react-hot-toast'

interface CV {
  id: string
  originalFileName: string
  extractedText: string
  standardizedVersion: string | null
  overallScore: number | null
  improvements: string[]
  missingSections: string[]
  createdAt: string
}

export default function CVPage() {
  const [cv, setCV] = useState<CV | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [standardizing, setStandardizing] = useState(false)
  const [activeTab, setActiveTab] = useState<'original' | 'standardized'>('original')
  const [checkedImprovements, setCheckedImprovements] = useState<Set<string>>(new Set())
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchCV()
  }, [])

  const fetchCV = async () => {
    try {
      const res = await fetch('/api/cv')
      const data = await res.json()
      setCV(data.cv || null)
    } catch {
      toast.error('Failed to load CV')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Max 5MB.')
      return
    }

    const formData = new FormData()
    formData.append('cv', file)

    setUploading(true)
    try {
      const res = await fetch('/api/cv/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setCV(data.cv)
      toast.success('CV uploaded successfully!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleStandardize = async () => {
    if (!cv) return
    setStandardizing(true)
    try {
      const res = await fetch('/api/cv/standardize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvId: cv.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCV(data.cv)
      toast.success('CV standardized with AI!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Standardization failed')
    } finally {
      setStandardizing(false)
    }
  }

  const handleDownload = () => {
    if (!cv?.standardizedVersion) return
    const blob = new Blob([cv.standardizedVersion], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${cv.originalFileName.replace(/\.[^/.]+$/, '')}_standardized.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleImprovement = (imp: string) => {
    setCheckedImprovements(prev => {
      const next = new Set(prev)
      if (next.has(imp)) next.delete(imp)
      else next.add(imp)
      return next
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-[#2A2D3A] rounded animate-pulse" />
        <div className="h-64 bg-[#1A1D27] border border-[#2A2D3A] rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#F1F5F9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>My CV</h1>
        <p className="text-[#94A3B8] mt-1">Upload and AI-optimize your CV for maximum ATS visibility</p>
      </div>

      {/* Upload area */}
      {!cv ? (
        <div
          onClick={() => fileRef.current?.click()}
          className="bg-[#1A1D27] border-2 border-dashed border-[#2A2D3A] hover:border-emerald-500/30 rounded-2xl p-16 text-center cursor-pointer transition-all group"
        >
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-500/20 transition-colors">
            <Upload className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-semibold text-[#F1F5F9] mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Upload Your CV
          </h3>
          <p className="text-[#94A3B8] mb-1">PDF or DOCX, max 5MB</p>
          <p className="text-sm text-[#94A3B8]">Click or drag and drop</p>
          <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleUpload} />
          {uploading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-emerald-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Uploading and extracting text...</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* CV Header */}
          <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#F1F5F9] text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {cv.originalFileName}
                  </h3>
                  <p className="text-sm text-[#94A3B8]">
                    Uploaded {new Date(cv.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {cv.overallScore && <ScoreRing score={cv.overallScore} size={72} />}
                <div className="flex flex-col gap-2">
                  {!cv.standardizedVersion ? (
                    <Button onClick={handleStandardize} loading={standardizing}>
                      <RefreshCw className="w-4 h-4" />
                      Standardize with AI
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={handleDownload}>
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
                    <Upload className="w-3 h-3" /> Replace
                  </Button>
                  <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleUpload} />
                </div>
              </div>
            </div>
          </div>

          {/* Score breakdown */}
          {cv.overallScore && (
            <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6">
              <h3 className="font-semibold text-[#F1F5F9] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                ATS Score: {cv.overallScore}/100
              </h3>
              <div className="w-full bg-[#2A2D3A] rounded-full h-3 mb-4">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${cv.overallScore >= 80 ? 'bg-emerald-500' : cv.overallScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  style={{ width: `${cv.overallScore}%` }}
                />
              </div>
              <p className="text-sm text-[#94A3B8]">
                {cv.overallScore >= 80 ? 'Excellent ATS compatibility' : cv.overallScore >= 60 ? 'Good score, room for improvement' : 'Needs significant improvements'}
              </p>
            </div>
          )}

          {/* Improvements checklist */}
          {cv.improvements?.length > 0 && (
            <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6">
              <h3 className="font-semibold text-[#F1F5F9] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Suggested Improvements ({cv.improvements.length})
              </h3>
              <div className="space-y-3">
                {cv.improvements.map((imp, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 cursor-pointer group"
                    onClick={() => toggleImprovement(imp)}
                  >
                    <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${checkedImprovements.has(imp) ? 'bg-emerald-500 border-emerald-500' : 'border-[#2A2D3A] group-hover:border-emerald-500/50'}`}>
                      {checkedImprovements.has(imp) && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <p className={`text-sm transition-colors ${checkedImprovements.has(imp) ? 'text-[#94A3B8] line-through' : 'text-[#F1F5F9]'}`}>
                      {imp}
                    </p>
                  </div>
                ))}
              </div>
              {checkedImprovements.size > 0 && (
                <p className="mt-4 text-sm text-emerald-400">
                  {checkedImprovements.size} of {cv.improvements.length} improvements addressed ✓
                </p>
              )}
            </div>
          )}

          {/* Missing sections */}
          {cv.missingSections?.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <p className="text-sm font-medium text-amber-400">Missing Sections</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {cv.missingSections.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* CV content tabs */}
          {(cv.extractedText || cv.standardizedVersion) && (
            <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl overflow-hidden">
              <div className="flex border-b border-[#2A2D3A]">
                <button
                  onClick={() => setActiveTab('original')}
                  className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'original' ? 'text-emerald-400 border-b-2 border-emerald-400 -mb-px' : 'text-[#94A3B8] hover:text-[#F1F5F9]'}`}
                >
                  Original Text
                </button>
                {cv.standardizedVersion && (
                  <button
                    onClick={() => setActiveTab('standardized')}
                    className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'standardized' ? 'text-emerald-400 border-b-2 border-emerald-400 -mb-px' : 'text-[#94A3B8] hover:text-[#F1F5F9]'}`}
                  >
                    AI Standardized
                    <span className="ml-2 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs">New</span>
                  </button>
                )}
              </div>
              <div className="p-6">
                <pre className="text-sm text-[#94A3B8] whitespace-pre-wrap font-sans leading-relaxed max-h-[500px] overflow-y-auto">
                  {activeTab === 'original' ? cv.extractedText : cv.standardizedVersion}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
