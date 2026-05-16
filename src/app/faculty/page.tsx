'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Filter, Edit2, Trash2, X, Users, Mail, Phone, 
  BookOpen, ChevronDown, Upload, Award, CheckCircle, Building, 
  MoreVertical, TrendingUp, Briefcase, ChevronRight, GraduationCap,
  Clock, MapPin, ArrowLeft, Download, Eye, Camera, ShieldCheck,
  Star, LayoutGrid, List as ListIcon, Building2, SlidersHorizontal,
  FileText, UserPlus, ArrowUpRight, ArrowDownRight, MoreHorizontal,
  Calendar, Globe, Shield, Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import CSVUploader from '@/components/ui/CSVUploader'
import { useRouter } from 'next/navigation'
import { downloadCSV } from '@/utils/csvHelper'
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
  subjects?: string[]
  labs?: string[]
  dept_responsibility?: string
  college_responsibility?: string
  qualification?: string
  experience_years?: number
  status: 'active' | 'inactive' | 'on_leave'
  joining_date?: string
  photo_url?: string
}

const DEPARTMENTS = ['All Departments', 'CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'MBA', 'AENS', 'BME', 'AIDS']
const DESIGNATIONS = ['All Designations', 'HOD', 'Professor', 'Assistant Professor', 'Lab Assistant']
const SHIFTS = ['Day', 'Eve', 'Noon']

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { 
      delay: i * 0.05, 
      duration: 0.5, 
      ease: [0.22, 1, 0.36, 1] as any
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

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 group/row">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/row:text-indigo-600 group-hover/row:bg-indigo-50 transition-all shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-[14px] font-bold text-slate-700 leading-none">{value}</p>
      </div>
    </div>
  )
}

const MOCK_FACULTY: Faculty[] = [
  { id: '1', employee_id: 'FAC001', name: 'Dr. Elena Rodriguez', email: 'e.rodriguez@edu.com', phone: '+91 98765 43210', department: 'CSE', designation: 'HOD', qualification: 'Ph.D in CS', status: 'active', joining_date: '2018-10-12', subjects: ['Theory of Computation', 'Compiler Design'], shift: 'Day', labs: ['Compiler Lab'], dept_responsibility: 'Academic Coordinator', college_responsibility: 'IQAC Member' },
  { id: '2', employee_id: 'FAC002', name: 'Prof. Marcus Sterling', email: 'm.sterling@edu.com', phone: '+91 98765 43211', department: 'MECH', designation: 'Professor', qualification: 'M.Tech', status: 'active', joining_date: '2020-01-15', subjects: ['Thermodynamics'], shift: 'Day', labs: ['Thermal Lab'] },
  { id: '3', employee_id: 'FAC003', name: 'Dr. Anika Sharma', email: 'a.sharma@edu.com', phone: '+91 98765 43212', department: 'MBA', designation: 'Assistant Professor', qualification: 'Ph.D', status: 'active', joining_date: '2021-03-01', subjects: ['Strategic Management'], shift: 'Eve', college_responsibility: 'Placement Officer' },
  { id: '4', employee_id: 'FAC004', name: 'Prof. Julian Vane', email: 'j.vane@edu.com', phone: '+91 98765 43213', department: 'ECE', designation: 'Associate Professor', qualification: 'M.E', status: 'active', joining_date: '2017-02-12', subjects: ['Digital Electronics'], shift: 'Noon' },
  { id: '5', employee_id: 'FAC005', name: 'Dr. Sarah Jenkins', email: 's.jenkins@edu.com', phone: '+91 98765 43214', department: 'BME', designation: 'Assistant Professor', qualification: 'Ph.D', status: 'active', joining_date: '2019-06-20', subjects: ['Biomechanics'], shift: 'Day' },
  { id: '6', employee_id: 'FAC006', name: 'Prof. Arjun Reddy', email: 'a.reddy@edu.com', phone: '+91 98765 43215', department: 'AENS', designation: 'Professor', qualification: 'Ph.D', status: 'active', joining_date: '2015-11-05', subjects: ['Calculus'], shift: 'Day' },
]

