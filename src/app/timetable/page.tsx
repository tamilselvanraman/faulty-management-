'use client'

import { useState, useMemo, useEffect, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Filter, CalendarDays, ChevronLeft, Building2, 
  ArrowUpRight, MapPin, Maximize2, Settings2, Plus, X,
  GraduationCap, BookOpen, Clock, LayoutGrid, Users,
  BarChart3, FileText, Share2, Download, CheckCircle2,
  Calendar, Layers, Monitor, Sparkles, Upload, ChevronRight
} from 'lucide-react'
import { toast } from 'react-hot-toast'

// --- Types ---
interface ClassData {
  id: string
  hall_number: string
  type_building: string
  department: string
  academic_year: string
  section: string
  advisor_name: string
  subject?: string
}

const BUILDINGS = ['All', 'Main Building', 'Block B', 'Block C', 'Block D', 'Block E']

// --- Constants ---
const DEPARTMENTS = [
  { name: 'CSE', fullName: 'Computer Science Engineering', color: '#8B5CF6', icon: LayoutGrid, count: 24 },
  { name: 'ECE', fullName: 'Electronics & Communication', color: '#3B82F6', icon: Building2, count: 18 },
  { name: 'MECH', fullName: 'Mechanical Engineering', color: '#F59E0B', icon: Settings2, count: 15 },
  { name: 'CIVIL', fullName: 'Civil Engineering', color: '#64748B', icon: Building2, count: 12 },
  { name: 'BME', fullName: 'Biomedical Engineering', color: '#10B981', icon: Users, count: 10 },
  { name: 'AIDS', fullName: 'AI & Data Science', color: '#0EA5E9', icon: BarChart3, count: 20 },
  { name: 'MBA', fullName: 'Business Administration', color: '#F97316', icon: GraduationCap, count: 8 },
  { name: 'AENS', fullName: 'Arts & Natural Sciences', color: '#06B6D4', icon: BookOpen, count: 14 },
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const TIME_SLOTS = [
  { id: '1', time: '09:00 AM - 09:50 AM', label: '1st Hour' },
  { id: '2', time: '09:50 AM - 10:40 AM', label: '2nd Hour' },
  { id: 'break-1', time: '10:40 AM - 11:00 AM', label: 'Short Break' },
  { id: '3', time: '11:00 AM - 11:50 AM', label: '3rd Hour' },
  { id: '4', time: '11:50 AM - 12:40 PM', label: '4th Hour' },
  { id: 'break-2', time: '12:40 PM - 01:30 PM', label: 'Lunch Break' },
  { id: '5', time: '01:30 PM - 02:20 PM', label: '5th Hour' },
  { id: '6', time: '02:20 PM - 03:10 PM', label: '6th Hour' },
  { id: '7', time: '03:10 PM - 04:00 PM', label: '7th Hour' },
]


// --- Animations ---
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }
  })
}

