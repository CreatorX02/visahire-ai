import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/openai'
import { z } from 'zod'

const schema = z.object({ cvId: z.string() })

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { cvId } = schema.parse(body)

    const cv = await prisma.cV.findFirst({ where: { id: cvId, userId: session.user.id } })
    if (!cv) return NextResponse.json({ error: 'CV not found' }, { status: 404 })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert ATS-optimized CV writer. Analyze the following CV and produce a standardized version. Rules:
- Restructure into: Professional Summary, Skills (categorized: Technical, Soft, Tools), Experience (with quantified achievements), Education, Certifications
- Remove photos, personal details like age/marital status/nationality
- Use strong action verbs and quantify achievements wherever possible
- Optimize for ATS systems (standard section headings, no tables, no graphics)
- Return ONLY valid JSON (no markdown wrapper): {"standardizedCV": "string (markdown format)", "overallScore": number (0-100), "improvements": ["string"], "missingSections": ["string"]}`,
        },
        { role: 'user', content: cv.extractedText.slice(0, 8000) },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 3000,
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')

    const updated = await prisma.cV.update({
      where: { id: cvId },
      data: {
        standardizedVersion: result.standardizedCV,
        overallScore: Math.min(100, Math.max(0, result.overallScore || 0)),
        improvements: result.improvements || [],
        missingSections: result.missingSections || [],
      },
    })

    return NextResponse.json({ cv: updated })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    console.error('[CV Standardize]', err)
    return NextResponse.json({ error: 'Standardization failed' }, { status: 500 })
  }
}