export default function FacultyPage() {
  const router = useRouter()
  const [faculty, setFaculty] = useState<Faculty[]>(MOCK_FACULTY)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  
  const [selectedDept, setSelectedDept] = useState<string>('All Departments')
  const [selectedDesignation, setSelectedDesignation] = useState<string>('All Designations')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  
  const [showModal, setShowModal] = useState(false)
  const [showCSV, setShowCSV] = useState(false)
  const [editItem, setEditItem] = useState<Faculty | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredFaculty = useMemo(() => {
    return faculty.filter(f => {
      const matchDept = selectedDept === 'All Departments' || f.department === selectedDept
      const matchDesignation = selectedDesignation === 'All Designations' || f.designation === selectedDesignation
      const matchSearch = !search || 
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.employee_id.toLowerCase().includes(search.toLowerCase()) ||
        f.email.toLowerCase().includes(search.toLowerCase()) ||
        f.subjects?.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
        f.designation.toLowerCase().includes(search.toLowerCase())
      return matchDept && matchDesignation && matchSearch
    })
  }, [faculty, selectedDept, selectedDesignation, search])

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
        const newItem = { ...data, id: Date.now().toString(), status: data.status || 'active' } as Faculty
        setFaculty(prev => [newItem, ...prev])
        toast.success('New faculty member added')
      }
      setShowModal(false)
      setEditItem(null)
    } catch {
      toast.error('Connection failed, using demo mode')
      if (editItem) {
        setFaculty(prev => prev.map(f => f.id === editItem.id ? { ...f, ...data } : f))
      } else {
        const newItem = { ...data, id: Date.now().toString(), status: data.status || 'active' } as Faculty
        setFaculty(prev => [newItem, ...prev])
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
      employee_id: row.employee_id || row.EmployeeID || `FAC${idx + 100}`,
      name: row.name || row.Name || 'Unknown',
      email: row.email || row.Email || '',
      phone: row.phone || row.Phone || '',
      department: row.department || row.Department || 'CSE',
      designation: row.designation || row.Designation || 'Lecturer',
      qualification: row.qualification || '',
      status: 'active',
      joining_date: row.joining_date || row['Joining Date'] || new Date().toISOString().split('T')[0],
      subjects: (row.subjects || row.Subjects || '').split('|').filter(Boolean),
      labs: (row.labs || row.Labs || '').split('|').filter(Boolean),
      dept_responsibility: row.dept_responsibility || row.Responsibilities || '',
      shift: row.shift || 'Day',
    })) as Faculty[]
    
    setFaculty(prev => [...newFaculty, ...prev])
    setShowCSV(false)
    toast.success(`Successfully imported ${newFaculty.length} faculty members`)
  }

  return (
    <div className="min-h-screen pb-20 space-y-8">
      {/* 📌 PAGE HEADER */}
      <motion.div 
        variants={fadeUp} initial="hidden" animate="visible" 
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/40 backdrop-blur-md p-8 rounded-[40px] border border-white/40 shadow-xl"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-[14px] bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Faculty Directory</h1>
            <p className="text-slate-400 font-bold text-[11px] mt-0.5 uppercase tracking-wider">Institutional Academic Staff</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => downloadCSV('faculty_import_template.csv', ['Name', 'Department', 'Designation', 'EmployeeID', 'Phone', 'Email', 'Subjects', 'Labs', 'Responsibilities'], [{ Name: 'Dr Kumar', Department: 'CSE', Designation: 'HOD', EmployeeID: 'CSE101', Phone: '9876543210', Email: 'kumar@college.edu', Subjects: 'DBMS|CN', Labs: 'DBMS Lab', Responsibilities: 'Placement Coordinator' }])}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl text-[14px] font-black transition-all hover:-translate-y-1 shadow-sm">
            <Download size={18} className="text-indigo-600" /> Format
          </button>
          <button onClick={() => setShowCSV(true)}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl text-[14px] font-black transition-all hover:-translate-y-1 shadow-sm">
            <Upload size={18} className="text-indigo-600" /> Import
          </button>
          <button onClick={() => { setEditItem(null); setShowModal(true) }}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[14px] font-black transition-all hover:-translate-y-1 shadow-lg shadow-indigo-200">
            <Plus size={20} /> Add Faculty
          </button>
        </div>
      </motion.div>

      {/* 🔍 TOP SECTION FEATURES */}
      <motion.div 
        variants={fadeUp} initial="hidden" animate="visible" custom={1}
        className="bg-white/80 backdrop-blur-2xl border border-slate-200 rounded-[32px] p-4 shadow-2xl shadow-indigo-900/5"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative group">
            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, employee ID, or email..."
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl text-[15px] font-bold text-slate-700 placeholder:text-slate-300 outline-none transition-all"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative group min-w-[180px]">
              <select 
                value={selectedDept} onChange={e => setSelectedDept(e.target.value)}
                className="w-full pl-5 pr-10 py-4 bg-slate-50 border border-transparent rounded-2xl text-[14px] font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:bg-white focus:border-indigo-500/20 transition-all"
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative group min-w-[180px]">
              <select 
                value={selectedDesignation} onChange={e => setSelectedDesignation(e.target.value)}
                className="w-full pl-5 pr-10 py-4 bg-slate-50 border border-transparent rounded-2xl text-[14px] font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:bg-white focus:border-indigo-500/20 transition-all"
              >
                {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

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
          </div>
        </div>
      </motion.div>

      {/* 📋 FACULTY TABLE / GRID VIEW */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div 
            key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
          >
            {filteredFaculty.map((f, i) => (
              <FacultyCard 
                key={f.id} faculty={f} index={i} 
                onEdit={() => { setEditItem(f); setShowModal(true) }}
                onDelete={() => setDeleteId(f.id)}
                onView={() => router.push(`/faculty/${f.id}`)}
                onSelectDept={setSelectedDept}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-white rounded-[32px] border border-slate-200 shadow-2xl shadow-indigo-900/5 flex flex-col"
          >
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-350px)] scrollbar-hide rounded-[32px]">
              <table className="w-full text-left border-separate border-spacing-0 min-w-[1200px]">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-slate-50/90 backdrop-blur-md">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Photo</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Name</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Employee ID</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Department</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Designation</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Phone Number</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Email</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Subjects</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Labs</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Responsibilities</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredFaculty.map((f, i) => (
                    <tr key={f.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-8 py-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                          {f.photo_url ? (
                            <img src={f.photo_url} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                              {f.name.charAt(0)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/faculty/${f.id}`}>
                          <p className="font-black text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer">{f.name}</p>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">{f.employee_id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setSelectedDept(f.department)}
                          className="px-3 py-1 bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white rounded-lg text-[11px] font-black uppercase tracking-wider transition-all"
                        >
                          {f.department}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[14px] font-bold text-slate-700">{f.designation}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[13px] font-medium text-slate-600 flex items-center gap-2"><Phone size={12} /> {f.phone || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[13px] font-medium text-slate-600 flex items-center gap-2"><Mail size={12} /> {f.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                          {f.subjects?.map(s => <span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold uppercase tracking-tighter">{s}</span>)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                          {f.labs?.map(l => <span key={l} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold uppercase tracking-tighter">{l}</span>)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[13px] font-medium text-slate-500 truncate max-w-[150px]">{f.dept_responsibility || f.college_responsibility || 'N/A'}</p>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={(e) => { e.stopPropagation(); setEditItem(f); setShowModal(true) }} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-100 rounded-xl transition-all"><Edit2 size={16} /></button>
                          <button onClick={(e) => { e.stopPropagation(); setDeleteId(f.id) }} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 rounded-xl transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ➕ ADD/EDIT MODAL */}
      <PortalModal>
        <AnimatePresence>
          {showModal && (
            <FacultyForm 
              editItem={editItem} 
              loading={loading} 
              onSave={handleSave} 
              onClose={() => { setShowModal(false); setEditItem(null) }} 
            />
          )}
        </AnimatePresence>
      </PortalModal>

      {/* 📂 CSV IMPORT */}
      <PortalModal>
        <AnimatePresence>
          {showCSV && (
            <CSVUploader 
              onUpload={handleBulkUpload} 
              onClose={() => setShowCSV(false)}
              sampleHeaders={['Name', 'Department', 'Designation', 'EmployeeID', 'Phone', 'Email', 'Subjects', 'Labs', 'Responsibilities']} 
            />
          )}
        </AnimatePresence>
      </PortalModal>

      {/* 🗑️ DELETE CONFIRMATION */}
      <PortalModal>
        <AnimatePresence>
          {deleteId && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl border border-slate-100">
                <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-600 mb-8 shadow-inner">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Remove Faculty Profile?</h3>
                <p className="text-slate-500 font-medium mt-3">This action will permanently delete the faculty record from the system.</p>
                <div className="flex gap-4 mt-10">
                  <button onClick={() => setDeleteId(null)} className="flex-1 py-4 border border-slate-200 rounded-2xl text-[14px] font-black text-slate-700 hover:bg-slate-50 transition-all">Cancel</button>
                  <button onClick={() => handleDelete(deleteId!)} className="flex-1 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-[14px] font-black transition-all shadow-xl shadow-rose-200">Yes, Remove</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </PortalModal>
    </div>
  )
}

function FacultyCard({ faculty, index, onEdit, onDelete, onView, onSelectDept }: { faculty: Faculty; index: number; onEdit: () => void; onDelete: () => void; onView: () => void; onSelectDept: (dept: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.03 }}
      className="bg-white rounded-[32px] border border-slate-200 p-6 shadow-sm hover:shadow-2xl hover:shadow-indigo-900/10 transition-all group relative overflow-hidden cursor-pointer border-b-4 border-b-transparent hover:border-b-indigo-500"
      onClick={onView}
    >
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-50 p-2 rounded-full text-indigo-600">
        <ArrowUpRight size={16} />
      </div>

      <div className="flex items-start justify-between mb-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-[28px] bg-slate-50 p-1 shadow-inner border border-slate-100 overflow-hidden group-hover:scale-110 transition-transform duration-500">
            {faculty.photo_url ? (
              <img src={faculty.photo_url} className="w-full h-full rounded-[24px] object-cover" />
            ) : (
              <div className="w-full h-full rounded-[24px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl">
                {faculty.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-1.5">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100 rounded-xl transition-all"><Edit2 size={16} /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-white border border-transparent hover:border-rose-100 rounded-xl transition-all"><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{faculty.name}</h3>
        </div>
        <p className="text-[12px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
          {faculty.designation} <span className="opacity-30">·</span> 
          <span 
            onClick={(e) => { e.stopPropagation(); onSelectDept(faculty.department); }}
            className="hover:text-indigo-600 transition-colors cursor-pointer underline decoration-dotted underline-offset-4"
          >
            {faculty.department}
          </span>
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-50 space-y-4">
        <div className="flex items-center gap-3 text-[14px] font-bold text-slate-600">
          <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><Briefcase size={16} /></div>
          {faculty.employee_id}
        </div>
        <div className="flex items-center gap-3 text-[14px] font-bold text-slate-600">
          <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><Mail size={16} /></div>
          <span className="truncate">{faculty.email}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {faculty.subjects?.slice(0, 2).map(s => <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black uppercase border border-indigo-100 tracking-wider">{s}</span>)}
        {faculty.dept_responsibility && <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase border border-emerald-100 tracking-wider">Lead</span>}
      </div>
    </motion.div>
  )
}


function FacultyForm({ editItem, loading, onSave, onClose }: { editItem: Faculty | null; loading: boolean; onSave: (d: Partial<Faculty>) => void; onClose: () => void }) {
  const [form, setForm] = useState<Partial<Faculty>>(editItem ?? { status: 'active', department: 'CSE', designation: 'Assistant Professor', shift: 'Day', subjects: [], labs: [] })
  const [subjectInput, setSubjectInput] = useState('')
  const [labInput, setLabInput] = useState('')
  
  const set = (k: keyof Faculty, v: any) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[48px] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        <div className="flex items-center justify-between px-10 py-8 border-b border-slate-100">
          <div>
            <h2 className="text-3xl font-black text-slate-900">{editItem ? 'Edit Faculty' : 'Add New Faculty'}</h2>
            <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-widest italic">Institutional Registry Management</p>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl hover:bg-slate-50 text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-10 overflow-y-auto space-y-12 scrollbar-hide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Personal Details */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><UserPlus size={18} /></div>
                <h3 className="text-[11px] font-black text-indigo-900 uppercase tracking-widest">Personal Details</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Full Name" value={form.name ?? ''} onChange={v => set('name', v)} placeholder="Dr. John Doe" />
                <Field label="Employee ID" value={form.employee_id ?? ''} onChange={v => set('employee_id', v)} placeholder="EMP123" />
                <SelectField label="Department" value={form.department ?? ''} onChange={v => set('department', v)} options={DEPARTMENTS.filter(d => d !== 'All Departments')} />
                <SelectField label="Designation" value={form.designation ?? ''} onChange={v => set('designation', v)} options={DESIGNATIONS.filter(d => d !== 'All Designations')} />
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><Mail size={18} /></div>
                <h3 className="text-[11px] font-black text-emerald-900 uppercase tracking-widest">Contact Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Official Email" value={form.email ?? ''} onChange={v => set('email', v)} placeholder="john@college.edu" />
                <Field label="Phone Number" value={form.phone ?? ''} onChange={v => set('phone', v)} placeholder="9876543210" />
                <Field label="Joining Date" value={form.joining_date ?? ''} onChange={v => set('joining_date', v)} type="date" />
                <SelectField label="Current Status" value={form.status ?? 'active'} onChange={v => set('status', v)} options={['active', 'inactive', 'on_leave']} />
              </div>
            </div>

            {/* Academic Portfolio */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="p-2 bg-purple-50 rounded-xl text-purple-600"><BookOpen size={18} /></div>
                <h3 className="text-[11px] font-black text-purple-900 uppercase tracking-widest">Academic Portfolio</h3>
              </div>
              <div className="space-y-6">
                <MultiField label="Subjects Handled" value={subjectInput} onChange={setSubjectInput} 
                  items={form.subjects || []} onAdd={() => { if(subjectInput) { set('subjects', [...(form.subjects || []), subjectInput]); setSubjectInput(''); } }} 
                  onRemove={idx => set('subjects', form.subjects?.filter((_, i) => i !== idx))} 
                />
                <MultiField label="Labs Handled" value={labInput} onChange={setLabInput} 
                  items={form.labs || []} onAdd={() => { if(labInput) { set('labs', [...(form.labs || []), labInput]); setLabInput(''); } }} 
                  onRemove={idx => set('labs', form.labs?.filter((_, i) => i !== idx))} 
                />
              </div>
            </div>

            {/* Responsibilities */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="p-2 bg-rose-50 rounded-xl text-rose-600"><Shield size={18} /></div>
                <h3 className="text-[11px] font-black text-rose-900 uppercase tracking-widest">Responsibilities</h3>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Departmental Level</label>
                  <textarea value={form.dept_responsibility ?? ''} onChange={e => set('dept_responsibility', e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-[14px] font-bold text-slate-700 focus:bg-white focus:border-indigo-500/20 outline-none transition-all min-h-[100px]"
                    placeholder="e.g. Timetable Coordinator"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">College Level</label>
                  <textarea value={form.college_responsibility ?? ''} onChange={e => set('college_responsibility', e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-[14px] font-bold text-slate-700 focus:bg-white focus:border-indigo-500/20 outline-none transition-all min-h-[100px]"
                    placeholder="e.g. Placement Committee Member"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 px-10 py-8 border-t border-slate-100 bg-slate-50/50">
          <button onClick={onClose} className="px-8 py-4 bg-white border border-slate-200 rounded-2xl text-[14px] font-black text-slate-700 hover:bg-slate-50 transition-all">Cancel</button>
          <button onClick={() => onSave(form)} disabled={loading}
            className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[14px] font-black hover:bg-indigo-700 transition-all">
            {loading ? 'Saving...' : editItem ? 'Update Faculty' : 'Save Faculty'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-[14px] font-bold text-slate-700 focus:bg-white focus:border-indigo-500/20 outline-none transition-all" />
    </div>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full pl-6 pr-10 py-4 bg-slate-50 border border-transparent rounded-2xl text-[14px] font-bold text-slate-700 appearance-none cursor-pointer focus:bg-white focus:border-indigo-500/20 outline-none transition-all"
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-600 transition-colors" />
      </div>
    </div>
  )
}

function MultiField({ label, value, onChange, items, onAdd, onRemove }: { label: string; value: string; onChange: (v: string) => void; items: string[]; onAdd: () => void; onRemove: (i: number) => void }) {
  return (
    <div className="space-y-3">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="flex gap-2">
        <input value={value} onChange={e => onChange(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), onAdd())}
          className="flex-1 px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-[14px] font-bold text-slate-700 focus:bg-white focus:border-indigo-500/20 outline-none transition-all" placeholder={`Add ${label.toLowerCase()}...`} />
        <button onClick={onAdd} className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all"><Plus size={20} /></button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-[12px] font-bold group">
            {item}
            <button onClick={() => onRemove(i)} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={14} /></button>
          </span>
        ))}
      </div>
    </div>
  )
}
