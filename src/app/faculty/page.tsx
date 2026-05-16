'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Filter, Edit2, Trash2, X, Users, Mail, Phone, 
  BookOpen, ChevronDown, Upload, Award, CheckCircle, Building, 
  MoreVertical, TrendingUp, Briefcase, ChevronRight, GraduationCap,
  Clock, MapPin, ArrowLeft, Download, Eye, Camera, ShieldCheck,
  Star, LayoutGrid, List as ListIcon, Building2, SlidersHorizontal,
  FileText, UserPlus
} from 'lucide-react'
import toast from 'react-hot-toast'
import CSVUploader from '@/components/ui/CSVUploader'
import { useRouter } from 'next/navigation'
import { downloadCSV, CSV_TEMPLATES } from '@/utils/csvHelper'
import PortalModal from '@/components/ui/PortalModal'
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
  subject_1?: string
  subject_2?: string
  labs?: string[]
  dept_level_responsibility?: string
  college_level_responsibility?: string
  qualification?: string
  experience_years?: number
  status: 'active' | 'inactive' | 'on_leave'
  joining_date?: string
  photo_url?: string
}

const DEPARTMENTS = ['AENS', 'BME', 'AIDS', 'CSE', 'ECE', 'MECH', 'CIVIL', 'MBA']
const SHIFTS = ['Day', 'Eve', 'Noon']
const DESIGNATIONS = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Senior Lecturer', 'Head of Department']

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { 
      delay: i * 0.05, 
      duration: 0.5, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  }),
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm'
    case 'inactive': return 'bg-slate-50 text-slate-500 border-slate-100'
    case 'on_leave': return 'bg-amber-50 text-amber-700 border-amber-100 shadow-sm'
    default: return 'bg-gray-50 text-gray-600 border-gray-100'
  }
}

const MOCK_FACULTY: Faculty[] = [
  { id: '1', employee_id: 'FAC001', name: 'Dr. Elena Rodriguez', email: 'e.rodriguez@edu.com', phone: '+91 98765 43210', department: 'CSE', designation: 'Head of Department', qualification: 'Ph.D in CS', status: 'active', joining_date: '2018-10-12', subject_1: 'Theory of Computation', subject_2: 'Compiler Design', shift: 'Day', labs: ['Compiler Lab'], dept_level_responsibility: 'Academic Coordinator' },
  { id: '2', employee_id: 'FAC002', name: 'Prof. Marcus Sterling', email: 'm.sterling@edu.com', phone: '+91 98765 43211', department: 'MECH', designation: 'Senior Lecturer', qualification: 'M.Tech', status: 'active', joining_date: '2020-01-15', subject_1: 'Thermodynamics', shift: 'Day', labs: ['Thermal Lab'] },
  { id: '3', employee_id: 'FAC003', name: 'Dr. Anika Sharma', email: 'a.sharma@edu.com', phone: '+91 98765 43212', department: 'MBA', designation: 'Assistant Professor', qualification: 'Ph.D', status: 'active', joining_date: '2021-03-01', subject_1: 'Strategic Management', shift: 'Eve', college_level_responsibility: 'Placement Officer' },
  { id: '4', employee_id: 'FAC004', name: 'Prof. Julian Vane', email: 'j.vane@edu.com', phone: '+91 98765 43213', department: 'ECE', designation: 'Associate Professor', qualification: 'M.E', status: 'active', joining_date: '2017-02-12', subject_1: 'Digital Electronics', shift: 'Noon' },
  { id: '5', employee_id: 'FAC005', name: 'Dr. Sarah Jenkins', email: 's.jenkins@edu.com', phone: '+91 98765 43214', department: 'BME', designation: 'Assistant Professor', qualification: 'Ph.D', status: 'active', joining_date: '2019-06-20', subject_1: 'Biomechanics', shift: 'Day' },
  { id: '6', employee_id: 'FAC006', name: 'Prof. Arjun Reddy', email: 'a.reddy@edu.com', phone: '+91 98765 43215', department: 'AENS', designation: 'Professor', qualification: 'Ph.D', status: 'active', joining_date: '2015-11-05', subject_1: 'Calculus', shift: 'Day' },
]

