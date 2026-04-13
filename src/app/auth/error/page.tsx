'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, Zap } from 'lucide-react'
import { Suspense } from 'react'

function ErrorContent() {
  const params = useSearchParams()
  const error = params.get('error')
  const messages: Record<string, string> = {
    Configuration: 'Server configuration error. Please try again later.',
    AccessDenied: 'Access denied. You do not have permission.',
    Verification: 'The verification link has expired or was already used.',
    Default: 'An authentication error occurred.',
  }
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="w-8 h-8 text-rose-400" />
      </div>
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        Authentication Error
      </h1>
      <p className="text-[#94A3B8] mb-8">{messages[error ?? 'Default'] ?? messages.Default}</p>
      <Link href="/auth/signin" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors">
        Try Again
      </Link>
    </div>
  )
}

export default function AuthErrorPage() {
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
          <Suspense fallback={<div className="text-center text-[#94A3B8]">Loading...</div>}>
            <ErrorContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
