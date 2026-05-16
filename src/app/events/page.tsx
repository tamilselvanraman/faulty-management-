'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  MoreVertical, Clock, MapPin, Filter, Search, X,
  CheckCircle2, AlertCircle, Info, Bookmark, CalendarDays,
  Users, Download, Upload
} from 'lucide-react'
import Image from 'next/image'
import PortalModal from '@/components/ui/PortalModal'
import CSVUploader from '@/components/ui/CSVUploader'
import toast from 'react-hot-toast'

// --- Types & Constants ---
type ViewType = 'Month' | 'Week' | 'Day'

interface Event {
  id: string
  title: string
  type: 'Academic' | 'Meeting' | 'Social' | 'Recurring'
  date: string
  time: string
  location: string
  description?: string
  priority?: 'High' | 'Normal'
  isWeekly?: boolean
}

const CATEGORIES = [
  { label: 'Academic', color: 'bg-indigo-600', count: 13 },
  { label: 'Meeting', color: 'bg-orange-500', count: 4 },
  { label: 'Social', color: 'bg-emerald-500', count: 8 },
]

const EVENT_TYPE_STYLES: Record<string, string> = {
  Academic: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  Meeting: 'bg-orange-50 text-orange-700 border-orange-100',
  Social: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Recurring: 'bg-amber-50 text-amber-700 border-amber-100',
}

const INITIAL_EVENTS: Event[] = [
  { id: '1', title: 'DEAN\'S MEETING', type: 'Meeting', date: '2026-05-02', time: '10:00 AM', location: 'Conference Room A' },
  { id: '2', title: 'MID-TERM SUBMISSION', type: 'Academic', date: '2026-05-14', time: '11:59 PM', location: 'Online' },
  { id: '3', title: 'SEMINAR', type: 'Academic', date: '2026-05-17', time: '10:00 AM', location: 'Main Hall', isWeekly: true },
  { id: '4', title: 'BASKETBALL TRYOUTS', type: 'Social', date: '2026-05-07', time: '4:00 PM', location: 'Gym' },
  { id: '5', title: 'CALCULUS LAB', type: 'Academic', date: '2026-05-09', time: '9:00 AM', location: 'Lab 2' },
  { id: '6', title: 'FACULTY LUNCH', type: 'Meeting', date: '2026-05-09', time: '1:00 PM', location: 'Cafeteria' },
  { id: '7', title: 'ALUMNI GALA', type: 'Social', date: '2026-05-23', time: '6:00 PM', location: 'Grand Ballroom' },
]

export default function EventsPage() {
  const [view, setView] = useState<ViewType>('Month')
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)) // May 2026
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCSV, setShowCSV] = useState(false)

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleAddEvent = (newEvent: Omit<Event, 'id'>) => {
    const eventWithId = {
      ...newEvent,
      id: Math.random().toString(36).substr(2, 9)
    }
    setEvents([...events, eventWithId as Event])
  }

  const handleBulkUpload = (data: any[]) => {
    const newEvents = data.map(item => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      priority: item.priority || 'Normal',
      type: item.type || 'Academic'
    }))
    setEvents(prev => [...newEvents, ...prev])
    setShowCSV(false)
    toast.success(`${newEvents.length} events imported successfully`)
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-black text-slate-900 tracking-tight leading-none">Events Calendar</h1>
          <p className="text-slate-500 font-medium mt-2">Manage and track all campus events and academic schedules.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="flex p-1 bg-slate-100/80 rounded-2xl border border-slate-200">
            {(['Month', 'Week', 'Day'] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  view === v 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-4 px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <button 
              onClick={handlePrevMonth}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-[15px] font-bold text-slate-900 min-w-[120px] text-center">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button 
              onClick={handleNextMonth}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <button 
            onClick={() => {
              const headers = ['title', 'type', 'date', 'time', 'location', 'description', 'priority']
              const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n"
              const encodedUri = encodeURI(csvContent)
              const link = document.createElement("a")
              link.setAttribute("href", encodedUri)
              link.setAttribute("download", "events_template.csv")
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              toast.success('Template downloaded')
            }}
            className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-all"
          >
            <Download size={16} /> Download Format
          </button>
          <button 
            onClick={() => setShowCSV(true)}
            className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-all"
          >
            <Upload size={16} /> Import
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {view === 'Month' && <MonthView currentDate={currentDate} events={events} />}
          {view === 'Week' && <WeekView />}
          {view === 'Day' && <DayView />}
        </motion.div>
      </AnimatePresence>

      {/* Add Event Modal — via Portal to avoid transform break */}
      <PortalModal>
        <AnimatePresence>
          {showAddModal && (
            <AddEventModal 
              onClose={() => setShowAddModal(false)} 
              onAdd={handleAddEvent}
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
              sampleHeaders={['title', 'type', 'date', 'time', 'location', 'description', 'priority']} 
            />
          )}
        </AnimatePresence>
      </PortalModal>

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
      >
        <Plus size={28} />
      </button>
    </div>
  )
}

