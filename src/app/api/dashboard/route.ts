import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createServiceClient()

    // Fetch current month date range for events
    const now = new Date()
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const monthEnd = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`

    const [
      { count: students },
      { count: faculty },
      { count: classes },
      { count: events },
      { data: tasks },
      { data: facultyByDept },
      { data: studentsByDept },
    ] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }),
      supabase.from('faculty').select('*', { count: 'exact', head: true }),
      supabase.from('classes').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true })
        .gte('date', monthStart).lt('date', monthEnd),
      supabase.from('tasks').select('status'),
      supabase.from('faculty').select('department'),
      supabase.from('students').select('department'),
    ])

    // Aggregate faculty by department
    const facultyDeptMap: Record<string, number> = {}
    facultyByDept?.forEach(f => {
      if (f.department) facultyDeptMap[f.department] = (facultyDeptMap[f.department] ?? 0) + 1
    })
    const faculty_by_dept = Object.entries(facultyDeptMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))

    // Aggregate students by department
    const studentDeptMap: Record<string, number> = {}
    studentsByDept?.forEach(s => {
      if (s.department) studentDeptMap[s.department] = (studentDeptMap[s.department] ?? 0) + 1
    })
    const students_by_dept = Object.entries(studentDeptMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))

    // Task stats
    const totalTasks = tasks?.length ?? 0
    const completedTasks = tasks?.filter(t => t.status === 'completed').length ?? 0
    const inProgressTasks = tasks?.filter(t => t.status === 'in_progress').length ?? 0
    const pendingTasks = tasks?.filter(t => t.status === 'pending').length ?? 0
    const taskCompletionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return NextResponse.json({
      data: {
        // Top KPI counts
        faculty: faculty ?? 0,
        students: students ?? 0,
        classes: classes ?? 0,
        events: events ?? 0,
        // Aliases
        total_faculty: faculty ?? 0,
        total_students: students ?? 0,
        total_classes: classes ?? 0,
        events_today: events ?? 0,
        // Chart data
        faculty_by_dept,
        students_by_dept,
        // Task breakdown
        task_completion_percentage: taskCompletionPct,
        tasks_completed: completedTasks,
        tasks_in_progress: inProgressTasks,
        tasks_pending: pendingTasks,
        tasks_total: totalTasks,
      },
      error: null,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ data: null, error: msg }, { status: 500 })
  }
}
