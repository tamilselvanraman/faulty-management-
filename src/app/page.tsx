'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users, GraduationCap, BookOpen, CalendarDays,
  TrendingUp, CheckCircle2, Clock, AlertCircle,
  ArrowUpRight, BarChart3, Activity
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] } }),
}

const DEPT_COLORS = ['#4F46E5', '#7C3AED', '#2563EB', '#0891B2', '#059669', '#D97706']

const mockStudentDept = [
  { name: 'CSE', count: 620 },
  { name: 'ECE', count: 480 },
  { name: 'MECH', count: 390 },
  { name: 'CIVIL', count: 310 },
  { name: 'MBA', count: 240 },
]

const mockAttendance = [
  { month: 'Jan', attendance: 88 },
  { month: 'Feb', attendance: 82 },
  { month: 'Mar', attendance: 91 },
  { month: 'Apr', attendance: 87 },
  { month: 'May', attendance: 79 },
]

const taskPieData = [
  { name: 'Completed', value: 42, color: '#10B981' },
  { name: 'In Progress', value: 18, color: '#F59E0B' },
  { name: 'Pending', value: 12, color: '#EF4444' },
]

const recentActivity = [
  { id: 1, title: 'IQAC Annual Meeting scheduled', time: '2 hours ago', icon: '📅', type: 'event' },
  { id: 2, title: 'Dr. Priya Sharma joined as Associate Professor', time: '5 hours ago', icon: '👩‍🏫', type: 'faculty' },
  { id: 3, title: '15 students below 75% attendance', time: '1 day ago', icon: '⚠️', type: 'alert' },
  { id: 4, title: 'Timetable updated for CSE – III Year', time: '1 day ago', icon: '🗓️', type: 'timetable' },
  { id: 5, title: 'Annual Sports Day task marked complete', time: '2 days ago', icon: '✅', type: 'task' },
]

const upcomingEvents = [
  { id: 1, title: 'Semester Exam – Theory', date: 'May 20, 2025', type: 'Exam', color: 'bg-red-50 text-red-600 border-red-200' },
  { id: 2, title: 'Faculty Development Program', date: 'May 22, 2025', type: 'Program', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 3, title: 'NAAC Committee Meeting', date: 'May 25, 2025', type: 'Meeting', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { id: 4, title: 'Annual Day Celebration', date: 'June 1, 2025', type: 'Event', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
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
    { label: 'Total Faculty', value: '—', change: '+4 this month', positive: true, icon: <Users size={22} />, gradient: 'from-indigo-500 to-indigo-600' },
    { label: 'Active Students', value: '—', change: '+12% vs last year', positive: true, icon: <GraduationCap size={22} />, gradient: 'from-violet-500 to-violet-600' },
    { label: 'Total Classes', value: '—', change: 'Across 5 departments', positive: true, icon: <BookOpen size={22} />, gradient: 'from-blue-500 to-blue-600' },
    { label: 'Events This Month', value: '—', change: '4 upcoming', positive: true, icon: <CalendarDays size={22} />, gradient: 'from-emerald-500 to-emerald-600' },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(({ data }) => {
        if (data) {
          setStats(prev => [
            { ...prev[0], value: data.faculty?.toString() ?? '—' },
            { ...prev[1], value: data.students?.toLocaleString() ?? '—' },
            { ...prev[2], value: data.classes?.toString() ?? '—' },
            { ...prev[3], value: data.events?.toString() ?? '—' },
          ])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, Admin · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
            <Activity size={12} /> System Online
          </span>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} variants={fadeUp} initial="hidden" animate="visible" custom={i + 1}>
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shadow-lg`}>
                  {s.icon}
                </div>
                <span className={`flex items-center gap-1 text-xs font-semibold ${s.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                  <ArrowUpRight size={12} />
                </span>
              </div>
              <p className="text-3xl font-black text-gray-900 tracking-tight">
                {loading ? <span className="inline-block w-16 h-8 bg-gray-100 rounded animate-pulse" /> : s.value}
              </p>
              <p className="text-sm font-semibold text-gray-600 mt-1">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.change}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart — Students by Dept */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5}
          className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Students by Department</h3>
              <p className="text-xs text-gray-400 mt-0.5">Enrollment distribution 2024–25</p>
            </div>
            <BarChart3 size={16} className="text-gray-300" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockStudentDept} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#F3F4F6', radius: 8 }}
                contentStyle={{ border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
              />
              <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]}>
                {mockStudentDept.map((_, i) => (
                  <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart — Task Status */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={6}
          className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <div className="mb-5">
            <h3 className="font-bold text-gray-900 text-sm">Task Overview</h3>
            <p className="text-xs text-gray-400 mt-0.5">Current task status breakdown</p>
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={taskPieData} cx="50%" cy="50%" innerRadius={44} outerRadius={72} paddingAngle={3} dataKey="value">
                  {taskPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {taskPieData.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-xs text-gray-500">{item.name}</span>
                </div>
                <span className="text-xs font-bold text-gray-700">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Attendance Trend */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={7}
        className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Monthly Attendance Trend</h3>
            <p className="text-xs text-gray-400 mt-0.5">Average attendance % per month</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
            <TrendingUp size={11} /> +3.2% vs last semester
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={mockAttendance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis domain={[70, 100]} tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip
              formatter={(v) => [`${v}%`, 'Attendance']}
              contentStyle={{ border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 12 }}
            />
            <Line type="monotone" dataKey="attendance" stroke="#4F46E5" strokeWidth={2.5} dot={{ fill: '#4F46E5', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Bottom Row: Activity + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={8}
          className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-base flex-shrink-0 group-hover:bg-indigo-50 transition-colors">
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 font-medium leading-snug">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={9}
          className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {upcomingEvents.map((ev) => (
              <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{ev.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{ev.date}</p>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${ev.color} flex-shrink-0`}>
                  {ev.type}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={10}
        className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-5 text-white">
        <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
          <CheckCircle2 size={16} /> Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add Faculty', icon: '👨‍🏫', href: '/faculty' },
            { label: 'Enroll Student', icon: '🎓', href: '/students' },
            { label: 'Schedule Event', icon: '📅', href: '/events' },
            { label: 'Create Task', icon: '✅', href: '/tasks' },
          ].map((a) => (
            <a key={a.label} href={a.href}
              className="flex flex-col items-center gap-2 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer backdrop-blur-sm border border-white/10">
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-semibold text-white/90 text-center leading-tight">{a.label}</span>
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
