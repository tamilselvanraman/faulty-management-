'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Clock, BookOpen, X, Edit2, Trash2, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Mathematics', 'MBA']

const DAY_COLORS: Record<string, string> = {
  Monday: 'from-indigo-500 to-indigo-600',
  Tuesday: 'from-violet-500 to-violet-600',
  Wednesday: 'from-sky-500 to-sky-600',
  Thursday: 'from-emerald-500 to-emerald-600',
  Friday: 'from-amber-500 to-amber-600',
  Saturday: 'from-rose-500 to-rose-600',
}

interface TimetableEntry {
  id: string
  day: string
  start_time: string
  end_time: string
  subject: string
  faculty_name: string
  room: string
  department: string
  year: number
  section?: string
}

const MOCK_ENTRIES: TimetableEntry[] = [
  { id: '1', day: 'Monday', start_time: '09:00', end_time: '10:00', subject: 'Data Structures', faculty_name: 'Dr. Priya Sharma', room: 'CS-101', department: 'Computer Science', year: 2 },
  { id: '2', day: 'Monday', start_time: '10:00', end_time: '11:00', subject: 'DBMS', faculty_name: 'Prof. Rajesh Kumar', room: 'CS-102', department: 'Computer Science', year: 2 },
  { id: '3', day: 'Monday', start_time: '14:00', end_time: '15:00', subject: 'Networks', faculty_name: 'Dr. Priya Sharma', room: 'CS-201', department: 'Computer Science', year: 3 },
  { id: '4', day: 'Tuesday', start_time: '09:00', end_time: '10:00', subject: 'VLSI', faculty_name: 'Prof. Rajesh Kumar', room: 'ECE-101', department: 'Electronics', year: 3 },
  { id: '5', day: 'Tuesday', start_time: '11:00', end_time: '12:00', subject: 'Algorithms', faculty_name: 'Dr. Priya Sharma', room: 'CS-103', department: 'Computer Science', year: 3 },
  { id: '6', day: 'Wednesday', start_time: '10:00', end_time: '11:00', subject: 'Calculus', faculty_name: 'Dr. Anita Mehta', room: 'MATH-101', department: 'Mathematics', year: 1 },
  { id: '7', day: 'Thursday', start_time: '09:00', end_time: '10:00', subject: 'Thermodynamics', faculty_name: 'Mr. Suresh Nair', room: 'MECH-101', department: 'Mechanical', year: 2 },
  { id: '8', day: 'Friday', start_time: '11:00', end_time: '12:00', subject: 'Structural Analysis', faculty_name: 'Dr. Kavitha Rajan', room: 'CIVIL-201', department: 'Civil', year: 3 },
]

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] } }) }

