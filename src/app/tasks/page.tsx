'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CheckCircle2, Clock, AlertCircle, Circle, X, Edit2, Trash2, Flag, ChevronDown, Filter, User, Calendar, AlertTriangle, Upload, Download, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import CSVUploader from '@/components/ui/CSVUploader'

interface Task {
  id: string
  title: string
  description?: string
  assigned_to?: string
  due_date?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  category?: string
  created_at: string
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string; ring: string; icon: React.ReactNode }> = {
  low: { bg: 'bg-surface-variant', text: 'text-on-surface-variant', ring: 'ring-outline', icon: <Circle size={10} className="fill-current" /> },
  medium: { bg: 'bg-primary/10', text: 'text-primary', ring: 'ring-primary/20', icon: <Circle size={10} className="fill-current" /> },
  high: { bg: 'bg-tertiary/10', text: 'text-tertiary', ring: 'ring-tertiary/20', icon: <Circle size={10} className="fill-current" /> },
  urgent: { bg: 'bg-tertiary', text: 'text-white', ring: 'ring-tertiary/40', icon: <AlertTriangle size={10} /> },
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  pending: { label: 'Pending', icon: <Circle size={14} />, color: 'text-on-surface-variant/40', bg: 'bg-surface-variant' },
  in_progress: { label: 'In Progress', icon: <Clock size={14} />, color: 'text-primary', bg: 'bg-primary/10' },
  completed: { label: 'Completed', icon: <CheckCircle2 size={14} />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  cancelled: { label: 'Cancelled', icon: <AlertCircle size={14} />, color: 'text-tertiary', bg: 'bg-tertiary/10' },
}

const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Prepare semester exam timetable', priority: 'urgent', status: 'in_progress', due_date: '2025-11-15', assigned_to: 'Exam Cell', category: 'Administration', created_at: '2025-11-01' },
  { id: '2', title: 'Submit annual report to board', priority: 'high', status: 'pending', due_date: '2025-11-30', assigned_to: 'Principal Office', category: 'Administration', created_at: '2025-11-02' },
  { id: '3', title: 'Update faculty attendance records', priority: 'medium', status: 'completed', due_date: '2025-11-10', assigned_to: 'HR Department', category: 'HR', created_at: '2025-10-28' },
  { id: '4', title: 'Organize freshers orientation', priority: 'medium', status: 'completed', due_date: '2025-09-10', assigned_to: 'Student Affairs', category: 'Events', created_at: '2025-09-01' },
  { id: '5', title: 'Lab equipment maintenance schedule', priority: 'low', status: 'pending', due_date: '2025-12-15', category: 'Infrastructure', created_at: '2025-11-05' },
  { id: '6', title: 'Review and approve course outlines', priority: 'high', status: 'in_progress', due_date: '2025-11-20', assigned_to: 'Academic Council', category: 'Academic', created_at: '2025-11-03' },
  { id: '7', title: 'NAAC documentation preparation', priority: 'urgent', status: 'pending', due_date: '2025-12-31', assigned_to: 'IQAC Cell', category: 'Accreditation', created_at: '2025-11-01' },
]

