'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Calendar, MapPin, Clock, Tag, X, Edit2, Trash2, 
  ChevronLeft, ChevronRight, Filter, AlertCircle, Bell,
  User, Users, BookOpen, Presentation, CalendarDays, ExternalLink, Star,
  Search, Upload, Download, MoreVertical, LayoutGrid, List as ListIcon,
  ArrowLeft, CheckCircle, ChevronDown
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
interface Event {
  id: string
  title: string
  type: 'Academic' | 'Meeting' | 'Social' | 'Workshop' | 'Lecture' | 'Faculty Meeting' | 'Seminar' | 'Exhibition'
  date: string
  start_time: string
  end_time: string
  location?: string
  description?: string
  priority?: 'High' | 'Normal' | 'Low'
  organizer?: string
  attendees_count?: number
}

// --- Constants & Styles ---
const VIEW_TYPES = ['Day', 'Week', 'Month']

const EVENT_STYLES: Record<string, { bg: string; text: string; border: string; accent: string; icon: string }> = {
  'Faculty Meeting': { bg: 'bg-indigo-50/50', text: 'text-indigo-600', border: 'border-indigo-100', accent: '#4f46e5', icon: 'groups' },
  'Lecture': { bg: 'bg-emerald-50/50', text: 'text-emerald-600', border: 'border-emerald-100', accent: '#10b981', icon: 'school' },
  'Workshop': { bg: 'bg-amber-50/50', text: 'text-amber-600', border: 'border-amber-100', accent: '#f59e0b', icon: 'construction' },
  'Academic': { bg: 'bg-sky-50/50', text: 'text-sky-600', border: 'border-sky-100', accent: '#0ea5e9', icon: 'menu_book' },
  'Meeting': { bg: 'bg-orange-50/50', text: 'text-orange-600', border: 'border-orange-100', accent: '#f97316', icon: 'handshake' },
  'Social': { bg: 'bg-rose-50/50', text: 'text-rose-600', border: 'border-rose-100', accent: '#f43f5e', icon: 'celebration' },
  'Seminar': { bg: 'bg-pink-50/50', text: 'text-pink-600', border: 'border-pink-100', accent: '#ec4899', icon: 'presentation_chart_line' },
  'Exhibition': { bg: 'bg-slate-50/50', text: 'text-slate-600', border: 'border-slate-100', accent: '#64748b', icon: 'gallery_thumbnail' },
}

