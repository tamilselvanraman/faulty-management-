import { z } from 'zod'

export const facultySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  employee_id: z.string().min(1, 'Employee ID is required'),
  phone: z.string().regex(/^\+?[\d\s\-()]{10,}$/, 'Invalid phone number').optional().or(z.literal('')),
  email: z.string().email('Invalid email address'),
  photo_url: z.string().url().optional().or(z.literal('')),
  shift: z.enum(['Day', 'Eve', 'Noon']).default('Day'),
  subject_1: z.string().optional().or(z.literal('')),
  subject_2: z.string().optional().or(z.literal('')),
  labs: z.array(z.string()).default([]),
  dept_level_responsibility: z.string().optional().or(z.literal('')),
  college_level_responsibility: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'on_leave']).default('active'),
})

export const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  roll_number: z.string().min(1, 'Roll number is required'),
  department: z.string().min(1, 'Department is required'),
  year: z.string().min(1, 'Year is required'), -- Changed to string (I, II, III, IV)
  section: z.string().optional().or(z.literal('')),
  class_id: z.string().uuid().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'detained', 'graduated']).default('active'),
  attendance_percentage: z.number().min(0).max(100).default(0),
  dob: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  avatar_url: z.string().url().optional().or(z.literal('')),
  father_name: z.string().optional().or(z.literal('')),
  blood_group: z.string().optional().or(z.literal('')),
  is_top_5: z.boolean().default(false),
})

export const classSchema = z.object({
  hall_number: z.string().min(1, 'Hall number is required'),
  type_building: z.string().min(1, 'Building is required'),
  department: z.string().min(1, 'Department is required'),
  academic_year: z.string().min(1, 'Year is required'),
  section: z.string().min(1, 'Section is required'),
  advisor_id: z.string().uuid().optional().or(z.literal('')),
  strength: z.number().int().min(0).default(0),
  capacity: z.number().int().min(1).default(50),
  status: z.string().default('active'),
})

export const timetableSlotSchema = z.object({
  class_id: z.string().uuid(),
  day_of_week: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
  period_number: z.number().int().min(1).max(10),
  subject: z.string().min(1),
  faculty_id: z.string().uuid().optional().or(z.literal('')),
})

export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  type: z.enum(['academic', 'meeting', 'social', 'holiday', 'exam']),
  color: z.string().optional(),
})

export const committeeSchema = z.object({
  name: z.string().min(1, 'Committee name is required'),
  type: z.enum(['statutory', 'non-statutory']),
  description: z.string().optional(),
})

export const committeeMemberSchema = z.object({
  committee_id: z.string().uuid(),
  faculty_id: z.string().uuid(),
  role: z.string().min(1, 'Role is required'),
})

export const committeeMeetingSchema = z.object({
  committee_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  agenda: z.string().optional(),
  notes: z.string().optional(),
})

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  assigned_to: z.string().uuid().optional().or(z.literal('')),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
})

export const notificationSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(['info', 'warning', 'success', 'error', 'reminder']).default('info'),
  target_role: z.string().optional(),
})

export type FacultyInput = z.infer<typeof facultySchema>
export type StudentInput = z.infer<typeof studentSchema>
export type ClassInput = z.infer<typeof classSchema>
export type TimetableSlotInput = z.infer<typeof timetableSlotSchema>
export type EventInput = z.infer<typeof eventSchema>
export type CommitteeInput = z.infer<typeof committeeSchema>
export type TaskInput = z.infer<typeof taskSchema>