const STATUS_LABELS = ['all', 'pending', 'in_progress', 'completed', 'cancelled']
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }) }

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Task | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showCSV, setShowCSV] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = tasks.filter(t => {
    const matchStatus = filterStatus === 'all' || t.status === filterStatus
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        t.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        t.assigned_to?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchStatus && matchPriority && matchSearch
  })

  const handleStatusChange = (id: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))
    toast.success(`Task marked as ${newStatus.replace('_', ' ')}`)
  }

  const handleSave = (data: Partial<Task>) => {
    if (editItem) {
      setTasks(prev => prev.map(t => t.id === editItem.id ? { ...t, ...data } : t))
      toast.success('Task updated successfully')
    } else {
      setTasks(prev => [{ ...data, id: Date.now().toString(), status: 'pending', created_at: new Date().toISOString().split('T')[0] } as Task, ...prev])
      toast.success('Task created successfully')
    }
    setShowModal(false)
    setEditItem(null)
  }

  const handleBulkUpload = (data: any[]) => {
    const newTasks = data.map(item => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      status: item.status || 'pending',
      priority: item.priority || 'medium',
      created_at: new Date().toISOString().split('T')[0]
    }))
    setTasks(prev => [...newTasks, ...prev])
    setShowCSV(false)
    toast.success(`${newTasks.length} tasks imported successfully`)
  }

  const counts = {
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    urgent: tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length,
  }

  const isOverdue = (task: Task) => task.due_date && task.status !== 'completed' && new Date(task.due_date) < new Date()

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tighter">Tasks Tracking</h1>
          <p className="text-sm font-bold text-on-surface-variant/60 mt-1 uppercase tracking-wider">
            {counts.in_progress} in progress · {counts.pending} pending · 
            {counts.urgent > 0 && <span className="text-tertiary ml-2">{counts.urgent} urgent items</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowCSV(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-outline hover:bg-surface-variant/50 text-on-surface-variant rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
          >
            <Upload size={16} className="text-primary" /> Import CSV
          </button>
          <button onClick={() => { setEditItem(null); setShowModal(true) }}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-2xl text-[13px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95">
            <Plus size={18} /> New Task
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: counts.pending, color: 'text-on-surface-variant', bg: 'bg-surface-variant/30', icon: <Circle size={16} /> },
          { label: 'Working', value: counts.in_progress, color: 'text-primary', bg: 'bg-primary/5', icon: <Clock size={16} /> },
          { label: 'Completed', value: counts.completed, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <CheckCircle2 size={16} /> },
          { label: 'Critical', value: counts.urgent, color: 'text-tertiary', bg: 'bg-tertiary/5', icon: <AlertTriangle size={16} /> },
        ].map((s, i) => (
          <motion.div key={s.label} custom={i} variants={fadeUp} initial="hidden" animate="visible"
            className="bg-white rounded-3xl border border-outline p-5 flex items-center justify-between shadow-premium group hover:border-primary/20 transition-all">
            <div>
              <p className="text-[11px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-1">{s.label}</p>
              <h3 className={`text-2xl font-black ${s.color}`}>{s.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.bg} ${s.color} transition-transform group-hover:scale-110`}>
              {s.icon}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto custom-scrollbar">
          <div className="flex bg-surface-variant/50 p-1 rounded-2xl border border-outline">
            {STATUS_LABELS.map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant/60 hover:text-on-surface'}`}>
                {s === 'all' ? 'All Tasks' : s.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="h-8 w-px bg-outline mx-2 hidden md:block" />
          <div className="relative min-w-[160px]">
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-outline rounded-2xl text-[11px] font-black uppercase tracking-widest text-on-surface-variant outline-none appearance-none cursor-pointer focus:border-primary/30 transition-all">
              <option value="all">All Priorities</option>
              {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 pointer-events-none" />
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-outline rounded-2xl text-[13px] font-medium outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all"
          />
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((task, i) => {
          const priority = PRIORITY_STYLES[task.priority]
          const status = STATUS_CONFIG[task.status]
          const overdue = isOverdue(task)
          return (
            <motion.div key={task.id} variants={fadeUp} initial="hidden" animate="visible" custom={i}
              className={`bg-white rounded-3xl border border-outline p-5 transition-all duration-300 hover:shadow-premium group relative overflow-hidden ${task.status === 'completed' ? 'opacity-60' : ''}`}>
              
              {/* Background Accent */}
              <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-10 ${priority.bg}`} />

              <div className="flex items-start justify-between gap-3 relative">
                <div className={`mt-1 p-2 rounded-xl ${status.bg} ${status.color}`}>
                  {status.icon}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex flex-wrap gap-2 mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-lg ring-1 ${priority.ring} ${priority.bg} ${priority.text}`}>
                      {task.priority}
                    </span>
                    {task.category && (
                       <span className="text-[10px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-lg bg-surface-variant text-on-surface-variant/60">
                       {task.category}
                     </span>
                    )}
                   </div>
                   <h3 className={`text-[15px] font-black tracking-tight leading-snug group-hover:text-primary transition-colors ${task.status === 'completed' ? 'line-through text-on-surface-variant/40' : 'text-on-surface'}`}>
                     {task.title}
                   </h3>
                </div>
              </div>

              {task.description && (
                <p className="text-[13px] text-on-surface-variant/60 mt-3 line-clamp-2 leading-relaxed font-medium">
                  {task.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-outline/50">
                {task.assigned_to && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-on-surface-variant/60">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <User size={10} className="text-primary" />
                    </div>
                    {task.assigned_to}
                  </div>
                )}
                {task.due_date && (
                  <div className={`flex items-center gap-1.5 text-[11px] font-bold ${overdue ? 'text-tertiary' : 'text-on-surface-variant/60'}`}>
                    <Calendar size={12} />
                    {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                )}
              </div>

              {/* Hover Actions */}
              <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-[-10px] group-hover:translate-y-0">
                <button onClick={() => { setEditItem(task); setShowModal(true) }}
                  className="p-2 rounded-xl bg-white border border-outline text-on-surface-variant hover:text-primary hover:border-primary/30 shadow-sm transition-all">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => setDeleteId(task.id)}
                  className="p-2 rounded-xl bg-white border border-outline text-on-surface-variant hover:text-tertiary hover:border-tertiary/30 shadow-sm transition-all">
                  <Trash2 size={14} />
                </button>
              </div>

              {overdue && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-tertiary/20 overflow-hidden">
                  <motion.div 
                    initial={{ x: '-100%' }} 
                    animate={{ x: '100%' }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-1/2 h-full bg-tertiary" 
                  />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-dashed border-outline">
          <div className="w-16 h-16 rounded-3xl bg-surface-variant flex items-center justify-center text-on-surface-variant/20 mb-4">
            <CheckCircle2 size={32} />
          </div>
          <p className="text-sm font-black text-on-surface-variant/40 uppercase tracking-widest">No tasks matching your search</p>
        </motion.div>
      )}

      {/* Task Modal */}
      <AnimatePresence>
        {showModal && (
          <TaskModal editItem={editItem} onSave={handleSave} onClose={() => { setShowModal(false); setEditItem(null) }} />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl relative z-10 text-center">
              <div className="w-16 h-16 rounded-3xl bg-tertiary/10 text-tertiary flex items-center justify-center mx-auto mb-6">
                <Trash2 size={28} />
              </div>
              <h3 className="text-xl font-black text-on-surface tracking-tight mb-2">Delete Task?</h3>
              <p className="text-sm font-medium text-on-surface-variant/60 leading-relaxed mb-8">This action cannot be undone. Are you sure you want to remove this task?</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-3 border border-outline rounded-2xl text-[13px] font-black uppercase tracking-widest text-on-surface-variant hover:bg-surface-variant transition-all">Cancel</button>
                <button onClick={() => { setTasks(prev => prev.filter(t => t.id !== deleteId)); setDeleteId(null); toast.success('Task permanently deleted') }}
                  className="flex-1 py-3 bg-tertiary text-white rounded-2xl text-[13px] font-black uppercase tracking-widest shadow-lg shadow-tertiary/20 hover:bg-tertiary/90 transition-all">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CSV Import */}
      <AnimatePresence>
        {showCSV && (
          <CSVUploader 
            onUpload={handleBulkUpload} 
            onClose={() => setShowCSV(false)}
            sampleHeaders={['title', 'description', 'assigned_to', 'due_date', 'priority', 'category']}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function TaskModal({ editItem, onSave, onClose }: { editItem: Task | null; onSave: (d: Partial<Task>) => void; onClose: () => void }) {
  const [form, setForm] = useState<Partial<Task>>(editItem ?? { priority: 'medium', status: 'pending' })
  const set = (k: keyof Task, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl relative z-10 overflow-hidden">
        
        <div className="flex items-center justify-between px-8 py-6 border-b border-outline">
          <div>
            <h2 className="text-xl font-black text-on-surface tracking-tighter">{editItem ? 'Edit Task' : 'New Task'}</h2>
            <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mt-1">Fill in the details below</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-variant text-on-surface-variant transition-colors"><X size={20} /></button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] ml-1">Task Title</label>
            <input 
              value={form.title ?? ''} 
              onChange={e => set('title', e.target.value)} 
              placeholder="e.g. Schedule department review"
              className="w-full px-5 py-3.5 bg-surface-variant/50 border border-outline rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-white transition-all" 
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] ml-1">Priority</label>
              <div className="relative">
                <select value={form.priority ?? ''} onChange={e => set('priority', e.target.value)}
                  className="w-full px-5 py-3.5 bg-surface-variant/50 border border-outline rounded-2xl text-sm font-medium outline-none appearance-none focus:border-primary/30 transition-all">
                  {['low', 'medium', 'high', 'urgent'].map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] ml-1">Category</label>
              <input value={form.category ?? ''} onChange={e => set('category', e.target.value)} placeholder="Administration"
                className="w-full px-5 py-3.5 bg-surface-variant/50 border border-outline rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-white transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] ml-1">Assigned To</label>
              <input value={form.assigned_to ?? ''} onChange={e => set('assigned_to', e.target.value)} placeholder="Department or User"
                className="w-full px-5 py-3.5 bg-surface-variant/50 border border-outline rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-white transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] ml-1">Due Date</label>
              <input type="date" value={form.due_date ?? ''} onChange={e => set('due_date', e.target.value)}
                className="w-full px-5 py-3.5 bg-surface-variant/50 border border-outline rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-white transition-all" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] ml-1">Description (Optional)</label>
            <textarea rows={3} value={form.description ?? ''} onChange={e => set('description', e.target.value)} placeholder="Provide additional context..."
              className="w-full px-5 py-3.5 bg-surface-variant/50 border border-outline rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-white transition-all resize-none" />
          </div>
        </div>

        <div className="flex gap-4 px-8 pb-8">
          <button onClick={onClose} className="flex-1 py-4 border border-outline rounded-2xl text-[13px] font-black uppercase tracking-widest text-on-surface-variant hover:bg-surface-variant transition-all">Cancel</button>
          <button onClick={() => onSave(form)} disabled={!form.title}
            className="flex-1 py-4 bg-primary hover:bg-primary/90 disabled:bg-primary/30 text-white rounded-2xl text-[13px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95">
            {editItem ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

