'use client'
import React from 'react'
import Image from 'next/image'
import { MapPin, Clock, DollarSign, ExternalLink, CheckCircle2, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatSalary, timeAgo, getScoreBg } from '@/lib/utils'

interface JobCardProps {
  job: {
    id: string
    title: string
    company: string
    companyLogo?: string | null
    location?: string | null
    country?: string | null
    isRemote: boolean
    salaryMin?: number | null
    salaryMax?: number | null
    currency?: string | null
    jobUrl: string
    jobType?: string | null
    experienceLevel?: string | null
    postedDate?: Date | string | null
    scrapedAt: Date | string
    tags: string[]
    source: string
    visaSponsorshipConfirmed: boolean
    matchScore?: number
    matchStatus?: string
    strengths?: string[]
    gaps?: string[]
  }
  onViewDetails?: () => void
  showMatchScore?: boolean
}

export function JobCard({ job, onViewDetails, showMatchScore = false }: JobCardProps) {
  return (
    <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-start gap-4">
        {/* Company logo */}
        <div className="w-12 h-12 rounded-xl bg-[#2A2D3A] flex items-center justify-center flex-shrink-0 overflow-hidden">
          {job.companyLogo ? (
            <Image src={job.companyLogo} alt={job.company} width={48} height={48} className="object-cover" unoptimized />
          ) : (
            <Building2 className="w-6 h-6 text-[#94A3B8]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-[#F1F5F9] truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {job.title}
              </h3>
              <p className="text-sm text-[#94A3B8] mt-0.5">{job.company}</p>
            </div>
            {showMatchScore && job.matchScore !== undefined && (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${getScoreBg(job.matchScore)}`}>
                {job.matchScore}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#94A3B8]">
        {(job.location || job.country) && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {job.isRemote ? 'Remote' : job.location || job.country}
          </span>
        )}
        {job.postedDate && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo(job.postedDate)}
          </span>
        )}
        {(job.salaryMin || job.salaryMax) && (
          <span className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
          </span>
        )}
      </div>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.visaSponsorshipConfirmed && (
          <Badge variant="visa">
            <CheckCircle2 className="w-3 h-3" />
            Visa Sponsored
          </Badge>
        )}
        {job.isRemote && <Badge variant="info">Remote</Badge>}
        {job.jobType && <Badge>{job.jobType}</Badge>}
        {job.experienceLevel && <Badge>{job.experienceLevel}</Badge>}
        {job.tags.slice(0, 3).map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-[#2A2D3A] flex items-center justify-between">
        <span className="text-xs text-[#94A3B8] capitalize">{job.source}</span>
        <div className="flex gap-2">
          {onViewDetails && (
            <Button size="sm" variant="secondary" onClick={onViewDetails}>
              Details
            </Button>
          )}
          <a href={job.jobUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm">
              <ExternalLink className="w-3 h-3" />
              Apply
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
