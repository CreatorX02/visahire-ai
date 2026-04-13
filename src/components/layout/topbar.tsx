'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Bell, Search, LogOut, User, Settings, ChevronDown } from 'lucide-react'

export function TopBar() {
  const { data: session } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-[#0F1117]/80 backdrop-blur-md border-b border-[#2A2D3A] z-30 flex items-center justify-between px-6">
      {/* Search */}
      <div className="relative hidden sm:flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-[#94A3B8]" />
        <input
          type="text"
          placeholder="Search jobs, companies..."
          className="bg-[#1A1D27] border border-[#2A2D3A] rounded-lg pl-10 pr-4 py-2 text-sm text-[#F1F5F9] placeholder:text-[#94A3B8] focus:outline-none focus:border-emerald-500 w-64"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1A1D27] transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
        </button>

        {/* User menu */}
        {session ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#1A1D27] transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold">
                {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm text-[#F1F5F9] hidden sm:block">{session.user?.name || 'User'}</span>
              <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
            </button>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1A1D27] border border-[#2A2D3A] rounded-xl shadow-xl z-20 overflow-hidden">
                  <Link href="/dashboard/settings" className="flex items-center gap-2 px-4 py-3 text-sm text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#2A2D3A] transition-colors" onClick={() => setDropdownOpen(false)}>
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <Link href="/dashboard/settings" className="flex items-center gap-2 px-4 py-3 text-sm text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#2A2D3A] transition-colors" onClick={() => setDropdownOpen(false)}>
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                  <div className="border-t border-[#2A2D3A]" />
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link href="/auth/signin" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
            Sign In
          </Link>
        )}
      </div>
    </header>
  )
}
