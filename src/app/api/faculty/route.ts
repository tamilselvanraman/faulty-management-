import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { facultySchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') ?? '1')
    const perPage = parseInt(searchParams.get('per_page') ?? '20')

    let query = supabase.from('faculty').select('*', { count: 'exact' })

    if (department) query = query.eq('department', department)
    if (search) query = query.ilike('name', `%${search}%`)

    const from = (page - 1) * perPage
    query = query.range(from, from + perPage - 1).order('name')

    const { data, error, count } = await query
    if (error) throw error

    return NextResponse.json({ data, error: null, meta: { total: count, page, per_page: perPage } })
  } catch (err) {
    console.error('Error fetching faculty:', err)
    return NextResponse.json({ data: null, error: 'Failed to fetch faculty' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()
    const parsed = facultySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { data, error } = await supabase.from('faculty').insert(parsed.data).select().single()
    if (error) throw error

    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (err: any) {
    console.error('Error creating faculty:', err)
    return NextResponse.json({ data: null, error: err.message ?? 'Failed to create faculty' }, { status: 500 })
  }
}



