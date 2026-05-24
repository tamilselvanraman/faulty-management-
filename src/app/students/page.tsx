'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Filter, Edit2, Trash2, X, GraduationCap, 
  ChevronDown, User, Upload, Users, Award, TrendingUp, 
  AlertCircle, FileText, MoreVertical, Download, ChevronRight,
  ArrowLeft, Mail, Phone, Calendar, MapPin, Eye, CheckCircle,
  Star, UserCheck, ArrowUpRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import CSVUploader from '@/components/ui/CSVUploader'
import { useRouter } from 'next/navigation'
import { downloadCSV, CSV_TEMPLATES } from '@/utils/csvHelper'

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
}

const DEPARTMENTS = ['AENS', 'BME', 'AIDS', 'CSE', 'ECE', 'MECH', 'CIVIL', 'MBA']
const YEARS = ['I', 'II', 'III', 'IV']

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-100/20',
  inactive: 'bg-gray-50 text-gray-500 border-gray-100',
  detained: 'bg-rose-50 text-rose-700 border-rose-100 shadow-rose-100/20',
  graduated: 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-indigo-100/20',
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] as any } }),
}

const getDeptStyle = (dept: string) => {
  switch (dept) {
    case 'CSE': return 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-indigo-100/50'
    case 'AIDS': return 'bg-blue-50 text-blue-700 border-blue-100 shadow-blue-100/50'
    case 'MECH': return 'bg-orange-50 text-orange-700 border-orange-100 shadow-orange-100/50'
    case 'CIVIL': return 'bg-amber-50 text-amber-700 border-amber-100 shadow-amber-100/50'
    case 'MBA': return 'bg-rose-50 text-rose-700 border-rose-100 shadow-rose-100/50'
    case 'ECE': return 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-100/50'
    case 'BME': return 'bg-cyan-50 text-cyan-700 border-cyan-100 shadow-cyan-100/50'
    case 'AENS': return 'bg-purple-50 text-purple-700 border-purple-100 shadow-purple-100/50'
    default: return 'bg-gray-50 text-gray-700 border-gray-100 shadow-gray-100/50'
  }
}

const MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'Arun Kumar S', email: 'arun.kumar@student.edu', roll_number: 'CSE2101', department: 'CSE', year: 'III', section: 'A', phone: '+91 94556 12345', attendance_percentage: 92, status: 'active', father_name: 'Subramanian', blood_group: 'O+', is_top_5: true },
  { id: '2', name: 'Divya Priya R', email: 'divya.priya@student.edu', roll_number: 'CSE2102', department: 'CSE', year: 'III', section: 'A', attendance_percentage: 71, status: 'active', is_top_5: true },
  { id: '3', name: 'Karthik M', email: 'karthik.m@student.edu', roll_number: 'ECE2201', department: 'ECE', year: 'II', section: 'B', attendance_percentage: 85, status: 'active', is_top_5: false },
  { id: '4', name: 'Sneha Reddy', email: 'sneha.r@student.edu', roll_number: 'MECH2301', department: 'MECH', year: 'III', attendance_percentage: 66, status: 'active', is_top_5: false },
  { id: '5', name: 'Vishnu Vardhan', email: 'vishnu.v@student.edu', roll_number: 'CIVIL2101', department: 'CIVIL', year: 'I', section: 'A', attendance_percentage: 88, status: 'active', is_top_5: false },
  { id: '6', name: 'Meena Kumari', email: 'meena.k@student.edu', roll_number: 'MBA2401', department: 'MBA', year: 'I', attendance_percentage: 95, status: 'active', is_top_5: false },
  { id: '7', name: 'Ravi Shankar', email: 'ravi.s@student.edu', roll_number: 'CSE2103', department: 'CSE', year: 'II', section: 'C', attendance_percentage: 58, status: 'detained', is_top_5: false },
  { id: '8', name: 'Anjali Singh', email: 'anjali.s@student.edu', roll_number: 'ECE2202', department: 'ECE', year: 'IV', attendance_percentage: 90, status: 'active', is_top_5: false },
]

