import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { facultySchema, studentSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  const supabase = createServiceClient()
  const body = await request.json() as { entity: string; rows: Record<string, unknown>[] }
  const { entity, rows } = body

  if (!entity || !Array.isArray(rows)) {
    return NextResponse.json({ data: null, error: 'entity and rows[] required' }, { status: 400 })
  }

  const schemaMap: Record<string, typeof facultySchema | typeof studentSchema> = {
    faculty: facultySchema,
    students: studentSchema,
  }

  if (entity === 'timetable') {
    const valid: any[] = []
    const errors: { row: number; error: string }[] = []

    const { data: dbClasses, error: classErr } = await supabase.from('classes').select('id, department, academic_year, section')
    if (classErr) return NextResponse.json({ data: null, error: classErr.message }, { status: 500 })

    const { data: dbFaculty, error: facultyErr } = await supabase.from('faculty').select('id, employee_id')
    if (facultyErr) return NextResponse.json({ data: null, error: facultyErr.message }, { status: 500 })

    rows.forEach((row, i) => {
      const { department, academic_year, section, day_of_week, period_number, subject, employee_id } = row

      if (!department || !academic_year || !section || !day_of_week || !period_number || !subject) {
        errors.push({ row: i + 1, error: 'Missing required fields (department, academic_year, section, day_of_week, period_number, subject)' })
        return
      }

      const matchedClass = dbClasses?.find(c => 
        c.department.toUpperCase() === String(department).trim().toUpperCase() &&
        c.academic_year.toUpperCase() === String(academic_year).trim().toUpperCase() &&
        c.section.toUpperCase() === String(section).trim().toUpperCase()
      )

      if (!matchedClass) {
        errors.push({ row: i + 1, error: `Class not found for department: ${department}, year: ${academic_year}, section: ${section}` })
        return
      }

      let faculty_id: string | null = null
      if (employee_id) {
        const matchedFaculty = dbFaculty?.find(f => 
          f.employee_id.trim().toUpperCase() === String(employee_id).trim().toUpperCase()
        )
        if (matchedFaculty) {
          faculty_id = matchedFaculty.id
        }
      }

      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const formattedDay = String(day_of_week).trim()
      const matchedDay = validDays.find(d => d.toLowerCase() === formattedDay.toLowerCase())
      if (!matchedDay) {
        errors.push({ row: i + 1, error: `Invalid day of week: ${day_of_week}` })
        return
      }

      valid.push({
        class_id: matchedClass.id,
        day_of_week: matchedDay,
        period_number: Number(period_number),
        subject: String(subject).trim(),
        faculty_id: faculty_id,
      })
    })

    let inserted = 0
    if (valid.length > 0) {
      const { data, error } = await supabase.from('timetable').upsert(valid, { onConflict: 'class_id,day_of_week,period_number' }).select()
      if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
      inserted = data?.length ?? 0
    }

    return NextResponse.json({
      data: { inserted, skipped: errors.length, errors },
      error: null,
    })
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


