import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { runJobMatching } from '@/lib/ai/matcher'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await runJobMatching(session.user.id)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[Matching]', err)
    return NextResponse.json({ error: 'Matching failed' }, { status: 500 })
  }
}
