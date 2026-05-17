'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Mail, Phone, BookOpen, Building2, Briefcase, 
  Calendar, GraduationCap, ShieldCheck, Star, Clock, 
  CheckCircle, Globe, Zap, LayoutGrid, List as ListIcon,
  Camera, MapPin, User, Award, FileText, ClipboardList,
  Users, Activity, ArrowUpRight
} from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Faculty {
  id: string
  employee_id: string
  name: string
  email: string
  phone?: string
  department: string
  designation: string
  shift: 'Day' | 'Eve' | 'Noon'
  subjects?: string[]
  labs?: string[]
  dept_responsibility?: string[]
  college_responsibility?: string[]
  qualification?: string
  experience_years?: number
  status: 'active' | 'inactive' | 'on_leave'
  joining_date?: string
  photo_url?: string
}

// Extended Mock Data for Detail View
const MOCK_FACULTY: Record<string, Faculty> = {
  '1': { 
    id: '1', 
    employee_id: 'FAC001', 
    name: 'Dr. Elena Rodriguez', 
    email: 'e.rodriguez@edu.com', 
    phone: '+91 98765 43210', 
    department: 'CSE', 
    designation: 'HOD', 
    qualification: 'Ph.D in CS', 
    status: 'active', 
    joining_date: '2018-10-12', 
    subjects: ['Theory of Computation', 'Compiler Design', 'Data Structures'], 
    shift: 'Day', 
    labs: ['Compiler Lab', 'DBMS Lab'], 
    dept_responsibility: ['Academic Coordinator', 'Timetable Coordinator', 'Class Advisor'], 
    college_responsibility: ['IQAC Member', 'Placement Coordinator', 'Event Committee Member'] 
  },
  '2': { 
    id: '2', 
    employee_id: 'FAC002', 
    name: 'Prof. Marcus Sterling', 
    email: 'm.sterling@edu.com', 
    phone: '+91 98765 43211', 
    department: 'MECH', 
    designation: 'Professor', 
    qualification: 'M.Tech', 
    status: 'active', 
    joining_date: '2020-01-15', 
    subjects: ['Thermodynamics', 'Fluid Mechanics'], 
    shift: 'Day', 
    labs: ['Thermal Lab', 'Manufacturing Lab'],
    dept_responsibility: ['Lab In-charge'],
    college_responsibility: ['Sports Committee']
  },
  '3': { 
    id: '3', 
    employee_id: 'FAC003', 
    name: 'Dr. Anika Sharma', 
    email: 'a.sharma@edu.com', 
    phone: '+91 98765 43212', 
    department: 'MBA', 
    designation: 'Assistant Professor', 
    qualification: 'Ph.D', 
    status: 'active', 
    joining_date: '2021-03-01', 
    subjects: ['Strategic Management', 'Marketing'], 
    shift: 'Eve', 
    college_responsibility: ['Placement Officer'],
    dept_responsibility: ['Seminar Coordinator']
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { 
      delay: i * 0.1, 
      duration: 0.5, 
      ease: [0.22, 1, 0.36, 1]
    } 
  }),
}

