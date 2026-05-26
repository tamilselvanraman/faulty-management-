import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { committeeSchema } from '@/lib/validations'

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('committees')
    .select('*, committee_members(id, role, faculty(id,name,designation))')
    .order('name')
  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  return NextResponse.json({ data, error: null })
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient()
  const body = await request.json()
  const parsed = committeeSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 400 })
  const { data, error } = await supabase.from('committees').insert(parsed.data).select().single()
  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  return NextResponse.json({ data, error: null }, { status: 201 })
}

