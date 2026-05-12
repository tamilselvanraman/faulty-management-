'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Filter, Edit2, Trash2, X, Users, Mail, Phone, 
  ChevronRight, Building, MoreVertical, TrendingUp, Briefcase, 
  Clock, MapPin, ArrowLeft, Download, Eye, ShieldCheck,
  Star, LayoutGrid, List as ListIcon, Calendar, CheckCircle,
  FileText, Upload, ChevronDown, UserCheck, Award, Layers,
  Activity, ArrowUpRight, Zap, Info, Settings, HelpCircle, Bell
} from 'lucide-react'
import toast from 'react-hot-toast'
import CSVUploader from '@/components/ui/CSVUploader'
import { useRouter } from 'next/navigation'

// --- Material Icon Helper ---
const MaterialIcon = ({ icon, className = "", fill = false }: { icon: string, className?: string, fill?: boolean }) => (
  <span 
    className={`material-symbols-outlined ${className}`} 
    style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
  >
    {icon}
  </span>
)

// --- Types ---
interface CommitteeMember {
  id: string
  name: string
  role: string
  faculty_id?: string
  department?: string
  avatar?: string
}

interface Committee {
  id: string
  name: string
  type: string // Statutory / Non-Statutory
  category: string // Academic / Cultural / etc.
  description?: string
  meeting_schedule?: string
  notes?: string
  status: 'active' | 'inactive'
  formed_date?: string
  member_count: number
  chair_name?: string
  members?: CommitteeMember[]
  last_meeting?: string
  completion_rate?: number
}

// --- Constants & Styles ---
const CATEGORIES = ['All', 'Academic', 'Administrative', 'Cultural', 'Sports', 'Technical', 'Welfare', 'Examination']
const COMMITTEE_TYPES = ['Statutory', 'Non-Statutory']

const CATEGORY_STYLES: Record<string, { color: string; bg: string; text: string; border: string; icon: string; shadow: string }> = {
  Academic: { color: '#3525cd', bg: 'bg-indigo-50/50', text: 'text-indigo-600', border: 'border-indigo-100', icon: 'account_balance', shadow: 'shadow-indigo-500/10' },
  Administrative: { color: '#575e70', bg: 'bg-slate-50/50', text: 'text-slate-600', border: 'border-slate-100', icon: 'gavel', shadow: 'shadow-slate-500/10' },
  Cultural: { color: '#7e3000', bg: 'bg-amber-50/50', text: 'text-amber-600', border: 'border-amber-100', icon: 'diversity_3', shadow: 'shadow-amber-500/10' },
  Sports: { color: '#10b981', bg: 'bg-emerald-50/50', text: 'text-emerald-600', border: 'border-emerald-100', icon: 'workspace_premium', shadow: 'shadow-emerald-500/10' },
  Technical: { color: '#0ea5e9', bg: 'bg-sky-50/50', text: 'text-sky-600', border: 'border-sky-100', icon: 'bolt', shadow: 'shadow-sky-500/10' },
  Welfare: { color: '#a44100', bg: 'bg-orange-50/50', text: 'text-orange-600', border: 'border-orange-100', icon: 'volunteer_activism', shadow: 'shadow-orange-500/10' },
  Examination: { color: '#ba1a1a', bg: 'bg-red-50/50', text: 'text-red-600', border: 'border-red-100', icon: 'verified_user', shadow: 'shadow-red-500/10' },
}

