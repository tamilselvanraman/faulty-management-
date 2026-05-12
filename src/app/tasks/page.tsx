'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CheckCircle2, Clock, AlertCircle, Circle, X, Edit2, Trash2, Flag, ChevronDown, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

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

const PRIORITY_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  low: { bg: 'bg-gray-50', text: 'text-gray-500', icon: '🟢' },
  medium: { bg: 'bg-blue-50', text: 'text-blue-600', icon: '🔵' },
  high: { bg: 'bg-amber-50', text: 'text-amber-600', icon: '🟡' },
  urgent: { bg: 'bg-red-50', text: 'text-red-600', icon: '🔴' },
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'Pending', icon: <Circle size={14} />, color: 'text-gray-400' },
  in_progress: { label: 'In Progress', icon: <Clock size={14} />, color: 'text-blue-500' },
  completed: { label: 'Completed', icon: <CheckCircle2 size={14} />, color: 'text-emerald-500' },
  cancelled: { label: 'Cancelled', icon: <AlertCircle size={14} />, color: 'text-red-400' },
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
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] } }) }

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Task | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = tasks.filter(t => {
    const matchStatus = filterStatus === 'all' || t.status === filterStatus
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority
    return matchStatus && matchPriority
  })

  const handleStatusChange = (id: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))
    toast.success(`Task marked as ${newStatus.replace('_', ' ')}`)
  }

  const handleSave = (data: Partial<Task>) => {
    if (editItem) {
      setTasks(prev => prev.map(t => t.id === editItem.id ? { ...t, ...data } : t))
      toast.success('Task updated')
    } else {
      setTasks(prev => [{ ...data, id: Date.now().toString(), status: 'pending', created_at: new Date().toISOString().split('T')[0] } as Task, ...prev])
      toast.success('Task created')
    }
    setShowModal(false)
    setEditItem(null)
  }

  const counts = {
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    urgent: tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length,
  }

  const isOverdue = (task: Task) => task.due_date && task.status !== 'completed' && new Date(task.due_date) < new Date()

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{counts.in_progress} in progress · {counts.pending} pending · {counts.urgent > 0 && <span className="text-red-500 font-semibold">{counts.urgent} urgent</span>}</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/20 flex-shrink-0">
          <Plus size={16} /> Add Task
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Pending', value: counts.pending, color: 'text-gray-600', bg: 'bg-gray-50' },
          { label: 'In Progress', value: counts.in_progress, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Completed', value: counts.completed, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Urgent', value: counts.urgent, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${s.bg} ${s.color}`}>{s.value}</div>
            <span className="text-xs font-medium text-gray-500">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          {STATUS_LABELS.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 text-xs font-semibold capitalize transition-colors ${filterStatus === s ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="relative">
          <Flag size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
            className="pl-7 pr-7 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs text-gray-700 outline-none appearance-none cursor-pointer">
            <option value="all">All Priorities</option>
            {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2.5">
        {filtered.map((task, i) => {
          const priority = PRIORITY_STYLES[task.priority]
          const status = STATUS_CONFIG[task.status]
          const overdue = isOverdue(task)
          return (
            <motion.div key={task.id} variants={fadeUp} initial="hidden" animate="visible" custom={i}
              className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-md group ${task.status === 'completed' ? 'border-[#F3F4F6] opacity-70' : 'border-[#E5E7EB]'}`}>
              <div className="p-4 flex items-start gap-3">
                {/* Status toggle */}
                <button
                  onClick={() => handleStatusChange(task.id, task.status === 'completed' ? 'pending' : task.status === 'pending' ? 'in_progress' : task.status === 'in_progress' ? 'completed' : 'pending')}
                  className={`mt-0.5 flex-shrink-0 transition-colors ${status.color} hover:scale-110`}>
                  {status.icon}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className={`text-sm font-semibold ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {task.title}
                    </p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${priority.bg} ${priority.text}`}>
                      {priority.icon} {task.priority}
                    </span>
                    {overdue && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-50 text-red-600">⚠ Overdue</span>}
                  </div>
                  {task.description && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{task.description}</p>}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-gray-400">
                    {task.assigned_to && <span>👤 {task.assigned_to}</span>}
                    {task.due_date && <span className={overdue ? 'text-red-400 font-semibold' : ''}>📅 {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                    {task.category && <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{task.category}</span>}
                  </div>
                </div>

                {/* Quick status change */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <select value={task.status} onChange={e => handleStatusChange(task.id, e.target.value as Task['status'])}
                    className="text-xs bg-gray-50 border border-[#E5E7EB] rounded-lg px-2 py-1 outline-none appearance-none cursor-pointer hidden sm:block">
                    {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                  </select>
                  <button onClick={() => { setEditItem(task); setShowModal(true) }}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => setDeleteId(task.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-16 gap-3">
          <CheckCircle2 size={36} className="text-gray-200" />
          <p className="text-sm text-gray-400">No tasks found for this filter</p>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <TaskModal editItem={editItem} onSave={handleSave} onClose={() => { setShowModal(false); setEditItem(null) }} />
        )}
      </AnimatePresence>

      {/* Delete */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <h3 className="font-bold text-gray-900">Delete Task?</h3>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-[#E5E7EB] rounded-xl text-sm font-semibold text-gray-600">Cancel</button>
                <button onClick={() => { setTasks(prev => prev.filter(t => t.id !== deleteId)); setDeleteId(null); toast.success('Task deleted') }}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold">Delete</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TaskModal({ editItem, onSave, onClose }: { editItem: Task | null; onSave: (d: Partial<Task>) => void; onClose: () => void }) {
  const [form, setForm] = useState<Partial<Task>>(editItem ?? { priority: 'medium', status: 'pending' })
  const set = (k: keyof Task, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E7EB]">
          <h2 className="font-bold text-gray-900">{editItem ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Task Title *</label>
            <input value={form.title ?? ''} onChange={e => set('title', e.target.value)} placeholder="What needs to be done?"
              className="w-full px-3 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[{ label: 'Priority', key: 'priority', opts: ['low', 'medium', 'high', 'urgent'] },
              { label: 'Status', key: 'status', opts: Object.keys(STATUS_CONFIG) }].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                <select value={(form as Record<string, unknown>)[f.key] as string ?? ''} onChange={e => set(f.key as keyof Task, e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-sm outline-none appearance-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50">
                  {f.opts.map(o => <option key={o} value={o}>{o.replace('_', ' ').charAt(0).toUpperCase() + o.replace('_', ' ').slice(1)}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Assigned To</label>
              <input value={form.assigned_to ?? ''} onChange={e => set('assigned_to', e.target.value)} placeholder="Name or dept"
                className="w-full px-3 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Due Date</label>
              <input type="date" value={form.due_date ?? ''} onChange={e => set('due_date', e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
            <input value={form.category ?? ''} onChange={e => set('category', e.target.value)} placeholder="Administration, Academic, HR..."
              className="w-full px-3 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
            <textarea rows={3} value={form.description ?? ''} onChange={e => set('description', e.target.value)} placeholder="Additional details..."
              className="w-full px-3 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 resize-none" />
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#E5E7EB] rounded-xl text-sm font-semibold text-gray-600">Cancel</button>
          <button onClick={() => onSave(form)} disabled={!form.title}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-sm font-bold">
            {editItem ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
