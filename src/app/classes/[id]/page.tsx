'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, BookOpen, Users, MapPin, 
  GraduationCap, Phone, Mail, Award, 
  TrendingUp, Calendar as CalendarIcon, Clock,
  MoreVertical, CheckCircle2, ChevronRight,
  UserCheck, ShieldCheck
} from 'lucide-react'

// Mock Data specific to an ID
const getClassDetails = (id: string) => {
  return {
    id: decodeURIComponent(id),
    name: 'CSE-A',
    department: 'Computer Science and Engineering',
    academic_year: 'III',
    section: 'A',
    hall_number: 'LH-101',
    block: 'Main Building',
    faculty: {
      name: 'Dr. Janardhan K.',
      contact: '+91 98765 43210',
      email: 'janardhan.k@college.edu',
      department: 'CSE',
      role: 'Class Advisor & Associate Professor'
    },
    students: {
      total: 58,
      boys: 32,
      girls: 26,
      attendance_percentage: 92.5,
      top_performers: [
        { name: 'Rahul S.', cgpa: 9.8, roll: '21CS045' },
        { name: 'Priya M.', cgpa: 9.6, roll: '21CS023' },
        { name: 'Arun V.', cgpa: 9.5, roll: '21CS011' }
      ]
    },
    subjects: {
      theory: [
        { code: 'CS301', name: 'Database Management Systems', staff: 'Dr. Janardhan K.' },
        { code: 'CS302', name: 'Computer Networks', staff: 'Prof. Ramesh B.' },
        { code: 'CS303', name: 'Operating Systems', staff: 'Dr. Smitha N.' },
        { code: 'CS304', name: 'Theory of Computation', staff: 'Mr. Karthik R.' }
      ],
      lab: [
        { code: 'CS311', name: 'DBMS Lab', staff: 'Dr. Janardhan K. / Ms. Anita' },
        { code: 'CS312', name: 'Networks Lab', staff: 'Prof. Ramesh B. / Mr. Raj' }
      ]
    },
    timetable: [
      { day: 'Mon', periods: ['CS301', 'CS302', 'CS303', 'Break', 'CS311', 'CS311', 'CS304'] },
      { day: 'Tue', periods: ['CS304', 'CS301', 'CS302', 'Break', 'CS312', 'CS312', 'CS303'] }
    ]
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }
  })
}

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const classData = getClassDetails(id)

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* 🌟 HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 md:px-8 py-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {classData.department} - {classData.section}
                </h1>
                <span className="px-2.5 py-1 bg-primary/10 text-primary text-[11px] font-black uppercase tracking-widest rounded-lg">
                  Year {classData.academic_year}
                </span>
              </div>
              <p className="text-[12px] font-bold text-slate-400 mt-1 flex items-center gap-2">
                Class ID: {classData.id} <span className="w-1 h-1 rounded-full bg-slate-300" /> Resource Management
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN - Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* 🏫 BASIC DETAILS */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="bg-white rounded-[24px] border border-slate-200 p-6 md:p-8 shadow-sm">
              <h2 className="text-[14px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <MapPin className="text-primary" size={18} /> Location & Basic Info
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Class Name</p>
                  <p className="text-[15px] font-bold text-slate-800">{classData.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Department</p>
                  <p className="text-[15px] font-bold text-slate-800">{classData.department}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Academic Year</p>
                  <p className="text-[15px] font-bold text-slate-800">{classData.academic_year} Year</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Section</p>
                  <p className="text-[15px] font-bold text-slate-800">{classData.section}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Hall Number</p>
                  <p className="text-[15px] font-bold text-slate-800">{classData.hall_number}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Floor / Block</p>
                  <p className="text-[15px] font-bold text-slate-800">{classData.block}</p>
                </div>
              </div>
            </motion.div>

            {/* 📚 SUBJECT ALLOCATION */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} className="bg-white rounded-[24px] border border-slate-200 p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[14px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <BookOpen className="text-primary" size={18} /> Subject Allocation
                </h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-4 bg-slate-50 inline-block px-3 py-1 rounded-lg">Theory Subjects</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classData.subjects.theory.map((sub, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary font-black text-[11px]">
                          {sub.code.substring(2)}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-slate-800">{sub.name}</p>
                          <p className="text-[12px] font-medium text-slate-500 flex items-center gap-1.5 mt-1">
                            <UserCheck size={14} /> {sub.staff}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-4 bg-slate-50 inline-block px-3 py-1 rounded-lg">Laboratory</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classData.subjects.lab.map((sub, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-indigo-50/30">
                        <div className="w-10 h-10 rounded-xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-[11px]">
                          {sub.code.substring(2)}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-slate-800">{sub.name}</p>
                          <p className="text-[12px] font-medium text-slate-500 flex items-center gap-1.5 mt-1">
                            <UserCheck size={14} /> {sub.staff}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 📅 TIMETABLE QUICK VIEW */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="bg-white rounded-[24px] border border-slate-200 p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[14px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <CalendarIcon className="text-primary" size={18} /> Schedule Overview
                </h2>
                <button className="text-[12px] font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-widest">
                  Full Timetable
                </button>
              </div>
              <div className="overflow-x-auto custom-scrollbar pb-2">
                <div className="flex flex-col gap-3 min-w-[600px]">
                  {classData.timetable.map((day, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-14 text-center">
                        <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">{day.day}</p>
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        {day.periods.map((period, pIdx) => (
                          <div 
                            key={pIdx} 
                            className={`flex-1 py-3 text-center rounded-xl text-[12px] font-bold border
                              ${period === 'Break' ? 'bg-slate-50 border-slate-100 text-slate-400' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}
                            `}
                          >
                            {period}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN - Stats & Faculty */}
          <div className="space-y-6">
            {/* 👨‍🏫 FACULTY INFORMATION */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4} className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-0" />
              <h2 className="text-[14px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
                <ShieldCheck className="text-primary" size={18} /> Class Advisor
              </h2>
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-white shadow-md flex items-center justify-center text-xl font-black text-slate-400">
                  {classData.faculty.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <p className="text-[16px] font-black text-slate-800">{classData.faculty.name}</p>
                  <p className="text-[12px] font-bold text-slate-400 mt-0.5">{classData.faculty.department} Department</p>
                </div>
              </div>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <Phone size={16} className="text-slate-400" />
                  <p className="text-[13px] font-bold text-slate-700">{classData.faculty.contact}</p>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <Mail size={16} className="text-slate-400" />
                  <p className="text-[13px] font-bold text-slate-700">{classData.faculty.email}</p>
                </div>
              </div>
            </motion.div>

            {/* 📊 STUDENT ANALYTICS */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5} className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm">
              <h2 className="text-[14px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Users className="text-primary" size={18} /> Class Strength
              </h2>
              
              <div className="flex items-end gap-4 mb-6">
                <div>
                  <p className="text-[36px] font-black text-slate-900 leading-none">{classData.students.total}</p>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Total Students</p>
                </div>
                <div className="flex-1 pb-1">
                  <div className="flex items-center justify-between text-[12px] font-bold mb-2">
                    <span className="text-blue-500">Boys: {classData.students.boys}</span>
                    <span className="text-pink-500">Girls: {classData.students.girls}</span>
                  </div>
                  <div className="h-2 flex w-full rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${(classData.students.boys/classData.students.total)*100}%` }} />
                    <div className="bg-pink-500 h-full" style={{ width: `${(classData.students.girls/classData.students.total)*100}%` }} />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Avg Attendance</p>
                  <p className="text-[20px] font-black text-emerald-700 mt-1">{classData.students.attendance_percentage}%</p>
                </div>
                <TrendingUp size={24} className="text-emerald-500" />
              </div>
            </motion.div>

            {/* 🏆 TOP PERFORMERS */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={6} className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm">
              <h2 className="text-[14px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Award className="text-amber-500" size={18} /> Top Performers
              </h2>
              <div className="space-y-4">
                {classData.students.top_performers.map((student, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-black
                        ${idx === 0 ? 'bg-amber-100 text-amber-700' : 
                          idx === 1 ? 'bg-slate-200 text-slate-700' : 
                          'bg-orange-100 text-orange-700'}
                      `}>
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-800">{student.name}</p>
                        <p className="text-[11px] font-medium text-slate-400">{student.roll}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-black text-slate-900">{student.cgpa}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CGPA</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
