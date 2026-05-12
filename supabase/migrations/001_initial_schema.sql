-- ============================================================
-- College Management ERP — Full PostgreSQL Schema
-- Apply this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── FACULTY ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faculty (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  department    TEXT NOT NULL,
  designation   TEXT NOT NULL,
  employee_id   TEXT NOT NULL UNIQUE,
  phone         TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  photo_url     TEXT,
  subjects      TEXT[] DEFAULT '{}',
  responsibilities TEXT[] DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS faculty_department_idx ON faculty(department);
CREATE INDEX IF NOT EXISTS faculty_name_idx ON faculty USING gin(to_tsvector('english', name));

-- ─── STUDENTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  TEXT NOT NULL,
  roll_number           TEXT NOT NULL UNIQUE,
  department            TEXT NOT NULL,
  year                  INTEGER NOT NULL CHECK (year BETWEEN 1 AND 5),
  class_id              UUID,
  phone                 TEXT NOT NULL,
  email                 TEXT NOT NULL UNIQUE,
  attendance_percentage NUMERIC(5,2) DEFAULT 0 CHECK (attendance_percentage BETWEEN 0 AND 100),
  marks                 NUMERIC(5,2) CHECK (marks BETWEEN 0 AND 100),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS students_department_idx ON students(department);
CREATE INDEX IF NOT EXISTS students_year_idx ON students(year);
CREATE INDEX IF NOT EXISTS students_class_idx ON students(class_id);

-- ─── CLASSES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS classes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  department  TEXT NOT NULL,
  year        INTEGER NOT NULL CHECK (year BETWEEN 1 AND 5),
  hall_number TEXT NOT NULL,
  advisor_id  UUID REFERENCES faculty(id) ON DELETE SET NULL,
  strength    INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS classes_department_idx ON classes(department);
CREATE INDEX IF NOT EXISTS classes_advisor_idx ON classes(advisor_id);

-- Add FK from students to classes (after classes table created)
ALTER TABLE students ADD CONSTRAINT fk_students_class
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL;

-- ─── CLASS_FACULTY (many-to-many) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS class_faculty (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id    UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  faculty_id  UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  subject     TEXT NOT NULL,
  UNIQUE(class_id, faculty_id, subject)
);

CREATE INDEX IF NOT EXISTS class_faculty_class_idx ON class_faculty(class_id);
CREATE INDEX IF NOT EXISTS class_faculty_faculty_idx ON class_faculty(faculty_id);

-- ─── TIMETABLE ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS timetable (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id      UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  day_of_week   TEXT NOT NULL CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')),
  period_number INTEGER NOT NULL CHECK (period_number BETWEEN 1 AND 10),
  subject       TEXT NOT NULL,
  faculty_id    UUID REFERENCES faculty(id) ON DELETE SET NULL,
  UNIQUE(class_id, day_of_week, period_number)
);

CREATE INDEX IF NOT EXISTS timetable_class_idx ON timetable(class_id);
CREATE INDEX IF NOT EXISTS timetable_faculty_idx ON timetable(faculty_id);

-- ─── EVENTS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  date        DATE NOT NULL,
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('academic','meeting','social','holiday','exam')),
  color       TEXT DEFAULT '#4F46E5',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS events_date_idx ON events(date);
CREATE INDEX IF NOT EXISTS events_type_idx ON events(type);

-- ─── COMMITTEES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS committees (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('statutory','non-statutory')),
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── COMMITTEE_MEMBERS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS committee_members (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  committee_id  UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  faculty_id    UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  role          TEXT NOT NULL,
  UNIQUE(committee_id, faculty_id)
);

CREATE INDEX IF NOT EXISTS cm_committee_idx ON committee_members(committee_id);
CREATE INDEX IF NOT EXISTS cm_faculty_idx ON committee_members(faculty_id);

-- ─── COMMITTEE_MEETINGS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS committee_meetings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  committee_id  UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  agenda        TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS meetings_committee_idx ON committee_meetings(committee_id);
CREATE INDEX IF NOT EXISTS meetings_date_idx ON committee_meetings(date);

-- ─── TASKS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES faculty(id) ON DELETE SET NULL,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
  priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  due_date    DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);
CREATE INDEX IF NOT EXISTS tasks_assigned_idx ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS tasks_priority_idx ON tasks(priority);

-- ─── TASK_LOGS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS task_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  changed_by  UUID REFERENCES faculty(id) ON DELETE SET NULL,
  old_status  TEXT,
  new_status  TEXT NOT NULL,
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS task_logs_task_idx ON task_logs(task_id);

-- ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info','warning','success','error','reminder')),
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  target_role TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications(read);
CREATE INDEX IF NOT EXISTS notifications_created_idx ON notifications(created_at DESC);

-- ─── AUTO UPDATE updated_at TRIGGER ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_faculty_updated_at BEFORE UPDATE ON faculty
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (admin-only app)
DO $$
DECLARE
  tbl TEXT;
  tbls TEXT[] := ARRAY['faculty','students','classes','class_faculty','timetable',
    'events','committees','committee_members','committee_meetings',
    'tasks','task_logs','notifications'];
BEGIN
  FOREACH tbl IN ARRAY tbls LOOP
    EXECUTE format('CREATE POLICY IF NOT EXISTS %I_auth_all ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl, tbl);
  END LOOP;
END $$;

-- ─── SEED DATA ────────────────────────────────────────────────────────────────
-- Sample Faculty
INSERT INTO faculty (name, department, designation, employee_id, phone, email, subjects, responsibilities) VALUES
  ('Dr. Anitha Raj', 'Computer Science', 'Professor & HOD', 'EMP001', '9876543210', 'anitha.raj@college.edu', ARRAY['Data Structures','Algorithms','DBMS'], ARRAY['HOD','Research Coordinator']),
  ('Prof. Karthik Sundaram', 'Computer Science', 'Associate Professor', 'EMP002', '9876543211', 'karthik.s@college.edu', ARRAY['Operating Systems','Computer Networks'], ARRAY['Class Advisor - CS-A']),
  ('Dr. Priya Lakshmi', 'Information Technology', 'Professor & HOD', 'EMP003', '9876543212', 'priya.l@college.edu', ARRAY['Web Technologies','Cloud Computing'], ARRAY['HOD','Placement Coordinator']),
  ('Prof. Ravi Kumar', 'Electronics & Communication', 'Assistant Professor', 'EMP004', '9876543213', 'ravi.k@college.edu', ARRAY['Digital Electronics','Signals & Systems'], ARRAY['Lab Incharge']),
  ('Dr. Meena Devi', 'Mathematics', 'Professor', 'EMP005', '9876543214', 'meena.d@college.edu', ARRAY['Engineering Mathematics','Statistics','Numerical Methods'], ARRAY['Exam Cell Coordinator']),
  ('Prof. Suresh Babu', 'Mechanical Engineering', 'Associate Professor', 'EMP006', '9876543215', 'suresh.b@college.edu', ARRAY['Thermodynamics','Fluid Mechanics'], ARRAY['Sports Coordinator']),
  ('Dr. Kavitha Nair', 'Computer Science', 'Assistant Professor', 'EMP007', '9876543216', 'kavitha.n@college.edu', ARRAY['Python Programming','Machine Learning'], ARRAY['IQAC Member']),
  ('Prof. Vijay Shankar', 'Civil Engineering', 'Associate Professor', 'EMP008', '9876543217', 'vijay.s@college.edu', ARRAY['Structural Analysis','Construction Management'], ARRAY['NSS Coordinator'])
ON CONFLICT DO NOTHING;

-- Sample Classes
INSERT INTO classes (name, department, year, hall_number, strength) VALUES
  ('CS-A', 'Computer Science', 1, 'HALL-101', 60),
  ('CS-B', 'Computer Science', 2, 'HALL-102', 58),
  ('IT-A', 'Information Technology', 1, 'HALL-201', 62),
  ('IT-B', 'Information Technology', 2, 'HALL-202', 55),
  ('ECE-A', 'Electronics & Communication', 1, 'HALL-301', 65),
  ('MECH-A', 'Mechanical Engineering', 1, 'HALL-401', 70)
ON CONFLICT DO NOTHING;

-- Sample Students
INSERT INTO students (name, roll_number, department, year, phone, email, attendance_percentage, marks) VALUES
  ('Arun Prakash', 'CS21001', 'Computer Science', 1, '9876501001', 'arun.p@student.edu', 92.5, 88.0),
  ('Bhavani Rajan', 'CS21002', 'Computer Science', 1, '9876501002', 'bhavani.r@student.edu', 88.0, 91.5),
  ('Chandru Mohan', 'CS21003', 'Computer Science', 1, '9876501003', 'chandru.m@student.edu', 76.0, 72.0),
  ('Divya Krishnan', 'CS21004', 'Computer Science', 1, '9876501004', 'divya.k@student.edu', 95.0, 96.0),
  ('Elango Perumal', 'CS22001', 'Computer Science', 2, '9876501005', 'elango.p@student.edu', 83.5, 79.5),
  ('Fathima Beevi', 'IT21001', 'Information Technology', 1, '9876501006', 'fathima.b@student.edu', 91.0, 87.0),
  ('Ganesh Raj', 'IT21002', 'Information Technology', 1, '9876501007', 'ganesh.r@student.edu', 78.5, 75.0),
  ('Harini Suresh', 'ECE21001', 'Electronics & Communication', 1, '9876501008', 'harini.s@student.edu', 89.0, 84.5),
  ('Ilayaraja Kumar', 'MECH21001', 'Mechanical Engineering', 1, '9876501009', 'ilayaraja.k@student.edu', 82.0, 77.5),
  ('Janani Murugan', 'CS21005', 'Computer Science', 1, '9876501010', 'janani.m@student.edu', 97.5, 98.0)
ON CONFLICT DO NOTHING;

-- Sample Events
INSERT INTO events (title, description, date, start_time, end_time, type, color) VALUES
  ('Annual Sports Day', 'Inter-department sports competition', CURRENT_DATE + 2, '09:00', '17:00', 'social', '#10B981'),
  ('IQAC Meeting', 'Quarterly internal quality audit meeting', CURRENT_DATE + 1, '14:00', '16:00', 'meeting', '#F59E0B'),
  ('Semester Exams Begin', 'End semester examinations start', CURRENT_DATE + 7, '09:00', '12:00', 'exam', '#EF4444'),
  ('Tech Symposium 2024', 'Annual technical symposium with industry experts', CURRENT_DATE + 14, '09:00', '18:00', 'academic', '#4F46E5'),
  ('Parent-Teacher Meeting', 'Semester progress discussion with parents', CURRENT_DATE + 5, '10:00', '13:00', 'meeting', '#F59E0B'),
  ('Cultural Fest', 'Annual cultural festival - Utsav 2024', CURRENT_DATE + 21, '09:00', '21:00', 'social', '#10B981')
ON CONFLICT DO NOTHING;

-- Sample Committees
INSERT INTO committees (name, type, description) VALUES
  ('Anti-Ragging Committee', 'statutory', 'Statutory committee for preventing ragging on campus'),
  ('Internal Complaints Committee', 'statutory', 'Handles grievances related to sexual harassment'),
  ('IQAC', 'statutory', 'Internal Quality Assurance Cell for academic excellence'),
  ('Placement Committee', 'non-statutory', 'Manages campus recruitment and placement activities'),
  ('Sports & Games Committee', 'non-statutory', 'Organizes sports events and manages sports facilities'),
  ('Cultural Committee', 'non-statutory', 'Plans and executes cultural events and fests')
ON CONFLICT DO NOTHING;

-- Sample Tasks
INSERT INTO tasks (title, description, status, priority, due_date) VALUES
  ('Prepare Semester Question Papers', 'Set questions for all subjects for end semester exams', 'in_progress', 'high', CURRENT_DATE + 5),
  ('Update Student Attendance Records', 'Verify and update attendance for October month', 'pending', 'high', CURRENT_DATE + 3),
  ('Submit NAAC Documents', 'Compile all required documents for NAAC accreditation', 'in_progress', 'high', CURRENT_DATE + 10),
  ('Organize Department Seminar', 'Guest lecture by industry expert on AI/ML trends', 'pending', 'medium', CURRENT_DATE + 14),
  ('Update Faculty Workload Report', 'Monthly faculty workload consolidation report', 'completed', 'medium', CURRENT_DATE - 2),
  ('Library Book Cataloguing', 'Catalogue newly received books in the library', 'pending', 'low', CURRENT_DATE + 20),
  ('Prepare Annual Report', 'College annual report for academic year 2023-24', 'in_progress', 'high', CURRENT_DATE + 7)
ON CONFLICT DO NOTHING;

-- Sample Notifications
INSERT INTO notifications (title, message, type) VALUES
  ('Exam Schedule Released', 'End semester examination schedule has been published. Check timetable module.', 'info'),
  ('IQAC Meeting Tomorrow', 'Reminder: IQAC quarterly meeting is scheduled for tomorrow at 2 PM.', 'reminder'),
  ('New Faculty Added', 'Prof. Suresh Babu has been added to the faculty directory.', 'success'),
  ('Attendance Alert', '15 students have attendance below 75% threshold.', 'warning'),
  ('Task Overdue', '3 tasks are past their due date. Please review the task board.', 'error')
ON CONFLICT DO NOTHING;