export default function TimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>(MOCK_ENTRIES)
  const [filterDept, setFilterDept] = useState('Computer Science')
  const [filterYear, setFilterYear] = useState<number>(2)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<TimetableEntry | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = entries.filter(e => e.department === filterDept && e.year === filterYear)

  // Build schedule grid: day → time → entry
  const schedule: Record<string, Record<string, TimetableEntry>> = {}
  filtered.forEach(e => {
    if (!schedule[e.day]) schedule[e.day] = {}
    schedule[e.day][e.start_time] = e
  })

  const handleSave = (data: Partial<TimetableEntry>) => {
    if (editItem) {
      setEntries(prev => prev.map(e => e.id === editItem.id ? { ...e, ...data } : e))
      toast.success('Entry updated')
    } else {
      setEntries(prev => [...prev, { ...data, id: Date.now().toString() } as TimetableEntry])
      toast.success('Period added')
    }
    setShowModal(false)
    setEditItem(null)
  }

  const handleDelete = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id))
    setDeleteId(null)
    toast.success('Period removed')
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
          <p className="text-sm text-gray-500 mt-0.5">Weekly class schedule — {filterDept} · Year {filterYear}</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/20 flex-shrink-0">
          <Plus size={16} /> Add Period
        </button>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
            className="pl-3 pr-8 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-gray-700 outline-none appearance-none cursor-pointer">
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="flex bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          {[1, 2, 3, 4].map(y => (
            <button key={y} onClick={() => setFilterYear(y)}
              className={`px-3 py-2.5 text-sm font-semibold transition-colors ${filterYear === y ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              Yr {y}
            </button>
          ))}
        </div>
        <div className="text-xs text-gray-400 self-center">{filtered.length} periods scheduled this week</div>
      </div>

      {/* Weekly Grid — desktop scroll table */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}
        className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E5E7EB]">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider w-20">Time</th>
                {DAYS.map(d => (
                  <th key={d} className="px-3 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <span className={`inline-block px-2.5 py-1 rounded-lg bg-gradient-to-r ${DAY_COLORS[d]} text-white text-[11px]`}>{d.slice(0, 3)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((slot, i) => (
                <tr key={slot} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-4 py-2 text-xs text-gray-400 font-mono border-r border-[#F3F4F6] whitespace-nowrap">{slot}</td>
                  {DAYS.map(day => {
                    const entry = schedule[day]?.[slot]
                    return (
                      <td key={day} className="px-2 py-2 border-l border-[#F3F4F6] min-w-[130px]">
                        {entry ? (
                          <div className="group relative bg-indigo-50 border border-indigo-100 rounded-xl p-2 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all">
                            <p className="text-[11px] font-bold text-indigo-700 truncate">{entry.subject}</p>
                            <p className="text-[10px] text-gray-500 truncate">{entry.faculty_name.split(' ').slice(-1)}</p>
                            <p className="text-[10px] text-gray-400">🏠 {entry.room}</p>
                            <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                              <button onClick={() => { setEditItem(entry); setShowModal(true) }}
                                className="p-1 bg-white rounded shadow text-indigo-500 hover:bg-indigo-50"><Edit2 size={10} /></button>
                              <button onClick={() => setDeleteId(entry.id)}
                                className="p-1 bg-white rounded shadow text-red-400 hover:bg-red-50"><Trash2 size={10} /></button>
                            </div>
                          </div>
                        ) : (
                          <div className="h-[58px] rounded-xl border border-dashed border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors cursor-pointer flex items-center justify-center"
                            onClick={() => { setEditItem(null); setShowModal(true) }}>
                            <Plus size={12} className="text-gray-300" />
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Mobile List View */}
      <div className="xl:hidden space-y-3">
        {DAYS.filter(d => schedule[d]).map(day => (
          <motion.div key={day} variants={fadeUp} initial="hidden" animate="visible"
            className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
            <div className={`px-4 py-3 bg-gradient-to-r ${DAY_COLORS[day]}`}>
              <h3 className="text-sm font-bold text-white">{day}</h3>
            </div>
            <div className="divide-y divide-[#F3F4F6]">
              {Object.entries(schedule[day]).sort().map(([time, entry]) => (
                <div key={time} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xs text-gray-400 font-mono w-12 flex-shrink-0">{time}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{entry.subject}</p>
                    <p className="text-xs text-gray-400">{entry.faculty_name} · {entry.room}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditItem(entry); setShowModal(true) }}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"><Edit2 size={13} /></button>
                    <button onClick={() => setDeleteId(entry.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 gap-3">
            <Clock size={32} className="text-gray-200" />
            <p className="text-sm text-gray-400">No periods scheduled for {filterDept} Year {filterYear}</p>
            <button onClick={() => setShowModal(true)} className="text-xs text-indigo-600 hover:underline">Add first period</button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <TimetableModal editItem={editItem} dept={filterDept} year={filterYear}
            onSave={handleSave} onClose={() => { setShowModal(false); setEditItem(null) }} />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <h3 className="font-bold text-gray-900">Remove Period?</h3>
              <p className="text-sm text-gray-500 mt-2">This slot will be freed up.</p>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-[#E5E7EB] rounded-xl text-sm font-semibold text-gray-600">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold">Remove</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TimetableModal({ editItem, dept, year, onSave, onClose }: {
  editItem: TimetableEntry | null; dept: string; year: number
  onSave: (d: Partial<TimetableEntry>) => void; onClose: () => void
}) {
  const [form, setForm] = useState<Partial<TimetableEntry>>(editItem ?? { department: dept, year, day: 'Monday', start_time: '09:00', end_time: '10:00' })
  const set = (k: keyof TimetableEntry, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E7EB]">
          <h2 className="font-bold text-gray-900">{editItem ? 'Edit Period' : 'Add Period'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject *</label>
            <input value={form.subject ?? ''} onChange={e => set('subject', e.target.value)} placeholder="Subject name"
              className="w-full px-3 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Faculty Name</label>
            <input value={form.faculty_name ?? ''} onChange={e => set('faculty_name', e.target.value)} placeholder="Dr. First Last"
              className="w-full px-3 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" />
          </div>
          {[
            { label: 'Day', key: 'day', options: DAYS },
            { label: 'Department', key: 'department', options: DEPARTMENTS },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
              <select value={(form as Record<string, unknown>)[f.key] as string ?? ''} onChange={e => set(f.key as keyof TimetableEntry, e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-sm outline-none appearance-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50">
                {f.options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          {[
            { label: 'Start Time', key: 'start_time', options: TIME_SLOTS },
            { label: 'End Time', key: 'end_time', options: TIME_SLOTS },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
              <select value={(form as Record<string, unknown>)[f.key] as string ?? ''} onChange={e => set(f.key as keyof TimetableEntry, e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-sm outline-none appearance-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50">
                {f.options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Room</label>
            <input value={form.room ?? ''} onChange={e => set('room', e.target.value)} placeholder="CS-101"
              className="w-full px-3 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Year</label>
            <select value={form.year ?? 1} onChange={e => set('year', parseInt(e.target.value))}
              className="w-full px-3 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-sm outline-none appearance-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50">
              {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#E5E7EB] rounded-xl text-sm font-semibold text-gray-600">Cancel</button>
          <button onClick={() => onSave(form)} disabled={!form.subject || !form.day}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-sm font-bold">
            {editItem ? 'Update' : 'Add Period'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
