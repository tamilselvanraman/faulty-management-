import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const [
      { count: students },
      { count: faculty },
      { count: classes },
      { data: events },
      { data: tasks },
    ] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }),
      supabase.from('faculty').select('*', { count: 'exact', head: true }),
      supabase.from('classes').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('id').eq('date', new Date().toISOString().split('T')[0]),
      supabase.from('tasks').select('status'),
    ])

    const totalTasks = tasks?.length ?? 0
    const completedTasks = tasks?.filter(t => t.status === 'completed').length ?? 0
    const taskCompletionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return NextResponse.json({
      data: {
        total_students: students ?? 0,
        total_faculty: faculty ?? 0,
        total_classes: classes ?? 0,
        events_today: events?.length ?? 0,
        task_completion_percentage: taskCompletionPct,
      },
      error: null,
    })
  } catch (err) {
    return NextResponse.json({ data: null, error: 'Failed to load dashboard stats' }, { status: 500 })
  }
}
