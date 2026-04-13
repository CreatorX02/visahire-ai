import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/openai'
import { z } from 'zod'

const schema = z.object({ jobId: z.string(), regenerate: z.boolean().optional() })

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { jobId, regenerate } = schema.parse(body)

    const [job, cv, profile] = await Promise.all([
      prisma.job.findUnique({ where: { id: jobId } }),
      prisma.cV.findFirst({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' } }),
      prisma.userProfile.findUnique({ where: { userId: session.user.id } }),
    ])

    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    if (!regenerate) {
      const existing = await prisma.interviewPrep.findFirst({
        where: { userId: session.user.id, jobId },
      })
      if (existing) return NextResponse.json({ prep: existing })
    }

    const candidateContext = `
Background:
- Role: ${profile?.targetRole || 'Not specified'}
- Experience: ${profile?.yearsOfExperience || 'Not specified'} years
- Skills: ${profile?.skills?.join(', ') || 'Not specified'}
- Visa Status: ${profile?.visaStatus || 'Needs sponsorship'}
${cv ? `\nCV Extract:\n${cv.extractedText?.slice(0, 2000)}` : ''}
`.trim()

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Generate a comprehensive interview prep guide for the specified role. Return ONLY valid JSON:
{
  "companyResearch": "string",
  "questions": [
    {
      "question": "string",
      "category": "behavioral" | "technical" | "situational" | "role-specific" | "visa/authorization",
      "difficulty": "easy" | "medium" | "hard",
      "suggestedAnswer": "string",
      "followUps": ["string"]
    }
  ],
  "visaSpecificTips": ["string"],
  "redFlags": ["string"]
}`,
        },
        {
          role: 'user',
          content: `Job: ${job.title} at ${job.company}\nLocation: ${job.location || job.country}\nDescription: ${job.description.slice(0, 1500)}\n\nCandidate:\n${candidateContext}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4000,
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')

    const prep = await prisma.interviewPrep.upsert({
      where: { userId_jobId: { userId: session.user.id, jobId } },
      create: {
        userId: session.user.id,
        jobId,
        questions: result.questions || [],
        companyResearchNotes: result.companyResearch,
        visaSpecificTips: result.visaSpecificTips || [],
        redFlags: result.redFlags || [],
      },
      update: {
        questions: result.questions || [],
        companyResearchNotes: result.companyResearch,
        visaSpecificTips: result.visaSpecificTips || [],
        redFlags: result.redFlags || [],
      },
    })

    return NextResponse.json({ prep })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    console.error('[Interview Generate]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