export default function StudentsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  
  // Drill-down State
  const [selectedDept, setSelectedDept] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  
  const [showModal, setShowModal] = useState(false)
  const [showCSV, setShowCSV] = useState(false)
  const [editItem, setEditItem] = useState<Student | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchDept = !selectedDept || s.department === selectedDept
      const matchYear = !selectedYear || selectedYear === 'All' || s.year === selectedYear
      const matchSearch = !search || 
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.roll_number.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
      return matchDept && matchYear && matchSearch
    })
  }, [students, selectedDept, selectedYear, search])

  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch('/api/students')
      const { data } = await res.json()
      if (data && data.length > 0) setStudents(data)
    } catch { /* use mock */ }
  }, [])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  const handleSave = async (data: Partial<Student>) => {
    setLoading(true)
    try {
      const method = editItem ? 'PUT' : 'POST'
      const url = editItem ? `/api/students/${editItem.id}` : '/api/students'
      const res = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(data) 
      })
      
      if (!res.ok) throw new Error('Failed to save')
      const { data: savedData } = await res.json()

      if (editItem) {
        setStudents(prev => prev.map(s => s.id === editItem.id ? { ...s, ...savedData } : s))
        toast.success('Student profile updated')
      } else {
        setStudents(prev => [savedData, ...prev])
        toast.success('New student enrolled')
      }
      setShowModal(false)
      setEditItem(null)
    } catch {
      toast.error('Failed to save student record')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try { 
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setStudents(prev => prev.filter(s => s.id !== id))
      toast.success('Student record removed')
    } catch { 
      toast.error('Failed to delete student record')
    } finally {
      setDeleteId(null)
    }
  }

  const handleBulkUpload = async (data: any[]) => {
    const newStudents = data.map((row, idx) => ({
      name: row.name || 'Unknown',
      email: row.email || `stud-${Date.now()}-${idx}@student.edu`,
      roll_number: row.roll_number || `REG${Date.now()}-${idx}`,
      department: row.department || 'CSE',
      year: row.year || 'I',
      status: row.status || 'active',
      attendance_percentage: parseFloat(row.attendance_percentage) || 0,
      is_top_5: row.is_top_5 === 'true' || row.is_top_5 === true
    }))
    
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'students', rows: newStudents })
      })
      if (!res.ok) throw new Error()
      fetchStudents()
      toast.success(`Successfully imported students`)
    } catch {
      toast.error('Failed to import students')
    } finally {
      setShowCSV(false)
    }
  }

  const stats = [
    { label: 'TOTAL STUDENTS', value: students.length, icon: <Users size={24} />, gradient: 'from-indigo-500 via-purple-500 to-pink-500', change: '+12% this year' },
    { label: 'ACTIVE ENROLLMENT', value: students.filter(s => s.status === 'active').length, icon: <GraduationCap size={24} />, gradient: 'from-emerald-400 via-teal-500 to-cyan-500', change: '+5% this term' },
    { label: 'LOW ATTENDANCE', value: students.filter(s => (s.attendance_percentage ?? 100) < 75).length, icon: <AlertCircle size={24} />, gradient: 'from-orange-400 via-amber-500 to-rose-500', change: '-2% vs last week' },
    { label: 'TOP PERFORMERS', value: students.filter(s => s.is_top_5).length, icon: <Star size={24} />, gradient: 'from-blue-500 via-indigo-500 to-cyan-500', change: '+10% improvement' },
  ]

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-4">
        <div>
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <button onClick={() => { setSelectedDept(null); setSelectedYear(null) }} className="hover:text-primary transition-colors font-medium">Students</button>
            {selectedDept && (
              <>
                <ChevronRight size={14} className="text-slate-300" />
                <button onClick={() => setSelectedYear(null)} className="hover:text-primary transition-colors font-medium">{selectedDept}</button>
              </>
            )}
            {selectedYear && (
              <>
                <ChevronRight size={14} className="text-slate-300" />
                <span className="text-slate-900 font-bold">{selectedYear === 'All' ? 'All Years' : `Year ${selectedYear}`}</span>
              </>
            )}
          </nav>
          <h1 className="text-[32px] font-black text-slate-900 tracking-tight flex items-center gap-3">
            {selectedDept ? (
              <button onClick={() => { selectedYear ? setSelectedYear(null) : setSelectedDept(null) }} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <ArrowLeft size={24} />
              </button>
            ) : null}
            Student Directory
          </h1>
          <p className="text-[15px] text-slate-500 mt-1 font-medium">
            {selectedDept 
              ? `Managing ${selectedDept} Department ${selectedYear ? `- ${selectedYear === 'All' ? 'All Students' : `Year ${selectedYear}`}` : ''}`
              : 'Holistic management of student lifecycle and academic performance.'}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <button onClick={() => downloadCSV('students_import_template.csv', CSV_TEMPLATES.students.headers, CSV_TEMPLATES.students.sample)}
            className="flex justify-center items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-[13px] sm:text-[14px] font-bold transition-all shadow-sm">
            <Download size={16} className="text-indigo-600 w-4 h-4" /> Format
          </button>
          <button onClick={() => setShowCSV(true)}
            className="flex justify-center items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-[13px] sm:text-[14px] font-bold transition-all shadow-sm">
            <Upload size={16} className="text-indigo-600 w-4 h-4" /> Import
          </button>
          <button onClick={() => { setEditItem(null); setShowModal(true) }}
            className="col-span-2 flex justify-center items-center gap-1.5 sm:gap-2 px-5 sm:px-6 py-2.5 bg-primary hover:bg-slate-800 text-white rounded-xl text-[13px] sm:text-[14px] font-bold transition-all shadow-lg shadow-slate-200">
            <Plus size={18} className="w-[18px] h-[18px]" /> Add Student
          </button>
        </div>
      </motion.div>

      {/* Quick Stats Summary */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {stats.map((stat, i) => (
          <div key={i} className={`relative overflow-hidden rounded-[32px] p-6 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group bg-gradient-to-br ${stat.gradient}`}>
            {/* Glass overlay */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {/* Decorative blob */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
            
            <div className="relative z-10 flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 text-white shadow-sm">
                <ArrowUpRight size={14} />
                {stat.change.split(' ')[0]}
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-4xl font-black tracking-tighter drop-shadow-sm">
                {stat.value}
              </p>
              <p className="text-xs font-black mt-2 uppercase tracking-[0.15em] opacity-90">{stat.label}</p>
              <p className="text-[11px] font-bold mt-1 text-white/70">{stat.change}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Step 1: Department Selection */}
        {!selectedDept && (
          <motion.div
            key="depts"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-8 px-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {DEPARTMENTS.map((dept, i) => {
                const count = students.filter(s => s.department === dept).length
                return (
                  <motion.div
                    key={dept}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    whileHover={{ 
                      y: -12, 
                      scale: 1.05,
                      rotateX: 2,
                      rotateY: 2
                    }}
                    onClick={() => setSelectedDept(dept)}
                    className="relative overflow-hidden cursor-pointer p-8 rounded-[40px] border border-slate-100 bg-white hover:border-primary/20 hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] transition-all duration-500 group min-h-[260px] flex flex-col justify-between"
                  >
                    {/* Premium Decorative Elements */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                    
                    <div className="flex items-start justify-between relative z-10">
                      <div className="w-16 h-16 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-sm">
                        <GraduationCap size={32} />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="px-4 py-1.5 bg-slate-100 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-500">
                          {dept}
                        </div>
                        <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:border-primary/20 transition-all duration-500 bg-white shadow-sm group-hover:scale-110 group-hover:shadow-md">
                          <ArrowUpRight size={18} />
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight group-hover:text-primary transition-colors duration-500">{dept}</h3>
                      <p className="text-[14px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors duration-500">
                        Academic Department · <span className="text-slate-900 font-black">{count}</span>
                      </p>
                    </div>
                    
                    {/* Subtle Background Mark */}
                    <div className="absolute -right-8 -bottom-8 text-slate-50 opacity-40 group-hover:opacity-10 transition-all duration-700 transform group-hover:scale-110 group-hover:-rotate-12">
                      <Users size={160} />
                    </div>
                  </motion.div>
                )
              })}
            </div>


          </motion.div>
        )}

        {/* Step 2: Year Selection */}
        {selectedDept && !selectedYear && (
          <motion.div
            key="years"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-8 px-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              {YEARS.map((y, i) => {
                const count = students.filter(s => s.department === selectedDept && s.year === y).length
                return (
                  <motion.div
                    key={y}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    whileHover={{ y: -12, scale: 1.08 }}
                    onClick={() => setSelectedYear(y)}
                    className="relative cursor-pointer bg-white border border-[#E5E7EB] p-10 rounded-[40px] shadow-sm hover:shadow-2xl hover:border-indigo-200 transition-all group text-center overflow-hidden"
                  >
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all bg-white shadow-sm">
                      <ArrowUpRight size={18} />
                    </div>
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-6 shadow-inner">
                      <Award size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Year {y}</h3>
                    <p className="text-gray-500 font-bold">{count} Enrolled</p>
                  </motion.div>
                )
              })}
            </div>
            
            <div className="flex justify-center mt-12">
              <button onClick={() => setSelectedYear('All')} className="flex items-center gap-3 px-10 py-4 bg-white border-2 border-indigo-100 rounded-2xl text-[14px] font-black text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-sm transition-all group">
                <Users size={20} className="group-hover:scale-110 transition-transform" /> 
                View All {selectedDept} Students
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Student List */}
        {selectedDept && selectedYear && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 px-4"
          >
            {/* Search & Bulk Row */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-[#E5E7EB] shadow-sm relative z-10">
              <div className="flex-1 flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-2xl border border-transparent focus-within:border-indigo-200 focus-within:bg-white transition-all w-full shadow-inner">
                <Search size={20} className="text-gray-400" />
                <input 
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, roll number, or email..." 
                  className="bg-transparent text-[15px] outline-none w-full text-gray-700 placeholder:text-gray-400 font-bold"
                />
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button className="flex items-center gap-2 px-5 py-3 bg-white border border-[#E5E7EB] rounded-2xl text-[14px] font-bold text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-all flex-1 md:flex-none shadow-sm">
                  <Download size={18} /> Export
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-[14px] font-bold text-indigo-700 hover:bg-indigo-100 transition-all flex-1 md:flex-none shadow-sm">
                  <Filter size={18} /> Advanced
                </button>
              </div>
            </div>

            {/* List View */}
            <div className="bg-white rounded-[40px] border border-[#E5E7EB] overflow-hidden shadow-sm">
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[1000px] text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-[#E5E7EB]">
                      <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Student Identity</th>
                      <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Academic Info</th>
                      <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Attendance</th>
                      <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Classification</th>
                      <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudents.map((s, i) => (
                      <motion.tr 
                        key={s.id}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        whileHover={{ scale: 1.005, backgroundColor: 'rgba(79, 70, 229, 0.05)' }}
                        className="transition-all group cursor-pointer border-l-4 border-l-transparent hover:border-l-primary"
                        onClick={() => router.push(`/students/${s.id}`)}
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-5">
                            <div className="relative">
                              <div className="w-14 h-14 rounded-[22px] bg-gradient-to-br from-indigo-50 to-violet-100 border-2 border-white flex items-center justify-center text-indigo-600 font-black text-xl shadow-sm">
                                {s.avatar_url ? (
                                  <img src={s.avatar_url} className="w-full h-full rounded-[20px] object-cover" />
                                ) : s.name.charAt(0)}
                              </div>
                              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${s.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500 shadow-rose-200'}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-[17px] font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{s.name}</p>
                                {s.is_top_5 && (
                                  <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-[10px] font-black uppercase">
                                    <Star size={10} fill="currentColor" /> Top 5
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-[12px] text-gray-500 font-bold mt-1">
                                <span className="flex items-center gap-1"><Mail size={12} className="text-gray-300" /> {s.email}</span>
                                {s.phone && <span className="flex items-center gap-1 px-2 border-l border-gray-100"><Phone size={12} className="text-gray-300" /> {s.phone}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div>
                            <span className="text-[13px] font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">{s.roll_number}</span>
                            <p className="text-[12px] text-gray-500 font-bold mt-2 uppercase tracking-wide">
                              Year {s.year} · Sec {s.section || 'A'}
                            </p>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="w-32">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className={`text-[13px] font-black ${(s.attendance_percentage || 0) < 75 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {s.attendance_percentage}%
                              </span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${s.attendance_percentage}%` }}
                                className={`h-full rounded-full shadow-sm ${(s.attendance_percentage || 0) < 75 ? 'bg-gradient-to-r from-rose-400 to-rose-600' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'}`} 
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${STATUS_STYLES[s.status]}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-8 py-5" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                            <button onClick={() => router.push(`/students/${s.id}`)} className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Eye size={18} /></button>
                            <button onClick={() => { setEditItem(s); setShowModal(true) }} className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                            <button onClick={() => setDeleteId(s.id)} className="p-3 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-8 py-32 text-center">
                          <div className="flex flex-col items-center gap-6">
                            <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-200 shadow-inner">
                              <Users size={48} />
                            </div>
                            <div>
                              <p className="text-gray-900 font-black text-xl tracking-tight">No students discovered</p>
                              <p className="text-gray-500 font-bold mt-1">Try refined search parameters or different filters.</p>
                            </div>
                            <button onClick={() => { setSearch(''); setSelectedYear('All') }} className="px-8 py-3 bg-indigo-50 text-indigo-700 rounded-2xl font-black text-sm hover:bg-indigo-100 transition-all">Clear All Filters</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <StudentModal 
            editItem={editItem} 
            loading={loading} 
            onSave={handleSave} 
            onClose={() => { setShowModal(false); setEditItem(null) }} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCSV && (
          <CSVUploader 
            onUpload={handleBulkUpload} 
            onClose={() => setShowCSV(false)}
            sampleHeaders={['name', 'email', 'roll_number', 'department', 'year', 'section', 'phone', 'attendance_percentage', 'status', 'is_top_5']} 
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[40px] p-12 w-full max-w-md shadow-2xl border border-rose-100 text-center">
              <div className="w-24 h-24 bg-rose-50 rounded-[32px] flex items-center justify-center text-rose-600 mb-8 shadow-inner shadow-rose-100 mx-auto">
                <Trash2 size={40} />
              </div>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">Unenroll Student?</h3>
              <p className="text-[16px] text-gray-500 mt-4 leading-relaxed font-bold opacity-80">This will permanently remove <span className="text-gray-900">{students.find(s => s.id === deleteId)?.name}</span> from academic records. This action is irreversible.</p>
              <div className="flex gap-4 mt-12">
                <button onClick={() => setDeleteId(null)} 
                  className="flex-1 py-5 border-2 border-[#E5E7EB] rounded-[24px] text-[15px] font-black text-gray-700 hover:bg-gray-50 transition-all">Keep Record</button>
                <button onClick={() => handleDelete(deleteId)} 
                  className="flex-1 py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-[24px] text-[15px] font-black transition-all shadow-xl shadow-rose-100">Confirm Removal</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StudentModal({ editItem, loading, onSave, onClose }: { editItem: Student | null; loading: boolean; onSave: (d: Partial<Student>) => void; onClose: () => void }) {
  const [form, setForm] = useState<Partial<Student>>(editItem ?? { status: 'active', department: 'CSE', year: 'I', is_top_5: false })
  const set = (k: keyof Student, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-[48px] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-white">
        
        <div className="flex items-start justify-between px-12 py-10 border-b border-gray-100 bg-gray-50/20 rounded-t-[48px]">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{editItem ? 'Update Student Profile' : 'Enroll New Student'}</h2>
            <p className="text-[16px] text-gray-500 mt-1 font-bold italic opacity-70">Capture comprehensive academic and personal identity.</p>
          </div>
          <button onClick={onClose} className="p-4 rounded-full hover:bg-white text-gray-400 hover:text-gray-900 transition-all shadow-sm"><X size={24} /></button>
        </div>

        <div className="p-12 overflow-y-auto space-y-12 custom-scrollbar">
          {/* Section 1: Basic Info */}
          <div className="space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-inner"><User size={20} /></div>
                <h3 className="text-[13px] font-black text-indigo-900 uppercase tracking-widest">Personal Identification</h3>
              </div>
              <button 
                onClick={() => set('is_top_5', !form.is_top_5)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-black transition-all border ${form.is_top_5 ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm' : 'bg-gray-50 text-gray-400 border-gray-200 opacity-50'}`}
              >
                <Star size={14} fill={form.is_top_5 ? "currentColor" : "none"} />
                TOP 5 PERFORMER
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="col-span-1 lg:col-span-2">
                <Field label="Full Legal Name" value={form.name ?? ''} onChange={v => set('name', v)} placeholder="e.g. Alexander Pierce" />
              </div>
              <Field label="Roll Number" value={form.roll_number ?? ''} onChange={v => set('roll_number', v)} placeholder="e.g. CSE2024101" />
              <Field label="Email Address" value={form.email ?? ''} onChange={v => set('email', v)} placeholder="alex@student.edu" type="email" />
              <Field label="Primary Phone" value={form.phone ?? ''} onChange={v => set('phone', v)} placeholder="+91 98765 43210" />
              <Field label="Blood Group" value={form.blood_group ?? ''} onChange={v => set('blood_group', v)} placeholder="e.g. O+ve" />
            </div>
          </div>

          {/* Section 2: Academic Program */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-inner"><GraduationCap size={20} /></div>
              <h3 className="text-[13px] font-black text-emerald-900 uppercase tracking-widest">Academic Placement</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <SelectField label="Department" value={form.department ?? ''} onChange={v => set('department', v)} options={DEPARTMENTS} placeholder="Select Dept" />
              <SelectField label="Current Year" value={form.year ?? 'I'} onChange={v => set('year', v)} options={YEARS} placeholder="Select Year" />
              <Field label="Section" value={form.section ?? ''} onChange={v => set('section', v)} placeholder="e.g. B (Optional)" />
              <Field label="Attendance %" value={form.attendance_percentage?.toString() ?? ''} onChange={v => set('attendance_percentage', parseFloat(v) || 0)} placeholder="85" type="number" />
              <Field label="Date of Birth" value={form.dob ?? ''} onChange={v => set('dob', v)} placeholder="YYYY-MM-DD" type="date" />
              <Field label="Father's Name" value={form.father_name ?? ''} onChange={v => set('father_name', v)} placeholder="Legal guardian name" />
            </div>
          </div>

          {/* Section 3: Communication */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 shadow-inner"><MapPin size={20} /></div>
              <h3 className="text-[13px] font-black text-amber-900 uppercase tracking-widest">Contact & Address</h3>
            </div>
            <div className="col-span-full">
              <label className="block text-[12px] font-black text-gray-700 mb-4 uppercase tracking-wider ml-1">Permanent Residential Address</label>
              <textarea 
                value={form.address ?? ''} 
                onChange={e => set('address', e.target.value)}
                placeholder="Enter complete permanent residential address with pincode..."
                className="w-full px-8 py-6 bg-gray-50 border-2 border-gray-100 rounded-[32px] text-[16px] text-gray-900 font-bold placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-8 focus:ring-indigo-50/50 transition-all min-h-[160px] shadow-inner"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-6 px-12 py-10 border-t border-gray-100 bg-gray-50/20 rounded-b-[48px]">
          <button onClick={onClose} className="px-12 py-4 bg-white border-2 border-gray-200 rounded-[24px] text-[15px] font-black text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">Cancel</button>
          <button onClick={() => onSave(form)} disabled={loading || !form.name || !form.roll_number || !form.department}
            className="px-14 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-[24px] text-[16px] font-black transition-all shadow-xl shadow-indigo-200 flex items-center gap-3">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserCheck size={20} />}
            {editItem ? 'Save Updates' : 'Confirm Enrollment'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-3">
      <label className="block text-[12px] font-black text-gray-700 uppercase tracking-wider ml-1">{label}</label>
      <input 
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-7 py-4.5 bg-white border-2 border-gray-100 rounded-[24px] text-[15px] text-gray-900 font-black placeholder:text-gray-400/60 outline-none focus:border-indigo-400 focus:ring-8 focus:ring-indigo-50 transition-all shadow-sm" 
      />
    </div>
  )
}

function SelectField({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (v: string) => void; options: string[], placeholder?: string }) {
  return (
    <div className="space-y-3">
      <label className="block text-[12px] font-black text-gray-700 uppercase tracking-wider ml-1">{label}</label>
      <div className="relative">
        <select 
          value={value} onChange={e => onChange(e.target.value)}
          className={`w-full pl-7 pr-14 py-4.5 bg-white border-2 border-gray-100 rounded-[24px] text-[15px] font-black outline-none appearance-none cursor-pointer focus:border-indigo-400 focus:ring-8 focus:ring-indigo-50 transition-all shadow-sm ${value ? 'text-gray-900' : 'text-gray-400'}`}
        >
          <option value="" disabled hidden>{placeholder || 'Select...'}</option>
          {options.map(o => <option key={o} value={o} className="text-gray-900 font-bold">{o}</option>)}
        </select>
        <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}
