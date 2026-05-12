'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, Menu, LogOut, User, Settings, ChevronDown, HelpCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const breadcrumbMap: Record<string, string> = {
  '/': 'Dashboard',
  '/faculty': 'Faculty Management',
  '/students': 'Student Management',
  '/classes': 'Class Management',
  '/timetable': 'Timetable',
  '/events': 'Events & Scheduling',
  '/committees': 'Committees',
  '/tasks': 'Task Tracking',
}

interface TopBarProps {
  onMobileMenuOpen: () => void
}

export default function TopBar({ onMobileMenuOpen }: TopBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [time, setTime] = useState<Date | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [unreadCount] = useState(3)

  // Live clock
  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const currentPage = breadcrumbMap[pathname] ?? pathname.split('/').pop() ?? 'Dashboard'

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <header className="fixed top-0 right-0 left-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 z-30 font-sans antialiased">
      <div className="flex items-center gap-8">
        {/* Mobile menu button */}
        <button
          onClick={onMobileMenuOpen}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-8">
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">EduCore ERP</span>
          
          {/* Search */}
          <div className="hidden md:flex items-center bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 w-64 group focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <Search size={18} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search everything..."
              className="bg-transparent border-none focus:ring-0 text-sm w-full p-0 text-gray-700 dark:text-gray-300 placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}
              className="p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors active:opacity-80 text-gray-500"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</span>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-72 overflow-y-auto">
                    {[
                      { icon: '📅', title: 'IQAC Meeting Tomorrow', time: '2h ago', unread: true },
                      { icon: '⚠️', title: 'Attendance Alert: 15 students below 75%', time: '4h ago', unread: true },
                      { icon: '✅', title: 'Task Completed: Faculty Workload Report', time: '1d ago', unread: false },
                    ].map((n, i) => (
                      <div key={i} className={`flex gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${n.unread ? 'bg-indigo-50/40 dark:bg-indigo-900/20' : ''}`}>
                        <span className="text-lg flex-shrink-0">{n.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-gray-100 font-medium leading-snug">{n.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                        </div>
                        {n.unread && <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />}
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-200 dark:border-gray-800">
                    <button className="w-full text-center text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium py-1">
                      View all notifications →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className="p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors active:opacity-80 text-gray-500">
            <HelpCircle size={20} />
          </button>
          
          <button className="p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors active:opacity-80 text-gray-500">
            <Settings size={20} />
          </button>
        </div>

        {/* Profile */}
        <div className="relative border-l border-gray-200 dark:border-gray-800 pl-4">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
            className="flex items-center gap-3 py-1 rounded-xl transition-colors group"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900/30 ring-2 ring-indigo-50 dark:ring-indigo-900/20 group-hover:ring-indigo-100 dark:group-hover:ring-indigo-900/40 transition-all">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhHnIXsi6rKOntXkfNqOGRZTYF6g7k1H3fuXcU6B6kCiO_xaHoS8g7Rwuh8Fd3wzcW8g-Y4eu9CqPHUGCzKT-JM5fT1pP5nrafEAutmbpmj0qlvfKGwJu6V-0fnrC512xOZOmsInSWhSzUuC7GCia13dXhxZE0HLOoOcoz_H4mEjP_TQ15HuaTy_ZMD3t38reMIZ4zFKo_eEyuCLFxl0ekQU6oIYOuJ9WRa98HZGmvdfbBCJ4FEsHitIrUJnwIIYuKANDkE9Pn7X7R" 
                alt="Admin"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">Prof. Raman</p>
              <p className="text-[11px] text-gray-400 mt-1">Super Admin</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
          </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-3 border-b border-gray-200 dark:border-gray-800">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Prof. Raman</p>
                    <p className="text-xs text-gray-400">raman@college.edu</p>
                  </div>
                  <div className="p-1.5">
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <User size={15} className="text-gray-400" />
                      Profile
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <Settings size={15} className="text-gray-400" />
                      Settings
                    </button>
                    <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut size={15} className="text-red-400" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
