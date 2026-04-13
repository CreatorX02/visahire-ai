'use client'
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { User, MapPin, Briefcase, DollarSign, Shield, X, Check, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import toast from 'react-hot-toast'

const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Germany', 'Australia', 'Netherlands', 'Singapore', 'UAE', 'France', 'Switzerland', 'Sweden', 'Norway', 'Denmark', 'New Zealand', 'Ireland']
const SKILLS_LIST = ['JavaScript', 'TypeScript', 'Python', 'React', 'Node.js', 'Next.js', 'Java', 'Go', 'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Machine Learning', 'Data Science', 'SQL', 'PostgreSQL', 'GraphQL', 'REST APIs', 'DevOps', 'Product Management', 'UX Design', 'iOS', 'Android', 'Flutter']

export default function SettingsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [form, setForm] = useState({
    targetRole: '',
    industry: '',
    currentLocation: '',
    targetCountry: [] as string[],
    yearsOfExperience: '',
    skills: [] as string[],
    preferredSalaryMin: '',
    preferredSalaryMax: '',
    noticePeriod: '',
    visaStatus: '',
  })

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        if (data.profile) {
          setForm({
            targetRole: data.profile.targetRole || '',
            industry: data.profile.industry || '',
            currentLocation: data.profile.currentLocation || '',
            targetCountry: data.profile.targetCountry || [],
            yearsOfExperience: data.profile.yearsOfExperience?.toString() || '',
            skills: data.profile.skills || [],
            preferredSalaryMin: data.profile.preferredSalaryMin?.toString() || '',
            preferredSalaryMax: data.profile.preferredSalaryMax?.toString() || '',
            noticePeriod: data.profile.noticePeriod || '',
            visaStatus: data.profile.visaStatus || '',
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          yearsOfExperience: form.yearsOfExperience ? parseInt(form.yearsOfExperience) : null,
          preferredSalaryMin: form.preferredSalaryMin ? parseInt(form.preferredSalaryMin) : null,
          preferredSalaryMax: form.preferredSalaryMax ? parseInt(form.preferredSalaryMax) : null,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Settings saved!')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const addSkill = (s: string) => {
    if (s && !form.skills.includes(s)) setForm({ ...form, skills: [...form.skills, s] })
    setSkillInput('')
  }

  const toggleCountry = (c: string) => {
    setForm(prev => ({
      ...prev,
      targetCountry: prev.targetCountry.includes(c)
        ? prev.targetCountry.filter(x => x !== c)
        : [...prev.targetCountry, c],
    }))
  }

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-[#1A1D27] rounded-xl animate-pulse" />)}</div>

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F1F5F9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Settings</h1>
          <p className="text-[#94A3B8] mt-1">Manage your profile and job preferences</p>
        </div>
        <Button onClick={handleSave} loading={saving}>
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </div>

      {/* Account info */}
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-[#F1F5F9] flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <User className="w-5 h-5 text-emerald-400" /> Account
        </h2>
        <div className="flex items-center gap-4 p-4 bg-[#0F1117] rounded-xl">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg font-bold">
            {session?.user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-medium text-[#F1F5F9]">{session?.user?.name || 'User'}</p>
            <p className="text-sm text-[#94A3B8]">{session?.user?.email}</p>
          </div>
        </div>
      </div>

      {/* Role & location */}
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-[#F1F5F9] flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <Briefcase className="w-5 h-5 text-emerald-400" /> Role & Location
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Target Role"
            placeholder="e.g. Senior Software Engineer"
            value={form.targetRole}
            onChange={e => setForm({ ...form, targetRole: e.target.value })}
          />
          <Input
            label="Current Location"
            placeholder="e.g. Mumbai, India"
            value={form.currentLocation}
            onChange={e => setForm({ ...form, currentLocation: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#94A3B8] mb-2">Target Countries</label>
          <div className="grid grid-cols-3 gap-2">
            {COUNTRIES.map(c => (
              <button
                key={c}
                onClick={() => toggleCountry(c)}
                className={`px-3 py-2 rounded-lg text-xs border text-left transition-all ${form.targetCountry.includes(c) ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#0F1117] border-[#2A2D3A] text-[#94A3B8] hover:border-[#3A3D4A]'}`}
              >
                {form.targetCountry.includes(c) && <Check className="w-3 h-3 inline mr-1" />}
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Experience & skills */}
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-[#F1F5F9] flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <MapPin className="w-5 h-5 text-emerald-400" /> Experience & Skills
        </h2>
        <Select
          label="Years of Experience"
          placeholder="Select level"
          options={[
            { value: '0', label: 'Less than 1 year' }, { value: '1', label: '1 year' },
            { value: '2', label: '2 years' }, { value: '3', label: '3 years' },
            { value: '5', label: '5 years' }, { value: '7', label: '7 years' },
            { value: '10', label: '10+ years' }, { value: '15', label: '15+ years' },
          ]}
          value={form.yearsOfExperience}
          onChange={e => setForm({ ...form, yearsOfExperience: e.target.value })}
        />
        <div>
          <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Skills</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.skills.map(s => (
              <span key={s} className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-sm">
                {s} <button onClick={() => setForm({ ...form, skills: form.skills.filter(x => x !== s) })}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add a skill and press Enter..."
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput) } }}
            className="w-full bg-[#0F1117] border border-[#2A2D3A] rounded-lg px-3 py-2.5 text-[#F1F5F9] placeholder:text-[#94A3B8] text-sm focus:outline-none focus:border-emerald-500"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SKILLS_LIST.filter(s => !form.skills.includes(s)).slice(0, 8).map(s => (
              <button key={s} onClick={() => addSkill(s)} className="px-2 py-0.5 bg-[#0F1117] border border-[#2A2D3A] text-[#94A3B8] hover:text-[#F1F5F9] rounded-full text-xs">+ {s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Salary */}
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-[#F1F5F9] flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <DollarSign className="w-5 h-5 text-emerald-400" /> Salary & Availability
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Min Salary (USD/year)"
            type="number"
            placeholder="80000"
            value={form.preferredSalaryMin}
            onChange={e => setForm({ ...form, preferredSalaryMin: e.target.value })}
          />
          <Input
            label="Max Salary (USD/year)"
            type="number"
            placeholder="150000"
            value={form.preferredSalaryMax}
            onChange={e => setForm({ ...form, preferredSalaryMax: e.target.value })}
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
          value={form.noticePeriod}
          onChange={e => setForm({ ...form, noticePeriod: e.target.value })}
        />
      </div>

      {/* Visa */}
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-[#F1F5F9] flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <Shield className="w-5 h-5 text-emerald-400" /> Visa Status
        </h2>
        <Select
          label="Current Visa Status"
          placeholder="Select status"
          options={[
            { value: 'citizen', label: 'Citizen' },
            { value: 'permanent_resident', label: 'Permanent Resident' },
            { value: 'work_visa', label: 'Current Work Visa' },
            { value: 'student_visa', label: 'Student Visa' },
            { value: 'no_status', label: 'No Status / Seeking Sponsorship' },
            { value: 'other', label: 'Other' },
          ]}
          value={form.visaStatus}
          onChange={e => setForm({ ...form, visaStatus: e.target.value })}
        />
      </div>

      <Button onClick={handleSave} loading={saving} size="lg" className="w-full">
        <Save className="w-4 h-4" /> Save All Changes
      </Button>
    </div>
  )
}
