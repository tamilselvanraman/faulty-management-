import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// assigned_to in DB is UUID FK to faculty — we drop it from insert
// since the frontend sends plain text (e.g. "Exam Cell")
const taskInsertSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  category: z.string().optional().default(''),
  // assigned_to is stored as text in the UI — we map it to category note, not the UUID FK
  assigned_to_label: z.string().optional(), // frontend "assigned_to" string — ignored for DB
})

export async function GET(request: NextRequest) {
  const supabase = createServiceClient()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')

  let query = supabase.from('tasks').select('*')
  if (status) query = query.eq('status', status)
  if (priority) query = query.eq('priority', priority)

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  return NextResponse.json({ data, error: null })
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient()
  const body = await request.json()
  const parsed = taskInsertSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 400 })
  // Only pass DB column fields — drop ui-only fields
  const { assigned_to_label, due_date, description, category, ...rest } = parsed.data
  const payload: Record<string, unknown> = { ...rest }
  if (description) payload.description = description
  if (category) payload.category = category
  if (due_date) payload.due_date = due_date
  // assigned_to_label is ignored — DB field is UUID FK
  const { data, error } = await supabase.from('tasks').insert(payload).select().single()
  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  return NextResponse.json({ data, error: null }, { status: 201 })
}