function TimetableContent() {
  const searchParams = useSearchParams()
  const deptParam = searchParams.get('dept')
  const [selectedDept, setSelectedDept] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All')
  const [selectedBuilding, setSelectedBuilding] = useState('All')
  const [currentTimeProgress, setCurrentTimeProgress] = useState(0)
  const [currentTimeSlot, setCurrentTimeSlot] = useState<string | null>(null)
  const [currentDay, setCurrentDay] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const [timetableSlots, setTimetableSlots] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    const parseTimeToMinutes = (timeStr: string) => {
      const [timePart, ampm] = timeStr.trim().split(' ')
      const [hourStr, minStr] = timePart.split(':')
      let hour = parseInt(hourStr)
      const minutes = parseInt(minStr)
      if (ampm === 'PM' && hour !== 12) hour += 12
      if (ampm === 'AM' && hour === 12) hour = 0
      return hour * 60 + minutes
    }

    const updateTime = () => {
      const now = new Date()
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      setCurrentDay(dayNames[now.getDay()])
      
      const hour = now.getHours()
      const minutes = now.getMinutes()
      const currentMinutes = hour * 60 + minutes
      
      // Find closest slot
      const slot = TIME_SLOTS.find(t => {
        const [startStr, endStr] = t.time.split(' - ')
        const startMinutes = parseTimeToMinutes(startStr)
        const endMinutes = parseTimeToMinutes(endStr)
        return currentMinutes >= startMinutes && currentMinutes < endMinutes
      })
      
      if (slot) {
        setCurrentTimeSlot(slot.time)
        const [startStr, endStr] = slot.time.split(' - ')
        const startMinutes = parseTimeToMinutes(startStr)
        const endMinutes = parseTimeToMinutes(endStr)
        const totalSlotDuration = endMinutes - startMinutes
        setCurrentTimeProgress(((currentMinutes - startMinutes) / totalSlotDuration) * 100)
      } else {
        setCurrentTimeSlot(null)
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (deptParam) setSelectedDept(deptParam)
  }, [deptParam])

  useEffect(() => {
    if (!selectedDept) return
    const loadTimetableData = async () => {
      try {
        setLoadingSlots(true)
        const classRes = await fetch(`/api/classes?department=${selectedDept}`)
        const { data: classData } = await classRes.json()
        if (classData && classData.length > 0) {
          setClasses(classData)
          const firstClass = classData[0]
          const slotRes = await fetch(`/api/timetable?class_id=${firstClass.id}`)
          const { data: slotData } = await slotRes.json()
          if (slotData) setTimetableSlots(slotData)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingSlots(false)
      }
    }
    loadTimetableData()
  }, [selectedDept])

  const filteredDepts = useMemo(() => {
    return DEPARTMENTS.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           d.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDept = selectedDeptFilter === 'All' || d.name === selectedDeptFilter
      return matchesSearch && matchesDept
    })
  }, [searchQuery, selectedDeptFilter])

  const getSlotClass = (dept: string | null, day: string, slotIdx: number) => {
    if (!dept) return null
    const slot = TIME_SLOTS[slotIdx]
    if (!slot) return null
    
    // Skip if it's a break slot
    if (slot.label.toLowerCase().includes('break')) return null
    
    // Period number maps from slot index (skipping break indices if necessary, but simple period number works)
    let periodNumber = 0
    for (let i = 0; i <= slotIdx; i++) {
      if (!TIME_SLOTS[i].label.toLowerCase().includes('break')) {
        periodNumber++
      }
    }
    
    // Find matches in timetableSlots
    const matchingSlot = timetableSlots.find(s => 
      s.day_of_week === day && 
      s.period_number === periodNumber
    )
    
    if (!matchingSlot) {
      // Deterministic mock data fallback
      const hash = (dept.length + day.length + slotIdx) % 5
      if (hash > 2) return null
      
      const subjects = ['Core Engineering', 'Advanced Systems', 'Design Patterns', 'Data Analytics', 'Ethics & Tech']
      const advisors = ['Dr. Sarah Jenkins', 'Prof. Michael Chen', 'Dr. Elena Rodriguez', 'Prof. David Wilson', 'Dr. James Smith']
      
      return {
        id: `CLS-${dept}-${day}-${slotIdx}`,
        department: dept,
        academic_year: `${(hash % 4) + 1}st Year`,
        section: String.fromCharCode(65 + (hash % 3)), // A, B, C
        advisor_name: advisors[hash % advisors.length],
        subject: `${dept} - ${subjects[hash % subjects.length]}`,
      }
    }

    // Return live data
    const relatedClass = classes.find(c => c.id === matchingSlot.class_id)
    return {
      id: matchingSlot.id,
      department: dept,
      academic_year: relatedClass ? `${relatedClass.academic_year} Year` : 'I Year',
      section: relatedClass ? relatedClass.section : 'A',
      advisor_name: matchingSlot.faculty?.name || 'Unassigned',
      subject: matchingSlot.subject,
    }
  }

  const displayedDays = DAYS


  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        {selectedDept && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="w-full bg-white border-b border-slate-200/60"
          >
            <div className="max-w-[1600px] mx-auto px-4 h-12 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSelectedDept(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors border border-transparent hover:border-slate-200"
                >
                  <ChevronLeft size={14} />
                </button>
                <div className="h-4 w-px bg-slate-200 mx-0.5" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-[14px] font-black text-slate-900 tracking-tight">{selectedDept} Institutional Timetable</h2>
                      <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-wider border border-indigo-100">Live View</span>
                    </div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none mt-0.5">Main Campus • Batch 2024-28</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedDay && (
                  <button 
                    onClick={() => setSelectedDay(null)}
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
                  >
                    <X size={8} />
                    Clear Filter
                  </button>
                )}
                <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-slate-50 border border-slate-200/60">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Live</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1600px] mx-auto px-6 py-2">
        <AnimatePresence mode="wait">
          {!selectedDept ? (
            <motion.div key="landing" initial="hidden" animate="visible" className="space-y-10">
              {/* HERO & QUICK STATS */}
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.5fr)_420px] gap-12 items-start">
  {/* LEFT CONTENT */}
  <div className="max-w-3xl space-y-8">
    
    {/* Badge */}
    <motion.div
      variants={fadeUp}
      custom={1}
      className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/70 backdrop-blur-xl px-4 py-2 shadow-sm"
    >
      <Sparkles size={12} className="text-primary" />

      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">
        Control Center V2.0
      </span>
    </motion.div>

    {/* Heading */}
    <motion.div
      variants={fadeUp}
      custom={2}
      className="space-y-4"
    >
      <h1 className="text-4xl xl:text-6xl font-black tracking-[-0.04em] leading-[1.1] text-slate-900">
        Institutional{" "}
        <span className="relative inline-block">
          <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            Timetable
          </span>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute -bottom-1 left-0 h-2 w-full origin-left rounded-full bg-indigo-100"
          />
        </span>
      </h1>

      {/* FIXED DESCRIPTION */}
    <motion.p
  variants={fadeUp}
  custom={3}
  className="
    max-w-[500px]
    text-[18px]
    leading-relaxed
    text-slate-500
  "
