'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Briefcase, FileText, MessageSquare, Bot } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/dashboard/matches', label: 'Matches', icon: Briefcase },
  { href: '/dashboard/cv', label: 'CV', icon: FileText },
  { href: '/dashboard/interviews', label: 'Prep', icon: MessageSquare },
  { href: '/dashboard/agent', label: 'Agent', icon: Bot },
]

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#1A1D27] border-t border-[#2A2D3A] flex">
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
              'flex-1 flex flex-col items-center py-3 gap-1 transition-colors',
              active ? 'text-emerald-400' : 'text-[#94A3B8]'
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
