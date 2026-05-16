import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { facultySchema, studentSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json() as { entity: string; rows: Record<string, unknown>[] }
  const { entity, rows } = body

  if (!entity || !Array.isArray(rows)) {
    return NextResponse.json({ data: null, error: 'entity and rows[] required' }, { status: 400 })
  }

  const schemaMap: Record<string, typeof facultySchema | typeof studentSchema> = {
    faculty: facultySchema,
    students: studentSchema,
  }

  const schema = schemaMap[entity]
  if (!schema) return NextResponse.json({ data: null, error: `Unknown entity: ${entity}` }, { status: 400 })

  const valid: Record<string, unknown>[] = []
  const errors: { row: number; error: string }[] = []

  rows.forEach((row, i) => {
    const parsed = schema.safeParse(row)
    if (parsed.success) valid.push(parsed.data)
    else errors.push({ row: i + 1, error: parsed.error.issues[0].message })
  })

  let inserted = 0
  if (valid.length > 0) {
    const { data, error } = await supabase.from(entity).insert(valid as never).select()
    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    inserted = data?.length ?? 0
  }

  return NextResponse.json({
    data: { inserted, skipped: errors.length, errors },
    error: null,
  })
}