export default function FacultyPage() {
  const router = useRouter()
  const [faculty, setFaculty] = useState<Faculty[]>(MOCK_FACULTY)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  
  // Drill-down State
  const [selectedDept, setSelectedDept] = useState<string | null>(null)
  const [selectedShift, setSelectedShift] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  
  const [showModal, setShowModal] = useState(false)
  const [showCSV, setShowCSV] = useState(false)
  const [editItem, setEditItem] = useState<Faculty | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredFaculty = useMemo(() => {
    return faculty.filter(f => {
      const matchDept = !selectedDept || f.department === selectedDept
      const matchShift = !selectedShift || selectedShift === 'All' || f.shift === selectedShift
      const matchSearch = !search || 
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.employee_id.toLowerCase().includes(search.toLowerCase()) ||
        f.email.toLowerCase().includes(search.toLowerCase()) ||
        f.subject_1?.toLowerCase().includes(search.toLowerCase()) ||
        f.subject_2?.toLowerCase().includes(search.toLowerCase())
      return matchDept && matchShift && matchSearch
    })
  }, [faculty, selectedDept, selectedShift, search])

  const fetchFaculty = useCallback(async () => {
    try {
      const res = await fetch('/api/faculty')
      const { data } = await res.json()
      if (data && data.length > 0) setFaculty(data)
    } catch { /* use mock */ }
  }, [])

  useEffect(() => { fetchFaculty() }, [fetchFaculty])

  const handleSave = async (data: Partial<Faculty>) => {
    setLoading(true)
    try {
      const method = editItem ? 'PUT' : 'POST'
      const url = editItem ? `/api/faculty/${editItem.id}` : '/api/faculty'
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      
      if (editItem) {
        setFaculty(prev => prev.map(f => f.id === editItem.id ? { ...f, ...data } : f))
        toast.success('Faculty profile updated')
      } else {
        setFaculty(prev => [{ ...data, id: Date.now().toString(), status: 'active' } as Faculty, ...prev])
        toast.success('New faculty member added')
      }
      setShowModal(false)
      setEditItem(null)
    } catch {
      toast.error('Connection failed, using demo mode')
      if (editItem) {
        setFaculty(prev => prev.map(f => f.id === editItem.id ? { ...f, ...data } : f))
      } else {
        setFaculty(prev => [{ ...data, id: Date.now().toString(), status: 'active' } as Faculty, ...prev])
      }
      setShowModal(false)
      setEditItem(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try { await fetch(`/api/faculty/${id}`, { method: 'DELETE' }) } catch { /* ignore */ }
    setFaculty(prev => prev.filter(f => f.id !== id))
    setDeleteId(null)
    toast.success('Faculty member removed')
  }

  const handleBulkUpload = (data: any[]) => {
    const newFaculty = data.map((row, idx) => ({
      id: `bulk-${Date.now()}-${idx}`,
      employee_id: row.employee_id || `FAC${idx + 100}`,
      name: row.name || 'Unknown',
      email: row.email || '',
      phone: row.phone || '',
      department: row.department || 'CSE',
      designation: row.designation || 'Lecturer',
      qualification: row.qualification || '',
      status: 'active',
      joining_date: new Date().toISOString().split('T')[0],
      subject_1: row.subject_1 || '',
      subject_2: row.subject_2 || '',
      shift: row.shift || 'Day',
    })) as Faculty[]
    
    setFaculty(prev => [...newFaculty, ...prev])
    setShowCSV(false)
    toast.success(`Successfully imported ${newFaculty.length} faculty members`)
  }

  const analytics = [
    { label: 'Total Faculty', value: faculty.length, change: '+4 this semester', positive: true, icon: Users, accent: 'text-indigo-600', bg: 'bg-indigo-50/50' },
    { label: 'Departments', value: DEPARTMENTS.length, change: 'All Active', positive: true, icon: Building2, accent: 'text-purple-600', bg: 'bg-purple-50/50' },
    { label: 'Ph.D Holders', value: faculty.filter(f => f.qualification?.toLowerCase().includes('ph.d')).length, change: '65% of staff', positive: true, icon: Award, accent: 'text-emerald-600', bg: 'bg-emerald-50/50' },
    { label: 'On Leave', value: faculty.filter(f => f.status === 'on_leave').length, change: 'Temporary', positive: false, icon: Clock, accent: 'text-amber-600', bg: 'bg-amber-50/50' },
  ]

  return (
    <div className="min-h-screen pb-20 space-y-10">
      {/* 📌 PAGE HEADER */}
      <motion.div 
        variants={fadeUp} initial="hidden" animate="visible" 
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
      >
        <div>
          <nav className="flex items-center gap-2 text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            <button onClick={() => { setSelectedDept(null); setSelectedShift(null) }} className="hover:text-primary transition-colors">Faculty Directory</button>
            {selectedDept && (
              <>
                <ChevronRight size={12} />
                <button onClick={() => setSelectedShift(null)} className="hover:text-primary transition-colors text-gray-600">{selectedDept}</button>
              </>
            )}
            {selectedShift && (
              <>
                <ChevronRight size={12} />
                <span className="text-primary font-black uppercase tracking-widest">{selectedShift} Shift</span>
              </>
            )}
          </nav>
          
          <div className="flex items-center gap-4">
            {selectedDept && (
              <button 
                onClick={() => { selectedShift ? setSelectedShift(null) : setSelectedDept(null) }} 
                className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm group"
              >
                <ArrowLeft size={24} className="text-slate-400 group-hover:text-primary transition-colors" />
              </button>
            )}
            <div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {selectedDept ? `${selectedDept} Faculty` : 'Academic Faculty'}
              </h1>
              <p className="text-base font-medium text-slate-500 mt-2">
                {selectedDept 
                  ? `Detailed directory of faculty members in ${selectedDept} ${selectedShift ? `- ${selectedShift} Shift` : ''}`
                  : 'Manage and monitor academic staff across all departments and shifts.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => downloadCSV('faculty_import_template.csv', CSV_TEMPLATES.faculty.headers, CSV_TEMPLATES.faculty.sample)}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl text-[14px] font-black transition-all hover:-translate-y-1 shadow-sm">
            <Download size={18} className="text-indigo-600" /> Format
          </button>
          <button onClick={() => setShowCSV(true)}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl text-[14px] font-black transition-all hover:-translate-y-1 shadow-sm">
            <Upload size={18} className="text-indigo-600" /> Import
          </button>
          <button onClick={() => { setEditItem(null); setShowModal(true) }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-indigo-600 to-purple-700 hover:shadow-xl hover:shadow-indigo-200 text-white rounded-2xl text-[14px] font-black transition-all hover:-translate-y-1 active:translate-y-0">
            <Plus size={20} /> Add Faculty
          </button>
        </div>
      </motion.div>

      {/* 📊 ANALYTICS CARDS */}
      {!selectedDept && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {analytics.map((stat, i) => (
            <motion.div 
              key={stat.label} 
              variants={fadeUp} initial="hidden" animate="visible" custom={i + 1}
              className="bg-white border border-slate-200 rounded-[32px] p-7 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.accent} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon size={26} strokeWidth={2.5} />
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${stat.positive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                  {stat.positive ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                  {stat.change}
                </div>
              </div>
              
              <div className="relative z-10">
                <p className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{stat.value}</p>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Department Selection Grid */}
        {!selectedDept && (
          <motion.div
            key="depts"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {DEPARTMENTS.map((dept, i) => {
              const count = faculty.filter(f => f.department === dept).length
              return (
                <motion.div
                  key={dept}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => setSelectedDept(dept)}
                  className="relative overflow-hidden cursor-pointer p-8 rounded-[40px] border border-slate-200 bg-white hover:border-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-900/5 transition-all group min-h-[240px] flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                      <GraduationCap size={28} />
                    </div>
                    <div className="px-4 py-1.5 rounded-full bg-slate-50 text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors">
                      {dept}
                    </div>
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="text-3xl font-black text-slate-900 mb-1">{dept}</h3>
                    <p className="text-[15px] font-bold text-slate-400">Academic Faculty · {count}</p>
                  </div>
                  
                  <div className="absolute -right-8 -bottom-8 text-slate-50 opacity-20 group-hover:opacity-40 transition-opacity rotate-12 group-hover:rotate-0">
                    <Building size={180} />
                  </div>
                  <div className="absolute bottom-8 right-8 p-3 rounded-full bg-slate-50 text-slate-400 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <ChevronRight size={24} />
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Step 2: Shift Selection */}
        {selectedDept && !selectedShift && (
          <motion.div
            key="shifts"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {SHIFTS.map((s, i) => {
                const count = faculty.filter(f => f.department === selectedDept && f.shift === s).length
                return (
                  <motion.div
                    key={s}
                    whileHover={{ y: -8, scale: 1.02 }}
                    onClick={() => setSelectedShift(s)}
                    className="cursor-pointer bg-white border border-slate-200 p-12 rounded-[48px] shadow-sm hover:shadow-2xl hover:border-indigo-500/20 hover:shadow-indigo-900/5 transition-all group text-center"
                  >
                    <div className="w-24 h-24 mx-auto rounded-[32px] bg-slate-50 flex items-center justify-center text-slate-400 mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-6 shadow-inner">
                      <Clock size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{s} Shift</h3>
                    <p className="text-slate-500 font-bold text-lg">{count} Faculty Members</p>
                  </motion.div>
                )
              })}
            </div>
            
            <div className="flex justify-center">
              <button onClick={() => setSelectedShift('All')} className="flex items-center gap-3 px-12 py-5 bg-white border border-slate-200 rounded-3xl text-[16px] font-black text-slate-700 hover:bg-slate-50 hover:border-indigo-500/30 transition-all group shadow-sm">
                <Users size={24} className="text-indigo-600 group-hover:scale-110 transition-transform" /> 
                View Complete {selectedDept} Faculty List
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Faculty Content */}
        {selectedDept && selectedShift && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* 🔍 FILTER SECTION */}
            <div className="relative z-10">
              <div className="bg-white/80 backdrop-blur-2xl border border-slate-200 rounded-[32px] p-4 shadow-2xl shadow-indigo-900/5 flex flex-col lg:flex-row gap-4 items-center">
                <div className="flex-1 w-full relative group">
                  <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, employee ID, or designation..."
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl text-[15px] font-bold text-slate-700 placeholder:text-slate-300 outline-none transition-all"
                  />
                </div>
                
                <div className="flex items-center gap-3 w-full lg:w-auto">
                  <div className="flex items-center bg-slate-50 p-1.5 rounded-2xl border border-transparent">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-lg text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <LayoutGrid size={20} />
                    </button>
                    <button 
                      onClick={() => setViewMode('table')}
                      className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white shadow-lg text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <ListIcon size={20} />
                    </button>
                  </div>
                  
                  <button className="flex items-center gap-2 px-6 py-4 bg-slate-50 border border-transparent hover:border-indigo-500/20 hover:bg-white rounded-2xl text-[14px] font-black text-slate-700 transition-all">
                    <Filter size={18} /> Advanced Filters
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredFaculty.map((f, i) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -8 }}
                    className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-900/5 transition-all group relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-[28px] bg-slate-50 p-1 shadow-inner border border-slate-100 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                          {f.photo_url ? (
                            <img src={f.photo_url} className="w-full h-full rounded-[24px] object-cover" />
                          ) : (
                            <div className="w-full h-full rounded-[24px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl">
                              {f.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white ${f.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditItem(f); setShowModal(true) }} className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100 rounded-2xl transition-all"><Edit2 size={18} /></button>
                        <button onClick={() => setDeleteId(f.id)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-white border border-transparent hover:border-rose-100 rounded-2xl transition-all"><Trash2 size={18} /></button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{f.name}</h3>
                      <p className="text-[13px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                        {f.designation} <span className="opacity-30">·</span> {f.qualification}
                      </p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-50 space-y-4">
                      <div className="flex items-center gap-3 text-[14px] font-bold text-slate-600">
                        <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><Briefcase size={16} /></div>
                        {f.employee_id}
                      </div>
                      <div className="flex items-center gap-3 text-[14px] font-bold text-slate-600">
                        <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><Mail size={16} /></div>
                        <span className="truncate">{f.email}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {f.subject_1 && <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black uppercase border border-indigo-100 tracking-wider">{f.subject_1}</span>}
                      {f.dept_level_responsibility && <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase border border-emerald-100 tracking-wider">Lead</span>}
                    </div>

                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none">
                      <ShieldCheck size={120} />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-2xl shadow-indigo-900/5">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Faculty Member</th>
                        <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Expertise</th>
                        <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Administrative</th>
                        <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                        <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredFaculty.map((f, i) => (
                        <motion.tr 
                          key={f.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="hover:bg-indigo-50/30 transition-colors group"
                        >
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-5">
                              <div className="relative w-14 h-14">
                                {f.photo_url ? (
                                  <img src={f.photo_url} className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                                ) : (
                                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg">
                                    {f.name.charAt(0)}
                                  </div>
                                )}
                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${f.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              </div>
                              <div>
                                <p className="text-[17px] font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{f.name}</p>
                                <p className="text-[13px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{f.designation} · {f.employee_id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex flex-wrap gap-2">
                              {f.subject_1 && <span className="text-[10px] font-black px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 uppercase tracking-widest">{f.subject_1}</span>}
                              {f.qualification && <span className="text-[10px] font-black px-3 py-1 bg-slate-50 text-slate-500 rounded-lg border border-slate-100 uppercase tracking-widest">{f.qualification}</span>}
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex flex-col gap-1">
                              <p className="text-[14px] font-black text-slate-700 truncate max-w-[200px]">{f.dept_level_responsibility || 'Academic Staff'}</p>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{f.college_level_responsibility || 'Standard Role'}</p>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(f.status)}`}>
                              {f.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                              <button onClick={() => { setEditItem(f); setShowModal(true) }} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-xl rounded-2xl transition-all"><Edit2 size={18} /></button>
                              <button onClick={() => setDeleteId(f.id)} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:shadow-xl rounded-2xl transition-all"><Trash2 size={18} /></button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {filteredFaculty.length === 0 && (
              <div className="bg-white rounded-[40px] p-24 text-center border-2 border-dashed border-slate-200">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200">
                    <Users size={48} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">No faculty members found</h3>
                    <p className="text-slate-500 font-bold mt-2">Try adjusting your search or filters to find what you're looking for.</p>
                  </div>
                  <button onClick={() => { setSearch(''); setSelectedShift('All') }} className="px-8 py-3 bg-slate-50 text-primary rounded-2xl font-black text-[14px] hover:bg-slate-100 transition-all">Clear All Search Filters</button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <PortalModal>
        <AnimatePresence>
          {showModal && (
            <FacultyModal 
              editItem={editItem} 
              loading={loading} 
              onSave={handleSave} 
              onClose={() => { setShowModal(false); setEditItem(null) }} 
            />
          )}
        </AnimatePresence>
      </PortalModal>

      <PortalModal>
        <AnimatePresence>
          {showCSV && (
            <CSVUploader 
              onUpload={handleBulkUpload} 
              onClose={() => setShowCSV(false)}
              sampleHeaders={['employee_id', 'name', 'email', 'phone', 'department', 'designation', 'qualification', 'subject_1', 'subject_2', 'shift']} 
            />
          )}
        </AnimatePresence>
      </PortalModal>

      {/* Delete Confirmation */}
      <PortalModal>
        <AnimatePresence>
          {deleteId && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl border border-slate-100 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-rose-500"></div>
                <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-600 mb-8 shadow-inner">
                  <Trash2 size={32} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Remove Faculty Profile?</h3>
                <p className="text-base font-medium text-slate-500 mt-3 leading-relaxed">
                  This will permanently remove <span className="text-slate-900 font-bold">{faculty.find(f => f.id === deleteId)?.name}</span> from the directory. This action is irreversible.
                </p>
                <div className="flex gap-4 mt-10">
                  <button onClick={() => setDeleteId(null)} 
                    className="flex-1 py-4 border border-slate-200 rounded-2xl text-[14px] font-black text-slate-700 hover:bg-slate-50 transition-all">Cancel</button>
                  <button onClick={() => handleDelete(deleteId)} 
                    className="flex-1 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-[14px] font-black transition-all shadow-xl shadow-rose-200">Yes, Remove</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </PortalModal>
    </div>
  )
}

function FacultyModal({ editItem, loading, onSave, onClose }: { editItem: Faculty | null; loading: boolean; onSave: (d: Partial<Faculty>) => void; onClose: () => void }) {
  const [form, setForm] = useState<Partial<Faculty>>(editItem ?? { status: 'active', department: 'CSE', shift: 'Day', labs: [] })
  const [labInput, setLabInput] = useState('')
  const set = (k: keyof Faculty, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  const handleAddLab = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && labInput.trim()) {
      e.preventDefault()
      set('labs', [...(form.labs || []), labInput.trim()])
      setLabInput('')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-[48px] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        
        <div className="flex items-center justify-between px-10 py-8 border-b border-slate-100">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editItem ? 'Edit Faculty Member' : 'New Faculty Registry'}</h2>
            <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-widest">Enterprise Resource Planning</p>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl hover:bg-slate-50 text-slate-400 transition-colors bg-slate-50 border border-transparent hover:border-slate-100">
            <X size={24} />
          </button>
        </div>

        <div className="p-10 overflow-y-auto custom-scrollbar space-y-12">
          {/* Section 1: Basic & Contact */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Camera size={18} /></div>
                <h3 className="text-[11px] font-black text-indigo-900 uppercase tracking-widest">Profile Portrait</h3>
              </div>
              <div className="aspect-square rounded-[40px] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all relative overflow-hidden">
                {form.photo_url ? (
                  <img src={form.photo_url} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-3xl bg-white shadow-md flex items-center justify-center text-slate-300 group-hover:text-indigo-400 transition-all">
                      <Plus size={32} />
                    </div>
                    <p className="text-[11px] font-black text-slate-400 group-hover:text-indigo-900 transition-all uppercase tracking-widest">Upload Photo</p>
                  </>
                )}
              </div>
              <p className="text-[12px] text-slate-400 font-bold text-center leading-relaxed px-4">Standard profile photo for academic directory and identity verification.</p>
            </div>

            <div className="lg:col-span-2 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><UserPlus size={18} /></div>
                  <h3 className="text-[11px] font-black text-emerald-900 uppercase tracking-widest">Identity & Roles</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <Field label="Full Legal Name" value={form.name ?? ''} onChange={v => set('name', v)} placeholder="e.g. Dr. Elena Rodriguez" />
                  <Field label="Employee ID" value={form.employee_id ?? ''} onChange={v => set('employee_id', v)} placeholder="e.g. FAC2024001" />
                  <SelectField label="Primary Department" value={form.department ?? ''} onChange={v => set('department', v)} options={DEPARTMENTS} placeholder="Select Dept" />
                  <SelectField label="Official Designation" value={form.designation ?? ''} onChange={v => set('designation', v)} options={DESIGNATIONS} placeholder="Select Title" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><Mail size={18} /></div>
                  <h3 className="text-[11px] font-black text-amber-900 uppercase tracking-widest">Contact Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <Field label="Academic Email" value={form.email ?? ''} onChange={v => set('email', v)} placeholder="elena@edu.com" type="email" />
                  <Field label="Mobile Number" value={form.phone ?? ''} onChange={v => set('phone', v)} placeholder="+91 98765 43210" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Academic & Responsibilities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="p-2 bg-purple-50 rounded-xl text-purple-600"><BookOpen size={18} /></div>
                <h3 className="text-[11px] font-black text-purple-900 uppercase tracking-widest">Academic Portfolio</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <Field label="Primary Subject" value={form.subject_1 ?? ''} onChange={v => set('subject_1', v)} placeholder="e.g. Algorithms" />
                <Field label="Secondary Subject" value={form.subject_2 ?? ''} onChange={v => set('subject_2', v)} placeholder="e.g. AI Theory" />
                <SelectField label="Assigned Shift" value={form.shift ?? 'Day'} onChange={v => set('shift', v)} options={SHIFTS} placeholder="Select Shift" />
                <Field label="Qualification" value={form.qualification ?? ''} onChange={v => set('qualification', v)} placeholder="e.g. Ph.D, M.Tech" />
              </div>
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Laboratory Oversight</label>
                <div className="w-full p-6 bg-slate-50 border border-transparent rounded-[32px] flex items-center flex-wrap gap-3 focus-within:border-indigo-500/20 focus-within:bg-white transition-all shadow-inner">
                  {form.labs?.map((lab, i) => (
                    <span key={i} className="flex items-center gap-3 px-4 py-2 bg-white text-indigo-700 border border-indigo-100 rounded-2xl text-[13px] font-black shadow-sm group">
                      {lab}
                      <button onClick={() => set('labs', form.labs?.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={16} /></button>
                    </span>
                  ))}
                  <input
                    value={labInput}
                    onChange={e => setLabInput(e.target.value)}
                    onKeyDown={handleAddLab}
                    placeholder="Add lab assignment..."
                    className="flex-1 min-w-[200px] bg-transparent outline-none text-[15px] text-slate-700 font-bold placeholder:text-slate-300"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="p-2 bg-rose-50 rounded-xl text-rose-600"><FileText size={18} /></div>
                <h3 className="text-[11px] font-black text-rose-900 uppercase tracking-widest">Administrative Roles</h3>
              </div>
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Departmental Roles</label>
                  <textarea 
                    value={form.dept_level_responsibility ?? ''} 
                    onChange={e => set('dept_level_responsibility', e.target.value)}
                    placeholder="e.g. Academic Coordinator, Lab In-charge..."
                    className="w-full px-6 py-5 bg-slate-50 border border-transparent rounded-[32px] text-[15px] text-slate-700 font-bold placeholder:text-slate-300 outline-none focus:border-indigo-500/20 focus:bg-white transition-all min-h-[120px] shadow-inner"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Institutional Roles</label>
                  <textarea 
                    value={form.college_level_responsibility ?? ''} 
                    onChange={e => set('college_level_responsibility', e.target.value)}
                    placeholder="e.g. IQAC Member, Cultural Coordinator..."
                    className="w-full px-6 py-5 bg-slate-50 border border-transparent rounded-[32px] text-[15px] text-slate-700 font-bold placeholder:text-slate-300 outline-none focus:border-indigo-500/20 focus:bg-white transition-all min-h-[120px] shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 px-10 py-8 border-t border-slate-100 bg-slate-50/50">
          <button onClick={onClose} className="px-8 py-4 bg-white border border-slate-200 rounded-2xl text-[14px] font-black text-slate-700 hover:bg-slate-50 transition-all">Cancel Operation</button>
          <button onClick={() => onSave(form)} disabled={loading || !form.name || !form.email || !form.department}
            className="px-10 py-4 bg-gradient-to-br from-indigo-600 to-purple-700 hover:shadow-2xl hover:shadow-indigo-500/20 disabled:opacity-50 text-white rounded-2xl text-[14px] font-black transition-all hover:-translate-y-1 active:translate-y-0">
            {loading ? 'Processing System...' : editItem ? 'Commit Changes' : 'Finalize Registry'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-3">
      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>
      <input 
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-[15px] font-bold text-slate-700 placeholder:text-slate-300 outline-none focus:border-indigo-500/20 focus:bg-white transition-all shadow-inner" 
      />
    </div>
  )
}

function SelectField({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (v: string) => void; options: string[], placeholder?: string }) {
  return (
    <div className="space-y-3">
      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>
      <div className="relative group">
        <select 
          value={value} onChange={e => onChange(e.target.value)}
          className={`w-full pl-6 pr-12 py-4 bg-slate-50 border border-transparent rounded-2xl text-[15px] font-bold outline-none appearance-none cursor-pointer group-focus-within:border-indigo-500/20 group-focus-within:bg-white transition-all shadow-inner ${value ? 'text-slate-900' : 'text-slate-300'}`}
        >
          <option value="" disabled hidden>{placeholder || 'Select...'}</option>
          {options.map(o => <option key={o} value={o} className="text-slate-900 font-bold">{o}</option>)}
        </select>
        <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-indigo-600 transition-colors" />
      </div>
    </div>
  )
}
