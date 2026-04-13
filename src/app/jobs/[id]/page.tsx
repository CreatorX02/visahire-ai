import React from 'react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Clock, DollarSign, CheckCircle2, ExternalLink, Building2, ArrowLeft } from 'lucide-react'
import { formatSalary, timeAgo } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await prisma.job.findUnique({ where: { id } })
  if (!job) notFound()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F1117' }}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back */}
        <Link href="/jobs" className="inline-flex items-center gap-2 text-[#94A3B8] hover:text-[#F1F5F9] text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </Link>

        <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-[#2A2D3A]">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-[#2A2D3A] flex items-center justify-center flex-shrink-0">
                <Building2 className="w-8 h-8 text-[#94A3B8]" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-[#F1F5F9] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {job.title}
                </h1>
                <p className="text-xl text-[#94A3B8]">{job.company}</p>
                <div className="flex flex-wrap gap-3 mt-3 text-sm text-[#94A3B8]">
                  {(job.location || job.country) && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {job.isRemote ? 'Remote' : (job.location || job.country)}
                    </span>
                  )}
                  {(job.salaryMin || job.salaryMax) && (
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                    </span>
                  )}
                  {job.postedDate && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Posted {timeAgo(job.postedDate)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              {job.visaSponsorshipConfirmed && (
                <Badge variant="visa">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Visa Sponsored
                </Badge>
              )}
              {job.isRemote && <Badge variant="info">Remote</Badge>}
              {job.jobType && <Badge>{job.jobType}</Badge>}
              {job.experienceLevel && <Badge>{job.experienceLevel}</Badge>}
              {job.tags.slice(0, 5).map(tag => <Badge key={tag}>{tag}</Badge>)}
            </div>

            <div className="flex gap-3 mt-6">
              <a href={job.jobUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors">
                Apply Now <ExternalLink className="w-4 h-4" />
              </a>
              <Link href="/auth/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F1117] border border-[#2A2D3A] hover:border-emerald-500/30 text-[#F1F5F9] font-medium rounded-xl transition-colors">
                Get Match Score
              </Link>
            </div>
          </div>

          {/* Description */}
          <div className="p-8">
            <h2 className="text-xl font-semibold text-[#F1F5F9] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Job Description
            </h2>
            <div className="prose prose-sm max-w-none text-[#94A3B8] leading-relaxed whitespace-pre-wrap">
              {job.description}
            </div>

            {job.requirements && (
              <>
                <h2 className="text-xl font-semibold text-[#F1F5F9] mt-8 mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Requirements
                </h2>
                <div className="prose prose-sm max-w-none text-[#94A3B8] leading-relaxed whitespace-pre-wrap">
                  {job.requirements}
                </div>
              </>
            )}
          </div>

          {/* Footer CTA */}
          <div className="p-8 border-t border-[#2A2D3A] bg-[#0F1117]/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[#94A3B8] text-sm">
                Sign up to see your AI match score and get interview preparation for this role
              </p>
              <Link href="/auth/signup"
                className="flex-shrink-0 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors">
                Get AI Match Score →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