function SectionCard({ title, icon, children, className = "" }: { title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <motion.div 
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={`bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 ${className}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      </div>
      {children}
    </motion.div>
  )
}

function InfoRow({ label, value, icon }: { label: string; value: string | React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
      {icon && (
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
          {icon}
        </div>
      )}
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="text-[14px] font-bold text-slate-700">{value}</div>
      </div>
    </div>
  )
}

export default function FacultyProfilePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [faculty, setFaculty] = useState<Faculty | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch
    const data = MOCK_FACULTY[id] || MOCK_FACULTY['1'] // Fallback to 1 for demo
    setFaculty(data)
    setLoading(false)
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  )

  if (!faculty) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Faculty Not Found</h2>
        <button 
          onClick={() => router.push('/faculty')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-indigo-200 transition-all"
        >
          Back to Directory
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* 🚀 Premium Header */}
      <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-0 md:h-24 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 md:gap-5 min-w-0">
            <button 
              onClick={() => router.back()}
              className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl md:rounded-2xl flex items-center justify-center bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <ArrowLeft size={20} className="md:w-[22px] md:h-[22px]" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                <span className="px-1.5 md:px-2 py-0.5 bg-indigo-600 text-white text-[9px] md:text-[10px] font-black uppercase tracking-wider rounded-md">Faculty Profile</span>
                <span className="text-slate-300 hidden sm:inline">/</span>
                <span className="text-slate-400 text-[10px] md:text-xs font-bold tracking-tight truncate">{faculty.employee_id}</span>
              </div>
              <h1 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight truncate">{faculty.name}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
            <button className="shrink-0 flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl sm:rounded-2xl text-[12px] sm:text-[14px] font-black hover:bg-slate-50 hover:shadow-lg transition-all active:scale-95">
              <FileText size={16} className="text-indigo-600 sm:w-[18px] sm:h-[18px]" />
              Export Dossier
            </button>
            <button className="shrink-0 flex items-center gap-1.5 sm:gap-2 px-5 sm:px-8 py-2.5 sm:py-3.5 bg-indigo-600 text-white rounded-xl sm:rounded-2xl text-[12px] sm:text-[14px] font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95">
              <Zap size={16} className="sm:w-[18px] sm:h-[18px]" />
              Quick Actions
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* 👤 Profile Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[48px] p-10 shadow-[0_32px_64px_rgba(31,38,135,0.05)] border border-slate-100 relative overflow-hidden group"
            >
              {/* Glass Accents */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/5 rounded-full -ml-20 -mb-20 blur-3xl group-hover:bg-purple-500/10 transition-colors" />
              
              <div className="relative z-10 text-center">
                <div className="w-40 h-40 mx-auto mb-8 relative">
                  <div className="absolute inset-0 bg-indigo-600 rounded-[38%] rotate-12 scale-105 opacity-10 group-hover:rotate-45 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-white rounded-[38%] overflow-hidden border-4 border-white shadow-2xl relative z-10">
                    {faculty.photo_url ? (
                      <img src={faculty.photo_url} alt={faculty.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                        <User size={64} className="opacity-50" />
                      </div>
                    )}
                  </div>
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
                    className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-500 border-4 border-white rounded-2xl flex items-center justify-center text-white shadow-xl z-20"
                  >
                    <ShieldCheck size={20} />
                  </motion.div>
                </div>

                <div className="space-y-1 mb-8">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{faculty.name}</h2>
                  <p className="text-indigo-600 font-bold uppercase tracking-[0.2em] text-[10px]">{faculty.designation}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100 group/item hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Employee ID</p>
                    <p className="text-[15px] font-black text-slate-700">{faculty.employee_id}</p>
                  </div>
                  <div className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100 group/item hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Department</p>
                    <p className="text-[15px] font-black text-slate-700">{faculty.department}</p>
                  </div>
                  <div className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100 group/item hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Experience</p>
                    <p className="text-[15px] font-black text-slate-700">{faculty.experience_years || 5}+ Years</p>
                  </div>
                  <div className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100 group/item hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Joined In</p>
                    <p className="text-[15px] font-black text-slate-700">{faculty.joining_date ? new Date(faculty.joining_date).getFullYear() : '2018'}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 📞 Contact Information - Enhanced Placement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-indigo-900 rounded-[48px] p-10 text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all duration-500" />
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-white border border-white/10">
                  <Phone size={22} />
                </div>
                <h3 className="text-xl font-black tracking-tight">Contact Details</h3>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="group/link cursor-pointer">
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">Direct Phone</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold group-hover:text-indigo-200 transition-colors">{faculty.phone || '+91 98765 43210'}</p>
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover/link:opacity-100 transition-all">
                      <ArrowLeft size={16} className="rotate-180" />
                    </div>
                  </div>
                </div>
                <div className="h-px bg-white/10 w-full" />
                <div className="group/link cursor-pointer">
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">Official Email</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold group-hover:text-indigo-200 transition-colors">{faculty.email}</p>
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover/link:opacity-100 transition-all">
                      <ArrowLeft size={16} className="rotate-180" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 📚 Detailed Sections */}
          <div className="lg:col-span-8 space-y-10">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Academic */}
              <SectionCard title="Academic Portfolio" icon={<BookOpen size={20} />} className="p-8">
                <div className="space-y-8">
                  <div className="group/sec">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Zap size={12} className="text-amber-500" />
                        Subjects Handled
                      </p>
                      <span className="text-[10px] font-black text-slate-300">{faculty.subjects?.length || 0} Total</span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {faculty.subjects?.map((sub, i) => (
                        <motion.span 
                          key={i} whileHover={{ scale: 1.05 }}
                          className="px-4 py-2 bg-slate-50 text-slate-700 rounded-2xl text-[13px] font-bold border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-md transition-all cursor-default"
                        >
                          {sub}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="group/sec">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <LayoutGrid size={12} className="text-indigo-500" />
                      Labs Handled
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {faculty.labs?.map((lab, i) => (
                        <motion.span 
                          key={i} whileHover={{ scale: 1.05 }}
                          className="px-4 py-2 bg-emerald-50/50 text-emerald-700 rounded-2xl text-[13px] font-bold border border-emerald-100 hover:bg-white hover:shadow-md transition-all cursor-default"
                        >
                          {lab}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Responsibilities */}
              <SectionCard title="Key Responsibilities" icon={<Briefcase size={20} />} className="p-8">
                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 text-blue-600">
                      <Building2 size={12} />
                      Departmental Roles
                    </p>
                    <div className="space-y-3">
                      {faculty.dept_responsibility?.map((resp, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-white transition-all group/item">
                          <div className="w-2 h-2 rounded-full bg-blue-400 group-hover/item:scale-150 transition-transform" />
                          <span className="text-[13px] font-bold text-slate-700">{resp}</span>
                        </div>
                      )) || <p className="text-xs font-bold text-slate-300 italic px-3">No departmental roles assigned</p>}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 text-purple-600">
                      <Globe size={12} />
                      Institutional Roles
                    </p>
                    <div className="space-y-3">
                      {faculty.college_responsibility?.map((resp, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-2xl border border-transparent hover:border-purple-100 hover:bg-white transition-all group/item">
                          <div className="w-2 h-2 rounded-full bg-purple-400 group-hover/item:scale-150 transition-transform" />
                          <span className="text-[13px] font-bold text-slate-700">{resp}</span>
                        </div>
                      )) || <p className="text-xs font-bold text-slate-300 italic px-3">No institutional roles assigned</p>}
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* 📊 Performance Dashboard */}
            <SectionCard title="Performance & Engagement" icon={<Activity size={20} />} className="p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 relative z-10">
                <MetricCard label="Attendance" value="94.8%" trend="+2.4%" />
                <MetricCard label="Classes" value="12/Week" sub="Assigned" />
                <MetricCard label="Committees" value="03" sub="Active" />
                <MetricCard label="Rating" value="4.9" isRating />
              </div>

              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.15em]">Recent Activity Log</h4>
                  <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All</button>
                </div>
                
                <div className="grid gap-4">
                  {[
                    { title: "Published Research Paper", date: "2 days ago", category: "Academic", color: "bg-indigo-500", icon: <Award size={14} /> },
                    { title: "Conducted Workshop on AI", date: "1 week ago", category: "Event", color: "bg-purple-500", icon: <Zap size={14} /> },
                    { title: "Completed Syllabus Audit", date: "2 weeks ago", category: "Milestone", color: "bg-emerald-500", icon: <CheckCircle size={14} /> }
                  ].map((activity, i) => (
                    <motion.div 
                      key={i} whileHover={{ x: 10 }}
                      className="flex items-center gap-5 p-5 bg-slate-50/50 rounded-3xl border border-slate-100/50 hover:bg-white hover:shadow-xl hover:shadow-indigo-900/5 transition-all group/activity"
                    >
                      <div className={`w-12 h-12 rounded-2xl ${activity.color} text-white flex items-center justify-center shadow-lg group-hover/activity:rotate-12 transition-transform`}>
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activity.category}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-[10px] font-bold text-slate-400">{activity.date}</span>
                        </div>
                        <p className="text-[15px] font-black text-slate-800 group-hover/activity:text-indigo-600 transition-colors">{activity.title}</p>
                      </div>
                      <ArrowLeft size={18} className="rotate-180 text-slate-200 group-hover/activity:text-indigo-400 transition-colors" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, trend, sub, isRating }: { label: string; value: string; trend?: string; sub?: string; isRating?: boolean }) {
  return (
    <div className="p-6 rounded-[32px] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{label}</p>
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-black tracking-tight ${isRating ? 'text-amber-500' : 'text-slate-900'}`}>{value}</p>
            {isRating && <Star size={20} fill="currentColor" className="text-amber-500 mb-1" />}
          </div>
          {sub && <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{sub}</p>}
        </div>
        {trend && (
          <div className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black flex items-center gap-1 mb-1">
            <ArrowUpRight size={10} />
            {trend}
          </div>
        )}
      </div>
    </div>
  )
}

