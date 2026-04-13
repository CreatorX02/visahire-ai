import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  targetRole: z.string().optional(),
  industry: z.string().optional(),
  targetCountry: z.array(z.string()).optional(),
  yearsOfExperience: z.number().int().min(0).max(50).nullable().optional(),
  currentLocation: z.string().optional(),
  skills: z.array(z.string()).optional(),
  preferredSalaryMin: z.number().int().min(0).nullable().optional(),
  preferredSalaryMax: z.number().int().min(0).nullable().optional(),
  noticePeriod: z.string().optional(),
  visaStatus: z.string().optional(),
  onboardingComplete: z.boolean().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.userProfile.findUnique({ where: { userId: session.user.id } })
  return NextResponse.json({ profile })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const profile = await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, ...data },
      update: data,
    })

    return NextResponse.json({ profile })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }
}
