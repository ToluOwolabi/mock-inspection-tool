import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, company_name } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('inspections')
      .insert({
        email: email.trim().toLowerCase(),
        company_name: company_name?.trim() || null,
        status: 'in_progress',
      })
      .select('id')
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to create inspection' }, { status: 500 })
    }

    return NextResponse.json({ id: data.id }, { status: 201 })
  } catch (err) {
    console.error('POST /api/inspections error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
