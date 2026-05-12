'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Filter, Edit2, Trash2, X, Users, Mail, Phone, 
  BookOpen, ChevronDown, Upload, Award, CheckCircle, Building, 
  MoreVertical, TrendingUp, Briefcase, ChevronRight, GraduationCap,
  Clock, MapPin, ArrowLeft, Download, Eye, Camera, ShieldCheck,
  Star, LayoutGrid, List as ListIcon
} from 'lucide-react'
import toast from 'react-hot-toast'
import CSVUploader from '@/components/ui/CSVUploader'
import { useRouter } from 'next/navigation'

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

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  inactive: 'bg-gray-50 text-gray-500 border-gray-100',
  on_leave: 'bg-amber-50 text-amber-700 border-amber-100',
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] } }),
}

const getDeptStyle = (dept: string) => {
  switch (dept) {
    case 'CSE': return 'bg-indigo-50 text-indigo-700 border-indigo-100'
    case 'AIDS': return 'bg-blue-50 text-blue-700 border-blue-100'
    case 'MECH': return 'bg-orange-50 text-orange-700 border-orange-100'
    case 'CIVIL': return 'bg-amber-50 text-amber-700 border-amber-100'
    case 'MBA': return 'bg-rose-50 text-rose-700 border-rose-100'
    case 'ECE': return 'bg-emerald-50 text-emerald-700 border-emerald-100'
    case 'BME': return 'bg-cyan-50 text-cyan-700 border-cyan-100'
    case 'AENS': return 'bg-purple-50 text-purple-700 border-purple-100'
    default: return 'bg-gray-50 text-gray-700 border-gray-100'
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
      const matchShift = !selectedShift || f.shift === selectedShift
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

  const stats = [
    { label: 'TOTAL FACULTY', value: faculty.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'DEPARTMENTS', value: DEPARTMENTS.length, icon: Building, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'PH.D HOLDERS', value: faculty.filter(f => f.qualification?.toLowerCase().includes('ph.d')).length, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'ON LEAVE', value: faculty.filter(f => f.status === 'on_leave').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <div className="space-y-8 pb-12 max-w-[1600px] mx-auto">
      {/* Premium Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-4">
        <div className="space-y-4">
          <nav className="flex items-center gap-2 text-[13px] font-bold text-gray-400">
            <button onClick={() => { setSelectedDept(null); setSelectedShift(null) }} className="hover:text-indigo-600 transition-colors uppercase tracking-widest">Faculty Management</button>
            {selectedDept && (
              <>
                <ChevronRight size={14} className="text-gray-300" />
                <button onClick={() => setSelectedShift(null)} className="hover:text-indigo-600 transition-colors uppercase tracking-widest text-gray-600">{selectedDept}</button>
              </>
            )}
            {selectedShift && (
              <>
                <ChevronRight size={14} className="text-gray-300" />
                <span className="text-indigo-600 uppercase tracking-widest">{selectedShift} Shift</span>
              </>
            )}
          </nav>
          
          <div className="flex items-center gap-4">
            {selectedDept && (
              <button 
                onClick={() => { selectedShift ? setSelectedShift(null) : setSelectedDept(null) }} 
                className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-sm group"
              >
                <ArrowLeft size={24} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
              </button>
            )}
            <div>
              <h1 className="text-[40px] font-black text-gray-900 tracking-tight leading-none">
                {selectedDept ? `${selectedDept} Department` : 'Academic Faculty'}
              </h1>
              <p className="text-[17px] text-gray-500 font-medium mt-2">
                {selectedDept 
                  ? `Detailed directory of faculty members in ${selectedDept} ${selectedShift ? `- ${selectedShift} Shift` : ''}`
                  : 'Manage and monitor academic staff across all departments and shifts.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm mr-2">
            <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
              <LayoutGrid size={20} />
            </button>
            <button onClick={() => setViewMode('table')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
              <ListIcon size={20} />
            </button>
          </div>
          <button onClick={() => setShowCSV(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-white border border-[#E5E7EB] hover:border-indigo-200 hover:text-indigo-600 rounded-[18px] text-[15px] font-bold transition-all shadow-sm">
            <Upload size={18} /> Import Bulk
          </button>
          <button onClick={() => { setEditItem(null); setShowModal(true) }}
            className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[18px] text-[15px] font-black transition-all shadow-xl shadow-indigo-100">
            <Plus size={20} /> Add Faculty
          </button>
        </div>
      </motion.div>

      {/* KPI Section */}
      {!selectedDept && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-[32px] p-7 flex items-center gap-6 shadow-sm hover:shadow-xl hover:border-indigo-50 transition-all group">
              <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={30} />
              </div>
              <div>
                <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Department Selection Grid */}
        {!selectedDept && (
          <motion.div
            key="depts"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4"
          >
            {DEPARTMENTS.map((dept, i) => {
              const count = faculty.filter(f => f.department === dept).length
              const style = getDeptStyle(dept)
              return (
                <motion.div
                  key={dept}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => setSelectedDept(dept)}
                  className={`relative overflow-hidden cursor-pointer p-8 rounded-[40px] border-2 ${style} transition-all shadow-xl group h-[220px] flex flex-col justify-between`}
                >
                  <div className="flex items-start justify-between relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-white/60 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-sm">
                      <GraduationCap size={28} />
                    </div>
                    <div className="px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-md border border-white/20 text-[11px] font-black uppercase tracking-widest">
                      {dept}
                    </div>
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="text-3xl font-black mb-1">{dept}</h3>
                    <p className="text-[15px] font-bold opacity-70">Academic Faculty · {count}</p>
                  </div>
                  
                  <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:opacity-20 transition-all rotate-12 group-hover:rotate-0">
                    <Building size={180} />
                  </div>
                  <div className="absolute bottom-8 right-8 p-3 rounded-full bg-white/40 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
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
            className="space-y-12 px-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {SHIFTS.map((s, i) => {
                const count = faculty.filter(f => f.department === selectedDept && f.shift === s).length
                return (
                  <motion.div
                    key={s}
                    whileHover={{ y: -8, scale: 1.02 }}
                    onClick={() => setSelectedShift(s)}
                    className="cursor-pointer bg-white border-2 border-gray-100 p-12 rounded-[48px] shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all group text-center"
                  >
                    <div className="w-24 h-24 mx-auto rounded-[32px] bg-indigo-50 flex items-center justify-center text-indigo-600 mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-6 shadow-inner">
                      <Clock size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">{s} Shift</h3>
                    <p className="text-gray-500 font-bold text-lg">{count} Faculty Members</p>
                  </motion.div>
                )
              })}
            </div>
            
            <div className="flex justify-center">
              <button onClick={() => setSelectedShift('All')} className="flex items-center gap-3 px-12 py-5 bg-white border-2 border-gray-100 rounded-3xl text-[16px] font-black text-gray-700 hover:bg-gray-50 hover:border-indigo-200 transition-all group shadow-sm">
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
            className="space-y-8 px-4"
          >
            {/* Advanced Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white/80 backdrop-blur-xl p-4 rounded-[32px] border border-gray-200 shadow-xl sticky top-4 z-30">
              <div className="flex-1 flex items-center gap-4 bg-gray-50 px-6 py-4 rounded-[22px] border border-transparent focus-within:border-indigo-200 focus-within:bg-white transition-all w-full shadow-inner">
                <Search size={22} className="text-gray-400" />
                <input 
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, ID, subjects or responsibilities..." 
                  className="bg-transparent text-[16px] outline-none w-full text-gray-800 font-bold placeholder:text-gray-400 placeholder:font-medium"
                />
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-200 rounded-[22px] text-[15px] font-black text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-all flex-1 md:flex-none shadow-sm">
                  <Download size={20} /> Export
                </button>
                <button className="flex items-center gap-2 px-6 py-4 bg-indigo-50 border border-indigo-100 rounded-[22px] text-[15px] font-black text-indigo-700 hover:bg-indigo-100 transition-all flex-1 md:flex-none">
                  <Filter size={20} /> Advanced
                </button>
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
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-indigo-500 to-violet-600 p-0.5 shadow-lg">
                          {f.photo_url ? (
                            <img src={f.photo_url} className="w-full h-full rounded-[26px] object-cover" />
                          ) : (
                            <div className="w-full h-full rounded-[26px] bg-white flex items-center justify-center text-indigo-600 font-black text-2xl">
                              {f.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white ${f.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => router.push(`/faculty/${f.id}`)} className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"><Eye size={20} /></button>
                        <button onClick={() => { setEditItem(f); setShowModal(true) }} className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"><Edit2 size={20} /></button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{f.name}</h3>
                      <p className="text-[14px] font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
                        {f.designation} <span className="opacity-30">·</span> {f.qualification}
                      </p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-50 space-y-4">
                      <div className="flex items-center gap-3 text-[14px] font-bold text-gray-600">
                        <div className="p-2 bg-gray-50 rounded-xl text-gray-400"><Briefcase size={16} /></div>
                        {f.employee_id}
                      </div>
                      <div className="flex items-center gap-3 text-[14px] font-bold text-gray-600">
                        <div className="p-2 bg-gray-50 rounded-xl text-gray-400"><Mail size={16} /></div>
                        <span className="truncate">{f.email}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {f.subject_1 && <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-[11px] font-black uppercase border border-indigo-100">{f.subject_1}</span>}
                      {f.subject_2 && <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl text-[11px] font-black uppercase border border-emerald-100">{f.subject_2}</span>}
                      {f.dept_level_responsibility && <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-xl text-[11px] font-black uppercase border border-purple-100">Dept Lead</span>}
                    </div>

                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity">
                      <ShieldCheck size={120} />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-10 py-6 text-[12px] font-black text-gray-400 uppercase tracking-widest">Faculty Member</th>
                        <th className="px-10 py-6 text-[12px] font-black text-gray-400 uppercase tracking-widest">Core Subjects</th>
                        <th className="px-10 py-6 text-[12px] font-black text-gray-400 uppercase tracking-widest">Responsibilities</th>
                        <th className="px-10 py-6 text-[12px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="px-10 py-6 text-[12px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredFaculty.map((f, i) => (
                        <motion.tr 
                          key={f.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="hover:bg-indigo-50/20 transition-colors group"
                        >
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-5">
                              <div className="relative w-14 h-14">
                                {f.photo_url ? (
                                  <img src={f.photo_url} className="w-14 h-14 rounded-2xl object-cover border border-gray-100" />
                                ) : (
                                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-lg">
                                    {f.name.charAt(0)}
                                  </div>
                                )}
                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${f.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              </div>
                              <div>
                                <p className="text-[17px] font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{f.name}</p>
                                <p className="text-[13px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{f.designation} · {f.employee_id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex flex-wrap gap-2">
                              {f.subject_1 && <span className="text-[11px] font-black px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 uppercase">{f.subject_1}</span>}
                              {f.subject_2 && <span className="text-[11px] font-black px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 uppercase">{f.subject_2}</span>}
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex flex-col gap-1">
                              <p className="text-[13px] font-bold text-gray-700 truncate max-w-[200px]">{f.dept_level_responsibility || 'No Dept Roles'}</p>
                              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{f.college_level_responsibility || 'No College Roles'}</p>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border ${STATUS_STYLES[f.status]}`}>
                              {f.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                              <button onClick={() => router.push(`/faculty/${f.id}`)} className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"><Eye size={20} /></button>
                              <button onClick={() => { setEditItem(f); setShowModal(true) }} className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"><Edit2 size={20} /></button>
                              <button onClick={() => setDeleteId(f.id)} className="p-3 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"><Trash2 size={20} /></button>
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
              <div className="bg-white rounded-[40px] p-24 text-center border-2 border-dashed border-gray-100">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-200">
                    <Users size={48} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">No faculty members found</h3>
                    <p className="text-gray-500 font-bold mt-2">Try adjusting your search or filters to find what you're looking for.</p>
                  </div>
                  <button onClick={() => { setSearch(''); setSelectedShift('All') }} className="px-8 py-3 bg-indigo-50 text-indigo-700 rounded-2xl font-black text-[14px] hover:bg-indigo-100 transition-all">Clear All Search Filters</button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
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

      <AnimatePresence>
        {showCSV && (
          <CSVUploader 
            onUpload={handleBulkUpload} 
            onClose={() => setShowCSV(false)}
            sampleHeaders={['employee_id', 'name', 'email', 'phone', 'department', 'designation', 'qualification', 'subject_1', 'subject_2', 'shift']} 
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[48px] p-12 w-full max-w-lg shadow-2xl border border-rose-100">
              <div className="w-24 h-24 bg-rose-50 rounded-[32px] flex items-center justify-center text-rose-600 mb-10 shadow-inner shadow-rose-100 mx-auto">
                <Trash2 size={40} />
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-black text-gray-900">Remove Faculty Profile?</h3>
                <p className="text-[17px] text-gray-500 mt-4 leading-relaxed font-medium">This will permanently remove <span className="text-gray-900 font-bold">{faculty.find(f => f.id === deleteId)?.name}</span> from the directory. This action is irreversible.</p>
              </div>
              <div className="flex gap-4 mt-12">
                <button onClick={() => setDeleteId(null)} 
                  className="flex-1 py-5 border-2 border-gray-100 rounded-[28px] text-[16px] font-black text-gray-700 hover:bg-gray-50 transition-all">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} 
                  className="flex-1 py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-[28px] text-[16px] font-black transition-all shadow-xl shadow-rose-200">Yes, Remove</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
      className="fixed inset-0 bg-black/50 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-[48px] w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl border border-white">
        
        <div className="flex items-start justify-between px-12 py-10 border-b border-gray-100">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[22px] bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">{editItem ? 'Edit Faculty Member' : 'Add Faculty Member'}</h2>
              <p className="text-[16px] text-gray-500 mt-1 font-bold italic opacity-70">Define academic roles and teaching responsibilities.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all shadow-sm"><X size={24} /></button>
        </div>

        <div className="p-12 overflow-y-auto space-y-12 custom-scrollbar">
          {/* Section 1: Basic & Contact */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Camera size={18} /></div>
                <h3 className="text-[13px] font-black text-indigo-900 uppercase tracking-widest">Faculty Photo</h3>
              </div>
              <div className="aspect-square rounded-[40px] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all relative overflow-hidden">
                {form.photo_url ? (
                  <img src={form.photo_url} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-[22px] bg-white shadow-md flex items-center justify-center text-gray-300 group-hover:text-indigo-400 transition-all">
                      <Plus size={32} />
                    </div>
                    <p className="text-[13px] font-black text-gray-400 group-hover:text-indigo-900 transition-all uppercase tracking-wider">Upload Portrait</p>
                  </>
                )}
              </div>
              <p className="text-[12px] text-gray-400 font-bold text-center leading-relaxed px-4">Standard profile photo for academic directory and ID cards.</p>
            </div>

            <div className="lg:col-span-2 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><Briefcase size={18} /></div>
                  <h3 className="text-[13px] font-black text-emerald-900 uppercase tracking-widest">Identity & Roles</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <Field label="Full Name" value={form.name ?? ''} onChange={v => set('name', v)} placeholder="e.g. Dr. Emily Carter" />
                  <Field label="Employee ID" value={form.employee_id ?? ''} onChange={v => set('employee_id', v)} placeholder="e.g. FAC2024001" />
                  <SelectField label="Department" value={form.department ?? ''} onChange={v => set('department', v)} options={DEPARTMENTS} placeholder="Select Dept" />
                  <SelectField label="Designation" value={form.designation ?? ''} onChange={v => set('designation', v)} options={DESIGNATIONS} placeholder="Select Title" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><Mail size={18} /></div>
                  <h3 className="text-[13px] font-black text-amber-900 uppercase tracking-widest">Contact Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <Field label="Work Email" value={form.email ?? ''} onChange={v => set('email', v)} placeholder="emily@edu.com" type="email" />
                  <Field label="Phone Number" value={form.phone ?? ''} onChange={v => set('phone', v)} placeholder="+91 98765 43210" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Academic & Responsibilities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="p-2 bg-purple-50 rounded-xl text-purple-600"><BookOpen size={18} /></div>
                <h3 className="text-[13px] font-black text-purple-900 uppercase tracking-widest">Academic Load</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <Field label="Subject 1 (Core)" value={form.subject_1 ?? ''} onChange={v => set('subject_1', v)} placeholder="e.g. Algorithms" />
                <Field label="Subject 2 (Elective)" value={form.subject_2 ?? ''} onChange={v => set('subject_2', v)} placeholder="e.g. AI Theory" />
                <SelectField label="Assigned Shift" value={form.shift ?? 'Day'} onChange={v => set('shift', v)} options={SHIFTS} placeholder="Select Shift" />
                <Field label="Qualification" value={form.qualification ?? ''} onChange={v => set('qualification', v)} placeholder="e.g. Ph.D, M.Tech" />
              </div>
              <div className="space-y-4">
                <label className="block text-[13px] font-black text-gray-700 uppercase tracking-widest ml-1">Laboratory Oversight</label>
                <div className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-[32px] flex items-center flex-wrap gap-3 focus-within:border-indigo-400 focus-within:bg-white transition-all shadow-inner">
                  {form.labs?.map((lab, i) => (
                    <span key={i} className="flex items-center gap-3 px-4 py-2 bg-white text-indigo-700 border border-indigo-100 rounded-2xl text-[14px] font-black shadow-sm group">
                      {lab}
                      <button onClick={() => set('labs', form.labs?.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-rose-500 transition-colors"><X size={16} /></button>
                    </span>
                  ))}
                  <input
                    value={labInput}
                    onChange={e => setLabInput(e.target.value)}
                    onKeyDown={handleAddLab}
                    placeholder="Type lab name and press Enter..."
                    className="flex-1 min-w-[240px] bg-transparent outline-none text-[15px] text-gray-800 font-bold placeholder:text-gray-400 placeholder:font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="p-2 bg-rose-50 rounded-xl text-rose-600"><Award size={18} /></div>
                <h3 className="text-[13px] font-black text-rose-900 uppercase tracking-widest">Administrative Roles</h3>
              </div>
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="block text-[13px] font-black text-gray-700 uppercase tracking-widest ml-1">Department Responsibilities</label>
                  <textarea 
                    value={form.dept_level_responsibility ?? ''} 
                    onChange={e => set('dept_level_responsibility', e.target.value)}
                    placeholder="e.g. Academic Coordinator, Lab In-charge..."
                    className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-[32px] text-[15px] text-gray-800 font-bold placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-8 focus:ring-indigo-50/50 transition-all min-h-[120px] shadow-inner"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-[13px] font-black text-gray-700 uppercase tracking-widest ml-1">College Level Roles</label>
                  <textarea 
                    value={form.college_level_responsibility ?? ''} 
                    onChange={e => set('college_level_responsibility', e.target.value)}
                    placeholder="e.g. IQAC Member, Cultural Coordinator..."
                    className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-[32px] text-[15px] text-gray-800 font-bold placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-8 focus:ring-indigo-50/50 transition-all min-h-[120px] shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-6 px-12 py-10 border-t border-gray-100 bg-gray-50/50 rounded-b-[48px]">
          <button onClick={onClose} className="px-10 py-4 bg-white border-2 border-gray-200 rounded-[28px] text-[15px] font-black text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">Cancel</button>
          <button onClick={() => onSave(form)} disabled={loading || !form.name || !form.email || !form.department}
            className="px-12 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-[28px] text-[16px] font-black transition-all shadow-xl shadow-indigo-200 flex items-center gap-3">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            {editItem ? 'Save Profile Changes' : 'Complete Registration'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-3">
      <label className="block text-[13px] font-black text-gray-700 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-6 py-4.5 bg-white border-2 border-gray-100 rounded-[24px] text-[15px] text-gray-900 font-black placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:ring-8 focus:ring-indigo-50 transition-all shadow-sm" 
      />
    </div>
  )
}

function SelectField({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (v: string) => void; options: string[], placeholder?: string }) {
  return (
    <div className="space-y-3">
      <label className="block text-[13px] font-black text-gray-700 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <select 
          value={value} onChange={e => onChange(e.target.value)}
          className={`w-full pl-6 pr-14 py-4.5 bg-white border-2 border-gray-100 rounded-[24px] text-[15px] font-black outline-none appearance-none cursor-pointer focus:border-indigo-400 focus:ring-8 focus:ring-indigo-50 transition-all shadow-sm ${value ? 'text-gray-900' : 'text-gray-400'}`}
        >
          <option value="" disabled hidden>{placeholder || 'Select...'}</option>
          {options.map(o => <option key={o} value={o} className="text-gray-900 font-bold">{o}</option>)}
        </select>
        <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}
