import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const activities = await prisma.agentActivity.findMany({
    orderBy: { timestamp: 'desc' },
    take: 50,
  })
  return NextResponse.json({ activities })
}
