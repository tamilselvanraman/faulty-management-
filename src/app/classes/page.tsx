'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Filter, Edit2, Trash2, X, ChevronDown, Presentation, Upload, Download, MoreVertical, Users, Building2, BookOpen, GraduationCap, CheckCircle, AlertCircle, MapPin, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import CSVUploader from '@/components/ui/CSVUploader'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Faculty {
  id: string
  name: string
  department: string
}

interface ClassData {
  id: string
  hall_number: string
  type_building: string
  department: string
  academic_year: string
  section: string
  advisor_id?: string
  advisor_name: string
  advisor_avatar?: string
  strength: number
  capacity: number
  status: string
}

const BUILDINGS = ['All', 'Block A', 'Block B', 'Block C', 'Main Building', 'Science Block']
const DEPARTMENTS = ['All', 'AENS', 'BME', 'AIDS', 'CSE', 'ECE', 'MECH', 'CIVIL', 'MBA']
const YEARS = ['I', 'II', 'III', 'IV']

const MOCK_CLASSES: ClassData[] = [
  { id: 'CLS-2024-001', hall_number: 'LH-101', type_building: 'Main Building', department: 'CSE', academic_year: 'III', section: 'A', advisor_name: 'Dr. Janardhan K.', strength: 42, capacity: 50, status: 'active' },
  { id: 'CLS-2024-042', hall_number: 'ME-204', type_building: 'Block B', department: 'MECH', academic_year: 'II', section: 'B', advisor_name: 'Prof. Sarala P.', strength: 18, capacity: 45, status: 'active' },
  { id: 'CLS-2024-015', hall_number: 'EE-102', type_building: 'Block C', department: 'ECE', academic_year: 'III', section: 'A', advisor_name: 'Dr. Rajesh N.', strength: 35, capacity: 50, status: 'active' },
  { id: 'CLS-2024-009', hall_number: 'BT-301', type_building: 'Main Building', department: 'BME', academic_year: 'I', section: 'B', advisor_name: 'Ms. Lavanya V.', strength: 28, capacity: 30, status: 'active' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] } }),
}

