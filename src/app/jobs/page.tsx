import React from 'react'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Search, Briefcase, MapPin, Clock, DollarSign, CheckCircle2, Building2, ExternalLink } from 'lucide-react'
import { formatSalary, timeAgo } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface SearchParams {
  q?: string
  country?: string
  type?: string
  level?: string
  remote?: string
  page?: string
  sort?: string
}

export default async function JobsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const limit = 20
  const skip = (page - 1) * limit

  const where = {
    isExpired: false,
    ...(params.q && {
      OR: [
        { title: { contains: params.q, mode: 'insensitive' as const } },
        { company: { contains: params.q, mode: 'insensitive' as const } },
        { description: { contains: params.q, mode: 'insensitive' as const } },
      ],
    }),
    ...(params.country && { country: { equals: params.country, mode: 'insensitive' as const } }),
    ...(params.type && { jobType: { equals: params.type, mode: 'insensitive' as const } }),
    ...(params.level && { experienceLevel: { equals: params.level, mode: 'insensitive' as const } }),
    ...(params.remote === 'true' && { isRemote: true }),
  }

  const orderBy = params.sort === 'salary'
    ? [{ salaryMax: 'desc' as const }]
    : [{ scrapedAt: 'desc' as const }]

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({ where, orderBy, skip, take: limit }),
    prisma.job.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F1117' }}>
      {/* Header */}
      <div className="border-b border-[#2A2D3A] bg-[#1A1D27]/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/" className="text-[#94A3B8] hover:text-[#F1F5F9] text-sm">Home</Link>
            <span className="text-[#2A2D3A]">/</span>
            <span className="text-[#F1F5F9] text-sm">Browse Jobs</span>
          </div>
          <h1 className="text-3xl font-bold text-[#F1F5F9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Visa-Sponsored Jobs
          </h1>
          <p className="text-[#94A3B8] mt-1">{total.toLocaleString()} verified visa-sponsored opportunities</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search & Filters */}
        <form method="GET" className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Search job titles, companies, skills..."
              className="w-full bg-[#1A1D27] border border-[#2A2D3A] rounded-xl pl-10 pr-4 py-3 text-[#F1F5F9] placeholder:text-[#94A3B8] text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <select
            name="country"
            defaultValue={params.country}
            className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl px-3 py-3 text-[#F1F5F9] text-sm focus:outline-none focus:border-emerald-500 min-w-40"
          >
            <option value="">All Countries</option>
            {['United States', 'United Kingdom', 'Canada', 'Germany', 'Australia', 'Netherlands', 'Singapore', 'UAE', 'France', 'Switzerland'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            name="type"
            defaultValue={params.type}
            className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl px-3 py-3 text-[#F1F5F9] text-sm focus:outline-none focus:border-emerald-500 min-w-36"
          >
            <option value="">All Types</option>
            <option value="fulltime">Full-time</option>
            <option value="parttime">Part-time</option>
            <option value="contract">Contract</option>
          </select>
          <select
            name="sort"
            defaultValue={params.sort}
            className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl px-3 py-3 text-[#F1F5F9] text-sm focus:outline-none focus:border-emerald-500 min-w-36"
          >
            <option value="newest">Newest First</option>
            <option value="salary">Highest Salary</option>
          </select>
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl text-sm transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" /> Search
          </button>
        </form>

        {/* Remote toggle */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm text-[#94A3B8]">Filters:</span>
          <Link
            href={params.remote === 'true' ? '/jobs' : '/jobs?remote=true'}
            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${params.remote === 'true' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-[#2A2D3A] text-[#94A3B8] hover:border-[#3A3D4A]'}`}
          >
            Remote Only
          </Link>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-[#94A3B8]">
            Showing {skip + 1}–{Math.min(skip + limit, total)} of {total.toLocaleString()} jobs
          </span>
        </div>

        {/* Job list */}
        <div className="space-y-4 mb-8">
          {jobs.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="w-12 h-12 text-[#2A2D3A] mx-auto mb-4" />
              <p className="text-[#94A3B8] text-lg">No jobs found matching your criteria</p>
              <Link href="/jobs" className="mt-4 inline-block text-emerald-400 hover:text-emerald-300 text-sm">Clear filters</Link>
            </div>
          ) : (
            jobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-5 hover:border-emerald-500/30 hover:-translate-y-0.5 transition-all cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#2A2D3A] flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-[#94A3B8]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h2 className="font-semibold text-[#F1F5F9] text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{job.title}</h2>
                          <p className="text-[#94A3B8] text-sm mt-0.5">{job.company}</p>
                        </div>
                        <Badge variant="visa" className="flex-shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          Visa Sponsored
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-[#94A3B8]">
                        {(job.location || job.country) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.isRemote ? 'Remote' : (job.location || job.country)}
                          </span>
                        )}
                        {(job.salaryMin || job.salaryMax) && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                          </span>
                        )}
                        {job.postedDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo(job.postedDate)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.isRemote && <Badge variant="info">Remote</Badge>}
                        {job.jobType && <Badge>{job.jobType}</Badge>}
                        {job.experienceLevel && <Badge>{job.experienceLevel}</Badge>}
                        {job.tags.slice(0, 3).map(tag => <Badge key={tag}>{tag}</Badge>)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#2A2D3A] flex justify-between items-center">
                    <span className="text-xs text-[#94A3B8] capitalize">{job.source}</span>
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      View Details <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {page > 1 && (
              <Link href={`/jobs?${new URLSearchParams({ ...params, page: String(page - 1) })}`}>
                <button className="px-4 py-2 bg-[#1A1D27] border border-[#2A2D3A] rounded-lg text-sm text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#3A3D4A]">← Previous</button>
              </Link>
            )}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
              return (
                <Link key={p} href={`/jobs?${new URLSearchParams({ ...params, page: String(p) })}`}>
                  <button className={`px-4 py-2 rounded-lg text-sm border transition-colors ${p === page ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-[#1A1D27] border-[#2A2D3A] text-[#94A3B8] hover:border-[#3A3D4A]'}`}>
                    {p}
                  </button>
                </Link>
              )
            })}
            {page < totalPages && (
              <Link href={`/jobs?${new URLSearchParams({ ...params, page: String(page + 1) })}`}>
                <button className="px-4 py-2 bg-[#1A1D27] border border-[#2A2D3A] rounded-lg text-sm text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#3A3D4A]">Next →</button>
              </Link>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            See How Well You Match These Jobs
          </h2>
          <p className="text-[#94A3B8] mb-6">Sign up free to get AI-powered match scores and interview prep for every job</p>
          <Link href="/auth/signup" className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors">
            Get Your Match Score →
          </Link>
        </div>
      </div>
    </div>
  )
}
