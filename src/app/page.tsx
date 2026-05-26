'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users, GraduationCap, BookOpen, CalendarDays,
  TrendingUp, CheckCircle2, Clock, AlertTriangle, AlertCircle,
  ArrowUpRight, BarChart3, Calendar, CheckSquare, Presentation
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] as any } }),
}

const DEPT_COLORS = ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1']

const mockAttendance = [
  { month: 'Jan', attendance: 88 },
  { month: 'Feb', attendance: 82 },
  { month: 'Mar', attendance: 91 },
  { month: 'Apr', attendance: 87 },
  { month: 'May', attendance: 79 },
]

const recentActivity = [
  { id: 1, title: 'IQAC Annual Meeting scheduled', time: '2 hours ago', icon: <Calendar size={20} />, type: 'event' },
  { id: 2, title: 'Dr. Priya Sharma joined as Associate Professor', time: '5 hours ago', icon: <Users size={20} />, type: 'faculty' },
  { id: 3, title: '15 students below 75% attendance', time: '1 day ago', icon: <AlertTriangle size={20} />, type: 'alert' },
  { id: 4, title: 'Timetable updated for CSE – III Year', time: '1 day ago', icon: <Presentation size={20} />, type: 'timetable' },
  { id: 5, title: 'Annual Sports Day task marked complete', time: '2 days ago', icon: <CheckSquare size={20} />, type: 'task' },
]

