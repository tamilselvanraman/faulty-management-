'use client'

import { 
  Plus, Search, SlidersHorizontal, MapPin, 
  MoreHorizontal, Eye, Edit2, Archive, Trash2,
  Download, FileDown, FileText, Upload,
  ChevronRight, Building2, X, GraduationCap,
  CircleDot
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useState, useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

// --- Types ---
interface ClassData {
  id: string
  hall_number: string
  type_building: string
  department: string
  academic_year: string
  section: string
  strength: number
  capacity: number
  advisor_name: string
  status: 'Active' | 'Full' | 'Pending' | 'Maintenance'
  subject?: string
}

// --- Mock Data ---
const MOCK_CLASSES: ClassData[] = [
  { id: 'CLS-2024-001', hall_number: 'LH-101', type_building: 'Main Building', department: 'CSE', academic_year: 'III', section: 'A', strength: 58, capacity: 60, advisor_name: 'Dr. Janardhan K.', status: 'Active' },
  { id: 'CLS-2024-042', hall_number: 'ME-204', type_building: 'Block B', department: 'MECH', academic_year: 'II', section: 'B', strength: 45, capacity: 65, advisor_name: 'Prof. Sarala P.', status: 'Full' },
  { id: 'CLS-2024-015', hall_number: 'EE-102', type_building: 'Block C', department: 'ECE', academic_year: 'III', section: 'A', strength: 52, capacity: 60, advisor_name: 'Dr. Rajesh N.', status: 'Active' },
  { id: 'CLS-2024-009', hall_number: 'BT-301', type_building: 'Main Building', department: 'BME', academic_year: 'I', section: 'B', strength: 30, capacity: 60, advisor_name: 'Ms. Lavanya V.', status: 'Pending' },
  { id: 'CLS-2024-010', hall_number: 'LH-102', type_building: 'Main Building', department: 'CSE', academic_year: 'II', section: 'C', strength: 60, capacity: 60, advisor_name: 'Dr. Arun Kumar', status: 'Full' },
  { id: 'CLS-2024-022', hall_number: 'AD-405', type_building: 'Block D', department: 'AIDS', academic_year: 'IV', section: 'A', strength: 12, capacity: 60, advisor_name: 'Dr. Meena R.', status: 'Maintenance' },
]

const BUILDINGS = ['All', 'Main Building', 'Block B', 'Block C', 'Block D', 'Block E']
const DEPARTMENTS = ['All', 'CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'MBA', 'AENS', 'BME', 'AIDS', 'MCA', 'SFE', 'S&H']
const YEARS = ['I', 'II', 'III', 'IV']

// --- Components ---
const DropdownItem = ({ icon: Icon, label, onClick, danger = false }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold transition-all rounded-xl ${danger ? 'text-rose-500 hover:bg-rose-50' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'}`}
  >
    <Icon size={16} />
    {label}
  </button>
)

// --- Page Component ---
export default function ClassesPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [buildingFilter, setBuildingFilter] = useState('All')
  const [deptFilter, setDeptFilter] = useState('All')
  const [yearFilter, setYearFilter] = useState('All')
  const [activeRowId, setActiveRowId] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFormatDownload = () => {
    const csvContent = "hall_number,type_building,department,academic_year,section,strength,capacity,advisor_name,status\nLH-101,Main Building,CSE,III,A,58,60,Dr. Janardhan K.,Active"
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('hidden', '')
    a.setAttribute('href', url)
    a.setAttribute('download', 'class_template.csv')
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.success('Template downloaded successfully')
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1500)),
        {
          loading: 'Importing classes...',
          success: 'Successfully imported 12 classes',
          error: 'Import failed',
        }
      )
    }
  }

  const handleAction = (type: string, id: string) => {
    if (type === 'View') {
      router.push(`/classes/${id}`)
    } else {
      toast.success(`${type} action triggered for ${id}`)
    }
    setActiveRowId(null)
  }

  const filtered = useMemo(() => {
    return MOCK_CLASSES.filter(c => {
      const matchesSearch = 
        c.hall_number.toLowerCase().includes(search.toLowerCase()) ||
        c.department.toLowerCase().includes(search.toLowerCase()) ||
        c.advisor_name.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase())
      
      const matchesBuilding = buildingFilter === 'All' || c.type_building === buildingFilter
      const matchesDept = deptFilter === 'All' || c.department === deptFilter
      const matchesYear = yearFilter === 'All' || c.academic_year === yearFilter
      return matchesSearch && matchesBuilding && matchesDept && matchesYear
    })
  }, [search, buildingFilter, deptFilter, yearFilter])

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }
    })
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* 🌟 HEADER SECTION */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <Plus size={24} />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">Class Management</h1>
                  <p className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mt-1">Resource & Allocation Dashboard</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto mt-4 lg:mt-0">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={onFileChange} 
                className="hidden" 
                accept=".csv,.xlsx"
              />
              <button 
                onClick={handleFormatDownload}
                className="flex justify-center items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl sm:rounded-2xl text-[13px] sm:text-[14px] font-black transition-all hover:-translate-y-1 shadow-sm active:scale-95"
              >
                <FileText size={16} className="text-primary sm:w-4 sm:h-4 w-[14px] h-[14px]" />
                Format
              </button>
              <button 
                onClick={handleImport}
                className="flex justify-center items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl sm:rounded-2xl text-[13px] sm:text-[14px] font-black transition-all hover:-translate-y-1 shadow-sm active:scale-95"
              >
                <Upload size={16} className="text-primary sm:w-4 sm:h-4 w-[14px] h-[14px]" />
                Import
              </button>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="col-span-2 flex justify-center items-center gap-1.5 sm:gap-2 px-5 sm:px-6 py-2.5 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-black text-[13px] sm:text-[14px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
              >
                <Plus size={18} className="sm:w-[20px] sm:h-[20px] w-[16px] h-[16px]" />
                Add New Class
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8">
        <motion.div 
          variants={fadeUp} initial="hidden" animate="visible" custom={3}
          className="sticky top-[-40px] z-40 py-6 bg-[#F8FAFC]/95 backdrop-blur-xl border-b border-slate-200/60"
        >
          <div className="bg-white border border-slate-200 rounded-[24px] p-3 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full relative group">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search class, faculty, hall..."
                className="w-full pl-13 pr-6 py-3 bg-slate-50/50 border border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-[14px] font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all"
              />
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="w-full md:w-[160px] relative">
                <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select 
                  value={deptFilter} 
                  onChange={e => setDeptFilter(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-600 outline-none hover:bg-slate-100 transition-all appearance-none cursor-pointer"
                >
                  <option value="All">All Depts</option>
                  {DEPARTMENTS.filter(d => d !== 'All').map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
              </div>

              <div className="w-full md:w-[160px] relative">
                <GraduationCap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select 
                  value={yearFilter} 
                  onChange={e => setYearFilter(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-600 outline-none hover:bg-slate-100 transition-all appearance-none cursor-pointer"
                >
                  <option value="All">All Years</option>
                  {YEARS.map(y => (
                    <option key={y} value={y}>{y} Year</option>
                  ))}
                </select>
                <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
              </div>

              <div className="w-full md:w-[160px] relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select 
                  value={buildingFilter} 
                  onChange={e => setBuildingFilter(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-600 outline-none hover:bg-slate-100 transition-all appearance-none cursor-pointer"
                >
                  <option value="All">All Blocks</option>
                  {BUILDINGS.filter(b => b !== 'All').map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* 📋 TABLE SECTION */}
        <motion.div 
          variants={fadeUp} initial="hidden" animate="visible" custom={4}
          className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden mt-6"
        >
          <div className="max-h-[calc(100vh-320px)] overflow-auto custom-scrollbar relative">
            <table className="w-full min-w-[1100px] border-collapse text-left">
              <thead className="sticky top-0 z-30">
                <tr className="border-b border-slate-200 bg-slate-50/95 backdrop-blur-md">
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Class Name</th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Department</th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Hall / Floor</th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Strength</th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Class Advisor</th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black text-sm border border-primary/10">
                          {c.department}-{c.section}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-slate-900">{c.department} - {c.section}</p>
                          <p className="text-[11px] font-bold text-slate-400 mt-0.5">Year {c.academic_year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-[14px] font-bold text-slate-700">{c.department}</p>
                      <p className="text-[11px] font-bold text-slate-400 mt-0.5">Year {c.academic_year}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[13px] font-bold text-slate-700">{c.hall_number}</span>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                          <MapPin size={12} />
                          {c.type_building}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="w-28">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold text-slate-600">{c.strength} / {c.capacity}</span>
                          <span className="text-[10px] font-bold text-slate-400">{Math.round((c.strength/c.capacity)*100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${(c.strength/c.capacity)*100}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-[10px]">
                          {c.advisor_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-[13px] font-bold text-slate-700">{c.advisor_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right relative">
                      <button 
                        onClick={() => setActiveRowId(activeRowId === c.id ? null : c.id)}
                        className={`p-2 rounded-lg transition-all ${activeRowId === c.id ? 'bg-primary text-white shadow-lg' : 'hover:bg-slate-100 text-slate-400'}`}
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {activeRowId === c.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveRowId(null)} />
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden text-left">
                            <DropdownItem icon={Eye} label="View Details" onClick={() => handleAction('View', c.id)} />
                            <DropdownItem icon={Edit2} label="Edit Class" onClick={() => handleAction('Edit', c.id)} />
                            <DropdownItem icon={Archive} label="Archive" onClick={() => handleAction('Archive', c.id)} />
                            <div className="h-px bg-slate-100 my-1 mx-2" />
                            <DropdownItem icon={Trash2} label="Delete" onClick={() => handleAction('Delete', c.id)} danger />
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* ➕ ADD CLASS MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-[95vw] md:w-[672px] bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Plus size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Add New Class</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configure resource allocation</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsAddModalOpen(false)}
                    className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); toast.success('Class created successfully!'); setIsAddModalOpen(false); }}>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hall Number</label>
                      <input placeholder="e.g. LH-101" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-bold outline-none focus:bg-white focus:border-primary/20 transition-all" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Building</label>
                      <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-bold outline-none focus:bg-white focus:border-primary/20 transition-all appearance-none">
                        {BUILDINGS.filter(b => b !== 'All').map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                      <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-bold outline-none focus:bg-white focus:border-primary/20 transition-all appearance-none">
                        {DEPARTMENTS.filter(d => d !== 'All').map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Section</label>
                      <input placeholder="e.g. A" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-bold outline-none focus:bg-white focus:border-primary/20 transition-all" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Faculty Advisor</label>
                    <input placeholder="Enter faculty name" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-bold outline-none focus:bg-white focus:border-primary/20 transition-all" required />
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button 
                      type="button" onClick={() => setIsAddModalOpen(false)}
                      className="flex-1 px-8 py-4 bg-slate-50 text-slate-500 rounded-[20px] font-black text-[13px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 px-8 py-4 bg-primary text-white rounded-[20px] font-black text-[13px] uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                    >
                      Create Class
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
