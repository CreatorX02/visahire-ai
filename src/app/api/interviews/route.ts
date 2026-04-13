import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const preps = await prisma.interviewPrep.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { job: true },
  })

  return NextResponse.json({ preps })
}
