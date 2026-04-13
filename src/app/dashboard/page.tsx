import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Briefcase, FileText, MessageSquare, TrendingUp, Plus, ArrowRight, CheckCircle2, Clock, Target } from 'lucide-react'
import { formatSalary, timeAgo, getScoreBg } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/signin')

  const userId = session.user.id

  const [profile, latestCV, matchCount, recentMatches, interviewCount, totalJobs] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.cV.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.jobMatch.count({ where: { userId } }),
    prisma.jobMatch.findMany({
      where: { userId },
      orderBy: { matchScore: 'desc' },
      take: 5,
      include: { job: true },
    }),
    prisma.interviewPrep.count({ where: { userId } }),
    prisma.job.count({ where: { isExpired: false } }),
  ])

  const highMatchCount = await prisma.jobMatch.count({ where: { userId, matchScore: { gte: 80 } } })
  const newThisWeek = await prisma.jobMatch.count({
    where: {
      userId,
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
  })

  const stats = [
    { label: 'Total Matches', value: matchCount, icon: Briefcase, color: 'emerald', href: '/dashboard/matches' },
    { label: 'High Matches (80%+)', value: highMatchCount, icon: Target, color: 'amber', href: '/dashboard/matches?min=80' },
    { label: 'Jobs in Database', value: totalJobs, icon: TrendingUp, color: 'cyan', href: '/jobs' },
    { label: 'Interview Preps', value: interviewCount, icon: MessageSquare, color: 'violet', href: '/dashboard/interviews' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F1F5F9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Welcome back{session.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-[#94A3B8] mt-1">Here's your job search overview</p>
        </div>
        <Link href="/dashboard/matches">
          <Button>
            <Briefcase className="w-4 h-4" />
            View Matches
          </Button>
        </Link>
      </div>

      {/* Banner if new matches */}
      {newThisWeek > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-[#F1F5F9] text-sm">
              You have <strong className="text-emerald-400">{newThisWeek} new matches</strong> this week
              {highMatchCount > 0 && <>, including <strong className="text-amber-400">{highMatchCount} above 80% match</strong></>}
            </p>
          </div>
          <Link href="/dashboard/matches" className="text-emerald-400 text-sm font-medium hover:text-emerald-300 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, href }) => {
          const colors: Record<string, string> = {
            emerald: 'text-emerald-400 bg-emerald-500/10',
            amber: 'text-amber-400 bg-amber-500/10',
            cyan: 'text-cyan-400 bg-cyan-500/10',
            violet: 'text-violet-400 bg-violet-500/10',
          }
          return (
            <Link key={label} href={href}>
              <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-5 hover:border-emerald-500/20 hover:-translate-y-0.5 transition-all">
                <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-3xl font-bold text-[#F1F5F9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
                <div className="text-sm text-[#94A3B8] mt-0.5">{label}</div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Setup checklist if not complete */}
      {(!profile?.onboardingComplete || !latestCV) && (
        <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Complete Your Setup
          </h2>
          <div className="space-y-3">
            <div className={`flex items-center gap-3 p-3 rounded-lg ${profile?.onboardingComplete ? 'bg-emerald-500/5' : 'bg-[#0F1117]'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${profile?.onboardingComplete ? 'bg-emerald-500' : 'bg-[#2A2D3A]'}`}>
                {profile?.onboardingComplete ? <CheckCircle2 className="w-4 h-4 text-white" /> : <span className="text-xs text-[#94A3B8]">1</span>}
              </div>
              <span className={`text-sm ${profile?.onboardingComplete ? 'text-emerald-400 line-through' : 'text-[#F1F5F9]'}`}>
                Complete your profile
              </span>
              {!profile?.onboardingComplete && (
                <Link href="/onboarding" className="ml-auto text-xs text-emerald-400 hover:text-emerald-300">Start →</Link>
              )}
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-lg ${latestCV ? 'bg-emerald-500/5' : 'bg-[#0F1117]'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${latestCV ? 'bg-emerald-500' : 'bg-[#2A2D3A]'}`}>
                {latestCV ? <CheckCircle2 className="w-4 h-4 text-white" /> : <span className="text-xs text-[#94A3B8]">2</span>}
              </div>
              <span className={`text-sm ${latestCV ? 'text-emerald-400 line-through' : 'text-[#F1F5F9]'}`}>
                Upload & standardize your CV
              </span>
              {!latestCV && (
                <Link href="/dashboard/cv" className="ml-auto text-xs text-emerald-400 hover:text-emerald-300">Upload →</Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent matches */}
      {recentMatches.length > 0 && (
        <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl overflow-hidden">
          <div className="p-5 border-b border-[#2A2D3A] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#F1F5F9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Top Matches</h2>
            <Link href="/dashboard/matches" className="text-emerald-400 text-sm hover:text-emerald-300 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-[#2A2D3A]">
            {recentMatches.map((match) => (
              <div key={match.id} className="p-4 flex items-center gap-4 hover:bg-[#2A2D3A]/20 transition-colors">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${getScoreBg(match.matchScore)}`}>
                  {match.matchScore}%
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#F1F5F9] truncate">{match.job.title}</p>
                  <p className="text-xs text-[#94A3B8]">{match.job.company} • {match.job.location || match.job.country}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {match.job.visaSponsorshipConfirmed && <Badge variant="visa">Visa</Badge>}
                  <span className="text-xs text-[#94A3B8]"><Clock className="w-3 h-3 inline mr-1" />{timeAgo(match.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CV section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#F1F5F9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Your CV</h2>
            <FileText className="w-5 h-5 text-[#94A3B8]" />
          </div>
          {latestCV ? (
            <div>
              <p className="text-sm text-[#F1F5F9] mb-1">{latestCV.originalFileName}</p>
              <p className="text-xs text-[#94A3B8] mb-4">Uploaded {timeAgo(latestCV.createdAt)}</p>
              {latestCV.overallScore && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[#2A2D3A] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${latestCV.overallScore}%` }} />
                  </div>
                  <span className="text-sm font-bold text-emerald-400">{latestCV.overallScore}%</span>
                </div>
              )}
              <Link href="/dashboard/cv" className="mt-4 inline-block">
                <Button variant="secondary" size="sm">Manage CV</Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-[#94A3B8] text-sm mb-4">Upload your CV to get AI-powered standardization and a quality score</p>
              <Link href="/dashboard/cv">
                <Button size="sm">
                  <Plus className="w-4 h-4" />
                  Upload CV
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#F1F5F9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Interview Prep</h2>
            <MessageSquare className="w-5 h-5 text-[#94A3B8]" />
          </div>
          {interviewCount > 0 ? (
            <div>
              <p className="text-[#F1F5F9] text-sm mb-4">You have <strong className="text-emerald-400">{interviewCount}</strong> interview prep sessions saved</p>
              <Link href="/dashboard/interviews">
                <Button variant="secondary" size="sm">View Sessions</Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-[#94A3B8] text-sm mb-4">Generate tailored interview questions from your matched jobs</p>
              <Link href="/dashboard/matches">
                <Button size="sm" variant="outline">
                  <ArrowRight className="w-4 h-4" />
                  Go to Matches
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
