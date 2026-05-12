'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Calendar,
  CalendarDays, Users2, CheckSquare, Building2,
  ChevronLeft, ChevronRight, X
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/faculty', label: 'Faculty', icon: Users },
  { href: '/students', label: 'Students', icon: GraduationCap },
  { href: '/classes', label: 'Classes', icon: BookOpen },
  { href: '/timetable', label: 'Timetable', icon: Calendar },
  { href: '/events', label: 'Events', icon: CalendarDays },
  { href: '/committees', label: 'Committees', icon: Users2 },
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
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex flex-col h-full bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 z-20 overflow-hidden flex-shrink-0"
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
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-0 top-0 h-full w-[256px] bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 z-40 lg:hidden flex flex-col"
          >
            <button
              onClick={onMobileClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              <X size={18} />
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

function SidebarContent({ collapsed, onToggleCollapse, isActive, isMobile }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
          U
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <h2 className="text-lg font-black text-gray-900 dark:text-white leading-tight whitespace-nowrap">University Portal</h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link key={item.href} href={item.href}>
              <div className={`relative flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer group transition-all duration-150 ${
                active
                  ? 'bg-white dark:bg-gray-900 shadow-sm text-indigo-600 ring-1 ring-black/5 dark:ring-white/10'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-800 dark:hover:text-gray-200'
              } ${collapsed ? 'justify-center' : ''}`}>
                <Icon
                  size={18}
                  className={`relative z-10 flex-shrink-0 transition-colors ${active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`relative z-10 text-sm font-semibold tracking-tight whitespace-nowrap overflow-hidden ${active ? 'text-indigo-600' : ''}`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip when collapsed */}
                {collapsed && !isMobile && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {item.label}
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle — desktop only */}
      {!isMobile && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
          <button
            onClick={onToggleCollapse}
            className={`w-full flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl text-sm transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            {collapsed ? <ChevronRight size={16} /> : (
              <>
                <ChevronLeft size={16} />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