const upcomingEvents = [
  { id: 1, title: 'Semester Exam – Theory', date: 'May 20, 2025', type: 'Exam', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  { id: 2, title: 'Faculty Development Program', date: 'May 22, 2025', type: 'Program', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  { id: 3, title: 'NAAC Committee Meeting', date: 'May 25, 2025', type: 'Meeting', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  { id: 4, title: 'Annual Day Celebration', date: 'June 1, 2025', type: 'Event', color: 'bg-slate-50 text-slate-700 border-slate-200' },
]

interface KPICard {
  label: string
  value: string
  change: string
  positive: boolean
  icon: React.ReactNode
  gradient: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<KPICard[]>([
    { label: 'Total Faculty', value: '—', change: 'Loading...', positive: true, icon: <Users size={24} />, gradient: 'from-indigo-500 via-purple-500 to-pink-500' },
    { label: 'Active Students', value: '—', change: 'Loading...', positive: true, icon: <GraduationCap size={24} />, gradient: 'from-emerald-400 via-teal-500 to-cyan-500' },
    { label: 'Total Classes', value: '—', change: 'Loading...', positive: true, icon: <BookOpen size={24} />, gradient: 'from-orange-400 via-amber-500 to-rose-500' },
    { label: 'Events This Month', value: '—', change: 'Loading...', positive: true, icon: <CalendarDays size={24} />, gradient: 'from-blue-500 via-indigo-500 to-cyan-500' },
  ])
  const [loading, setLoading] = useState(true)
  const [deptChartData, setDeptChartData] = useState<{ name: string; count: number }[]>([])
  const [taskPieData, setTaskPieData] = useState([
    { name: 'Completed', value: 0, color: '#059669' },
    { name: 'In Progress', value: 0, color: '#64748b' },
    { name: 'Pending', value: 0, color: '#94a3b8' },
  ])

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(({ data }) => {
        if (data) {
          setStats([
            { label: 'Total Faculty', value: data.faculty?.toLocaleString() ?? '0', change: `${data.faculty ?? 0} registered`, positive: true, icon: <Users size={24} />, gradient: 'from-indigo-500 via-purple-500 to-pink-500' },
            { label: 'Active Students', value: data.students?.toLocaleString() ?? '0', change: `${data.students ?? 0} enrolled`, positive: true, icon: <GraduationCap size={24} />, gradient: 'from-emerald-400 via-teal-500 to-cyan-500' },
            { label: 'Total Classes', value: data.classes?.toString() ?? '0', change: 'Across departments', positive: true, icon: <BookOpen size={24} />, gradient: 'from-orange-400 via-amber-500 to-rose-500' },
            { label: 'Events This Month', value: data.events?.toString() ?? '0', change: 'This month', positive: true, icon: <CalendarDays size={24} />, gradient: 'from-blue-500 via-indigo-500 to-cyan-500' },
          ])
          // Chart data from real DB
          if (data.faculty_by_dept?.length > 0) {
            setDeptChartData(data.faculty_by_dept)
          } else if (data.students_by_dept?.length > 0) {
            setDeptChartData(data.students_by_dept)
          }
          setTaskPieData([
            { name: 'Completed', value: data.tasks_completed ?? 0, color: '#059669' },
            { name: 'In Progress', value: data.tasks_in_progress ?? 0, color: '#64748b' },
            { name: 'Pending', value: data.tasks_pending ?? 0, color: '#94a3b8' },
          ])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h1 text-on-surface tracking-tight font-black">Dashboard</h1>
          <p className="text-body-sm text-on-surface-variant mt-1 font-medium">Welcome back, Admin · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-on-surface/5 text-on-surface rounded-full text-xs font-bold border border-outline-variant backdrop-blur-md">
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            System Online
          </span>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <motion.div key={s.label} variants={fadeUp} initial="hidden" animate="visible" custom={i + 1}>
            <div className={`relative overflow-hidden rounded-[32px] p-6 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group bg-gradient-to-br ${s.gradient}`}>
              {/* Glass overlay */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Decorative blob */}
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
              
              <div className="relative z-10 flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {s.icon}
                </div>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 text-white shadow-sm">
                  <ArrowUpRight size={14} />
                  {s.change.split(' ')[0]}
                </span>
              </div>
              <div className="relative z-10">
                <p className="text-4xl font-black tracking-tighter drop-shadow-sm">
                  {loading ? <span className="inline-block w-20 h-10 bg-white/20 rounded-xl animate-pulse" /> : s.value}
                </p>
                <p className="text-xs font-black mt-2 uppercase tracking-[0.15em] opacity-90">{s.label}</p>
                <p className="text-[11px] font-bold mt-1 text-white/70">{s.change}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart — Faculty by Dept (real data) */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5}
          className="lg:col-span-2 bg-surface rounded-[32px] border border-outline p-8 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-on-surface">Faculty by Department</h3>
              <p className="text-sm font-medium text-on-surface-variant mt-1">
                {loading ? 'Loading...' : `${stats[0].value} total faculty across ${deptChartData.length} departments`}
              </p>
            </div>
            <div className="p-3 bg-surface-variant rounded-2xl text-on-surface-variant border border-outline-variant">
              <BarChart3 size={20} />
            </div>
          </div>
          {loading ? (
            <div className="h-[280px] flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : deptChartData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-on-surface-variant font-bold text-sm">No department data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={280} minWidth={0}>
              <BarChart data={deptChartData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline)" vertical={false} opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--color-on-surface-variant)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--color-on-surface-variant)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'var(--color-surface-variant)', radius: 12 }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderColor: 'var(--color-outline)', 
                    borderRadius: 20, 
                    fontSize: 12, 
                    fontWeight: 700,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                    color: 'var(--color-on-surface)',
                    border: '1px solid var(--color-outline)'
                  }}
                />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[10, 10, 10, 10]}>
                  {deptChartData.map((_, i) => (
                    <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Pie Chart — Task Status */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={6}
          className="bg-surface rounded-[32px] border border-outline p-8 shadow-sm">
          <div className="mb-10">
            <h3 className="text-xl font-black text-on-surface">Task Overview</h3>
            <p className="text-sm font-medium text-on-surface-variant mt-1">Status breakdown</p>
          </div>
          <div className="flex items-center justify-center py-4">
            <ResponsiveContainer width="100%" height={200} minWidth={0}>
              <PieChart>
                <Pie data={taskPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={10} dataKey="value">
                  {taskPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: 'var(--color-outline)', borderRadius: 20, fontSize: 11, fontWeight: 700 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-8">
            {taskPieData.map(item => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-2xl hover:bg-surface-variant transition-colors border border-transparent hover:border-outline-variant">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">{item.name}</span>
                </div>
                <span className="text-[13px] font-black text-on-surface">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Attendance Trend */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={7}
        className="bg-surface rounded-[32px] border border-outline p-8 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-xl font-black text-on-surface">Monthly Attendance Trend</h3>
            <p className="text-sm font-medium text-on-surface-variant mt-1">Average attendance % per month</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-secondary bg-secondary/10 px-4 py-2 rounded-full border border-secondary/20 uppercase tracking-widest">
            <TrendingUp size={14} /> +3.2% increase
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240} minWidth={0}>
          <LineChart data={mockAttendance}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline)" vertical={false} opacity={0.2} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--color-on-surface-variant)' }} axisLine={false} tickLine={false} />
            <YAxis domain={[70, 100]} tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--color-on-surface-variant)' }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip
              formatter={(v) => [`${v}%`, 'Attendance']}
              contentStyle={{ backgroundColor: '#ffffff', borderColor: 'var(--color-outline)', borderRadius: 20, fontSize: 11, fontWeight: 700 }}
            />
            <Line type="monotone" dataKey="attendance" stroke="var(--color-primary)" strokeWidth={4} dot={{ fill: 'var(--color-primary)', r: 6, strokeWidth: 3, stroke: '#ffffff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Bottom Row: Activity + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={8}
          className="bg-surface rounded-[32px] border border-outline p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-on-surface">Recent Activity</h3>
            <button className="text-[11px] font-black text-primary uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">View All</button>
          </div>
          <div className="space-y-6">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-start gap-5 group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-surface-variant border border-outline-variant flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:scale-110">
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] text-on-surface font-black leading-tight group-hover:translate-x-1 transition-transform">{a.title}</p>
                  <p className="text-[12px] text-on-surface-variant mt-1.5 font-bold flex items-center gap-1.5 opacity-50 uppercase tracking-wider">
                    <Clock size={12} /> {a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={9}
          className="bg-surface rounded-[32px] border border-outline p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-on-surface">Upcoming Events</h3>
            <button className="text-[11px] font-black text-primary uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">Full Calendar</button>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((ev) => (
              <div key={ev.id} className="flex items-center gap-5 p-5 rounded-[24px] bg-surface-variant/50 border border-outline-variant hover:bg-white hover:shadow-xl hover:border-primary/20 transition-all duration-300 group cursor-pointer">
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-black text-on-surface truncate group-hover:text-primary transition-colors">{ev.title}</p>
                  <p className="text-[12px] text-on-surface-variant mt-1.5 font-bold uppercase tracking-wider opacity-60">{ev.date}</p>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-4 py-2 rounded-xl border bg-white shadow-sm flex-shrink-0`}>
                  {ev.type}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={10}
        className="bg-on-surface rounded-[40px] p-10 text-white shadow-2xl shadow-primary/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        
        <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-3 relative z-10">
          <CheckCircle2 size={24} /> Quick Operations
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 relative z-10">
          {[
            { label: 'Add Faculty', icon: <Users size={36} />, href: '/faculty' },
            { label: 'Enroll Student', icon: <GraduationCap size={36} />, href: '/students' },
            { label: 'Schedule Event', icon: <CalendarDays size={36} />, href: '/events' },
            { label: 'Create Task', icon: <CheckCircle2 size={36} />, href: '/tasks' },
          ].map((a) => (
            <a key={a.label} href={a.href}
              className="flex flex-col items-center gap-4 p-6 bg-white/5 hover:bg-white/10 rounded-3xl transition-all duration-300 cursor-pointer backdrop-blur-md border border-white/5 hover:-translate-y-2">
              <span className="text-white drop-shadow-2xl">{a.icon}</span>
              <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] text-center leading-tight">{a.label}</span>
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
