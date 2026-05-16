'use client'

import { useState, createContext, useContext } from 'react'
import { Menu, Search, Bell, User, ChevronDown } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import { motion, AnimatePresence } from 'framer-motion'

interface AppShellContextType {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void
}

export const AppShellContext = createContext<AppShellContextType>({
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
})

export function useAppShell() {
  return useContext(AppShellContext)
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <AppShellContext.Provider value={{ sidebarCollapsed, setSidebarCollapsed }}>
      <div className="flex h-screen bg-background overflow-hidden font-sans">
        {/* Mobile overlay */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-secondary/40 z-30 lg:hidden backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        {/* Main content */}
        <div className="flex flex-col flex-1 min-w-0 transition-all duration-300 relative">
          {/* Top Header */}
          <header className="h-20 bg-surface/80 backdrop-blur-md border-b border-outline flex items-center justify-between px-6 lg:px-10 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-surface-variant text-on-surface-variant transition-colors"
              >
                <Menu size={20} />
              </button>
              
              <div className="hidden md:flex items-center gap-3 bg-surface-variant/50 px-4 py-2.5 rounded-2xl border border-outline-variant w-80 group focus-within:border-primary/30 transition-all">
                <Search size={18} className="text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search anything..." 
                  className="bg-transparent border-none outline-none text-sm font-medium w-full placeholder:text-on-surface-variant/30"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-6">
              <div className="flex items-center gap-1 lg:gap-3 mr-2 lg:mr-0">
                <button className="p-2.5 rounded-2xl hover:bg-surface-variant text-on-surface-variant transition-all relative group">
                  <Bell size={20} />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-tertiary rounded-full border-2 border-surface" />
                </button>
              </div>

              <div className="h-8 w-px bg-outline hidden lg:block" />

              <button className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-2xl hover:bg-surface-variant transition-all border border-transparent hover:border-outline-variant group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <User size={20} />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-[13px] font-black text-on-surface leading-tight">Admin User</p>
                  <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider mt-0.5">Super Admin</p>
                </div>
                <ChevronDown size={14} className="text-on-surface-variant/40 group-hover:text-on-surface transition-colors hidden lg:block" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar scroll-smooth">
            <div className="max-w-[1600px] mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AppShellContext.Provider>
  )
}
