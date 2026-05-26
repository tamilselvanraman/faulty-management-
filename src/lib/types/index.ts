// ─── Faculty ──────────────────────────────────────────────────────────────────
export interface Faculty {
  id: string
  name: string
  department: string
  designation: string
  employee_id: string
  phone: string
  email: string
  photo_url?: string
  subjects: string[]
  responsibilities: string[]
  created_at: string
  updated_at: string
}

// ─── Student ──────────────────────────────────────────────────────────────────
export interface Student {
  id: string
  name: string
  roll_number: string
  department: string
  year: number
  class_id?: string
  phone: string
  email: string
  attendance_percentage: number
  marks?: number
  created_at: string
  updated_at: string
}

// ─── Class ────────────────────────────────────────────────────────────────────
export interface ClassRoom {
  id: string
  name: string
  department: string
  year: number
  hall_number: string
  advisor_id?: string
  advisor?: Faculty
  strength: number
  created_at: string
  updated_at: string
}

export interface ClassFaculty {
  id: string
  class_id: string
  faculty_id: string
  faculty?: Faculty
  subject: string
}

// ─── Timetable ────────────────────────────────────────────────────────────────
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'

export interface TimetableSlot {
  id: string
  class_id: string
  day_of_week: DayOfWeek
  period_number: number
  subject: string
  faculty_id?: string
  faculty?: Faculty
}

// ─── Event ────────────────────────────────────────────────────────────────────
export type EventType = 'academic' | 'meeting' | 'social' | 'holiday' | 'exam'

export interface CollegeEvent {
  id: string
  title: string
  description?: string
  date: string
  start_time: string
  end_time: string
  type: EventType
  color?: string
  created_at: string
}

// ─── Committee ────────────────────────────────────────────────────────────────
export type CommitteeType = 'statutory' | 'non-statutory'

export interface Committee {
  id: string
  name: string
  type: CommitteeType
  description?: string
  created_at: string
}

export interface CommitteeMember {
  id: string
  committee_id: string
  faculty_id: string
  faculty?: Faculty
  role: string
}

export interface CommitteeMeeting {
  id: string
  committee_id: string
  date: string
  agenda?: string
  notes?: string
  created_at: string
}

// ─── Task ─────────────────────────────────────────────────────────────────────
export type TaskStatus = 'pending' | 'in_progress' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description?: string
  assigned_to?: string
  assignee?: Faculty
  status: TaskStatus
  priority: TaskPriority
  due_date?: string
  created_at: string
  updated_at: string
}

export interface TaskLog {
  id: string
  task_id: string
  changed_by?: string
  changer?: Faculty
  old_status?: TaskStatus
  new_status: TaskStatus
  note?: string
  created_at: string
}

// ─── Notification ─────────────────────────────────────────────────────────────
export type NotificationType = 'info' | 'warning' | 'success' | 'error' | 'reminder'

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  target_role?: string
  created_at: string
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardStats {
  total_students: number
  total_faculty: number
  total_classes: number
  events_today: number
  task_completion_percentage: number
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  meta?: {
    total?: number
    page?: number
    per_page?: number
  }
}

export const DEPARTMENTS = [
  'CSE',
  'IT',
  'ECE',
  'EEE',
  'MECH',
  'CIVIL',
  'MBA',
  'AENS',
  'BME',
  'AIDS',
  'MCA',
  'SFE',
  'S&H',
] as const

export type Department = typeof DEPARTMENTS[number]
