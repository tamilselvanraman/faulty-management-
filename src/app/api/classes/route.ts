import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Flexible class schema — academic_year has default so the form doesn't need to send it
const classInsertSchema = z.object({
  hall_number: z.string().min(1, 'Hall number is required'),
  type_building: z.string().min(1, 'Building is required'),
  department: z.string().min(1, 'Department is required'),
  academic_year: z.string().optional().default('2025-26'),
  section: z.string().min(1, 'Section is required'),
  advisor_id: z.string().optional().or(z.literal('')),
  strength: z.number().int().min(0).default(0),
  capacity: z.number().int().min(1).default(50),
  status: z.string().default('active'),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const building = searchParams.get('building')

    let query = supabase.from('classes').select('*, advisor:faculty(id, name, department)', { count: 'exact' })
    if (department && department !== 'All') query = query.eq('department', department)
    if (building && building !== 'All') query = query.eq('type_building', building)

    const { data, error, count } = await query.order('hall_number')
    if (error) throw error

    const mappedData = data?.map(c => ({
      ...c,
      advisor_name: c.advisor?.name || 'Unassigned',
      advisor_id: c.advisor?.id || null
    }))

    return NextResponse.json({ data: mappedData, error: null, meta: { total: count } })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ data: null, error: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()
    const parsed = classInsertSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 400 })
    // Clean empty advisor_id
    const payload: Record<string, unknown> = { ...parsed.data }
    if (!payload.advisor_id) delete payload.advisor_id
    const { data, error } = await supabase.from('classes').insert(payload).select().single()
    if (error) throw error
    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ data: null, error: msg }, { status: 500 })
  }
}

