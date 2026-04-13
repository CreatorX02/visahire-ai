import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { status } = await req.json()

  const validStatuses = ['new', 'reviewed', 'applied', 'rejected']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const match = await prisma.jobMatch.findFirst({ where: { id, userId: session.user.id } })
  if (!match) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.jobMatch.update({ where: { id }, data: { status } })
  return NextResponse.json({ match: updated })
}
