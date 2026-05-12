-- Create Faculty table
CREATE TABLE faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  email TEXT UNIQUE NOT NULL,
  image_placeholder TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  gpa DECIMAL(3,2),
  rank INTEGER,
  department TEXT NOT NULL,
  year INTEGER,
  email TEXT UNIQUE NOT NULL,
  image_placeholder TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  priority TEXT NOT NULL, -- 'High', 'Medium', 'Low'
  status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'In Progress', 'Done'
  due_date TEXT,
  assignee TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow all for now as per dev needs, should be restricted later)
CREATE POLICY "Allow all access" ON faculty FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON tasks FOR ALL USING (true) WITH CHECK (true);

-- Seed Faculty
INSERT INTO faculty (name, role, department, status, email, image_placeholder)
VALUES 
('Dr. Robert Fox', 'Professor', 'Computer Science', 'Active', 'robert.fox@example.com', 'R'),
('Dr. Jane Cooper', 'Assistant Professor', 'Mathematics', 'Active', 'jane.cooper@example.com', 'J'),
('Dr. Guy Hawkins', 'Associate Professor', 'Physics', 'On Leave', 'guy.hawkins@example.com', 'G');

-- Seed Students
INSERT INTO students (name, gpa, rank, department, year, email, image_placeholder)
VALUES 
('Alice Johnson', 3.98, 1, 'Computer Science', 4, 'alice.j@example.com', 'A'),
('Bob Smith', 3.95, 2, 'Mathematics', 3, 'bob.s@example.com', 'B'),
('Charlie Davis', 3.92, 3, 'Physics', 2, 'charlie.d@example.com', 'C');

-- Seed Tasks
INSERT INTO tasks (title, priority, status, due_date, assignee)
VALUES 
('Review Syllabus for CS401', 'High', 'In Progress', 'Today', 'Dr. Sarah'),
('Upload Mid-term Results', 'Medium', 'Pending', 'Tomorrow', 'Dr. Robert'),
('Finalize Department Budget', 'High', 'Done', 'Yesterday', 'Dr. Sarah');