const getBuildingColor = (building: string) => {
  switch (building) {
    case 'Main Building': return 'bg-indigo-50 text-indigo-700'
    case 'Block A': return 'bg-emerald-50 text-emerald-700'
    case 'Block B': return 'bg-amber-50 text-amber-700'
    case 'Block C': return 'bg-purple-50 text-purple-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export default function ClassesPage() {
  const router = useRouter()
  const [classes, setClasses] = useState<ClassData[]>(MOCK_CLASSES)
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [buildingFilter, setBuildingFilter] = useState('All')
  const [deptFilter, setDeptFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [showCSV, setShowCSV] = useState(false)
  const [editItem, setEditItem] = useState<ClassData | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch('/api/classes')
      const { data } = await res.json()
      if (data && data.length > 0) setClasses(data)
    } catch { /* use mock */ }
  }, [])

  const fetchFaculty = useCallback(async () => {
    try {
      const res = await fetch('/api/faculty')
      const { data } = await res.json()
      if (data) setFaculty(data)
    } catch { /* ignored */ }
  }, [])

  useEffect(() => { 
    fetchClasses()
    fetchFaculty()
  }, [fetchClasses, fetchFaculty])

  const handleSave = async (data: Partial<ClassData>) => {
    setLoading(true)
    try {
      const method = editItem ? 'PUT' : 'POST'
      const url = editItem ? `/api/classes/${editItem.id}` : '/api/classes'
      const response = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(data) 
      })
      
      if (!response.ok) throw new Error('API Error')

      if (editItem) {
        setClasses(prev => prev.map(c => c.id === editItem.id ? { ...c, ...data } : c))
        toast.success('Class records updated')
      } else {
        const newClass = { ...data, id: `CLS-${Date.now()}`, status: 'active' } as ClassData
        setClasses(prev => [newClass, ...prev])
        toast.success('New class registered successfully')
      }
      setShowModal(false)
      setEditItem(null)
    } catch {
      toast.error('Connection failed, using demo mode')
      if (editItem) {
        setClasses(prev => prev.map(c => c.id === editItem.id ? { ...c, ...data } : c))
      } else {
        setClasses(prev => [{ ...data, id: `CLS-${Date.now()}`, status: 'active' } as ClassData, ...prev])
      }
      setShowModal(false)
      setEditItem(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try { await fetch(`/api/classes/${id}`, { method: 'DELETE' }) } catch { /* ignore */ }
    setClasses(prev => prev.filter(c => c.id !== id))
    setDeleteId(null)
    toast.success('Class record removed')
  }

  const handleBulkUpload = (data: any[]) => {
    const newClasses = data.map((row, idx) => ({
      id: `bulk-${Date.now()}-${idx}`,
      hall_number: row.hall_number || row.name || 'Unknown',
      type_building: row.type_building || row.building || 'Main Building',
      department: row.department || 'CSE',
      academic_year: row.academic_year || row.year || 'I',
      section: row.section || 'A',
      advisor_name: row.advisor_name || 'Unassigned',
      strength: parseInt(row.strength) || 0,
      capacity: parseInt(row.capacity) || 50,
      status: 'active'
    })) as ClassData[]
    
    setClasses(prev => [...newClasses, ...prev])
    setShowCSV(false)
    toast.success(`Successfully imported ${newClasses.length} class records`)
  }

  const filtered = classes.filter(c => {
    const matchBuilding = buildingFilter === 'All' || c.type_building === buildingFilter
    const matchDept = deptFilter === 'All' || c.department === deptFilter
    const matchSearch = !search || 
      c.hall_number.toLowerCase().includes(search.toLowerCase()) ||
      c.advisor_name.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase())
    return matchBuilding && matchDept && matchSearch
  })

  const stats = [
    { label: 'TOTAL CLASSES', value: classes.length, icon: Presentation, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'AVG OCCUPANCY', value: `${Math.round(classes.reduce((acc, c) => acc + (c.strength / c.capacity), 0) / (classes.length || 1) * 100)}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'ACTIVE ADVISORS', value: new Set(classes.map(c => c.advisor_name)).size, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'NEAR CAPACITY', value: classes.filter(c => (c.strength / c.capacity) > 0.9).length, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ]

  const buildingDistribution = BUILDINGS.filter(b => b !== 'All').map(b => ({
    name: b,
    count: classes.filter(c => c.type_building === b).length
  })).filter(b => b.count > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Class Management</h1>
          <p className="text-[15px] text-gray-500 mt-1">Manage classrooms, hall assignments, and academic year sections.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowCSV(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-gray-700 rounded-lg text-[14px] font-semibold transition-all shadow-sm">
            <Upload size={16} /> Import Bulk
          </button>
          <button onClick={() => { setEditItem(null); setShowModal(true) }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#3b2dd3] hover:bg-[#3427ba] text-white rounded-lg text-[14px] font-semibold transition-all shadow-md">
            <Plus size={18} /> Add New Class
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Analytics Row */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Building Distribution */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-wide">Hall Distribution</h3>
            <MapPin size={16} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            {buildingDistribution.map(bd => (
              <div key={bd.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-[13px] font-medium">
                  <span className="text-gray-600">{bd.name}</span>
                  <span className="text-gray-900 font-bold">{bd.count} Halls</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(bd.count / (classes.length || 1)) * 100}%` }}
                    className={`h-full rounded-full ${getBuildingColor(bd.name).split(' ')[1].replace('text', 'bg')}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High Occupancy Alert / Featured Classes */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-wide">Recent Hall Assignments</h3>
            <div className="flex items-center gap-2 text-[12px] text-gray-500 font-medium">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Active</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> High Cap</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.slice(0, 6).map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-xl border border-[#E5E7EB]/50 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                  {c.hall_number}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{c.department} - {c.academic_year}</p>
                  <p className="text-[11px] text-gray-500 truncate">{c.advisor_name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="bg-white border border-[#E5E7EB] rounded-2xl p-3 flex flex-col sm:flex-row gap-3 shadow-sm">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 border border-transparent focus-within:border-[#E5E7EB] focus-within:bg-white transition-all">
          <Search size={18} className="text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search classes by hall, dept or advisor..."
            className="bg-transparent text-[14px] text-gray-700 placeholder:text-gray-400 outline-none w-full"
          />
          {search && <button onClick={() => setSearch('')}><X size={16} className="text-gray-400" /></button>}
        </div>
        <div className="flex gap-3">
          <div className="relative min-w-[160px]">
            <select value={buildingFilter} onChange={e => setBuildingFilter(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[14px] font-medium text-gray-700 outline-none appearance-none cursor-pointer">
              {BUILDINGS.map(b => <option key={b}>{b === 'All' ? 'All Buildings' : b}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative min-w-[160px]">
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[14px] font-medium text-gray-700 outline-none appearance-none cursor-pointer">
              {DEPARTMENTS.map(d => <option key={d}>{d === 'All' ? 'All Departments' : d}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <button className="px-3.5 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center">
            <Filter size={18} />
          </button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4} className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-gray-50/50">
                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-6 py-4">CLASS / HALL</th>
                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-6 py-4">DEPARTMENT / YEAR</th>
                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-6 py-4">BUILDING</th>
                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-6 py-4">OCCUPANCY</th>
                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-6 py-4">FACULTY ADVISOR</th>
                <th className="text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider px-6 py-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <Link href={`/classes/${c.id}`} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-200/50">
                        {c.hall_number}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-gray-900 group-hover:text-[#3b2dd3] transition-colors">{c.department} - {c.section}</p>
                        <p className="text-[12px] text-gray-500 mt-0.5">ID: {c.id}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-gray-700 font-medium">{c.department}</span>
                      <span className="text-[12px] text-gray-400">· Year {c.academic_year}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${getBuildingColor(c.type_building)}`}>
                      {c.type_building}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-24">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[12px] font-bold ${(c.strength / c.capacity) > 0.9 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {c.strength}/{c.capacity}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${(c.strength / c.capacity) > 0.9 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${(c.strength / c.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-[10px] border border-indigo-100 shadow-sm">
                        {c.advisor_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-[13px] font-semibold text-gray-700">{c.advisor_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditItem(c); setShowModal(true) }}
                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setDeleteId(c.id)}
                        className="p-2 rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-between bg-gray-50/30">
          <p className="text-[13px] text-gray-500">Showing <span className="font-semibold text-gray-900">1-{filtered.length}</span> of <span className="font-semibold text-gray-900">{classes.length}</span> classes</p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-50" disabled>
              <ChevronDown size={16} className="rotate-90" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-[#3b2dd3] text-white flex items-center justify-center text-[13px] font-medium">1</button>
            <button className="w-8 h-8 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-gray-600 hover:bg-gray-50">
              <ChevronDown size={16} className="-rotate-90" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <ClassModal 
            editItem={editItem} 
            loading={loading} 
            faculty={faculty}
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
            sampleHeaders={['hall_number', 'type_building', 'department', 'academic_year', 'section', 'advisor_name', 'strength', 'capacity']} 
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-7 w-full max-w-sm shadow-xl border border-rose-100">
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Remove Class Record?</h3>
              <p className="text-[14px] text-gray-500 mt-2 leading-relaxed">This will permanently remove the class assignment from the system. This action cannot be undone.</p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setDeleteId(null)} 
                  className="flex-1 py-2.5 border border-[#E5E7EB] rounded-xl text-[14px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} 
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[14px] font-bold transition-all shadow-sm shadow-rose-200">Remove</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ClassModal({ editItem, loading, faculty, onSave, onClose }: { editItem: ClassData | null; loading: boolean; faculty: Faculty[]; onSave: (d: Partial<ClassData>) => void; onClose: () => void }) {
  const [form, setForm] = useState<Partial<ClassData>>(editItem ?? { status: 'active', type_building: 'Main Building', department: 'CSE', academic_year: 'I' })
  const set = (k: keyof ClassData, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2 }}
        className="bg-white rounded-[24px] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-[#E5E7EB]">
        
        <div className="flex items-start justify-between px-8 py-6 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-[20px] font-bold text-gray-900">{editItem ? 'Edit Class Details' : 'Register New Class'}</h2>
            <p className="text-[14px] text-gray-500 mt-1">Assign halls, advisors and monitor student strength.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Hall Number / Name" value={form.hall_number ?? ''} onChange={v => set('hall_number', v)} placeholder="e.g. LH-101 or Seminar Hall" />
            <SelectField label="Building / Block" value={form.type_building ?? ''} onChange={v => set('type_building', v)} options={BUILDINGS.filter(b => b !== 'All')} placeholder="Select Building" />
            
            <SelectField label="Department" value={form.department ?? ''} onChange={v => set('department', v)} options={DEPARTMENTS.filter(d => d !== 'All')} placeholder="Select Department" />
            <SelectField label="Academic Year" value={form.academic_year ?? 'I'} onChange={v => set('academic_year', v)} options={YEARS} placeholder="Select Year" />
            
            <Field label="Section" value={form.section ?? ''} onChange={v => set('section', v)} placeholder="e.g. A or B" />
            
            <div className="space-y-2">
              <label className="block text-[13px] font-semibold text-gray-700">Class Advisor</label>
              <div className="relative">
                <select 
                  value={form.advisor_id ?? ''} 
                  onChange={e => {
                    const selected = faculty.find(f => f.id === e.target.value)
                    if (selected) {
                      set('advisor_id', selected.id)
                      set('advisor_name', selected.name)
                    }
                  }}
                  className="w-full pl-4 pr-10 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[14px] outline-none appearance-none cursor-pointer focus:border-[#3b2dd3] focus:ring-2 focus:ring-indigo-50 transition-all"
                >
                  <option value="" disabled>Select Faculty Advisor</option>
                  {faculty.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.department})</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <Field label="Current Strength" value={form.strength?.toString() ?? ''} onChange={v => set('strength', parseInt(v) || 0)} placeholder="40" type="number" />
            <Field label="Max Capacity" value={form.capacity?.toString() ?? ''} onChange={v => set('capacity', parseInt(v) || 50)} placeholder="60" type="number" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-8 py-6 border-t border-[#E5E7EB] bg-gray-50/50 rounded-b-[24px]">
          <button onClick={onClose} className="px-6 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[14px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">Cancel</button>
          <button onClick={() => onSave(form)} disabled={loading || !form.hall_number || !form.department}
            className="px-6 py-2.5 bg-[#3b2dd3] hover:bg-[#3427ba] disabled:opacity-50 text-white rounded-xl text-[14px] font-bold transition-colors shadow-md">
            {loading ? 'Processing...' : editItem ? 'Update Class' : 'Register Class'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-gray-700 mb-2">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#3b2dd3] focus:ring-2 focus:ring-indigo-50 transition-all" />
    </div>
  )
}

function SelectField({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (v: string) => void; options: string[], placeholder?: string }) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)}
          className={`w-full pl-4 pr-10 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[14px] outline-none appearance-none cursor-pointer focus:border-[#3b2dd3] focus:ring-2 focus:ring-indigo-50 transition-all ${value ? 'text-gray-900' : 'text-gray-400'}`}>
          <option value="" disabled hidden>{placeholder || 'Select...'}</option>
          {options.map(o => <option key={o} value={o} className="text-gray-900">{o}</option>)}
        </select>
        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}
