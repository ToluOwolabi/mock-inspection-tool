import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { question_id, question, answer, response_confidence } = body

    const validConfidenceLevels = ['immediate', 'uncertain', 'need_to_check']
    if (!validConfidenceLevels.includes(response_confidence)) {
      return NextResponse.json({ error: 'Invalid confidence level' }, { status: 400 })
    }

    if (!question_id || !question || !answer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { error } = await supabase.from('inspection_responses').upsert(
      {
        inspection_id: id,
        question_id,
        question,
        answer: answer.trim(),
        response_confidence,
      },
      { onConflict: 'inspection_id,question_id' }
    )

    if (error) {
      console.error('Supabase upsert error:', error)
      return NextResponse.json({ error: 'Failed to save response' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('POST /api/inspections/[id]/responses error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
