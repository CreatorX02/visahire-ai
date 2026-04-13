'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { ArrowRight, ArrowLeft, Check, Zap, MapPin, Briefcase, DollarSign, Shield, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { SessionProvider } from '@/components/providers/session-provider'

const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Germany', 'Australia', 'Netherlands', 'Singapore', 'UAE', 'France', 'Switzerland', 'Sweden', 'Norway', 'Denmark', 'New Zealand', 'Ireland', 'Japan', 'South Korea']
const SKILLS = ['JavaScript', 'TypeScript', 'Python', 'React', 'Node.js', 'Next.js', 'Java', 'Go', 'Rust', 'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Machine Learning', 'Data Science', 'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST APIs', 'Microservices', 'DevOps', 'CI/CD', 'Product Management', 'UX Design', 'Figma', 'iOS', 'Android', 'Flutter', 'React Native', 'Vue.js', 'Angular', 'PHP', 'Laravel', 'Django', 'FastAPI', 'Spring Boot', 'Scala', 'Spark', 'TensorFlow', 'PyTorch', 'Agile', 'Scrum']
const INDUSTRIES = ['Software Engineering', 'Data Science & AI', 'Product Management', 'DevOps & Infrastructure', 'Mobile Development', 'Frontend Development', 'Backend Development', 'Full Stack Development', 'Security Engineering', 'Machine Learning', 'UX/UI Design', 'QA Engineering', 'Sales Engineering', 'Finance Tech', 'Healthcare Tech']
const VISA_STATUSES = [
  { value: 'citizen', label: 'Citizen' },
  { value: 'permanent_resident', label: 'Permanent Resident' },
  { value: 'work_visa', label: 'Current Work Visa' },
  { value: 'student_visa', label: 'Student Visa' },
  { value: 'no_status', label: 'No Current Status / Seeking Sponsorship' },
  { value: 'other', label: 'Other' },
]

