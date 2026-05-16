import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { classSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const building = searchParams.get('building')

    let query = supabase.from('classes').select('*, advisor:faculty(id, name, department)', { count: 'exact' })
    if (department && department !== 'All') query = query.eq('department', department)
    if (building && building !== 'All') query = query.eq('type_building', building)

    const { data, error, count } = await query.order('hall_number')
    if (error) throw error

    // Map advisor details to match UI expectation
    const mappedData = data?.map(c => ({
      ...c,
      advisor_name: c.advisor?.name || 'Unassigned',
      advisor_id: c.advisor?.id || null
    }))

    return NextResponse.json({ data: mappedData, error: null, meta: { total: count } })
  } catch (err: any) {
    return NextResponse.json({ data: null, error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const parsed = classSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 400 })
    const { data, error } = await supabase.from('classes').insert(parsed.data).select().single()
    if (error) throw error
    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ data: null, error: err.message }, { status: 500 })
  }
}

