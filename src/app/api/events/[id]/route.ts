import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('events').select('*').eq('id', id).single()
  if (error) return NextResponse.json({ data: null, error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data, error: null })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()
  const body = await request.json()
  // Allow any partial update
  const payload: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(body)) {
    if (v !== '' && v !== undefined && v !== null) payload[k] = v
  }
  const { data, error } = await supabase.from('events').update(payload).eq('id', id).select().single()
  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  return NextResponse.json({ data, error: null })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  return NextResponse.json({ data: { id }, error: null })
}
