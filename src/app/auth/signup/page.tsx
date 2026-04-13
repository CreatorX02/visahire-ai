'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import toast from 'react-hot-toast'
import { Zap, Mail, Lock, User, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignUpPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Registration failed')
        return
      }
      await signIn('credentials', { email: form.email, password: form.password, redirect: false })
      router.push('/onboarding')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0F1117' }}>
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-2xl text-[#F1F5F9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            VisaHire <span className="text-emerald-400">AI</span>
          </span>
        </Link>

        <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-[#F1F5F9] mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Create your account
          </h1>
          <p className="text-[#94A3B8] text-sm mb-8">Start finding visa-sponsored jobs with AI</p>

          <button
            onClick={() => signIn('google', { callbackUrl: '/onboarding' })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 border border-[#2A2D3A] hover:border-[#3A3D4A] rounded-xl text-[#F1F5F9] text-sm font-medium transition-all mb-6"
          >
            <Globe className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#2A2D3A]" />
            <span className="text-xs text-[#94A3B8]">or sign up with email</span>
            <div className="flex-1 h-px bg-[#2A2D3A]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Smith"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              icon={<User className="w-4 h-4" />}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              icon={<Mail className="w-4 h-4" />}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              icon={<Lock className="w-4 h-4" />}
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat password"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              icon={<Lock className="w-4 h-4" />}
              required
            />
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#94A3B8]">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-emerald-400 hover:text-emerald-300">Sign in</Link>
          </p>
          <p className="mt-3 text-center text-xs text-[#94A3B8]">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
