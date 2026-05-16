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
          <header className="h-20 bg-surface/60 backdrop-blur-xl border-b border-outline/50 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 transition-all duration-300">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2.5 rounded-2xl bg-surface shadow-sm border border-outline/50 text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
              >
                <Menu size={20} />
              </button>
              
              <div className="hidden md:flex items-center gap-3 bg-slate-100/50 px-5 py-3 rounded-2xl border border-transparent focus-within:border-primary/20 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-primary/5 w-96 group transition-all duration-500">
                <Search size={18} className="text-slate-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Global search..." 
                  className="bg-transparent border-none outline-none text-[14px] font-bold w-full placeholder:text-slate-300 text-slate-700"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-5">
              <div className="flex items-center gap-2">
                <button className="p-3 rounded-2xl bg-surface border border-outline/50 hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-all relative group shadow-sm">
                  <Bell size={20} />
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-surface animate-pulse" />
                </button>
              </div>

              <div className="h-8 w-px bg-outline/50 hidden lg:block" />

              <button className="flex items-center gap-3 pl-2 pr-5 py-1.5 rounded-[20px] bg-surface border border-outline/50 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                  <User size={20} />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-[13px] font-black text-slate-900 leading-tight">Admin User</p>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">Super Admin</p>
                </div>
                <ChevronDown size={14} className="text-slate-300 group-hover:text-slate-600 transition-colors hidden lg:block" />
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