function MonthView({ currentDate, events }: { currentDate: Date, events: Event[] }) {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  
  // Create an array for the grid
  const days = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDayOfMonth + 1
    return day > 0 && day <= daysInMonth ? day : null
  })

  const today = new Date()
  const isThisMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sidebar Controls */}
      <div className="lg:col-span-3 space-y-6">
        {/* Categories Card */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-6">Categories</h3>
          <div className="space-y-4">
            {CATEGORIES.map((cat) => (
              <div key={cat.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                  <span className="text-[15px] font-bold text-slate-600">{cat.label}</span>
                </div>
                <span className="bg-slate-50 px-3 py-1 rounded-lg text-xs font-black text-slate-400">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Today Card */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-6">Upcoming Today</h3>
          <div className="space-y-6">
            {events.filter(e => {
              const eDate = new Date(e.date)
              return eDate.getDate() === today.getDate() && 
                     eDate.getMonth() === today.getMonth() && 
                     eDate.getFullYear() === today.getFullYear()
            }).slice(0, 3).map(event => (
              <div key={event.id} className="flex gap-4 group">
                <div className={`w-1 rounded-full ${
                  event.type === 'Academic' ? 'bg-indigo-600' : 
                  event.type === 'Meeting' ? 'bg-orange-500' : 'bg-emerald-500'
                }`} />
                <div>
                  <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${
                    event.type === 'Academic' ? 'text-indigo-600' : 
                    event.type === 'Meeting' ? 'text-orange-500' : 'text-emerald-500'
                  }`}>
                    <span>{event.type}</span>
                    <span>•</span>
                    <span>{event.time}</span>
                  </div>
                  <h4 className="text-[15px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{event.title}</h4>
                  <p className="text-[13px] text-slate-400 font-medium">{event.location}</p>
                </div>
              </div>
            ))}
            {events.filter(e => {
               const eDate = new Date(e.date)
               return eDate.getDate() === today.getDate() && 
                      eDate.getMonth() === today.getMonth() && 
                      eDate.getFullYear() === today.getFullYear()
            }).length === 0 && (
              <p className="text-sm text-slate-400 font-medium italic">No events scheduled for today.</p>
            )}
          </div>
        </div>

        {/* Spotlight Card */}
        <div className="relative rounded-[32px] overflow-hidden group aspect-[4/3]">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/70">CAMPUS SPOTLIGHT</span>
            <h4 className="text-lg font-black text-white mt-1">Annual Science Fair</h4>
            <p className="text-white/60 text-xs font-bold mt-1">May 2026</p>
          </div>
          <Image 
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop" 
            alt="Campus" 
            fill 
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="lg:col-span-9 bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-4 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const dateStr = day ? `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}` : ''
            const dayEvents = events.filter(e => e.date === dateStr)
            const isToday = isThisMonth && day === today.getDate()

            return (
              <div key={i} className="min-h-[140px] p-3 border-r border-b border-slate-100 last:border-r-0 group hover:bg-slate-50/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  {day && (
                    <span className={`text-[13px] font-black w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
                      isToday 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' 
                        : 'text-slate-400 group-hover:text-slate-900'
                    }`}>
                      {day}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {dayEvents.map(e => (
                    <div 
                      key={e.id}
                      className={`px-2 py-1.5 rounded-xl border text-[9px] font-black leading-tight break-words uppercase tracking-tighter transition-all hover:scale-[1.02] cursor-pointer shadow-sm ${EVENT_TYPE_STYLES[e.type]}`}
                    >
                      <div className="flex flex-col">
                        <span>{e.title}</span>
                        <div className="flex items-center gap-1 mt-0.5 opacity-60">
                          <Clock size={8} />
                          <span>{e.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function WeekView() {
  const timeSlots = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM']
  const days = [
    { name: 'SUN', date: 10 },
    { name: 'MON', date: 11 },
    { name: 'TUE', date: 12 },
    { name: 'WED', date: 13 },
    { name: 'THU', date: 14, active: true },
    { name: 'FRI', date: 15 },
    { name: 'SAT', date: 16 },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        <div className="grid grid-cols-8 border-b border-slate-100 bg-slate-50/50">
          <div className="p-4 border-r border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center">GMT+2</div>
          {days.map(d => (
            <div key={d.name} className={`p-4 text-center border-r border-slate-100 last:border-r-0 ${d.active ? 'bg-white' : ''}`}>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.name}</div>
              <div className={`text-xl font-black mt-1 ${d.active ? 'text-indigo-600' : 'text-slate-900'}`}>
                {d.date}
                {d.active && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mx-auto mt-1" />}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-8">
          {/* Time column */}
          <div className="border-r border-slate-100">
            {timeSlots.map(t => (
              <div key={t} className="h-24 p-4 text-[10px] font-black text-slate-400 uppercase border-b border-slate-100 last:border-b-0 flex items-start justify-center">
                {t}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((d, dayIdx) => (
            <div key={dayIdx} className="relative border-r border-slate-100 last:border-r-0">
              {timeSlots.map((_, i) => (
                <div key={i} className="h-24 border-b border-slate-100 last:border-b-0" />
              ))}
              
              {/* Mock Placed Events */}
              {dayIdx === 1 && (
                <div className="absolute top-4 left-2 right-2 h-44 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[20px] p-4 text-white shadow-xl shadow-indigo-100/50 border border-white/10">
                  <div className="text-[13px] font-black leading-tight uppercase tracking-tight">Advanced Algorithms</div>
                  <div className="flex items-center gap-1 text-[11px] font-bold mt-2 opacity-80">
                    <MapPin size={12} /> Hall B-12
                  </div>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-[10px] font-black bg-white/20 px-2 py-1 rounded-lg">8:00 - 10:00</span>
                    <div className="flex -space-x-2">
                       {[1, 2].map(i => <div key={i} className="w-5 h-5 rounded-full border-2 border-indigo-600 bg-indigo-100" />)}
                    </div>
                  </div>
                </div>
              )}

              {d.active && (
                <div className="absolute top-52 left-2 right-2 h-24 bg-orange-50 border-l-4 border-orange-500 rounded-r-2xl p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-black text-orange-800">Weekly Dept Sync</span>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
                      <Clock size={12} className="text-orange-400" />
                    </motion.div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600/70 mt-2">
                    <MapPin size={10} /> Conference Rm 2
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
              <CalendarDays size={20} />
            </div>
            <h3 className="text-lg font-black text-slate-900">Resource Allocation</h3>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-5 bg-slate-50 rounded-[28px] border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Room Occ.</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">78%</span>
                <span className="text-[10px] font-black text-emerald-500">+4%</span>
              </div>
            </div>
            <div className="p-5 bg-slate-50 rounded-[28px] border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Faculty Ut.</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">92%</span>
                <span className="text-[10px] font-black text-orange-500">-2%</span>
              </div>
            </div>
            <div className="p-5 bg-slate-50 rounded-[28px] border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Canceled</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">03</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-6">Quick Legend</h3>
          <div className="grid grid-cols-2 gap-y-4">
            {Object.entries(EVENT_TYPE_STYLES).map(([type, style]) => (
              <div key={type} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  type === 'Academic' ? 'bg-indigo-600' : 
                  type === 'Meeting' ? 'bg-orange-500' : 
                  type === 'Social' ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
                <span className="text-sm font-bold text-slate-600">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function DayView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Daily Agenda</h2>
            <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
              <CalendarIcon size={16} /> Thursday, May 14, 2026
            </p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-all">
            <Filter size={16} /> Filter
          </button>
        </div>

        <div className="space-y-8 relative before:absolute before:left-[4.5rem] before:top-4 before:bottom-4 before:w-px before:bg-slate-200">
          <div className="flex gap-8 group">
            <div className="w-16 text-right pt-2">
              <span className="text-[11px] font-black text-slate-400 uppercase">08:00 AM</span>
            </div>
            <div className="relative pt-3.5">
              <div className="absolute -left-[1.65rem] top-5 w-3 h-3 rounded-full border-2 border-indigo-600 bg-white" />
            </div>
            <div className="flex-1" />
          </div>

          <div className="flex gap-8 group">
            <div className="w-16 text-right pt-2">
              <span className="text-[11px] font-black text-slate-400 uppercase">09:00 AM</span>
            </div>
            <div className="relative pt-3.5">
              <div className="absolute -left-[1.55rem] top-5 w-2 h-2 rounded-full bg-slate-300" />
            </div>
            <div className="flex-1 bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all relative overflow-hidden group">
              <div className="absolute right-8 top-8 text-slate-300 group-hover:text-slate-900 transition-colors cursor-pointer">
                <MoreVertical size={20} />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-indigo-50 text-[10px] font-black text-indigo-600 rounded-lg uppercase tracking-widest border border-indigo-100">Meeting</span>
                <span className="text-xs font-bold text-slate-400">9:00 AM – 10:30 AM</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-6">Dept. Curriculum Review</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-slate-100" />)}
                    <div className="w-9 h-9 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400">+4</div>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                    <MapPin size={16} /> Conference Room B
                  </div>
                </div>
                <div className="px-4 py-1.5 bg-orange-50 text-[10px] font-black text-orange-600 rounded-full border border-orange-100">
                   High Priority
                </div>
              </div>
            </div>
          </div>
          
          {/* Current Time Indicator */}
          <div className="flex gap-8 group">
            <div className="w-16 text-right pt-1">
              <span className="text-[13px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg shadow-sm shadow-indigo-100">12:30 PM</span>
            </div>
            <div className="relative pt-3.5 flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-indigo-100 z-10" />
              <div className="flex-1 w-px bg-indigo-600/30" />
            </div>
            <div className="flex-1 h-px bg-indigo-600/30 mt-[22px] self-start" />
          </div>

          <div className="flex gap-8 group">
            <div className="w-16 text-right pt-2" />
            <div className="relative pt-3.5" />
            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-[32px] p-8 flex items-center justify-between group hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-lg transition-all">
                  <Plus size={28} />
                </div>
                <div>
                  <h4 className="text-[17px] font-black text-slate-600 group-hover:text-indigo-900">Available Slot</h4>
                  <p className="text-[14px] text-slate-400 font-medium">No events scheduled for this time</p>
                </div>
              </div>
              <span className="text-sm font-black text-indigo-600 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all">Schedule Event</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900">May 2026</h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"><ChevronLeft size={18} /></button>
              <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"><ChevronRight size={18} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-center text-[10px] font-black text-slate-300">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2 text-[14px] font-bold text-slate-400">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className={`h-10 flex items-center justify-center rounded-xl transition-all ${i === 4 ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-110' : 'hover:bg-slate-50'}`}>
                {10 + i}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[32px] p-7 text-white shadow-xl shadow-indigo-100">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">TOTAL EVENTS</p>
            <span className="text-4xl font-black">08</span>
          </div>
          <div className="bg-slate-900 rounded-[32px] p-7 text-white shadow-xl">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">ROOM CAP.</p>
            <span className="text-4xl font-black">84%</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900">Quick Reminders</h3>
            <span className="w-7 h-7 bg-indigo-50 text-[11px] font-black text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">3</span>
          </div>
          <div className="space-y-6">
            {[
              { title: 'Submit Budget Report', time: 'by 5:00 PM', color: 'bg-rose-500' },
              { title: 'Email Faculty Panel', time: 'Tomorrow, 10:00 AM', color: 'bg-indigo-600' }
            ].map((rem, i) => (
              <div key={i} className="flex gap-5 group cursor-pointer">
                <div className={`w-1.5 h-1.5 rounded-full ${rem.color} mt-2 flex-shrink-0 group-hover:scale-150 transition-transform`} />
                <div>
                  <h4 className="text-[15px] font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{rem.title}</h4>
                  <p className="text-[13px] text-slate-400 font-medium mt-1">{rem.time}</p>
                </div>
              </div>
            ))}
            <button className="w-full py-4 bg-slate-50 rounded-2xl text-sm font-black text-indigo-600 border border-slate-100 hover:bg-indigo-600 hover:text-white transition-all">
              View All Reminders
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AddEventModal({ onClose, onAdd }: { onClose: () => void, onAdd: (e: Omit<Event, 'id'>) => void }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'Academic' as Event['type'],
    date: '2026-05-14',
    time: '09:00',
    location: '',
    description: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.date) return
    onAdd(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/20"
      >
        <div className="px-10 py-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Add New Event</h2>
            <p className="text-slate-500 font-medium text-[15px] mt-1">Schedule a new academic or social activity.</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Title</label>
              <input 
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Annual Science Fair"
                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold placeholder:text-slate-300 focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50 outline-none transition-all text-lg" 
              />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Type</label>
                <div className="relative">
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as Event['type']})}
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold outline-none focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50 transition-all cursor-pointer appearance-none"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Social">Social</option>
                    <option value="Recurring">Recurring</option>
                  </select>
                  <ChevronRight size={18} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                <input 
                  required
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold outline-none focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50 transition-all" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
                <input 
                  type="time"
                  value={formData.time}
                  onChange={e => setFormData({...formData, time: e.target.value})}
                  className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold outline-none focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50 transition-all" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                <input 
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., Auditorium B"
                  className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold placeholder:text-slate-300 focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50 outline-none transition-all" 
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Provide details about the event venue, agenda, and participants..."
                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold placeholder:text-slate-300 focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50 outline-none transition-all resize-none min-h-[120px]" 
              />
            </div>
          </div>

          <div className="p-10 pt-0 flex gap-6 bg-white">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-3xl font-black hover:bg-slate-200 transition-all text-lg"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg"
            >
              Create Event
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
