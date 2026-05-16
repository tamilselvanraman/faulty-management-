import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { timetableSlotSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get('class_id')
  let query = supabase.from('timetable').select('*, faculty(id,name)')
  if (classId) query = query.eq('class_id', classId)
  const { data, error } = await query.order('period_number')
  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  return NextResponse.json({ data, error: null })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()
  const parsed = timetableSlotSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 400 })
  // Conflict check: same faculty, same day+period
  if (parsed.data.faculty_id) {
    const { data: conflict } = await supabase.from('timetable')
      .select('id,class_id').eq('faculty_id', parsed.data.faculty_id)
      .eq('day_of_week', parsed.data.day_of_week).eq('period_number', parsed.data.period_number).neq('class_id', parsed.data.class_id)
    if (conflict && conflict.length > 0) {
      return NextResponse.json({ data: null, error: 'Faculty conflict: already assigned in another class at this slot' }, { status: 409 })
    }
  }
  const { data, error } = await supabase.from('timetable').upsert(parsed.data, { onConflict: 'class_id,day_of_week,period_number' }).select().single()
  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  return NextResponse.json({ data, error: null }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ data: null, error: 'ID required' }, { status: 400 })
  const { error } = await supabase.from('timetable').delete().eq('id', id)
  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  return NextResponse.json({ data: { id }, error: null })
}

