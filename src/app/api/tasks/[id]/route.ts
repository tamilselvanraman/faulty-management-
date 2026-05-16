import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { taskSchema } from '@/lib/validations'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks').select('*, assignee:faculty(id,name), task_logs(*, changer:faculty(id,name))').eq('id', id).single()
  if (error) return NextResponse.json({ data: null, error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data, error: null })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const body = await request.json()
  const parsed = taskSchema.partial().safeParse(body)
  if (!parsed.success) return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 400 })

  // Get old status for log
  const { data: old } = await supabase.from('tasks').select('status').eq('id', id).single()

  const { data, error } = await supabase.from('tasks').update(parsed.data).eq('id', id).select().single()
  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })

  // Log status change
  if (parsed.data.status && old?.status !== parsed.data.status) {
    await supabase.from('task_logs').insert({ task_id: id, old_status: old?.status, new_status: parsed.data.status })
  }
  return NextResponse.json({ data, error: null })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  return NextResponse.json({ data: { id }, error: null })
}
