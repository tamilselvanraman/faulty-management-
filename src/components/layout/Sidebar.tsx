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
  Building2,
  CheckSquare,
  Settings,
  LogOut,
  X,
  ChevronRight,
  ChevronLeft
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
        animate={{ width: collapsed ? 96 : 280 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-col h-full bg-surface border-r border-outline z-20 overflow-x-hidden overflow-y-hidden flex-shrink-0 relative"
      >
        <SidebarContent
          collapsed={collapsed}
          pathname={pathname}
          isActive={isActive}
          onToggleCollapse={onToggleCollapse}
        />
      </motion.aside>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 top-0 h-full w-[280px] bg-surface border-r border-outline z-40 lg:hidden flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <Building2 size={18} />
                </div>
              </div>
              <button
                onClick={onMobileClose}
                className="p-2 rounded-xl hover:bg-surface-variant text-on-surface-variant transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <SidebarContent
              collapsed={false}
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
  pathname: string
  isActive: (href: string) => boolean
  isMobile?: boolean
  onToggleCollapse?: () => void
}

function SidebarContent({ collapsed, isActive, isMobile, onToggleCollapse }: SidebarContentProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header / Logo Section */}
      {!isMobile && (
        <div className={`flex items-center px-6 py-8 flex-shrink-0 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 flex-shrink-0 transition-all duration-300">
              <Building2 size={22} />
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto overflow-x-hidden custom-scrollbar py-2">
        {!collapsed && !isMobile && (
          <p className="px-4 text-[11px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-4">Main Menu</p>
        )}
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link key={item.href} href={item.href}>
              <div className={`relative flex items-center gap-4 px-4 py-3.5 rounded-2xl cursor-pointer group transition-all duration-300 ${
                active
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-on-surface-variant hover:bg-surface-variant/80 hover:text-on-surface'
              } ${collapsed ? 'justify-center' : ''}`}>
                <Icon
                  size={20}
                  className={`flex-shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}
                />
                {!collapsed && (
                  <span className={`text-[14px] font-bold tracking-tight flex-1 ${active ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>
                    {item.label}
                  </span>
                )}
                
                {active && !collapsed && (
                   <ChevronRight size={14} className="text-white/50" />
                )}

                {collapsed && !isMobile && (
                  <div className="absolute left-full ml-4 px-4 py-2 bg-on-surface text-surface text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 shadow-xl">
                    {item.label}
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer Section */}
      <div className="mt-auto border-t border-outline p-4 space-y-1.5 bg-surface-variant/20 overflow-x-hidden">
        <button className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[14px] font-bold text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-all ${collapsed ? 'justify-center' : ''}`}>
          <Settings size={20} className="text-on-surface-variant/50" />
          {!collapsed && <span className="flex-1 text-left">Settings</span>}
        </button>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[14px] font-bold text-tertiary hover:bg-tertiary/5 transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={20} className="text-tertiary/70" />
          {!collapsed && <span className="flex-1 text-left">Sign Out</span>}
        </button>
      </div>
    </div>
  )
}

