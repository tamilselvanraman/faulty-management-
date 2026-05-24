'use client'

import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Mail, Phone, BookOpen, Building2, 
  Calendar, GraduationCap, ShieldCheck, Star, Clock, 
  CheckCircle, MapPin, User, Award, FileText,
  Users, Activity, ArrowUpRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Student {
  id: string
  name: string
  email: string
  roll_number: string
  department: string
  year: string
  section?: string
  phone?: string
  attendance_percentage?: number
  status: 'active' | 'inactive' | 'detained' | 'graduated'
  dob?: string
  address?: string
  avatar_url?: string
  father_name?: string
  blood_group?: string
  is_top_5: boolean
  class_id?: string
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { 
      delay: i * 0.1, 
      duration: 0.5, 
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
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

export default function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/students/${id}`)
        const { data } = await res.json()
        if (data) setStudent(data)
      } catch {
        // Fallback or error handled below
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  )

  if (!student) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Student Profile Not Found</h2>
        <button 
          onClick={() => router.push('/students')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-indigo-200 transition-all"
        >
          Back to Directory
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* Premium Header */}
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
                <span className="px-1.5 md:px-2 py-0.5 bg-indigo-600 text-white text-[9px] md:text-[10px] font-black uppercase tracking-wider rounded-md">Student Record</span>
                <span className="text-slate-300 hidden sm:inline">/</span>
                <span className="text-slate-400 text-[10px] md:text-xs font-bold tracking-tight truncate">{student.roll_number}</span>
              </div>
              <h1 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight truncate">{student.name}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
            <button className="shrink-0 flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl sm:rounded-2xl text-[12px] sm:text-[14px] font-black hover:bg-slate-50 hover:shadow-lg transition-all active:scale-95">
              <FileText size={16} className="text-indigo-600 sm:w-[18px] sm:h-[18px]" />
              Export Records
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Profile Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[48px] p-10 shadow-[0_32px_64px_rgba(31,38,135,0.05)] border border-slate-100 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/5 rounded-full -ml-20 -mb-20 blur-3xl group-hover:bg-purple-500/10 transition-colors" />
              
              <div className="relative z-10 text-center">
                <div className="w-40 h-40 mx-auto mb-8 relative">
                  <div className="absolute inset-0 bg-indigo-600 rounded-[38%] rotate-12 scale-105 opacity-10 group-hover:rotate-45 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-white rounded-[38%] overflow-hidden border-4 border-white shadow-2xl relative z-10">
                    {student.avatar_url ? (
                      <img src={student.avatar_url} alt={student.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-4xl">
                        {student.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  {student.is_top_5 && (
                    <motion.div 
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
                      className="absolute -bottom-2 -right-2 w-12 h-12 bg-amber-500 border-4 border-white rounded-2xl flex items-center justify-center text-white shadow-xl z-20"
                      title="Top 5 Performer"
                    >
                      <Star size={20} fill="currentColor" />
                    </motion.div>
                  )}
                </div>

                <div className="space-y-1 mb-8">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{student.name}</h2>
                  <p className="text-indigo-600 font-bold uppercase tracking-[0.2em] text-[10px]">Student · Year {student.year}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100 group/item hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Roll Number</p>
                    <p className="text-[15px] font-black text-slate-700">{student.roll_number}</p>
                  </div>
                  <div className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100 group/item hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Department</p>
                    <p className="text-[15px] font-black text-slate-700">{student.department}</p>
                  </div>
                  <div className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100 group/item hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Section</p>
                    <p className="text-[15px] font-black text-slate-700">{student.section || 'A'}</p>
                  </div>
                  <div className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100 group/item hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Status</p>
                    <p className="text-[14px] font-black uppercase text-slate-700">{student.status}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Details */}
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
                <h3 className="text-xl font-black tracking-tight">Contact Information</h3>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="group/link cursor-pointer">
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">Direct Phone</p>
                  <p className="text-lg font-bold">{student.phone || 'N/A'}</p>
                </div>
                <div className="h-px bg-white/10 w-full" />
                <div className="group/link cursor-pointer">
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">Official Email</p>
                  <p className="text-lg font-bold">{student.email || 'N/A'}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Detailed Sections */}
          <div className="lg:col-span-8 space-y-10">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Personal Details */}
              <SectionCard title="Personal Details" icon={<User size={20} />} className="p-8">
                <div className="space-y-4">
                  <InfoRow label="Guardian / Father's Name" value={student.father_name || 'N/A'} />
                  <InfoRow label="Date of Birth" value={student.dob ? new Date(student.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'} />
                  <InfoRow label="Blood Group" value={student.blood_group || 'N/A'} />
                </div>
              </SectionCard>

              {/* Address Details */}
              <SectionCard title="Residential Address" icon={<MapPin size={20} />} className="p-8">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 min-h-[140px] text-[14px] font-bold text-slate-600 leading-relaxed">
                  {student.address || 'No residential address registered.'}
                </div>
              </SectionCard>
            </div>

            {/* Performance and Attendance */}
            <SectionCard title="Academic Engagement" icon={<Activity size={20} />} className="p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10 mb-8">
                <div className="p-6 rounded-[32px] bg-white border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Attendance Ratio</p>
                  <p className={`text-3xl font-black ${(student.attendance_percentage ?? 0) < 75 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {student.attendance_percentage}%
                  </p>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-3 shadow-inner">
                    <div 
                      className={`h-full rounded-full ${(student.attendance_percentage ?? 0) < 75 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${student.attendance_percentage}%` }}
                    />
                  </div>
                </div>

                <div className="p-6 rounded-[32px] bg-white border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Top Performer</p>
                    <p className="text-[13px] font-bold text-slate-300 uppercase tracking-widest">Classification</p>
                  </div>
                  <p className="text-xl font-black text-slate-800 mt-2">{student.is_top_5 ? 'Top 5 Rank' : 'General'}</p>
                </div>

                <div className="p-6 rounded-[32px] bg-white border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Class Segment</p>
                    <p className="text-[13px] font-bold text-slate-300 uppercase tracking-widest">Section Link</p>
                  </div>
                  <p className="text-xl font-black text-slate-800 mt-2">Sec {student.section || 'A'}</p>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