const MOCK_EVENTS: Event[] = [
  { 
    id: '1', 
    title: 'Departmental Curriculum Review', 
    type: 'Faculty Meeting', 
    date: '2023-10-23', 
    start_time: '09:00', 
    end_time: '10:30', 
    location: 'Conference Room B', 
    priority: 'High',
    description: 'Quarterly review of the current computer science curriculum and upcoming changes.'
  },
  { 
    id: '2', 
    title: 'CS302: Advanced Algorithm Analysis', 
    type: 'Lecture', 
    date: '2023-10-23', 
    start_time: '11:00', 
    end_time: '12:30', 
    location: 'Main Hall 302', 
    attendees_count: 45,
    description: 'In-depth discussion on dynamic programming and network flow algorithms.'
  },
  { 
    id: '3', 
    title: 'Career Planning for Final Year Students', 
    type: 'Workshop', 
    date: '2023-10-23', 
    start_time: '13:30', 
    end_time: '15:00', 
    organizer: 'Dr. Sarah Jenkins',
    description: 'Preparation session for upcoming campus placements and interview techniques.'
  },
  {
    id: '4',
    title: 'Dean\'s Meeting',
    type: 'Meeting',
    date: '2024-10-02',
    start_time: '10:00',
    end_time: '11:30',
    location: 'Dean\'s Office'
  },
  {
    id: '5',
    title: 'Mid-term Submission',
    type: 'Academic',
    date: '2024-10-04',
    start_time: '12:00',
    end_time: '17:00',
    location: 'Submission Portal'
  },
  {
    id: '6',
    title: 'Basketball Tryouts',
    type: 'Social',
    date: '2024-10-07',
    start_time: '16:00',
    end_time: '18:00',
    location: 'Sports Ground'
  }
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

export default function EventsPage() {
  const router = useRouter()
  const [view, setView] = useState('Day')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCSV, setShowCSV] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/events')
      if (!res.ok) throw new Error('Failed to fetch')
      const { data } = await res.json()
      if (data) setEvents(data)
    } catch (err) {
      console.error('Failed to fetch events:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchSearch = !search || 
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.location?.toLowerCase().includes(search.toLowerCase()) ||
        e.description?.toLowerCase().includes(search.toLowerCase())
      const matchCategory = !selectedCategory || e.type === selectedCategory
      return matchSearch && matchCategory
    })
  }, [events, search, selectedCategory])

  const handleSave = async (eventData: Partial<Event>) => {
    try {
      const isEdit = !!selectedEvent
      const url = isEdit ? `/api/events/${selectedEvent.id}` : '/api/events'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      })

      const { data, error } = await res.json()
      if (error) throw new Error(error)

      if (isEdit) {
        setEvents(prev => prev.map(e => e.id === selectedEvent.id ? data : e))
        toast.success('Event updated')
      } else {
        setEvents(prev => [...prev, data])
        toast.success('Event scheduled')
      }
    } catch {
      const isEdit = !!selectedEvent
      if (isEdit) {
        setEvents(prev => prev.map(e => e.id === selectedEvent.id ? { ...e, ...eventData } : e))
        toast.success('Updated locally (Demo Mode)')
      } else {
        const newEvent = { ...eventData, id: Math.random().toString(36).substr(2, 9) } as Event
        setEvents(prev => [...prev, newEvent])
        toast.success('Created locally (Demo Mode)')
      }
    } finally {
      setShowAddModal(false)
      setSelectedEvent(null)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/events/${id}`, { method: 'DELETE' })
    } catch { /* ignore */ }
    setEvents(prev => prev.filter(e => e.id !== id))
    toast.success('Event removed')
  }

  const dayEvents = useMemo(() => {
    const dateStr = currentDate.toISOString().split('T')[0]
    return filteredEvents
      .filter(e => e.date === dateStr)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }, [filteredEvents, currentDate])

  const stats = [
    { label: 'TOTAL SCHEDULED', value: events.length, icon: 'event_available', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'UPCOMING (7D)', value: events.filter(e => new Date(e.date) >= new Date()).length, icon: 'schedule', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'HALL UTILIZATION', value: '84%', icon: 'location_on', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'PENDING ALERTS', value: '3', icon: 'notification_important', color: 'text-rose-600', bg: 'bg-rose-50' },
  ]

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (view === 'Day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    } else if (view === 'Month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto relative z-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <button onClick={() => router.back()} className="hover:text-indigo-600 transition-colors">Dashboard</button>
            <ChevronRight size={14} />
            <span className="text-indigo-600 font-bold tracking-tight">Events</span>
          </div>
          <h1 className="text-4xl font-bold text-[#1b1b24] tracking-tight">Event Scheduler</h1>
          <p className="text-[#575e70] text-lg">Coordinate campus activities, academic workshops, and institutional meetings.</p>
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
            onClick={() => { setSelectedEvent(null); setShowAddModal(true) }}
            className="flex items-center gap-2 bg-[#4f46e5] text-white font-semibold px-6 py-2.5 rounded-xl shadow-md hover:bg-indigo-700 active:opacity-80 transition-all"
          >
            <MaterialIcon icon="add_circle" className="text-xl" />
            <span>Schedule New Event</span>
          </button>
        </div>
      </div>

      {/* Dashboard Stats Summary (Bento Minimal) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={stat.label} className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-[#575e70] uppercase tracking-widest">{stat.label}</p>
              <MaterialIcon icon={stat.icon} className={`${stat.color} text-xl`} />
            </div>
            <p className="text-3xl font-bold text-[#1b1b24]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Control Bar: Navigation & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex p-1 bg-white rounded-xl border border-slate-200 shadow-sm">
            {VIEW_TYPES.map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  view === v ? 'bg-[#4f46e5] text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="h-8 w-[1px] bg-slate-200 mx-2" />
          <div className="flex items-center gap-3">
            <button onClick={() => handleDateChange('prev')} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-all"><ChevronLeft size={20} /></button>
            <span className="text-sm font-bold text-slate-700 min-w-[140px] text-center uppercase tracking-wider">
              {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button onClick={() => handleDateChange('next')} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-all"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="flex-1 relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events or locations..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
          />
        </div>
      </div>

      {/* Filters: Category Row */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
            !selectedCategory 
              ? 'bg-[#4f46e5] text-white border-indigo-600 shadow-sm' 
              : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
          }`}
        >
          All Categories
        </button>
        {Object.keys(EVENT_STYLES).map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
              selectedCategory === cat 
                ? 'bg-[#4f46e5] text-white border-indigo-600 shadow-sm' 
                : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main View Area */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={view + currentDate.toISOString()}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden min-h-[600px]"
        >
          {view === 'Day' && (
            <DayView 
              events={dayEvents} 
              onAddClick={() => { setSelectedEvent(null); setShowAddModal(true) }} 
              onEdit={(e) => { setSelectedEvent(e); setShowAddModal(true) }}
              onDelete={handleDelete}
            />
          )}
          {view === 'Month' && <MonthView events={filteredEvents} currentDate={currentDate} setCurrentDate={setCurrentDate} />}
          
          {view === 'Day' && dayEvents.length === 0 && (
            <div className="py-32 flex flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
                <MaterialIcon icon="event_busy" className="text-4xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Quiet Day Ahead</h3>
              <p className="text-slate-500 mt-2 max-w-xs mx-auto">No events scheduled for this date. Use the 'Schedule' button to fill the slot.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <AddEventModal 
            editItem={selectedEvent}
            onClose={() => { setShowAddModal(false); setSelectedEvent(null) }} 
            onSave={handleSave} 
          />
        )}
        {showCSV && (
          <CSVUploader 
            onClose={() => setShowCSV(false)}
            onUpload={(data) => {
              const newEvents = data.map((d, i) => ({ ...d, id: `bulk-${Date.now()}-${i}` }))
              setEvents(prev => [...prev, ...newEvents])
              setShowCSV(false)
              toast.success(`${data.length} events imported`)
            }}
            sampleHeaders={['title', 'type', 'date', 'start_time', 'end_time', 'location', 'description']}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// --- Enhanced Sub-Components ---

function DayView({ events, onAddClick, onEdit, onDelete }: { 
  events: Event[], 
  onAddClick: () => void,
  onEdit: (e: Event) => void,
  onDelete: (id: string) => void
}) {
  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ]

  return (
    <div className="relative p-10">
      {/* Time Indicator Line */}
      <div className="absolute left-[110px] top-10 bottom-10 w-[1px] bg-slate-100" />
      
      <div className="space-y-16">
        {timeSlots.map((time, idx) => {
          const slotEvents = events.filter(e => {
            const startHour = parseInt(e.start_time.split(':')[0])
            const hour12 = startHour > 12 ? `${startHour-12}:00 PM` : startHour === 12 ? '12:00 PM' : `${startHour.toString().padStart(2, '0')}:00 AM`
            return hour12 === time || (time === '08:00 AM' && startHour < 8)
          })

          return (
            <div key={time} className="relative flex items-start gap-12 group">
              {/* Time Label */}
              <div className="w-[80px] pt-1 text-right">
                <span className="text-[10px] font-black tracking-widest uppercase text-slate-400 group-hover:text-indigo-600 transition-colors">
                  {time}
                </span>
              </div>

              {/* Connector Dot */}
              <div className="absolute left-[106px] top-2 w-2 h-2 rounded-full bg-slate-200 border-2 border-white z-10 group-hover:bg-indigo-400 group-hover:scale-125 transition-all" />

              {/* Event Content Area */}
              <div className="flex-1 min-h-[40px]">
                <div className="space-y-4">
                  {slotEvents.map(event => {
                    const style = EVENT_STYLES[event.type] || EVENT_STYLES.Exhibition
                    return (
                      <motion.div 
                        key={event.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`relative p-6 rounded-[28px] border ${style.border} bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group/card cursor-pointer overflow-hidden`}
                      >
                        {/* Status Accent Bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: style.accent }} />
                        
                        <div className="flex justify-between items-start mb-4 relative z-10">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.bg} ${style.text}`}>
                              <MaterialIcon icon={style.icon} className="text-xl" />
                            </div>
                            <div>
                              <span className={`text-[10px] font-black uppercase tracking-wider ${style.text}`}>
                                {event.type}
                              </span>
                              <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px]">
                                <Clock size={12} />
                                <span>{event.start_time} - {event.end_time}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-all translate-x-4 group-hover/card:translate-x-0">
                            <button 
                              onClick={(e) => { e.stopPropagation(); onEdit(event) }}
                              className="p-2.5 bg-slate-50 hover:bg-indigo-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); onDelete(event.id) }}
                              className="p-2.5 bg-slate-50 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        
                        <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover/card:text-indigo-600 transition-colors">{event.title}</h4>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-6 leading-relaxed">
                          {event.description || "Orchestrating excellence through institutional coordination and strategic alignment."}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50 relative z-10">
                          <div className="flex items-center gap-6">
                            {event.location && (
                              <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                                <MaterialIcon icon="location_on" className="text-slate-400 text-lg" />
                                <span>{event.location}</span>
                              </div>
                            )}
                            {event.attendees_count && (
                              <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                                <MaterialIcon icon="group" className="text-slate-400 text-lg" />
                                <span>{event.attendees_count} Enrolled</span>
                              </div>
                            )}
                          </div>

                          {event.priority === 'High' && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black rounded-full border border-rose-100 uppercase tracking-wider">
                              <MaterialIcon icon="priority_high" className="text-xs" /> Priority
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}

                  {/* Available Slot Indicator */}
                  {slotEvents.length === 0 && (
                    <button 
                      onClick={onAddClick}
                      className="w-full py-6 border-2 border-dashed border-slate-100 rounded-[28px] flex items-center justify-between px-10 text-slate-300 hover:border-indigo-200 hover:bg-indigo-50/30 hover:text-indigo-400 transition-all group/slot"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover/slot:bg-white group-hover/slot:rotate-90 group-hover/slot:shadow-lg transition-all duration-500">
                          <Plus size={20} />
                        </div>
                        <div className="text-left">
                          <p className="text-[11px] font-black uppercase tracking-widest text-slate-300 group-hover/slot:text-indigo-400">Available Slot</p>
                          <p className="text-[10px] font-bold text-slate-200 group-hover/slot:text-indigo-300 mt-1">Ready for institutional coordination</p>
                        </div>
                      </div>
                      <div className="px-5 py-2 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-wider group-hover/slot:bg-indigo-600 group-hover/slot:text-white transition-all shadow-sm">
                        Schedule Event
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MonthView({ events, currentDate, setCurrentDate }: { events: Event[], currentDate: Date, setCurrentDate: (d: Date) => void }) {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const today = new Date()
  
  return (
    <div className="p-8">
      <div className="grid grid-cols-7 border-b border-slate-100 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 border-l border-t border-slate-50">
        {Array.from({ length: 42 }).map((_, idx) => {
          const day = idx - firstDayOfMonth + 1
          const isCurrentMonth = day > 0 && day <= daysInMonth
          const dateStr = isCurrentMonth ? `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}` : ''
          const dayEvents = isCurrentMonth ? events.filter(e => e.date === dateStr) : []
          const isToday = isCurrentMonth && day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()

          return (
            <div key={idx} className={`border-r border-b border-slate-50 min-h-[140px] p-4 flex flex-col gap-2 hover:bg-slate-50/50 transition-all cursor-pointer group ${!isCurrentMonth && 'bg-slate-50/10 opacity-40'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-black ${isToday ? 'w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-xl shadow-lg' : isCurrentMonth ? 'text-slate-800' : 'text-slate-200'}`}>
                  {isCurrentMonth ? day : ''}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter bg-indigo-50 px-1.5 rounded-md">
                    {dayEvents.length} EV
                  </span>
                )}
              </div>
              
              <div className="space-y-1.5">
                {dayEvents.slice(0, 3).map(e => (
                  <div key={e.id} className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border border-opacity-20 truncate shadow-sm group-hover:translate-x-1 transition-transform`} style={{ backgroundColor: `${EVENT_STYLES[e.type]?.accent}10`, color: EVENT_STYLES[e.type]?.accent, borderColor: EVENT_STYLES[e.type]?.accent }}>
                    {e.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-[9px] font-bold text-slate-400 pl-1">+{dayEvents.length - 3} more</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AddEventModal({ editItem, onClose, onSave }: { editItem: Event | null, onClose: () => void, onSave: (e: Partial<Event>) => void }) {
  const [form, setForm] = useState<Partial<Event>>(editItem ?? {
    type: 'Academic',
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '10:00',
    priority: 'Normal'
  })

  const set = (k: keyof Event, v: any) => setForm(p => ({ ...p, [k]: v }))

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
            <div className="w-14 h-14 bg-indigo-600 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-indigo-200">
              <MaterialIcon icon="event" className="text-2xl" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editItem ? 'Refine Event' : 'Schedule Activity'}</h2>
              <p className="text-sm text-slate-500 font-medium">Coordinate institutional mission and execution</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-[20px] bg-white border border-slate-100 hover:bg-slate-50 text-slate-400 transition-all"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-12 py-10 space-y-10 no-scrollbar custom-scrollbar">
          {/* Section 1: Identification */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-5 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]" />
              <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em]">Activity Identification</h3>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2.5 ml-1">Official Title *</label>
                <input 
                  value={form.title ?? ''} 
                  onChange={e => set('title', e.target.value)} 
                  placeholder="e.g. International Research Symposium"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] text-base font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-100 outline-none transition-all" 
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2.5 ml-1">Event Category</label>
                  <div className="relative">
                    <select 
                      value={form.type ?? 'Academic'} 
                      onChange={e => set('type', e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] text-sm font-bold appearance-none focus:ring-4 focus:ring-indigo-100 outline-none cursor-pointer"
                    >
                      {Object.keys(EVENT_STYLES).map(t => <option key={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2.5 ml-1">Priority Matrix</label>
                  <div className="relative">
                    <select 
                      value={form.priority ?? 'Normal'} 
                      onChange={e => set('priority', e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] text-sm font-bold appearance-none focus:ring-4 focus:ring-indigo-100 outline-none cursor-pointer"
                    >
                      {['Low', 'Normal', 'High'].map(p => <option key={p}>{p}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Logistics */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-5 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]" />
              <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em]">Spatio-Temporal Logistics</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2.5 ml-1">Location / Venue</label>
                <div className="relative group">
                  <MapPin size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    value={form.location ?? ''} 
                    onChange={e => set('location', e.target.value)} 
                    placeholder="Search venue or enter specific location..."
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] text-sm font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-100 outline-none transition-all" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2.5 ml-1">Event Date</label>
                <input 
                  type="date"
                  value={form.date ?? ''} 
                  onChange={e => set('date', e.target.value)} 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2.5 ml-1">Start</label>
                  <input 
                    type="time"
                    value={form.start_time ?? ''} 
                    onChange={e => set('start_time', e.target.value)} 
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-[22px] text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2.5 ml-1">End</label>
                  <input 
                    type="time"
                    value={form.end_time ?? ''} 
                    onChange={e => set('end_time', e.target.value)} 
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-[22px] text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Context */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-5 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]" />
              <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em]">Contextual Framework</h3>
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2.5 ml-1">Mandate & Description</label>
              <textarea 
                rows={4}
                value={form.description ?? ''} 
                onChange={e => set('description', e.target.value)} 
                placeholder="Elaborate on the activity scope, target audience and institutional objectives..."
                className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[24px] text-sm font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-100 outline-none transition-all resize-none custom-scrollbar" 
              />
            </div>
          </div>
        </div>

        <div className="px-12 py-10 bg-slate-50 border-t border-slate-100 flex gap-5">
          <button 
            onClick={onClose}
            className="flex-1 py-5 bg-white border border-slate-200 text-slate-600 rounded-[24px] text-sm font-black hover:bg-slate-50 hover:shadow-lg transition-all active:scale-95"
          >
            Abort
          </button>
          <button 
            onClick={() => onSave(form)} 
            disabled={!form.title}
            className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-[24px] text-sm font-black shadow-2xl shadow-indigo-200 transition-all active:scale-95"
          >
            {editItem ? 'Confirm Refinement' : 'Authorize Schedule'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