const MOCK_COMMITTEES: Committee[] = [
  { 
    id: '1', 
    name: 'Internal Quality Assurance Cell (IQAC)', 
    type: 'Statutory', 
    category: 'Academic', 
    description: 'Ensures and monitors quality in academic and administrative processes.', 
    chair_name: 'Dr. Priya Sharma', 
    member_count: 12, 
    status: 'active', 
    formed_date: '2018-06-01', 
    meeting_schedule: 'Monthly - First Monday', 
    last_meeting: '2023-10-05',
    completion_rate: 85,
    members: [
      { id: 'm1', name: 'Dr. Priya Sharma', role: 'Chair' }, 
      { id: 'm2', name: 'Prof. Rajesh Kumar', role: 'Member' },
      { id: 'm3', name: 'Dr. Anita Desai', role: 'Member' }
    ] 
  },
  { id: '2', name: 'Anti-Ragging Committee', type: 'Statutory', category: 'Welfare', description: 'Maintains a ragging-free campus environment as per UGC norms.', chair_name: 'Dr. Kavitha Rajan', member_count: 8, status: 'active', formed_date: '2010-01-01', meeting_schedule: 'Quarterly', completion_rate: 100 },
  { id: '3', name: 'Cultural Committee', type: 'Non-Statutory', category: 'Cultural', description: 'Organizes cultural events, fests, and student activity programs.', chair_name: 'Ms. Deepa Krishnan', member_count: 15, status: 'active', formed_date: '2015-03-01', meeting_schedule: 'Bi-weekly during events', completion_rate: 92 },
  { id: '4', name: 'Examination Cell', type: 'Statutory', category: 'Examination', description: 'Manages scheduling, conduct, and results of all college examinations.', chair_name: 'Mr. Suresh Nair', member_count: 6, status: 'active', formed_date: '2005-01-01', completion_rate: 78 },
  { id: '5', name: 'Sports Committee', type: 'Non-Statutory', category: 'Sports', description: 'Plans and executes sports events, tournaments, and inter-college competitions.', member_count: 10, status: 'active', formed_date: '2012-06-01', completion_rate: 65 },
  { id: '6', name: 'Technical Society', type: 'Non-Statutory', category: 'Technical', description: 'Promotes technical activities, hackathons, and industry collaborations.', chair_name: 'Prof. Rajesh Kumar', member_count: 20, status: 'active', formed_date: '2019-08-01', completion_rate: 88 },
]

// --- Animation Variants ---
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] } 
  }),
}

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.08 } }
}

