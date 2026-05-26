'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  MoreVertical, Clock, MapPin, Filter, Search, X,
  CheckCircle2, AlertCircle, Info, Bookmark, CalendarDays,
  Users, Download, Upload, Pencil, Trash2, Tag
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

const CATEGORY_CONFIG = [
  { label: 'Academic', color: 'bg-indigo-600' },
  { label: 'Meeting', color: 'bg-orange-500' },
  { label: 'Social', color: 'bg-emerald-500' },
  { label: 'Recurring', color: 'bg-amber-500' },
]

const EVENT_TYPE_STYLES: Record<string, string> = {
  Academic: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  Meeting: 'bg-orange-50 text-orange-700 border-orange-100',
  Social: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Recurring: 'bg-amber-50 text-amber-700 border-amber-100',
}



export default function EventsPage() {
  const [view, setView] = useState<ViewType>('Month')
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)) // May 2026
  const [events, setEvents] = useState<Event[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCSV, setShowCSV] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/events')
      const { data } = await res.json()
      if (data && Array.isArray(data)) setEvents(data)
    } catch {
      // keep empty on error
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleAddEvent = async (newEvent: Omit<Event, 'id'>) => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      })
      if (!res.ok) throw new Error()
      const { data } = await res.json()
      setEvents(prev => [...prev, data])
      toast.success('Event scheduled successfully')
    } catch {
      toast.error('Failed to create event in database')
    }
  }

  const handleEditEvent = async (updated: Event) => {
    try {
      const res = await fetch(`/api/events/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      })
      if (!res.ok) throw new Error()
      const { data } = await res.json()
      setEvents(prev => prev.map(e => e.id === data.id ? data : e))
      setSelectedEvent(data)
      setEditingEvent(null)
      toast.success('Event updated successfully')
    } catch {
      toast.error('Failed to update event')
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Delete this event? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setEvents(prev => prev.filter(e => e.id !== id))
      setSelectedEvent(null)
      toast.success('Event deleted')
    } catch {
      toast.error('Failed to delete event')
    }
  }

  const handleBulkUpload = async (data: any[]) => {
    const newEvents = data.map(item => ({
      title: item.title || 'Untitled Event',
      type: item.type || 'Academic',
      date: item.date || new Date().toISOString().split('T')[0],
      time: item.time || '09:00',
      location: item.location || 'Online',
      description: item.description || '',
      priority: item.priority || 'Normal'
    }))

    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'events', rows: newEvents })
      })
      if (!res.ok) throw new Error()
      fetchEvents()
      toast.success(`${newEvents.length} events imported successfully`)
    } catch {
      toast.error('Failed to import events')
    } finally {
      setShowCSV(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="pb-6 border-b border-slate-100 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-[32px] font-black text-slate-900 tracking-tight leading-tight">
              Events Calendar
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:justify-end">
          {/* View Switcher */}
          <div className="flex p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200 w-full sm:w-auto shadow-sm">
            {(['Month', 'Week', 'Day'] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                  view === v 
                    ? 'bg-white text-indigo-600 shadow-md shadow-indigo-100' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Date Selector */}
          <div className="flex items-center justify-between sm:justify-start gap-4 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all w-full sm:w-auto">
            <button 
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm sm:text-[15px] font-bold text-slate-900 min-w-[120px] text-center tracking-tight">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button 
              onClick={handleNextMonth}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
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
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
            >
              <Download size={16} /> <span className="hidden sm:inline">Format</span><span className="sm:hidden">Template</span>
            </button>
            <button 
              onClick={() => setShowCSV(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
            >
              <Upload size={16} /> <span>Import</span>
            </button>
          </div>
          </div>
        </div>
        <p className="text-slate-500 text-sm sm:text-base font-medium max-w-4xl leading-relaxed">
          Manage and track all campus events, academic schedules, and institutional activities in one centralized view.
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {view === 'Month' && <MonthView currentDate={currentDate} events={events} onSelect={setSelectedEvent} />}
          {view === 'Week' && <WeekView currentDate={currentDate} events={events} />}
          {view === 'Day' && <DayView currentDate={currentDate} events={events} />}
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

      {/* Event Detail / Edit Modal */}
      <PortalModal>
        <AnimatePresence>
          {selectedEvent && !editingEvent && (
            <EventDetailModal
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
              onEdit={() => setEditingEvent(selectedEvent)}
              onDelete={handleDeleteEvent}
            />
          )}
          {editingEvent && (
            <EditEventModal
              event={editingEvent}
              onClose={() => { setEditingEvent(null); setSelectedEvent(null) }}
              onSave={handleEditEvent}
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

function MonthView({ currentDate, events, onSelect }: { currentDate: Date, events: Event[], onSelect: (e: Event) => void }) {
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
        {/* Categories Card — real counts from DB */}
        <div className="bg-white border border-slate-200 rounded-[24px] sm:rounded-[32px] p-5 sm:p-6 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-6">Categories</h3>
          <div className="space-y-4">
            {CATEGORY_CONFIG.map((cat) => {
              const count = events.filter(e => e.type === cat.label).length
              return (
                <div key={cat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                    <span className="text-[15px] font-bold text-slate-600">{cat.label}</span>
                  </div>
                  <span className="bg-slate-50 px-3 py-1 rounded-lg text-xs font-black text-slate-400">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Today Card */}
        <div className="bg-white border border-slate-200 rounded-[24px] sm:rounded-[32px] p-5 sm:p-6 shadow-sm">
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
        <div className="relative rounded-[24px] sm:rounded-[32px] overflow-hidden group aspect-[4/3]">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/70">CAMPUS SPOTLIGHT</span>
            <h4 className="text-lg font-black text-white mt-1">Annual Science Fair</h4>
            <p className="text-white/60 text-xs font-bold mt-1">May 2026</p>
          </div>
          <Image 
            src="/images/science-fair.png" 
            alt="Campus Spotlight" 
            fill 
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="lg:col-span-9 bg-white border border-slate-200 rounded-[24px] sm:rounded-[32px] overflow-x-auto scrollbar-hide shadow-sm">
        <div className="min-w-[600px] sm:min-w-[800px]">
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
                <div key={i} className="min-h-[100px] sm:min-h-[140px] p-2 sm:p-3 border-r border-b border-slate-100 last:border-r-0 group hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-start mb-1 sm:mb-2">
                    {day && (
                      <span className={`text-[11px] sm:text-[13px] font-black w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg sm:rounded-xl transition-all ${
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
                        onClick={() => onSelect(e)}
                        className={`px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border text-[8px] sm:text-[9px] font-black leading-tight break-words uppercase tracking-tighter transition-all hover:scale-[1.02] cursor-pointer shadow-sm ${EVENT_TYPE_STYLES[e.type]}`}
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
    </div>
  )
}

function WeekView({ currentDate, events }: { currentDate: Date, events: Event[] }) {
  const timeSlots = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM']
  
  // Calculate days of the week based on currentDate
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek)
      d.setDate(startOfWeek.getDate() + i)
      return d
    })
  }, [currentDate])

  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay())

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Mobile Day Selector (Horizontal Scroll) */}
      <div className="lg:hidden flex overflow-x-auto gap-3 pb-2 scrollbar-hide -mx-4 px-4">
        {weekDays.map((date, i) => {
          const isActive = selectedDayIndex === i
          const isToday = new Date().toDateString() === date.toDateString()
          return (
            <button
              key={i}
              onClick={() => setSelectedDayIndex(i)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl border transition-all ${
                isActive 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                  : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              <span className="text-xl font-black mt-1">{date.getDate()}</span>
              {isToday && !isActive && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1" />}
            </button>
          )
        })}
      </div>

      {/* Desktop Weekly Grid */}
      <div className="hidden lg:block bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm relative">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-[1100px]">
            {/* Grid Header */}
            <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-0 z-30">
              <div className="p-4 border-r border-slate-100 flex items-center justify-center sticky left-0 bg-white/95 z-40 border-b border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</span>
              </div>
              {weekDays.map((date, i) => {
                const isToday = new Date().toDateString() === date.toDateString()
                return (
                  <div key={i} className={`p-5 text-center border-r border-slate-100 last:border-r-0 ${isToday ? 'bg-indigo-50/40 relative' : ''}`}>
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className={`text-2xl font-black mt-2 leading-none ${isToday ? 'text-indigo-600' : 'text-slate-900'}`}>
                      {date.getDate()}
                    </div>
                    {isToday && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-indigo-600 rounded-t-full shadow-[0_-4px_10px_rgba(79,70,229,0.3)]" />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Grid Body */}
            <div className="grid grid-cols-[100px_repeat(7,1fr)] relative">
              <div className="border-r border-slate-100 bg-slate-50/30 sticky left-0 z-20 backdrop-blur-sm shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
                {timeSlots.map(t => (
                  <div key={t} className="h-32 p-4 text-[10px] font-black text-slate-400 uppercase border-b border-slate-100 last:border-b-0 flex items-start justify-center">
                    <span className="mt-1 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">{t}</span>
                  </div>
                ))}
              </div>

              {weekDays.map((date, dayIdx) => {
                const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
                const dayEvents = events.filter(e => e.date === dateStr)
                
                return (
                  <div key={dayIdx} className={`relative border-r border-slate-100 last:border-r-0 group ${new Date().toDateString() === date.toDateString() ? 'bg-indigo-50/5' : ''}`}>
                    {timeSlots.map((_, i) => (
                      <div key={i} className="h-32 border-b border-slate-100 last:border-b-0 group-hover:bg-slate-50/30 transition-colors" />
                    ))}
                    
                    {dayEvents.map((event, eventIdx) => {
                      // Simple dynamic positioning based on index for demo
                      // A real implementation would parse 'event.time'
                      return (
                        <motion.div 
                          key={event.id}
                          whileHover={{ scale: 1.02, y: -2 }}
                          style={{ top: `${eventIdx * 140 + 20}px` }}
                          className={`absolute left-2 right-2 h-32 rounded-[24px] p-4 shadow-xl border border-white/10 z-10 cursor-pointer overflow-hidden flex flex-col group/evt ${
                            event.type === 'Academic' ? 'bg-indigo-600 text-white' : 
                            event.type === 'Meeting' ? 'bg-slate-900 text-white' : 'bg-emerald-500 text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                             <span className="px-2 py-0.5 bg-white/20 rounded-md text-[9px] font-black uppercase tracking-wider backdrop-blur-md">{event.type}</span>
                             <Clock size={12} className="opacity-60" />
                          </div>
                          <div className="text-[14px] font-black leading-tight uppercase tracking-tight line-clamp-2">{event.title}</div>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-1 text-[10px] font-medium opacity-80">
                              <MapPin size={10} /> {event.location}
                            </div>
                            <span className="text-[10px] font-black bg-white/10 px-2 py-1 rounded-lg">{event.time}</span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Agenda List */}
      <div className="lg:hidden space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
            {weekDays[selectedDayIndex].toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </h3>
          <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {events.filter(e => e.date === `${weekDays[selectedDayIndex].getFullYear()}-${(weekDays[selectedDayIndex].getMonth() + 1).toString().padStart(2, '0')}-${weekDays[selectedDayIndex].getDate().toString().padStart(2, '0')}`).length} Events
          </span>
        </div>
        
        <div className="space-y-4">
          {events.filter(e => e.date === `${weekDays[selectedDayIndex].getFullYear()}-${(weekDays[selectedDayIndex].getMonth() + 1).toString().padStart(2, '0')}-${weekDays[selectedDayIndex].getDate().toString().padStart(2, '0')}`).map(event => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm hover:shadow-md transition-all flex gap-4"
            >
              <div className={`w-1.5 rounded-full ${
                event.type === 'Academic' ? 'bg-indigo-600' : 
                event.type === 'Meeting' ? 'bg-slate-900' : 'bg-emerald-500'
              }`} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${
                    event.type === 'Academic' ? 'text-indigo-600' : 
                    event.type === 'Meeting' ? 'text-slate-900' : 'text-emerald-500'
                  }`}>{event.type}</span>
                  <span className="text-[10px] font-bold text-slate-400">{event.time}</span>
                </div>
                <h4 className="text-[16px] font-black text-slate-900 mb-2 leading-tight uppercase tracking-tight">{event.title}</h4>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <MapPin size={12} className="text-slate-300" />
                  <span>{event.location}</span>
                </div>
              </div>
            </motion.div>
          ))}
          
          {events.filter(e => e.date === `${weekDays[selectedDayIndex].getFullYear()}-${(weekDays[selectedDayIndex].getMonth() + 1).toString().padStart(2, '0')}-${weekDays[selectedDayIndex].getDate().toString().padStart(2, '0')}`).length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200">
              <CalendarDays size={40} className="text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold">No events scheduled for this day.</p>
              <button className="mt-4 text-indigo-600 text-xs font-black uppercase tracking-widest">+ Add Event</button>
            </div>
          )}
        </div>
      </div>

      {/* Stats and Legend Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
              <CalendarDays size={20} />
            </div>
            <h3 className="text-lg font-black text-slate-900">Resource Allocation</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { label: 'Room Occ.', value: '78%', change: '+4%', color: 'text-emerald-500' },
              { label: 'Faculty Ut.', value: '92%', change: '-2%', color: 'text-orange-500' },
              { label: 'Canceled', value: '03', change: null, color: '' }
            ].map((stat, i) => (
              <div key={i} className="p-4 sm:p-5 bg-slate-50 rounded-[20px] sm:rounded-[28px] border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-slate-900">{stat.value}</span>
                  {stat.change && <span className={`text-[10px] font-black ${stat.color}`}>{stat.change}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-6 sm:mb-8">Quick Legend</h3>
          <div className="grid grid-cols-2 gap-y-4 sm:gap-y-6">
            {[
              { type: 'Academic', color: 'bg-indigo-600' },
              { type: 'Meeting', color: 'bg-orange-500' },
              { type: 'Social', color: 'bg-emerald-500' },
              { type: 'Recurring', color: 'bg-amber-500' }
            ].map((item) => (
              <div key={item.type} className="flex items-center gap-3 group cursor-pointer">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${item.color} group-hover:scale-125 transition-transform`} />
                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{item.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )}

function DayView({ currentDate, events }: { currentDate: Date, events: Event[] }) {
  const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`
  const dayEvents = useMemo(() => events.filter(e => e.date === dateStr), [events, dateStr])
  
  const timeSlots = useMemo(() => {
    const slots = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM']
    return slots.map(time => {
      const event = dayEvents.find(e => e.time === time)
      return {
        time,
        status: event ? 'event' : (new Date().getHours() === parseInt(time) ? 'current' : 'empty'),
        event
      }
    })
  }, [dayEvents])

  const formattedDate = currentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric' 
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      {/* Main Agenda Section */}
      <div className="lg:col-span-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-[36px] font-black text-slate-900 tracking-tight leading-none">Daily Agenda</h2>
            <div className="flex items-center gap-2 text-slate-500 font-bold mt-2 text-sm sm:text-base">
              <CalendarIcon size={18} className="text-indigo-500" />
              <span>{formattedDate}</span>
            </div>
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-600 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all w-full sm:w-auto">
            <Filter size={18} /> Filter
          </button>
        </div>

        {/* Timeline Grid */}
        <div className="bg-white border border-slate-200 rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-4 sm:p-8 md:p-10">
            <div className="relative pl-12 sm:pl-20 md:pl-24 space-y-0">
              {/* Vertical Line */}
              <div className="absolute left-[44px] sm:left-[76px] md:left-[80px] top-4 bottom-4 w-1 bg-gradient-to-b from-slate-50 via-indigo-100 to-slate-50 rounded-full" />

              {timeSlots.map((slot, idx) => (
                <div key={idx} className="relative py-6 sm:py-8 first:pt-0 last:pb-0 group">
                  {/* Time Label */}
                  <div className="absolute -left-12 sm:-left-20 md:-left-24 w-10 sm:w-16 md:w-20 text-right">
                    <span className={`text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-widest leading-none ${slot.status === 'current' ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {slot.time}
                    </span>
                  </div>

                  {/* Node Indicator */}
                  <div className="absolute left-[39px] sm:left-[70px] md:left-[74px] top-7 sm:top-9 z-10 flex items-center justify-center">
                    {slot.status === 'current' ? (
                      <div className="relative">
                        <div className="absolute inset-0 bg-indigo-400 rounded-full animate-ping opacity-25" />
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-indigo-600 ring-4 ring-indigo-50 shadow-[0_0_15px_rgba(79,70,229,0.4)] relative z-10" />
                      </div>
                    ) : slot.status === 'event' ? (
                      <div className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-full bg-white border-[3px] sm:border-4 border-indigo-600 shadow-sm" />
                    ) : (
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-slate-100 group-hover:bg-indigo-200 transition-all duration-300 ring-4 ring-transparent group-hover:ring-indigo-50/50" />
                    )}
                  </div>

                  {/* Slot Content */}
                  <div className="pl-6 sm:pl-8 md:pl-10">
                    {slot.status === 'event' && slot.event && (
                      <motion.div 
                        whileHover={{ y: -4, scale: 1.005 }}
                        className="bg-white border border-slate-100 rounded-[24px] sm:rounded-[32px] p-5 sm:p-7 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(79,70,229,0.08)] hover:border-indigo-100 transition-all relative overflow-hidden group/card"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-50/30 to-transparent -mr-16 -mt-16 rounded-full blur-2xl group-hover/card:bg-indigo-100/40 transition-colors" />
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6 relative z-10">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest border ${
                              slot.event.type === 'Meeting' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                            }`}>
                              {slot.event.type}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                              <Clock size={14} className="text-slate-300" />
                              <span>{slot.event.time}</span>
                            </div>
                          </div>
                          <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 ring-1 ring-slate-100 overflow-hidden relative shadow-sm">
                                <Image src={`https://i.pravatar.cc/150?u=${i + idx + 50}`} alt="Avatar" fill className="object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>

                        <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 mb-4 sm:mb-6 tracking-tight group-hover/card:text-indigo-600 transition-colors relative z-10 uppercase">
                          {slot.event.title}
                        </h3>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 sm:pt-6 border-t border-slate-50 relative z-10">
                          <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                            <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                              <MapPin size={14} />
                            </div>
                            <span>{slot.event.location}</span>
                          </div>
                          
                          <button className="flex items-center gap-2 text-[11px] font-black text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest group/btn self-start sm:self-auto">
                            View Details
                            <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {slot.status === 'empty' && (
                      <div className="group/empty cursor-pointer py-1">
                        <div className="border-2 border-dashed border-slate-100 rounded-[20px] sm:rounded-[28px] p-4 sm:p-5 flex items-center justify-between group-hover/empty:border-indigo-200 group-hover/empty:bg-indigo-50/10 transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover/empty:bg-white group-hover/empty:text-indigo-600 group-hover/empty:shadow-lg group-hover/empty:scale-110 transition-all">
                              <Plus size={20} strokeWidth={3} />
                            </div>
                            <div>
                              <h4 className="text-sm sm:text-base font-black text-slate-400 group-hover/empty:text-indigo-900 transition-colors">Available Slot</h4>
                              <p className="text-[11px] text-slate-300 font-bold group-hover/empty:text-indigo-400 transition-colors uppercase tracking-wider mt-0.5">Click to schedule</p>
                            </div>
                          </div>
                          <div className="p-2 bg-slate-50/50 rounded-xl opacity-0 group-hover/empty:opacity-100 group-hover/empty:bg-indigo-100/50 transition-all">
                            <ChevronRight size={18} className="text-indigo-600" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="lg:col-span-4 space-y-6 sm:space-y-8">
        {/* Compact Calendar */}
        <div className="bg-white border border-slate-200 rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"><ChevronLeft size={18} /></button>
              <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"><ChevronRight size={18} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2 text-[14px] font-bold text-slate-500">
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1
              const isSelected = day === currentDate.getDate()
              return (
                <div key={day} className={`h-10 sm:h-11 flex items-center justify-center rounded-xl sm:rounded-2xl transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-110 font-black' 
                    : 'hover:bg-slate-50 hover:text-slate-900'
                }`}>
                  {day}
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[24px] sm:rounded-[32px] p-6 sm:p-7 text-white shadow-xl shadow-indigo-100/50">
            <div className="p-2 bg-white/20 rounded-xl w-fit mb-4">
              <CalendarIcon size={18} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">TOTAL EVENTS</p>
            <span className="text-3xl sm:text-4xl font-black">{dayEvents.length.toString().padStart(2, '0')}</span>
          </div>
          <div className="bg-slate-900 rounded-[24px] sm:rounded-[32px] p-6 sm:p-7 text-white shadow-xl">
            <div className="p-2 bg-white/10 rounded-xl w-fit mb-4">
              <Users size={18} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">CAPACITY</p>
            <span className="text-3xl sm:text-4xl font-black">84%</span>
          </div>
        </div>

        {/* Reminders Card */}
        <div className="bg-white border border-slate-200 rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900">Quick Reminders</h3>
            <span className="bg-indigo-50 text-[11px] font-black text-indigo-600 px-2.5 py-1 rounded-xl border border-indigo-100">2 New</span>
          </div>
          <div className="space-y-6">
            {[
              { title: 'Submit Budget Report', time: 'Today, 5:00 PM', color: 'bg-rose-500', icon: <Info size={14} /> },
              { title: 'Email Faculty Panel', time: 'Tomorrow, 10:00 AM', color: 'bg-indigo-600', icon: <Bookmark size={14} /> }
            ].map((rem, i) => (
              <div key={i} className="flex gap-4 group cursor-pointer p-1 rounded-2xl hover:bg-slate-50 transition-all">
                <div className={`w-10 h-10 rounded-xl ${rem.color.replace('bg-', 'bg-')}/10 flex items-center justify-center text-${rem.color.split('-')[1]}-600 flex-shrink-0`}>
                  {rem.icon}
                </div>
                <div>
                  <h4 className="text-[14px] sm:text-[15px] font-black text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">{rem.title}</h4>
                  <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tight">{rem.time}</p>
                </div>
              </div>
            ))}
            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-100 transition-all mt-4">
              View All Reminders
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AddEventModal({ onClose, onAdd }: { onClose: () => void, onAdd: (e: Omit<Event, 'id'>) => void }) {
  const todayStr = new Date().toISOString().split('T')[0]
  const [formData, setFormData] = useState({
    title: '',
    type: 'Academic' as Event['type'],
    date: todayStr,
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
        className="bg-white rounded-[32px] sm:rounded-[40px] w-[95vw] md:w-[672px] overflow-hidden shadow-2xl border border-white/20"
      >
        <div className="px-6 sm:px-10 py-6 sm:py-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Add New Event</h2>
            <p className="text-slate-500 font-medium text-sm sm:text-[15px] mt-1">Schedule a new academic or social activity.</p>
          </div>
          <button onClick={onClose} className="p-2 sm:p-3 hover:bg-white rounded-2xl transition-all shadow-sm">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 sm:p-10 space-y-6 sm:space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Title</label>
              <input 
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Annual Science Fair"
                className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl font-bold placeholder:text-slate-300 focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50 outline-none transition-all text-base sm:text-lg" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Type</label>
                <div className="relative">
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as Event['type']})}
                    className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl font-bold outline-none focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50 transition-all cursor-pointer appearance-none"
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
                  className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl font-bold outline-none focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50 transition-all" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
                <input 
                  type="time"
                  value={formData.time}
                  onChange={e => setFormData({...formData, time: e.target.value})}
                  className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl font-bold outline-none focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50 transition-all" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                <input 
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., Auditorium B"
                  className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl font-bold placeholder:text-slate-300 focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50 outline-none transition-all" 
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
                className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl font-bold placeholder:text-slate-300 focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50 outline-none transition-all resize-none min-h-[100px] sm:min-h-[120px]" 
              />
            </div>
          </div>

          <div className="p-6 sm:p-10 pt-0 flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 sm:py-5 bg-slate-100 text-slate-600 rounded-2xl sm:rounded-3xl font-black hover:bg-slate-200 transition-all text-base sm:text-lg"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-4 sm:py-5 bg-indigo-600 text-white rounded-2xl sm:rounded-3xl font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all text-base sm:text-lg"
            >
              Create Event
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Event Detail Modal — view full event, then edit or delete
// ─────────────────────────────────────────────────────────
function EventDetailModal({
  event, onClose, onEdit, onDelete
}: {
  event: Event
  onClose: () => void
  onEdit: () => void
  onDelete: (id: string) => void
}) {
  const typeColor = {
    Academic: 'bg-indigo-600',
    Meeting: 'bg-orange-500',
    Social: 'bg-emerald-500',
    Recurring: 'bg-amber-500',
  }[event.type] ?? 'bg-slate-500'

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-[32px] w-[95vw] md:w-[540px] overflow-hidden shadow-2xl"
      >
        {/* Coloured header band */}
        <div className={`${typeColor} px-8 py-6 flex items-start justify-between`}>
          <div>
            <span className="text-white/70 text-[10px] font-black uppercase tracking-widest">{event.type}</span>
            <h2 className="text-2xl font-black text-white mt-1 leading-tight">{event.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-2xl transition-all">
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* Detail rows */}
        <div className="px-8 py-6 space-y-4">
          <div className="flex items-center gap-3 text-slate-700">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <CalendarDays size={16} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
              <p className="text-[15px] font-bold text-slate-900">
                {new Date(event.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {event.time && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Clock size={16} className="text-orange-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</p>
                <p className="text-[15px] font-bold text-slate-900">{event.time}</p>
              </div>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <MapPin size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                <p className="text-[15px] font-bold text-slate-900">{event.location}</p>
              </div>
            </div>
          )}

          {event.description && (
            <div className="mt-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Description</p>
              <p className="text-sm font-medium text-slate-700 leading-relaxed">{event.description}</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="px-8 pb-8 flex gap-4">
          <button
            onClick={() => onDelete(event.id)}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-black text-sm hover:bg-red-100 transition-all"
          >
            <Trash2 size={16} /> Delete
          </button>
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
          >
            <Pencil size={16} /> Edit Event
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Edit Event Modal — pre-filled form to update an event
// ─────────────────────────────────────────────────────────
function EditEventModal({
  event, onClose, onSave
}: {
  event: Event
  onClose: () => void
  onSave: (e: Event) => void
}) {
  const [formData, setFormData] = useState({
    title: event.title,
    type: event.type,
    date: event.date,
    time: event.time ?? '',
    location: event.location ?? '',
    description: event.description ?? '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.date) return
    onSave({ ...event, ...formData })
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-[32px] sm:rounded-[40px] w-[95vw] md:w-[620px] overflow-hidden shadow-2xl"
      >
        <div className="px-8 py-7 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Event</h2>
            <p className="text-slate-500 font-medium text-sm mt-1">Update the details below and save.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-2xl transition-all shadow-sm">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Event Title</label>
              <input
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold placeholder:text-slate-300 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Type</label>
                <div className="relative">
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as Event['type'] })}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all cursor-pointer appearance-none"
                  >
                    <option>Academic</option>
                    <option>Meeting</option>
                    <option>Social</option>
                    <option>Recurring</option>
                  </select>
                  <ChevronRight size={16} className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                <input
                  required type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Start Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Location</label>
                <input
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Auditorium B"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold placeholder:text-slate-300 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold placeholder:text-slate-300 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all resize-none"
              />
            </div>
          </div>

          <div className="px-8 pb-8 flex gap-4">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
