'use client'
import React from 'react'
import { SessionProvider } from 'next-auth/react'
import { Sidebar } from '@/components/layout/sidebar'
import { TopBar } from '@/components/layout/topbar'
import { MobileNav } from '@/components/layout/mobile-nav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-[#0F1117]">
        <Sidebar />
        <TopBar />
        <main className="md:ml-64 pt-16 pb-20 md:pb-8 min-h-screen">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        <MobileNav />
      </div>
    </SessionProvider>
  )
}
