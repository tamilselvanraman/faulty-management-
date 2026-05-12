import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { studentSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const year = searchParams.get('year')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') ?? '1')
    const perPage = parseInt(searchParams.get('per_page') ?? '20')

    let query = supabase.from('students').select('*', { count: 'exact' })
    if (department) query = query.eq('department', department)
    if (year && year !== 'All') query = query.eq('year', year)
    if (search) query = query.or(`name.ilike.%${search}%,roll_number.ilike.%${search}%`)

    const from = (page - 1) * perPage
    const { data, error, count } = await query.range(from, from + perPage - 1).order('created_at', { ascending: false })
    if (error) throw error

    return NextResponse.json({ data, error: null, meta: { total: count, page, per_page: perPage } })
  } catch {
    return NextResponse.json({ data: null, error: 'Failed to fetch students' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const parsed = studentSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ data: null, error: parsed.error.errors[0].message }, { status: 400 })
    const { data, error } = await supabase.from('students').insert(parsed.data).select().single()
    if (error) throw error
    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ data: null, error: err.message }, { status: 500 })
  }
}