function OnboardingContent() {
  const router = useRouter()
  const { data: session } = useSession()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [data, setData] = useState({
    targetRole: '',
    industry: '',
    targetCountry: [] as string[],
    yearsOfExperience: '',
    skills: [] as string[],
    preferredSalaryMin: '',
    preferredSalaryMax: '',
    noticePeriod: '',
    visaStatus: '',
    currentLocation: '',
  })

  const totalSteps = 5

  const addSkill = (skill: string) => {
    if (skill && !data.skills.includes(skill)) {
      setData({ ...data, skills: [...data.skills, skill] })
    }
    setSkillInput('')
  }

  const removeSkill = (skill: string) => {
    setData({ ...data, skills: data.skills.filter(s => s !== skill) })
  }

  const toggleCountry = (country: string) => {
    if (data.targetCountry.includes(country)) {
      setData({ ...data, targetCountry: data.targetCountry.filter(c => c !== country) })
    } else {
      setData({ ...data, targetCountry: [...data.targetCountry, country] })
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          yearsOfExperience: data.yearsOfExperience ? parseInt(data.yearsOfExperience) : null,
          preferredSalaryMin: data.preferredSalaryMin ? parseInt(data.preferredSalaryMin) : null,
          preferredSalaryMax: data.preferredSalaryMax ? parseInt(data.preferredSalaryMax) : null,
          onboardingComplete: true,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Profile saved! Finding your matches...')
      router.push('/dashboard')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { icon: Briefcase, label: 'Role' },
    { icon: MapPin, label: 'Location' },
    { icon: Zap, label: 'Skills' },
    { icon: DollarSign, label: 'Salary' },
    { icon: Shield, label: 'Visa' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0F1117' }}>
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-[#F1F5F9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            VisaHire <span className="text-emerald-400">AI</span>
          </span>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8 px-4">
          {steps.map((s, i) => {
            const StepIcon = s.icon
            const stepNum = i + 1
            const active = stepNum === step
            const done = stepNum < step
            return (
              <React.Fragment key={s.label}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${done ? 'bg-emerald-500 border-emerald-500' : active ? 'border-emerald-500 bg-emerald-500/10' : 'border-[#2A2D3A] bg-[#1A1D27]'}`}>
                    {done ? <Check className="w-4 h-4 text-white" /> : <StepIcon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-[#94A3B8]'}`} />}
                  </div>
                  <span className={`text-xs hidden sm:block ${active ? 'text-emerald-400' : done ? 'text-emerald-600' : 'text-[#94A3B8]'}`}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${stepNum < step ? 'bg-emerald-500' : 'bg-[#2A2D3A]'}`} />
                )}
              </React.Fragment>
            )
          })}
        </div>

        <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-2xl p-8">
          {/* Step 1: Role */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>What's your target role?</h2>
                <p className="text-[#94A3B8] text-sm">This helps us find the most relevant visa-sponsored jobs for you.</p>
              </div>
              <Input
                label="Job Title / Role"
                placeholder="e.g. Senior Software Engineer"
                value={data.targetRole}
                onChange={e => setData({ ...data, targetRole: e.target.value })}
              />
              <Select
                label="Industry"
                placeholder="Select your industry"
                options={INDUSTRIES.map(i => ({ value: i, label: i }))}
                value={data.industry}
                onChange={e => setData({ ...data, industry: e.target.value })}
              />
              <Input
                label="Current Location"
                placeholder="e.g. Mumbai, India"
                value={data.currentLocation}
                onChange={e => setData({ ...data, currentLocation: e.target.value })}
              />
            </div>
          )}

          {/* Step 2: Countries */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Where do you want to work?</h2>
                <p className="text-[#94A3B8] text-sm">Select all countries you're open to. We'll prioritize visa-sponsored roles there.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COUNTRIES.map(country => (
                  <button
                    key={country}
                    onClick={() => toggleCountry(country)}
                    className={`px-3 py-2 rounded-lg text-sm border transition-all text-left ${data.targetCountry.includes(country) ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#0F1117] border-[#2A2D3A] text-[#94A3B8] hover:border-[#3A3D4A]'}`}
                  >
                    {data.targetCountry.includes(country) && <Check className="w-3 h-3 inline mr-1" />}
                    {country}
                  </button>
                ))}
              </div>
              {data.targetCountry.length > 0 && (
                <p className="text-sm text-emerald-400">{data.targetCountry.length} countries selected</p>
              )}
            </div>
          )}

          {/* Step 3: Skills */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Your skills & experience</h2>
                <p className="text-[#94A3B8] text-sm">Add your technical and soft skills for better job matching.</p>
              </div>
              <Select
                label="Years of Experience"
                placeholder="Select experience level"
                options={[
                  { value: '0', label: 'Less than 1 year' },
                  { value: '1', label: '1 year' },
                  { value: '2', label: '2 years' },
                  { value: '3', label: '3 years' },
                  { value: '5', label: '5 years' },
                  { value: '7', label: '7 years' },
                  { value: '10', label: '10+ years' },
                  { value: '15', label: '15+ years' },
                ]}
                value={data.yearsOfExperience}
                onChange={e => setData({ ...data, yearsOfExperience: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Skills</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {data.skills.map(skill => (
                    <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-sm">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-emerald-200"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Type a skill and press Enter..."
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput) } }}
                  className="w-full bg-[#0F1117] border border-[#2A2D3A] rounded-lg px-3 py-2.5 text-[#F1F5F9] placeholder:text-[#94A3B8] text-sm focus:outline-none focus:border-emerald-500"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {SKILLS.filter(s => !data.skills.includes(s) && (!skillInput || s.toLowerCase().includes(skillInput.toLowerCase()))).slice(0, 10).map(skill => (
                    <button key={skill} onClick={() => addSkill(skill)} className="px-2 py-0.5 bg-[#0F1117] border border-[#2A2D3A] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#3A3D4A] rounded-full text-xs transition-colors">
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Salary */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Salary & availability</h2>
                <p className="text-[#94A3B8] text-sm">Help us filter jobs that match your financial expectations.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Min. Salary (USD/year)"
                  type="number"
                  placeholder="80000"
                  value={data.preferredSalaryMin}
                  onChange={e => setData({ ...data, preferredSalaryMin: e.target.value })}
                />
                <Input
                  label="Max. Salary (USD/year)"
                  type="number"
                  placeholder="150000"
                  value={data.preferredSalaryMax}
                  onChange={e => setData({ ...data, preferredSalaryMax: e.target.value })}
                />
              </div>
              <Select
                label="Notice Period"
                placeholder="How soon can you start?"
                options={[
                  { value: 'immediately', label: 'Immediately' },
                  { value: '2_weeks', label: '2 weeks' },
                  { value: '1_month', label: '1 month' },
                  { value: '2_months', label: '2 months' },
                  { value: '3_months', label: '3 months' },
                  { value: '6_months', label: '6+ months' },
                ]}
                value={data.noticePeriod}
                onChange={e => setData({ ...data, noticePeriod: e.target.value })}
              />
            </div>
          )}

          {/* Step 5: Visa */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Visa & work authorization</h2>
                <p className="text-[#94A3B8] text-sm">This helps us find employers that can sponsor your visa.</p>
              </div>
              <div className="space-y-3">
                {VISA_STATUSES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setData({ ...data, visaStatus: value })}
                    className={`w-full px-4 py-3 rounded-xl border text-left text-sm transition-all ${data.visaStatus === value ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#0F1117] border-[#2A2D3A] text-[#94A3B8] hover:border-[#3A3D4A]'}`}
                  >
                    {data.visaStatus === value && <Check className="w-4 h-4 inline mr-2" />}
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <Button variant="secondary" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            ) : (
              <div />
            )}
            <span className="text-xs text-[#94A3B8]">Step {step} of {totalSteps}</span>
            {step < totalSteps ? (
              <Button onClick={() => setStep(step + 1)}>
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} loading={loading}>
                Complete Setup <Check className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <SessionProvider>
      <OnboardingContent />
    </SessionProvider>
  )
}
