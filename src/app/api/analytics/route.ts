import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const [students, faculty, taskData, events] = await Promise.all([
    supabase.from('students').select('department, year, attendance_percentage'),
    supabase.from('faculty').select('department'),
    supabase.from('tasks').select('status, priority, created_at'),
    supabase.from('events').select('type, date'),
  ])

  // Students by dept
  const deptMap: Record<string, number> = {}
  students.data?.forEach(s => { deptMap[s.department] = (deptMap[s.department] ?? 0) + 1 })
  const studentsByDept = Object.entries(deptMap).map(([name, count]) => ({ name: name.split(' ')[0], count }))

  // Faculty by dept
  const facDeptMap: Record<string, number> = {}
  faculty.data?.forEach(f => { facDeptMap[f.department] = (facDeptMap[f.department] ?? 0) + 1 })
  const facultyByDept = Object.entries(facDeptMap).map(([name, count]) => ({ name: name.split(' ')[0], count }))

  // Task status breakdown
  const taskStatus = { pending: 0, in_progress: 0, completed: 0 }
  taskData.data?.forEach(t => { taskStatus[t.status as keyof typeof taskStatus]++ })

  // Events by type
  const eventTypeMap: Record<string, number> = {}
  events.data?.forEach(e => { eventTypeMap[e.type] = (eventTypeMap[e.type] ?? 0) + 1 })

  // Attendance distribution
  const attend = { high: 0, medium: 0, low: 0 }
  students.data?.forEach(s => {
    if (s.attendance_percentage >= 85) attend.high++
    else if (s.attendance_percentage >= 75) attend.medium++
    else attend.low++
  })

  return NextResponse.json({
    data: { studentsByDept, facultyByDept, taskStatus, eventsByType: eventTypeMap, attendance: attend },
    error: null,
  })
}

