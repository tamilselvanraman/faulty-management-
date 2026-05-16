export const downloadCSV = (filename: string, headers: string[], sampleData: any[]) => {
  const csvRows = []
  
  // Add headers
  csvRows.push(headers.join(','))
  
  // Add sample data
  sampleData.forEach(row => {
    const values = headers.map(header => {
      const val = row[header]
      const escaped = ('' + (val ?? '')).replace(/"/g, '\\"')
      return `"${escaped}"`
    })
    csvRows.push(values.join(','))
  })
  
  const csvString = csvRows.join('\n')
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export const CSV_TEMPLATES = {
  students: {
    headers: ['name', 'email', 'roll_number', 'department', 'year', 'section', 'phone', 'attendance_percentage', 'status', 'father_name', 'blood_group', 'is_top_5'],
    sample: [
      { name: 'Arun Kumar S', email: 'arun.kumar@student.edu', roll_number: 'CSE2101', department: 'CSE', year: 'III', section: 'A', phone: '+91 94556 12345', attendance_percentage: 92, status: 'active', father_name: 'Subramanian', blood_group: 'O+', is_top_5: true }
    ]
  },
  classes: {
    headers: ['hall_number', 'type_building', 'department', 'academic_year', 'section', 'advisor_name', 'strength', 'capacity', 'status'],
    sample: [
      { hall_number: 'LH-101', type_building: 'Main Building', department: 'CSE', academic_year: 'III', section: 'A', advisor_name: 'Dr. Janardhan K.', strength: 42, capacity: 50, status: 'active' }
    ]
  },
  faculty: {
    headers: ['employee_id', 'name', 'email', 'phone', 'department', 'designation', 'shift', 'qualification', 'experience_years', 'status', 'joining_date', 'subject_1', 'subject_2', 'labs', 'dept_level_responsibility', 'college_level_responsibility'],
    sample: [
      { employee_id: 'FAC001', name: 'Dr. Elena Rodriguez', email: 'e.rodriguez@edu.com', phone: '+91 98765 43210', department: 'CSE', designation: 'Head of Department', shift: 'Day', qualification: 'Ph.D in CS', experience_years: 10, status: 'active', joining_date: '2018-10-12', subject_1: 'Theory of Computation', subject_2: 'Compiler Design', labs: 'Compiler Lab', dept_level_responsibility: 'Academic Coordinator', college_level_responsibility: '' }
    ]
  },
  events: {
    headers: ['title', 'type', 'date', 'time', 'location', 'description', 'priority', 'isWeekly'],
    sample: [
      { title: 'DEAN\'S MEETING', type: 'Meeting', date: '2026-05-02', time: '10:00 AM', location: 'Conference Room A', description: 'Regular monthly meeting', priority: 'High', isWeekly: false }
    ]
  },
  committees: {
    headers: ['name', 'type', 'category', 'description', 'chair_name', 'member_count', 'status', 'formed_date', 'meeting_schedule', 'completion_rate'],
    sample: [
      { name: 'Internal Quality Assurance Cell (IQAC)', type: 'Statutory', category: 'Academic', description: 'Ensures and monitors quality in academic and administrative processes.', chair_name: 'Dr. Priya Sharma', member_count: 12, status: 'active', formed_date: '2018-06-01', meeting_schedule: 'Monthly - First Monday', completion_rate: 85 }
    ]
  },
  tasks: {
    headers: ['title', 'description', 'assigned_to', 'due_date', 'priority', 'status', 'category'],
    sample: [
      { title: 'Prepare semester exam timetable', description: 'Drafting the schedule for upcoming exams', assigned_to: 'Exam Cell', due_date: '2025-11-15', priority: 'urgent', status: 'in_progress', category: 'Administration' }
    ]
  }
}
