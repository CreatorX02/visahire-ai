import React from 'react'
import Link from 'next/link'
import { ArrowRight, Bot, Briefcase, FileText, MessageSquare, Shield, Zap, CheckCircle2, Globe, TrendingUp, Users, Star } from 'lucide-react'

async function getJobCount() {
  try {
    // Will be populated by scraper
    return { total: 0, today: 0 }
  } catch {
    return { total: 0, today: 0 }
  }
}

export default async function LandingPage() {
  const { total } = await getJobCount()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F1117', color: '#F1F5F9' }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0F1117]/80 backdrop-blur-md border-b border-[#2A2D3A]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            VisaHire <span className="text-emerald-400">AI</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/jobs" className="text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors hidden sm:block">Browse Jobs</Link>
          <Link href="/auth/signin" className="text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors">Sign In</Link>
          <Link href="/auth/signup" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Gradient blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            AI Agent is actively scraping visa-sponsored jobs
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Find{' '}
            <span className="text-emerald-400">Visa-Sponsored</span>
            {' '}Jobs with{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
              AI Precision
            </span>
          </h1>

          <p className="text-xl text-[#94A3B8] max-w-2xl mx-auto mb-10 leading-relaxed">
            Our autonomous AI agent scrapes thousands of jobs daily, verifies visa sponsorship,
            matches them to your profile, and preps you for interviews — all automatically.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/25 text-lg">
              Start Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/jobs" className="inline-flex items-center gap-2 px-8 py-4 bg-[#1A1D27] border border-[#2A2D3A] hover:border-emerald-500/30 text-[#F1F5F9] font-semibold rounded-xl transition-all text-lg">
              Browse Jobs <Globe className="w-5 h-5" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Jobs in Database', value: total > 0 ? total.toLocaleString() : '10,000+', icon: Briefcase },
              { label: 'Countries Covered', value: '50+', icon: Globe },
              { label: 'Match Accuracy', value: '94%', icon: TrendingUp },
              { label: 'Users Placed', value: '500+', icon: Users },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-4">
                <Icon className="w-5 h-5 text-emerald-400 mb-2 mx-auto" />
                <div className="text-2xl font-bold text-[#F1F5F9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
                <div className="text-xs text-[#94A3B8] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Everything You Need to Land Your{' '}
              <span className="text-emerald-400">Dream Job Abroad</span>
            </h2>
            <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
              From scraping to interview prep — VisaHire AI automates every step of your international job search.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Bot,
                title: 'Autonomous Scraping',
                description: 'AI agent runs 24/7, scraping LinkedIn, Indeed, Glassdoor, Greenhouse & Lever for visa-sponsored roles.',
                color: 'emerald',
              },
              {
                icon: Briefcase,
                title: 'Smart Job Matching',
                description: 'GPT-4o analyzes your profile and CV against every job, scoring matches 0-100 with detailed reasoning.',
                color: 'amber',
              },
              {
                icon: FileText,
                title: 'CV Standardization',
                description: 'Upload your CV and get an ATS-optimized version with a score, improvement suggestions, and download.',
                color: 'cyan',
              },
              {
                icon: MessageSquare,
                title: 'Interview Preparation',
                description: 'Company-specific interview questions with tailored answers based on your background and the job role.',
                color: 'violet',
              },
              {
                icon: Shield,
                title: 'Visa Verified Jobs',
                description: 'Every job is AI-verified for visa sponsorship with confidence scoring — no more false positives.',
                color: 'emerald',
              },
              {
                icon: Zap,
                title: 'Real-time Updates',
                description: 'Instant notifications when new matching jobs appear. Never miss an opportunity again.',
                color: 'amber',
              },
            ].map(({ icon: Icon, title, description, color }) => {
              const colorMap: Record<string, string> = {
                emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
                violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
              }
              return (
                <div key={title} className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6 hover:border-emerald-500/20 hover:-translate-y-1 transition-all duration-200">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${colorMap[color]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-[#F1F5F9] text-lg mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h3>
                  <p className="text-[#94A3B8] text-sm leading-relaxed">{description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-[#1A1D27]/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              How It <span className="text-emerald-400">Works</span>
            </h2>
          </div>
          <div className="space-y-8">
            {[
              { step: '01', title: 'Create Your Profile', desc: 'Tell us your target role, preferred countries, skills, and salary expectations. Takes 5 minutes.' },
              { step: '02', title: 'Upload Your CV', desc: 'Our AI standardizes it for ATS systems, scores it, and suggests improvements.' },
              { step: '03', title: 'AI Finds Your Matches', desc: 'Our agent scrapes thousands of visa-sponsored jobs and matches them to your profile 24/7.' },
              { step: '04', title: 'Prepare & Apply', desc: 'Get company-specific interview prep and apply with confidence.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-6 items-start">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-400 font-bold text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{step}</span>
                </div>
                <div className="pt-2">
                  <h3 className="font-semibold text-[#F1F5F9] text-lg mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h3>
                  <p className="text-[#94A3B8]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Trusted by International Job Seekers
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Priya S.', role: 'Software Engineer → London', quote: 'Found my H-1B sponsored job in 3 weeks. The AI matching is incredibly accurate.' },
              { name: 'Ahmed K.', role: 'Data Scientist → Berlin', quote: 'The CV standardization alone was worth it. My applications went from ignored to interviews.' },
              { name: 'Maria L.', role: 'Product Manager → Toronto', quote: "The interview prep tailored to my background was a game-changer. I knew every question they'd ask." },
            ].map(({ name, role, quote }) => (
              <div key={name} className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-[#94A3B8] text-sm leading-relaxed mb-4">&ldquo;{quote}&rdquo;</p>
                <div>
                  <div className="font-semibold text-[#F1F5F9] text-sm">{name}</div>
                  <div className="text-xs text-emerald-400">{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-emerald-500/10 to-amber-500/5 border border-emerald-500/20 rounded-2xl p-12">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Ready to Find Your <span className="text-emerald-400">Visa-Sponsored Job?</span>
            </h2>
            <p className="text-[#94A3B8] mb-8 text-lg">
              Join thousands of professionals who found their dream jobs abroad with VisaHire AI.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/auth/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/25 text-lg">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/jobs" className="inline-flex items-center gap-2 px-8 py-4 bg-[#1A1D27] border border-[#2A2D3A] hover:border-emerald-500/30 text-[#F1F5F9] font-semibold rounded-xl transition-all text-lg">
                Browse Jobs First
              </Link>
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#94A3B8]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              No credit card required
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A2D3A] py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                VisaHire <span className="text-emerald-400">AI</span>
              </span>
            </div>
            <div className="flex gap-6 text-sm text-[#94A3B8]">
              <Link href="/jobs" className="hover:text-[#F1F5F9] transition-colors">Browse Jobs</Link>
              <Link href="/auth/signin" className="hover:text-[#F1F5F9] transition-colors">Sign In</Link>
              <Link href="/auth/signup" className="hover:text-[#F1F5F9] transition-colors">Sign Up</Link>
            </div>
            <p className="text-sm text-[#94A3B8]">© 2024 VisaHire AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