export default function CommitteesPage() {
  const router = useRouter()
  const [committees, setCommittees] = useState<Committee[]>(MOCK_COMMITTEES)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  
  const [showModal, setShowModal] = useState(false)
  const [showCSV, setShowCSV] = useState(false)
  const [editItem, setEditItem] = useState<Committee | null>(null)
  const [viewItem, setViewItem] = useState<Committee | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchCommittees = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/committees')
      if (!res.ok) throw new Error('API not ready')
      const { data } = await res.json()
      if (data) setCommittees(data)
    } catch { /* Fallback to mock */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchCommittees() }, [fetchCommittees])

  const filtered = useMemo(() => {
    return committees.filter(c => {
      const matchCategory = selectedCategory === 'All' || c.category === selectedCategory
      const matchSearch = !search || 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase()) ||
        c.chair_name?.toLowerCase().includes(search.toLowerCase())
      return matchCategory && matchSearch
    })
  }, [committees, selectedCategory, search])

  const handleSave = async (data: Partial<Committee>) => {
    setLoading(true)
    try {
      const isEdit = !!editItem
      const method = isEdit ? 'PUT' : 'POST'
      const url = isEdit ? `/api/committees/${editItem.id}` : '/api/committees'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) throw new Error('API failed')
      const { data: savedData } = await res.json()

      if (isEdit) {
        setCommittees(prev => prev.map(c => c.id === editItem.id ? { ...c, ...savedData } : c))
        toast.success('Committee updated')
      } else {
        setCommittees(prev => [savedData, ...prev])
        toast.success('New committee established')
      }
    } catch {
      // Fallback
      if (editItem) {
        setCommittees(prev => prev.map(c => c.id === editItem.id ? { ...c, ...data } : c))
        toast.success('Updated locally (Demo Mode)')
      } else {
        const newItem = { 
          ...data, 
          id: Date.now().toString(), 
          status: 'active', 
          member_count: 0,
          completion_rate: 0
        } as Committee
        setCommittees(prev => [newItem, ...prev])
        toast.success('Created locally (Demo Mode)')
      }
    } finally {
      setLoading(false)
      setShowModal(false)
      setEditItem(null)
    }
  }

  const handleDelete = async (id: string) => {
    try { await fetch(`/api/committees/${id}`, { method: 'DELETE' }) } catch { /* ignore */ }
    setCommittees(prev => prev.filter(c => c.id !== id))
    setDeleteId(null)
    toast.success('Committee disbanded')
  }

  const handleBulkUpload = (data: any[]) => {
    const newItems = data.map((row, idx) => ({
      id: `bulk-${Date.now()}-${idx}`,
      name: row.name || 'Untitled Committee',
      type: row.type || 'Non-Statutory',
      category: row.category || 'Administrative',
      description: row.description || '',
      chair_name: row.chair_name || '',
      member_count: parseInt(row.member_count) || 0,
      status: 'active',
      formed_date: row.formed_date || new Date().toISOString().split('T')[0],
      completion_rate: 0
    })) as Committee[]
    
    setCommittees(prev => [...newItems, ...prev])
    setShowCSV(false)
    toast.success(`Imported ${newItems.length} committees`)
  }

  const stats = [
    { label: 'TOTAL COMMITTEES', value: committees.length, icon: 'groups', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'ACTIVE MEMBERS', value: committees.reduce((a, c) => a + c.member_count, 0), icon: 'person', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'PENDING ACTIONS', value: 12, icon: 'pending_actions', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'MEETINGS THIS MONTH', value: 8, icon: 'calendar_month', color: 'text-primary', bg: 'bg-indigo-50' },
  ]

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto relative z-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-[#1b1b24] tracking-tight">Committees Management</h1>
          <p className="text-[#575e70] text-lg">Oversee academic and administrative committees and their governance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowCSV(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Upload size={18} />
            <span>Bulk Import</span>
          </button>
          <button 
            onClick={() => { setEditItem(null); setShowModal(true) }}
            className="flex items-center gap-2 bg-[#4f46e5] text-white font-semibold px-6 py-2.5 rounded-xl shadow-md hover:bg-indigo-700 active:opacity-80 transition-all"
          >
            <MaterialIcon icon="add_circle" className="text-xl" />
            <span>Create New Committee</span>
          </button>
        </div>
      </div>

      {/* Dashboard Stats Summary (Bento Minimal) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={stat.label} className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
            <p className="text-[10px] font-black text-[#575e70] mb-1 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-bold text-[#1b1b24]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
        <div className="flex-1 relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search committees..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-[#4f46e5] text-white shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
          <div className="h-6 w-[1px] bg-slate-200 mx-1" />
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
              <LayoutGrid size={16} />
            </button>
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-slate-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
              <ListIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Committee Grid */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={selectedCategory + search + viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative z-10"
        >
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((committee, i) => (
                <CommitteeCard 
                  key={committee.id} 
                  committee={committee} 
                  onEdit={() => { setEditItem(committee); setShowModal(true) }}
                  onDelete={() => setDeleteId(committee.id)}
                  onView={() => setViewItem(committee)}
                />
              ))}
              
              {/* Create Placeholder Card */}
              <div 
                onClick={() => { setEditItem(null); setShowModal(true) }}
                className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 hover:bg-slate-50 hover:border-indigo-300 transition-all cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-110 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
                  <MaterialIcon icon="add" className="text-3xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1b1b24]">New Committee</h3>
                  <p className="text-sm text-[#575e70]">Draft a new committee structure</p>
                </div>
              </div>
            </div>
          ) : (
            <CommitteeTable 
              committees={filtered} 
              onEdit={(c) => { setEditItem(c); setShowModal(true) }}
              onDelete={(id) => setDeleteId(id)}
              onView={(c) => setViewItem(c)}
            />
          )}

          {filtered.length === 0 && (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 py-24 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-6">
                <Building size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No committees found</h3>
              <p className="text-slate-500 mt-2 max-w-xs mx-auto">Try adjusting your search or category filters.</p>
              <button 
                onClick={() => { setSearch(''); setSelectedCategory('All') }} 
                className="mt-6 text-indigo-600 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {showModal && (
          <CommitteeModal 
            editItem={editItem} 
            onSave={handleSave} 
            onClose={() => { setShowModal(false); setEditItem(null) }} 
          />
        )}
        {showCSV && (
          <CSVUploader 
            onClose={() => setShowCSV(false)}
            onUpload={handleBulkUpload}
            sampleHeaders={['name', 'type', 'category', 'description', 'chair_name', 'member_count', 'formed_date']}
          />
        )}
        {viewItem && <CommitteeDetailPanel committee={viewItem} onClose={() => setViewItem(null)} />}
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md text-center shadow-2xl border border-slate-100"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6">
                <Trash2 size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Disband Committee?</h3>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                This action will permanently remove this committee record. This cannot be undone.
              </p>
              <div className="flex gap-4 mt-8">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-bold transition-all">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-all">Disband</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// --- Enhanced Subcomponents ---

// --- Enhanced Subcomponents ---

function CommitteeCard({ committee, onEdit, onDelete, onView }: { 
  committee: Committee; 
  onEdit: () => void; 
  onDelete: () => void;
  onView: () => void;
}) {
  const style = CATEGORY_STYLES[committee.category] || CATEGORY_STYLES.Administrative

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] p-8 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col group relative overflow-hidden">
      {/* Background Accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${style.bg} blur-[80px] -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center ${style.bg} ${style.text} shadow-inner`}>
          <MaterialIcon icon={style.icon} className="text-3xl" />
        </div>
        <div className="flex flex-col items-end gap-3">
          <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-full border ${style.border} ${style.bg} ${style.text}`}>
            {committee.category}
          </span>
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <button onClick={onEdit} className="p-2.5 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-slate-50 transition-all"><Edit2 size={16} /></button>
            <button onClick={onDelete} className="p-2.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-50 transition-all"><Trash2 size={16} /></button>
          </div>
        </div>
      </div>

      <div className="relative z-10 mb-6">
        <h3 className="text-2xl font-black text-[#1b1b24] mb-3 group-hover:text-[#4f46e5] transition-colors leading-tight">
          {committee.name}
        </h3>
        <p className="text-sm text-[#575e70] font-medium line-clamp-2 leading-relaxed opacity-80">
          {committee.description || "Leading institutional excellence through strategic oversight and governance."}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center -space-x-3">
            {committee.members?.slice(0, 3).map((m, i) => (
              <div key={m.id} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden shadow-sm group-hover:-translate-y-1 transition-transform" style={{ transitionDelay: `${i * 50}ms` }} title={m.name}>
                {m.avatar ? (
                  <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[11px] font-black text-slate-400">{m.name[0]}</span>
                )}
              </div>
            ))}
            {committee.member_count > 3 && (
              <div className="w-10 h-10 rounded-full bg-slate-50 border-4 border-white flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm">
                +{committee.member_count - 3}
              </div>
            )}
          </div>
          {committee.member_count === 0 && (
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Enrollment Pending</span>
          )}
        </div>
        
        <button 
          onClick={onView}
          className="w-12 h-12 rounded-2xl bg-slate-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all group/btn"
        >
          <MaterialIcon icon="arrow_forward" className="text-2xl group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}

function CommitteeTable({ committees, onEdit, onDelete, onView }: { 
  committees: Committee[]; 
  onEdit: (c: Committee) => void; 
  onDelete: (id: string) => void;
  onView: (c: Committee) => void;
}) {
  return (
    <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Council Identifier</th>
              <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Sector</th>
              <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Executive Chair</th>
              <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Capacity</th>
              <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {committees.map((c) => {
              const style = CATEGORY_STYLES[c.category] || CATEGORY_STYLES.Administrative
              return (
                <tr key={c.id} className="hover:bg-slate-50/30 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${style.bg} ${style.text} group-hover:scale-110 transition-transform`}>
                        <MaterialIcon icon={style.icon} className="text-2xl" />
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{c.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-1">{c.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] rounded-full ${style.bg} ${style.text} border ${style.border}`}>
                      {c.category}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-indigo-100">
                        {c.chair_name?.[0] || '?'}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{c.chair_name || 'Designation Pending'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-xs font-black text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                      {c.member_count}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] ${c.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      <div className={`w-2 h-2 rounded-full ${c.status === 'active' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-400'}`} />
                      {c.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onView(c)} className="p-3 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-white hover:shadow-lg transition-all"><Eye size={18} /></button>
                      <button onClick={() => onEdit(c)} className="p-3 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-white hover:shadow-lg transition-all"><Edit2 size={18} /></button>
                      <button onClick={() => onDelete(c.id)} className="p-3 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-white hover:shadow-lg transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CommitteeModal({ editItem, onSave, onClose }: { 
  editItem: Committee | null; 
  onSave: (d: Partial<Committee>) => void; 
  onClose: () => void 
}) {
  const [form, setForm] = useState<Partial<Committee>>(editItem ?? { 
    status: 'active', 
    category: 'Academic',
    type: 'Statutory',
    completion_rate: 0,
    member_count: 0
  })
  
  const set = (k: keyof Committee, v: any) => setForm(p => ({ ...p, [k]: v }))

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-[100] p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-[48px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-white"
      >
        <div className="flex items-center justify-between px-12 py-10 border-b border-slate-100 bg-slate-50/30">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-indigo-600 rounded-[26px] flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
              <Building size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editItem ? 'Refine Council' : 'Establish Committee'}</h2>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider opacity-60">Institutional Governance Framework</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 rounded-[22px] bg-white border border-slate-100 hover:bg-slate-50 text-slate-400 transition-all shadow-sm"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-12 py-12 space-y-12 no-scrollbar custom-scrollbar">
          {/* Section 1: Identity */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-2 h-6 bg-indigo-600 rounded-full shadow-[0_0_12px_rgba(79,70,229,0.4)]" />
              <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.25em]">Governance Identity</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">Official Designation *</label>
                <input 
                  value={form.name ?? ''} 
                  onChange={e => set('name', e.target.value)} 
                  placeholder="e.g. Strategic Planning & Resource Council"
                  className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[24px] text-lg font-black placeholder:text-slate-300 focus:bg-white focus:ring-[6px] focus:ring-indigo-100 focus:border-indigo-200 outline-none transition-all shadow-inner" 
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">Constitutional Type</label>
                  <div className="relative group">
                    <select 
                      value={form.type ?? 'Statutory'} 
                      onChange={e => set('type', e.target.value)}
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[24px] text-sm font-black appearance-none focus:bg-white focus:ring-[6px] focus:ring-indigo-100 focus:border-indigo-200 outline-none cursor-pointer shadow-inner"
                    >
                      {COMMITTEE_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">Functional Sector</label>
                  <div className="relative group">
                    <select 
                      value={form.category ?? 'Academic'} 
                      onChange={e => set('category', e.target.value)}
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[24px] text-sm font-black appearance-none focus:bg-white focus:ring-[6px] focus:ring-indigo-100 focus:border-indigo-200 outline-none cursor-pointer shadow-inner"
                    >
                      {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Leadership */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-2 h-6 bg-indigo-600 rounded-full shadow-[0_0_12px_rgba(79,70,229,0.4)]" />
              <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.25em]">Executive Composition</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 relative group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">Executive Chairperson</label>
                <div className="relative">
                  <UserCheck size={22} className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    value={form.chair_name ?? ''} 
                    onChange={e => set('chair_name', e.target.value)} 
                    placeholder="Enter full name of the presiding lead..."
                    className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[24px] text-sm font-black placeholder:text-slate-300 focus:bg-white focus:ring-[6px] focus:ring-indigo-100 outline-none transition-all shadow-inner" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">Total Member Count</label>
                <div className="relative group">
                  <Users size={20} className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="number"
                    value={form.member_count ?? 0} 
                    onChange={e => set('member_count', parseInt(e.target.value))} 
                    className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[24px] text-sm font-black focus:bg-white focus:ring-[6px] focus:ring-indigo-100 outline-none transition-all shadow-inner" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">Formation Date</label>
                <div className="relative group">
                  <Calendar size={20} className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="date"
                    value={form.formed_date ?? ''} 
                    onChange={e => set('formed_date', e.target.value)} 
                    className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[24px] text-sm font-black focus:bg-white focus:ring-[6px] focus:ring-indigo-100 outline-none transition-all shadow-inner" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Logistics */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-2 h-6 bg-indigo-600 rounded-full shadow-[0_0_12px_rgba(79,70,229,0.4)]" />
              <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.25em]">Operational Mandate</h3>
            </div>
            
            <div className="space-y-6">
              <div className="relative group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">Convening Schedule</label>
                <div className="relative">
                  <Clock size={22} className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    value={form.meeting_schedule ?? ''} 
                    onChange={e => set('meeting_schedule', e.target.value)} 
                    placeholder="e.g. Monthly, Second Monday at 10:00 AM"
                    className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[24px] text-sm font-black placeholder:text-slate-300 focus:bg-white focus:ring-[6px] focus:ring-indigo-100 outline-none transition-all shadow-inner" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">Mission Description</label>
                <textarea 
                  rows={5}
                  value={form.description ?? ''} 
                  onChange={e => set('description', e.target.value)} 
                  placeholder="Define the scope, objectives, and primary responsibilities of this body..."
                  className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[32px] text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:ring-[6px] focus:ring-indigo-100 outline-none transition-all resize-none shadow-inner no-scrollbar custom-scrollbar" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-12 py-10 bg-slate-50 border-t border-slate-100 flex gap-6">
          <button 
            onClick={onClose}
            className="flex-1 py-5 bg-white border border-slate-200 text-slate-500 rounded-[26px] text-sm font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-700 transition-all active:scale-95 shadow-sm"
          >
            Cancel Session
          </button>
          <button 
            onClick={() => onSave(form)} 
            disabled={!form.name}
            className="flex-2 py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-[26px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <MaterialIcon icon={editItem ? 'auto_fix_high' : 'verified'} className="text-xl" />
            {editItem ? 'Confirm Refinements' : 'Authorize Establishment'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function CommitteeDetailPanel({ committee, onClose }: { committee: Committee; onClose: () => void }) {
  const style = CATEGORY_STYLES[committee.category] || CATEGORY_STYLES.Administrative
  const [activeTab, setActiveTab] = useState('Overview')
  
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-end z-[110]"
      onClick={onClose}
    >
      <motion.div 
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        className="bg-white h-full w-full max-w-2xl shadow-[-40px_0_100px_rgba(0,0,0,0.15)] flex flex-col border-l border-white overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Dynamic Header */}
        <div className={`h-80 ${style.bg} relative overflow-hidden flex items-center justify-center border-b border-white`}>
          {/* Abstract background shapes */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className={`absolute -top-20 -right-20 w-96 h-96 rounded-full blur-[100px]`} style={{ backgroundColor: style.color }} />
            <div className={`absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full blur-[120px]`} style={{ backgroundColor: style.color }} />
          </div>
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, rotate: -10 }} 
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className={`w-32 h-32 rounded-[40px] bg-white/80 backdrop-blur-2xl shadow-2xl ${style.text} border border-white flex items-center justify-center relative z-10`}
          >
            <MaterialIcon icon={style.icon} className="text-6xl" />
          </motion.div>
          
          <button 
            onClick={onClose} 
            className="absolute top-10 right-10 w-14 h-14 bg-white/50 backdrop-blur-xl hover:bg-white rounded-2xl text-slate-600 transition-all border border-white shadow-lg flex items-center justify-center"
          >
            <X size={28} />
          </button>
          
          <div className="absolute bottom-8 left-12 flex items-center gap-4 relative z-10">
            <div className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.25em] shadow-xl border border-white ${style.bg} ${style.text}`}>
              {committee.type}
            </div>
            <div className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.25em] shadow-xl border border-white ${committee.status === 'active' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'}`}>
              {committee.status}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-12 pt-8 border-b border-slate-100 flex items-center gap-10 bg-white sticky top-0 z-20 overflow-x-auto no-scrollbar">
          {['Overview', 'Members', 'Logistics', 'Compliance'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[12px] font-black uppercase tracking-[0.25em] pb-6 transition-all border-b-4 ${activeTab === tab ? 'text-indigo-600 border-indigo-600' : 'text-slate-300 border-transparent hover:text-slate-500'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar custom-scrollbar bg-slate-50/20">
          <div className="p-12 space-y-12">
            {activeTab === 'Overview' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-6 bg-indigo-600 rounded-full" />
                    <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">Charter Description</h3>
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 leading-[1.1] tracking-tight">{committee.name}</h2>
                  <p className="text-slate-500 font-bold text-xl leading-relaxed opacity-80">
                    {committee.description || 'Dedicated to ensuring excellence and integrity through strategic institutional oversight.'}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white p-8 rounded-[40px] border border-slate-100 text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Composition</p>
                    <p className="text-4xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{committee.member_count}</p>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2">Enrolled</p>
                  </div>
                  <div className="bg-white p-8 rounded-[40px] border border-slate-100 text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Efficiency</p>
                    <p className="text-4xl font-black text-emerald-500 group-hover:scale-110 transition-transform">{committee.completion_rate || 0}%</p>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2">Resolution</p>
                  </div>
                  <div className="bg-white p-8 rounded-[40px] border border-slate-100 text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Established</p>
                    <p className="text-4xl font-black text-slate-900">{committee.formed_date ? new Date(committee.formed_date).getFullYear() : '—'}</p>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2">Fiscal Year</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-6 bg-indigo-600 rounded-full" />
                    <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">Executive Lead</h3>
                  </div>
                  <div className="p-8 bg-white border border-slate-100 rounded-[48px] shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-32 h-full ${style.bg} opacity-10 group-hover:opacity-30 transition-opacity`} />
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-slate-900 rounded-[32px] flex items-center justify-center text-white text-3xl font-black shadow-2xl group-hover:rotate-6 transition-transform">
                          {committee.chair_name?.[0] || '?'}
                        </div>
                        <div>
                          <p className="text-2xl font-black text-slate-900 mb-1">{committee.chair_name || 'Awaiting Nomination'}</p>
                          <p className="text-[11px] text-indigo-600 font-black uppercase tracking-[0.25em]">Executive Chairperson</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button className="w-14 h-14 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl flex items-center justify-center transition-all hover:bg-white hover:shadow-lg"><Mail size={24} /></button>
                        <button className="w-14 h-14 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl flex items-center justify-center transition-all hover:bg-white hover:shadow-lg"><Phone size={24} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Members' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-6 bg-indigo-600 rounded-full" />
                    <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">Council Membership</h3>
                  </div>
                  <button className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all">Enroll Member</button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {committee.members ? committee.members.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between p-6 bg-white border border-slate-50 rounded-[36px] hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group cursor-pointer">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-[24px] flex items-center justify-center text-xl font-black border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{m.name}</p>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">{m.role}</p>
                        </div>
                      </div>
                      <button className="w-12 h-12 flex items-center justify-center text-slate-200 group-hover:text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                        <MoreVertical size={20} />
                      </button>
                    </div>
                  )) : (
                    <div className="text-center py-24 bg-slate-50/50 rounded-[64px] border-2 border-dashed border-slate-200">
                      <Users size={80} className="text-slate-200 mx-auto mb-6" strokeWidth={1} />
                      <p className="text-[13px] font-black text-slate-300 uppercase tracking-[0.3em]">Institutional records pending</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'Logistics' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-6 bg-indigo-600 rounded-full" />
                    <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Rhythms</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div className="p-10 bg-white rounded-[48px] border border-slate-100 shadow-sm flex items-center gap-8 group hover:shadow-2xl transition-all">
                      <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[32px] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        <Clock size={40} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.3em] mb-2">Mandatory Convening</p>
                        <p className="text-2xl font-black text-slate-800">{committee.meeting_schedule || 'Determined by executive orders'}</p>
                      </div>
                    </div>

                    <div className="p-10 bg-white rounded-[48px] border border-slate-100 shadow-sm flex items-center gap-8 group hover:shadow-2xl transition-all">
                      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[32px] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        <Activity size={40} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.3em] mb-2">Last Deliberation</p>
                        <p className="text-2xl font-black text-slate-800">{committee.last_meeting ? new Date(committee.last_meeting).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'No session records found'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'Compliance' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-24 space-y-8">
                <div className="w-32 h-32 bg-indigo-50 text-indigo-600 rounded-[48px] flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck size={64} strokeWidth={1.5} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-slate-900">Governance Certified</h3>
                  <p className="text-slate-500 font-bold max-w-sm mx-auto text-lg leading-relaxed">
                    This body is fully compliant with institutional regulations and constitutional mandates.
                  </p>
                </div>
                <button className="px-10 py-5 bg-indigo-600 text-white rounded-[26px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 hover:scale-105 transition-all active:scale-95">
                  Download Full Audit
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-12 border-t border-slate-100 bg-white flex gap-6">
          <button onClick={onClose} className="flex-1 py-6 bg-slate-50 text-slate-500 rounded-[32px] text-xs font-black uppercase tracking-[0.25em] hover:bg-slate-100 hover:text-slate-700 transition-all active:scale-95">Dismiss Hub</button>
          <button className="flex-2 py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[32px] text-xs font-black uppercase tracking-[0.25em] shadow-[0_20px_50px_rgba(79,70,229,0.25)] transition-all flex items-center justify-center gap-4 active:scale-95 group">
            <MaterialIcon icon="edit_document" className="text-2xl group-hover:rotate-12 transition-transform" /> 
            <span>Refine Charter</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

