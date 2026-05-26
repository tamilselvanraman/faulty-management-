import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Flexible event schema that matches the DB events table exactly
const eventInsertSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  time: z.string().optional().default(''),
  location: z.string().optional().default(''),
  type: z.enum(['Academic', 'Meeting', 'Social', 'Recurring']),
  priority: z.enum(['High', 'Normal', 'Low', 'high', 'normal', 'low']).default('Normal').transform(v =>
    (v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()) as 'High' | 'Normal' | 'Low'
  ),
})

export async function GET(request: NextRequest) {
  const supabase = createServiceClient()
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  let query = supabase.from('events').select('*')
  if (type) query = query.eq('type', type)
  if (from) query = query.gte('date', from)
  if (to) query = query.lte('date', to)

  const { data, error } = await query.order('date').order('time')
  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  return NextResponse.json({ data, error: null })
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient()
  const body = await request.json()
  const parsed = eventInsertSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 400 })
  }
  const { data, error } = await supabase.from('events').insert(parsed.data).select().single()
  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  return NextResponse.json({ data, error: null }, { status: 201 })
}

