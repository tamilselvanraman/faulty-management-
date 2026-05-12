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
  subject_1 TEXT,
  subject_2 TEXT,
  labs TEXT[],
  dept_level_responsibility TEXT,
  college_level_responsibility TEXT,
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
  type TEXT NOT NULL, -- statutory, non-statutory
  description TEXT,
  meeting_schedule TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active',
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
  type TEXT NOT NULL, -- Academic / Meeting / Social / Workshop / Lecture
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
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
  name TEXT NOT NULL, -- Class Visit / Lab Visit / Attendance
  date DATE NOT NULL,
  department TEXT NOT NULL,
  assigned_to UUID REFERENCES faculty(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'Pending', -- Done / Pending
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
