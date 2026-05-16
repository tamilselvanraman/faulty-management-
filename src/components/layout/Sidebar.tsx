'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  Plus,
  Settings,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  CheckSquare,
  Building2,
  Calendar
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/classes', label: 'Class Info', icon: BookOpen },
  { href: '/students', label: 'Students', icon: GraduationCap },
  { href: '/faculty', label: 'Faculty', icon: Users },
  { href: '/events', label: 'Events & Scheduling', icon: CalendarDays },
  { href: '/committees', label: 'Committees', icon: Building2 },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
]

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex flex-col h-full bg-white border-r border-gray-100 z-20 overflow-hidden flex-shrink-0"
      >
        <SidebarContent
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
          pathname={pathname}
          isActive={isActive}
        />
      </motion.aside>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-0 top-0 h-full w-[280px] bg-white border-r border-gray-100 z-40 lg:hidden flex flex-col"
          >
            <button
              onClick={onMobileClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-50 text-gray-400"
            >
              <X size={20} />
            </button>
            <SidebarContent
              collapsed={false}
              onToggleCollapse={onMobileClose}
              pathname={pathname}
              isActive={isActive}
              isMobile
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}

interface SidebarContentProps {
  collapsed: boolean
  onToggleCollapse: () => void
  pathname: string
  isActive: (href: string) => boolean
  isMobile?: boolean
}

function SidebarContent({ collapsed, isActive, isMobile }: SidebarContentProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header / Logo Section */}
      <div className={`flex items-center gap-4 px-7 py-9 flex-shrink-0 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg shadow-indigo-100 ring-4 ring-indigo-50">
          U
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="overflow-hidden"
          >
            <h2 className="text-[19px] font-bold text-slate-900 tracking-tight whitespace-nowrap">University Portal</h2>
            <p className="text-[10px] font-bold text-slate-400 tracking-[0.1em] uppercase mt-0.5">ADMIN CONSOLE</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link key={item.href} href={item.href}>
              <div className={`relative flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer group transition-all duration-200 ${
                active
                  ? 'bg-primary/5 text-primary font-semibold'
                  : 'text-slate-500 hover:bg-slate-50/80 hover:text-slate-900'
              } ${collapsed ? 'justify-center' : ''}`}>
                <Icon
                  size={22}
                  className={`flex-shrink-0 transition-colors ${active ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`}
                />
                {!collapsed && (
                  <span className={`text-[15px] tracking-tight ${active ? 'text-primary' : ''}`}>
                    {item.label}
                  </span>
                )}
                
                {/* Active Indicator Bar */}
                {active && !collapsed && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-l-full shadow-[0_0_8px_rgba(15,23,42,0.1)]" />
                )}

                {collapsed && !isMobile && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {item.label}
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </nav>



      {/* Footer Section */}
      <div className="mt-auto border-t border-gray-50 p-5 space-y-1">
        <button className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors ${collapsed ? 'justify-center' : ''}`}>
          <Settings size={22} className="text-gray-400" />
          {!collapsed && <span>Settings</span>}
        </button>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] font-medium text-rose-600 hover:bg-rose-50 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={22} className="text-rose-500" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}