>
  Unified institutional scheduling system for real-time timetable synchronization and automated resource management across the academic ecosystem.
</motion.p>
    </motion.div>
  </div>

  {/* RIGHT STATS */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
    {[
      {
        label: 'Active Depts',
        value: '08',
        icon: <Building2 size={18} />,
        gradient: 'from-indigo-500 via-purple-500 to-pink-500',
        change: '+2 this term',
      },
      {
        label: 'Classes Today',
        value: '142',
        icon: <Clock size={18} />,
        gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
        change: '92% attendance',
      },
      {
        label: 'Faculty Active',
        value: '86%',
        icon: <Users size={18} />,
        gradient: 'from-orange-400 via-amber-500 to-rose-500',
        change: 'Fully staffed',
      },
      {
        label: 'Resource Load',
        value: 'Low',
        icon: <BarChart3 size={18} />,
        gradient: 'from-blue-500 via-indigo-500 to-cyan-500',
        change: 'Optimal state',
      },
    ].map((stat, i) => (
      
<motion.div
  key={stat.label}
  variants={fadeUp}
  custom={4 + i}
  className={`
    relative overflow-hidden
    rounded-[20px]
    px-4 py-3
    text-white
    shadow-md
    hover:shadow-xl
    hover:-translate-y-1
    transition-all duration-300
    group
    h-[140px]
    w-full
    bg-gradient-to-br ${stat.gradient}
  `}
>
  {/* Overlay */}
  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

  {/* Small Glow */}
  <div className="absolute -top-5 -right-5 w-20 h-20 bg-white/10 rounded-full blur-2xl" />

  {/* Top */}
  <div className="relative z-10 flex items-start justify-between mb-5">

    {/* Icon */}
    <div
      className="
        w-9 h-9
        rounded-xl
        bg-white/15
        border border-white/15
        backdrop-blur-md
        flex items-center justify-center
      "
    >
      <div className="scale-[0.7]">
        {stat.icon}
      </div>
    </div>

    {/* Badge */}
    <span
      className="
        flex items-center gap-1
        text-[6px]
        font-bold
        uppercase
        tracking-[0.15em]
        px-2 py-1
        rounded-md
        bg-white/15
        border border-white/15
      "
    >
      <ArrowUpRight size={9} />
      {stat.change.split(" ")[0]}
    </span>
  </div>

  {/* Bottom Content */}
  <div className="relative z-10">
    <h2 className="text-[20px] leading-none font-black tracking-tight">
      {stat.value}
    </h2>

    <p
      className="
        mt-2
        text-[10px]
        font-extrabold
        uppercase
        tracking-[0.18em]
        text-white/90
      "
    >
      {stat.label}
    </p>

    <p className="mt-1 text-[10px] text-white/70 font-medium">
      {stat.change}
    </p>
  </div>
</motion.div>


    ))}
  </div>
</div>

              {/* COMMAND BAR & FILTERS */}
              <motion.div variants={fadeUp} custom={8} className="space-y-6 pt-4">
                <div className="flex flex-col md:flex-row gap-4 items-stretch">
                  <div className="relative flex-[4] group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                      <Search size={20} className="text-slate-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search departments, blocks, or faculty..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-white/60 backdrop-blur-xl border border-slate-200 rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all text-slate-900 font-bold text-sm shadow-sm placeholder:text-slate-400 placeholder:font-medium"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <div className="px-2 py-1 rounded-md bg-slate-100 text-[8px] font-black text-slate-400 border border-slate-200">⌘ K</div>
                    </div>
                  </div>
                  <div className="flex flex-1 gap-4">
                    <div className="relative flex-1 group">
                      <Building2 size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors pointer-events-none" />
                      <select 
                        value={selectedBuilding}
                        onChange={(e) => setSelectedBuilding(e.target.value)}
                        className="w-full pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-3xl text-xs font-bold text-slate-600 appearance-none outline-none hover:border-primary/20 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
                      >
                        {BUILDINGS.map(b => <option key={b} value={b}>{b === 'All' ? 'All Campuses' : b}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-primary transition-colors">
                        <ChevronRight size={16} className="rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* DEPARTMENT GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredDepts.map((dept, i) => (
                    <motion.button
                      key={dept.name}
                      variants={fadeUp} custom={9+i}
                      whileHover={{ y: -8, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedDept(dept.name)}
                      className="group p-6 bg-white border border-slate-200/80 rounded-[32px] text-left hover:border-primary/30 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] transition-all relative overflow-hidden"
                    >
                      {/* Interactive Background Accent */}
                      <div className="absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full opacity-0 group-hover:opacity-10 transition-opacity blur-2xl" style={{ backgroundColor: dept.color }} />
                      
                      <div className="flex items-start justify-between mb-8 relative">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm group-hover:shadow-lg group-hover:shadow-primary/30 group-hover:-rotate-6">
                          <dept.icon size={22} />
                        </div>
                        <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:border-primary/20 transition-all bg-white shadow-sm group-hover:bg-primary group-hover:text-white">
                          <ArrowUpRight size={16} />
                        </div>
                      </div>
                      
                      <div className="space-y-1 relative">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">{dept.name}</h3>
                        <p className="text-[10px] text-slate-400 font-bold leading-tight line-clamp-1 uppercase tracking-wider">{dept.fullName}</p>
                      </div>

                      <div className="mt-6 pt-6 border-t border-slate-100/60 flex items-center justify-between relative">
                        <div className="flex items-center gap-2.5">
                          <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: dept.color }}></span>
                            <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: dept.color }}></span>
                          </div>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{dept.count} Classes</span>
                        </div>
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 shadow-sm flex items-center justify-center overflow-hidden">
                              <div className="w-full h-full bg-slate-200" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              key="table" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="flex flex-col bg-white rounded-[24px] border border-slate-200/60 shadow-premium">
                <div className="flex-1 overflow-x-auto scrollbar-hide">
                  <table className="w-full min-w-[1000px] border-separate border-spacing-0 table-fixed">
                    <thead className="sticky top-0 z-[70]">
                      <tr className="bg-white">
                        <th className="sticky left-0 top-0 z-[90] bg-white p-3 text-left border-r border-b border-slate-200 w-[100px] shadow-[4px_0_12px_rgba(0,0,0,0.03)]">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[8px] font-black text-primary uppercase tracking-[0.1em]">Schedule</span>
                            <span className="text-[10px] font-black text-slate-900 tracking-tight">MATRIX</span>
                          </div>
                        </th>
                        {TIME_SLOTS.map(slot => (
                          <th key={slot.time} className={`p-1.5 text-center border-b border-r border-slate-200/80 bg-white transition-all relative ${currentTimeSlot === slot.time ? 'bg-primary/[0.03]' : ''}`}>
                            <div className="flex flex-col items-center py-1">
                              <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">{slot.label}</span>
                              <span className={`text-[8px] font-black transition-colors ${currentTimeSlot === slot.time ? 'text-primary' : 'text-slate-900'}`}>
                                {slot.time}
                              </span>
                            </div>
                            {currentTimeSlot === slot.time && (
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(79,70,229,0.4)]" />
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-transparent">
                      {displayedDays.map((day) => (
                        <tr 
                          key={day} 
                          className={`group transition-all duration-500 ${selectedDay && selectedDay !== day ? 'blur-[3px] opacity-20 grayscale-[0.5] scale-[0.98]' : 'opacity-100 blur-0 scale-100'}`}
                        >
                          <td 
                            onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                            className={`sticky left-0 z-40 bg-white/95 backdrop-blur-md p-2 border-r border-b border-slate-200/60 font-black text-[9px] transition-all cursor-pointer hover:bg-slate-50 shadow-[4px_0_12px_rgba(0,0,0,0.03)] ${currentDay === day ? 'text-primary border-l-[3px] border-l-primary' : 'text-slate-500 border-l-[3px] border-l-transparent'} ${selectedDay === day ? 'bg-primary/5' : ''}`}
                          >
                            <div className="flex flex-col">
                              <span className="uppercase tracking-[0.2em] text-[7px] text-slate-400 mb-0.5">{day.substring(0, 3)}</span>
                              <span className="text-[10px] tracking-tight">{day}</span>
                            </div>
                            {selectedDay === day && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <CheckCircle2 size={10} className="text-primary" />
                              </div>
                            )}
                          </td>
                          {TIME_SLOTS.map((slot, slotIdx) => {
                            const classItem = getSlotClass(selectedDept, day, slotIdx) as any
                            const isCurrent = currentTimeSlot === slot.time && currentDay === day
                            const deptColor = DEPARTMENTS.find(d => d.name === selectedDept)?.color || '#94a3b8'
                            
                            return (
                              <td 
                                key={`${day}-${slot.time}`} 
                                className={`p-1 border-r border-b border-slate-200/40 relative group/cell transition-colors ${isCurrent ? 'bg-primary/[0.04]' : 'hover:bg-slate-50/50'}`}
                              >
                                {isCurrent && (
                                  <div 
                                    className="absolute left-0 right-0 z-20 pointer-events-none flex items-center group/line"
                                    style={{ top: `${currentTimeProgress}%` }}
                                  >
                                    <div className="w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_rgba(79,70,229,0.5)] -ml-[2px]" />
                                    <div className="flex-1 h-[1px] bg-primary/40 shadow-[0_0_8px_rgba(79,70,229,0.2)]" />
                                  </div>
                                )}
                                {classItem ? (
                                  <motion.div 
                                    whileHover={{ y: -1, scale: 1.01 }}
                                    className="relative group/card cursor-pointer h-[68px]"
                                  >
                                    <div className="absolute inset-0 rounded-lg bg-white border border-slate-200/80 shadow-sm group-hover/card:shadow-md group-hover/card:border-primary/20 transition-all duration-300" />
                                    <div 
                                      className="absolute left-0 top-1 w-0.5 h-[80%] rounded-r-full opacity-60 group-hover/card:opacity-100 transition-opacity" 
                                      style={{ backgroundColor: deptColor }} 
                                    />
                                    <div className="relative p-2 z-10 flex flex-col h-full justify-between">
                                      <div className="flex items-start justify-between gap-1">
                                        <div className="flex flex-col">
                                          <div className="flex items-center gap-1 mb-0.5">
                                            <span className="px-1 py-0.2 rounded bg-slate-100 text-[5px] font-black text-slate-500 uppercase tracking-wider">{classItem.academic_year}</span>
                                            <span className="text-[5px] font-black text-primary uppercase tracking-widest">{classItem.section}</span>
                                          </div>
                                          <h4 className="text-[9px] font-black text-slate-800 leading-tight group-hover/card:text-primary transition-colors line-clamp-2">
                                            {classItem.subject}
                                          </h4>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 text-[7px] font-bold text-slate-400">
                                        <Users size={7} className="text-slate-300" />
                                        <span className="truncate">{classItem.advisor_name}</span>
                                      </div>
                                    </div>
                                  </motion.div>
                                ) : slot.label.toLowerCase().includes('break') ? (
                                  <div className="h-[68px] flex flex-col items-center justify-center relative overflow-hidden bg-slate-50/50 rounded-lg border border-slate-100/50 group/break">
                                    <div className="absolute inset-0 opacity-[0.02] group-hover/break:opacity-[0.04] transition-opacity" style={{ 
                                      backgroundImage: `repeating-linear-gradient(45deg, ${deptColor}, ${deptColor} 1px, transparent 1px, transparent 10px)`
                                    }} />
                                    <span className="relative z-10 text-[7px] font-black text-slate-400 uppercase tracking-[0.2em]">{slot.label}</span>
                                    <Clock size={10} className="relative z-10 text-slate-300 mt-1" />
                                  </div>
                                ) : (
                                  <div className="h-[68px] flex items-center justify-center relative overflow-hidden group/empty rounded-lg transition-all border border-transparent hover:border-dashed hover:border-slate-300 hover:bg-white hover:shadow-card">
                                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none group-hover/empty:opacity-[0.05]" style={{ 
                                      backgroundImage: `radial-gradient(circle at 1px 1px, ${deptColor} 1px, transparent 0)`,
                                      backgroundSize: '16px 16px'
                                    }} />
                                    <motion.button 
                                      whileHover={{ scale: 1.1, rotate: 90 }}
                                      className="w-5 h-5 rounded-md bg-white border border-slate-200 shadow-sm text-slate-300 opacity-0 group-hover/empty:opacity-100 transition-all hover:text-primary hover:border-primary/20 flex items-center justify-center z-10"
                                    >
                                      <Plus size={10} />
                                    </motion.button>
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
              </div>
            </motion.div>

          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function TimetablePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <TimetableContent />
    </Suspense>
  )
}
