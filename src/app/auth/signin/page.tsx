'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Zap, Mail, Lock, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicLoading, setMagicLoading] = useState(false)

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await signIn('credentials', { email, password, redirect: false })
      if (res?.error) {
        toast.error('Invalid email or password')
      } else {
        router.push('/dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async () => {
    if (!email) { toast.error('Enter your email first'); return }
    setMagicLoading(true)
    try {
      await signIn('email', { email, callbackUrl: '/dashboard' })
      toast.success('Magic link sent! Check your email.')
    } catch {
      toast.error('Failed to send magic link')
    } finally {
      setMagicLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0F1117' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
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
            Welcome back
          </h1>
          <p className="text-[#94A3B8] text-sm mb-8">Sign in to continue finding visa-sponsored jobs</p>

          {/* Google */}
          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 border border-[#2A2D3A] hover:border-[#3A3D4A] rounded-xl text-[#F1F5F9] text-sm font-medium transition-all mb-6"
          >
            <Globe className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#2A2D3A]" />
            <span className="text-xs text-[#94A3B8]">or sign in with email</span>
            <div className="flex-1 h-px bg-[#2A2D3A]" />
          </div>

          <form onSubmit={handleCredentials} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
            />
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-px bg-[#2A2D3A]" />
            <span className="text-xs text-[#94A3B8]">or</span>
            <div className="flex-1 h-px bg-[#2A2D3A]" />
          </div>

          <button
            onClick={handleMagicLink}
            disabled={magicLoading}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 border border-[#2A2D3A] hover:border-emerald-500/30 rounded-xl text-[#94A3B8] hover:text-[#F1F5F9] text-sm transition-all"
          >
            <Mail className="w-4 h-4" />
            {magicLoading ? 'Sending...' : 'Send Magic Link'}
          </button>

          <p className="mt-6 text-center text-sm text-[#94A3B8]">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-emerald-400 hover:text-emerald-300">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
