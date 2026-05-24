-- EduManage ERP Supabase Migration

-- 1. Create `faculty` table
CREATE TABLE IF NOT EXISTS faculty (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  department TEXT NOT NULL,
  designation TEXT NOT NULL,
  shift TEXT DEFAULT 'Day', -- Day, Eve, Noon
  subjects TEXT[] DEFAULT '{}',
  dept_responsibility TEXT,
  college_responsibility TEXT,
  qualification TEXT,
  experience_years INTEGER,
  status TEXT DEFAULT 'active', -- active, inactive, on_leave
  joining_date DATE,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create `students` table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  roll_number TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  year TEXT NOT NULL, -- I, II, III, IV
  section TEXT,
  phone TEXT,
  attendance_percentage DECIMAL DEFAULT 0,
  status TEXT DEFAULT 'active', -- active, inactive, detained, graduated
  dob DATE,
  address TEXT,
  avatar_url TEXT,
  father_name TEXT,
  blood_group TEXT,
  is_top_5 BOOLEAN DEFAULT false,
  class_id UUID, -- Will link to classes table later
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create `classes` table
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hall_number TEXT NOT NULL,
  type_building TEXT NOT NULL,
  department TEXT NOT NULL,
  academic_year TEXT NOT NULL, -- I, II, III, IV
  section TEXT NOT NULL,
  advisor_id UUID REFERENCES faculty(id) ON DELETE SET NULL,
  strength INTEGER DEFAULT 0,
  capacity INTEGER DEFAULT 50,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key to students
ALTER TABLE students ADD CONSTRAINT fk_student_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL;

-- 4. Create `committees` table
CREATE TABLE IF NOT EXISTS committees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- Statutory, Non-Statutory
  category TEXT DEFAULT 'Administrative', -- Academic, Administrative, Cultural, Sports, Technical, Welfare, Examination
  description TEXT,
  meeting_schedule TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active',
  formed_date DATE,
  chair_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mapping table for Committee Members (many-to-many with faculty)
CREATE TABLE IF NOT EXISTS committee_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  committee_id UUID REFERENCES committees(id) ON DELETE CASCADE,
  faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(committee_id, faculty_id)
);

-- 5. Create `events` table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- Academic / Meeting / Social / Recurring
  date DATE NOT NULL,
  time TEXT, -- e.g. "09:00 AM" or "09:00"
  location TEXT,
  description TEXT,
  priority TEXT DEFAULT 'Normal', -- High / Normal / Low
  department TEXT,
  assigned_faculty_id UUID REFERENCES faculty(id) ON DELETE SET NULL,
  assigned_class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'Scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create `tasks` table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES faculty(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  due_date DATE,
  category TEXT, -- e.g. Administration, HR, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create `timetable` table
CREATE TABLE IF NOT EXISTS timetable (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  day_of_week TEXT NOT NULL, -- Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
  period_number INTEGER NOT NULL,
  subject TEXT NOT NULL,
  faculty_id UUID REFERENCES faculty(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, day_of_week, period_number)
);

-- 8. Create `class_faculty` mapping table
CREATE TABLE IF NOT EXISTS class_faculty (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, faculty_id)
);

-- 9. Create `notifications` table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- info, warning, success, error, reminder
  target_role TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create `task_logs` table
CREATE TABLE IF NOT EXISTS task_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  old_status TEXT,
  new_status TEXT,
  changer_id UUID REFERENCES faculty(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
