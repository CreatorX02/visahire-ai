'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Briefcase, FileText, MessageSquare,
  Bot, Settings, ChevronLeft, ChevronRight, Zap, Globe
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/matches', label: 'My Matches', icon: Briefcase },
  { href: '/dashboard/cv', label: 'My CV', icon: FileText },
  { href: '/dashboard/interviews', label: 'Interview Prep', icon: MessageSquare },
  { href: '/dashboard/agent', label: 'AI Agent', icon: Bot },
  { href: '/jobs', label: 'Browse Jobs', icon: Globe },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-40 flex flex-col bg-[#1A1D27] border-r border-[#2A2D3A]',
        'transition-all duration-300 ease-in-out hidden md:flex',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 p-4 border-b border-[#2A2D3A] h-16', collapsed && 'justify-center')}>
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg text-[#F1F5F9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            VisaHire <span className="text-emerald-400">AI</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                active
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#2A2D3A]',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', active ? 'text-emerald-400' : '')} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse button */}
      <div className="p-3 border-t border-[#2A2D3A]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn('flex items-center gap-2 px-3 py-2 w-full rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#2A2D3A] transition-colors', collapsed && 'justify-center')}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span className="text-sm">Collapse</span></>}
        </button>
      </div>
    </aside>
  )
}
