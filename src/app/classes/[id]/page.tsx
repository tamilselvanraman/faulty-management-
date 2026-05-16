'use client'

import { use } from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronRight, 
  MapPin, 
  Users, 
  BarChart3, 
  UserCircle2, 
  Clock, 
  Download, 
  Edit3, 
  Plus, 
  FileText, 
  ExternalLink,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] as [number, number, number, number] } 
  }),
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
const TIME_SLOTS = [
  { time: '09:00 AM', subjects: { MONDAY: 'Algorithms', TUESDAY: 'Arch.', WEDNESDAY: 'Algorithms', THURSDAY: 'ML Lab' } },
  { time: '10:30 AM', subjects: { MONDAY: 'ML Intro', TUESDAY: 'DBMS', WEDNESDAY: 'Arch.', THURSDAY: 'ML Lab', FRIDAY: 'DBMS' } },
  { time: '01:30 PM', subjects: { MONDAY: 'Soft Skills', TUESDAY: 'Algorithms', THURSDAY: 'DBMS', FRIDAY: 'Arch.' } },
]

const COLORS: Record<string, string> = {
  'Algorithms': 'bg-indigo-50 border-indigo-500 text-indigo-700',
  'Arch.': 'bg-orange-50 border-orange-500 text-orange-700',
  'ML Lab': 'bg-emerald-50 border-emerald-500 text-emerald-700',
  'ML Intro': 'bg-emerald-50 border-emerald-500 text-emerald-700',
  'DBMS': 'bg-blue-50 border-blue-500 text-blue-700',
  'Soft Skills': 'bg-purple-50 border-purple-500 text-purple-700',
}

export default function ClassDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm font-medium text-gray-500">
        <Link href="/classes" className="hover:text-indigo-600 transition-colors">Classes</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900">B.Tech CS - Year 3</span>
      </nav>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Main Info */}
        <div className="xl:col-span-2 space-y-6">
          <motion.div variants={fadeUp} initial="hidden" animate="visible"
            className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight">B.Tech CS - Year 3</h1>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                    Active Batch
                  </span>
                </div>
                <p className="text-gray-500 font-medium mt-2 flex items-center gap-2">
                  Section A <span className="w-1 h-1 bg-gray-300 rounded-full" /> Academic Session 2023-24
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-10">
              {[
                { icon: MapPin, label: 'LECTURE HALL', value: 'Hall 402, Block C', color: 'text-indigo-600' },
                { icon: Users, label: 'TOTAL STRENGTH', value: '58 Students', color: 'text-blue-600' },
                { icon: BarChart3, label: 'ATTENDANCE AVG', value: '92.4%', color: 'text-sky-600' },
                { icon: UserCircle2, label: 'CLASS COORDINATOR', value: 'Dr. Sarah Miller', color: 'text-indigo-600' },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase">{item.label}</p>
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-gray-50 ${item.color}`}>
                      <item.icon size={16} />
                    </div>
                    <span className="text-sm font-bold text-gray-900">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Faculty Assigned */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users size={20} className="text-indigo-600" /> Faculty Assigned
              </h2>
              <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Manage Assignments</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: 'Dr. Emily Watson', role: 'Systems Architecture', img: 'https://i.pravatar.cc/150?u=emily', hours: '12hrs/week', room: 'L-402' },
                { name: 'Prof. Marcus Chen', role: 'Machine Learning', img: 'https://i.pravatar.cc/150?u=marcus', hours: '8hrs/week', room: 'Lab-B' },
                { name: 'Dr. Sofia Rodriguez', role: 'Database Systems', img: 'https://i.pravatar.cc/150?u=sofia', hours: '10hrs/week', room: 'L-402' },
              ].map((faculty, i) => (
                <motion.div key={faculty.name} variants={fadeUp} custom={i} initial="hidden" animate="visible"
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-start gap-4">
                    <img src={faculty.img} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">{faculty.name}</h4>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">{faculty.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-[10px] font-bold px-2 py-1 bg-gray-50 text-gray-600 rounded-md border border-gray-100">{faculty.hours}</span>
                    <span className="text-[10px] font-bold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100">{faculty.room}</span>
                  </div>
                </motion.div>
              ))}
              <button className="border-2 border-dashed border-gray-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 hover:border-indigo-300 transition-all text-gray-400 hover:text-indigo-600">
                <Plus size={24} />
                <span className="text-xs font-bold">Assign Instructor</span>
              </button>
            </div>
          </section>

          {/* Timetable */}
          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Clock size={20} className="text-indigo-600" /> Weekly Timetable
              </h2>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                  <Download size={16} /> Export PDF
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
                  <Edit3 size={16} /> Edit Schedule
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center border-r border-gray-50">Time</th>
                    {DAYS.map(day => (
                      <th key={day} className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {TIME_SLOTS.map((slot, i) => (
                    <tr key={slot.time}>
                      <td className="p-4 text-center border-r border-gray-50">
                        <span className="text-sm font-black text-gray-900">{slot.time.split(' ')[0]}</span>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{slot.time.split(' ')[1]}</p>
                      </td>
                      {DAYS.map(day => {
                        const subject = slot.subjects[day as keyof typeof slot.subjects]
                        return (
                          <td key={day} className="p-2 align-top">
                            {subject ? (
                              <div className={`p-3 rounded-xl border-l-4 shadow-sm ${COLORS[subject] || 'bg-gray-50 border-gray-300'}`}>
                                <p className="text-xs font-black mb-1">{subject}</p>
                                <p className="text-[9px] font-bold opacity-70 uppercase tracking-wider">L-402</p>
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center p-3">
                                <span className="text-[10px] font-medium text-gray-300 italic uppercase">Self Study</span>
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                  <tr className="bg-gray-50/30">
                    <td colSpan={6} className="p-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Lunch Break
                    </td>
                  </tr>
                  {/* Additional slots could go here */}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-6">
          {/* Next Session Widget */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible"
            className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <h3 className="text-lg font-bold">Next Session</h3>
            <p className="text-indigo-100 text-sm mt-1">Starting in 15 minutes</p>
            
            <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
              <h4 className="text-xl font-black">Advanced Algorithms</h4>
              <p className="text-indigo-100 text-xs mt-1 font-medium">Prof. Alan Turing • Lab 3</p>
            </div>
          </motion.div>

          {/* Class Notices */}
          <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare size={18} className="text-indigo-600" /> Class Notices
            </h3>
            <div className="space-y-4">
              {[
                { title: 'Mid-term project submissions due by Friday.', time: 'Posted 2 hours ago', color: 'bg-blue-500' },
                { title: 'Guest lecture by Google Engineers on Saturday.', time: 'Posted Yesterday', color: 'bg-amber-500' },
              ].map((notice) => (
                <div key={notice.title} className="flex gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notice.color}`} />
                  <div>
                    <p className="text-sm font-bold text-gray-800 leading-snug">{notice.title}</p>
                    <p className="text-[10px] font-medium text-gray-400 mt-1">{notice.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Resources */}
          <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <FileText size={18} className="text-indigo-600" /> Resources
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Syllabus.pdf', icon: FileText, sub: 'Updated 2 days ago' },
                { name: 'LMS Portal', icon: ExternalLink, sub: 'v2.4.1' },
              ].map((res) => (
                <div key={res.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 group hover:bg-indigo-50 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white shadow-sm text-indigo-600 group-hover:scale-110 transition-transform">
                      <res.icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{res.name}</p>
                    </div>
                  </div>
                  <Download size={14} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
