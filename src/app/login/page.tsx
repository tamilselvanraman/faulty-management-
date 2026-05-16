'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Building2, Loader2, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 50%, #EFF6FF 100%)',
        padding: '16px',
        overflowY: 'auto',
      }}
    >
      {/* Decorative blobs — kept behind everything */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: '40vw', height: '40vw', maxWidth: 360, maxHeight: 360,
          background: 'radial-gradient(circle, rgba(199,210,254,0.7) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-5%',
          width: '40vw', height: '40vw', maxWidth: 360, maxHeight: 360,
          background: 'radial-gradient(circle, rgba(191,219,254,0.7) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
      </div>

      {/* Left panel — visible only on lg screens */}
      <div className="hidden lg:flex flex-col justify-between h-full max-h-[580px] w-[420px] mr-16 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">EduManage ERP</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 leading-tight tracking-tight">
            Manage your<br />
            <span className="text-indigo-600">college smarter.</span>
          </h2>
          <p className="text-gray-500 mt-4 text-base leading-relaxed max-w-xs">
            All-in-one platform for faculty, students, timetables, events, and administration.
          </p>
        </div>

        <div className="space-y-3 mt-8">
          {[
            { icon: '👨‍🏫', label: 'Faculty & Student Management' },
            { icon: '📅', label: 'Smart Timetable Scheduling' },
            { icon: '📊', label: 'Real-time Analytics Dashboard' },
            { icon: '🔔', label: 'Events, Tasks & Notifications' },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-3">
              <span className="text-xl">{f.icon}</span>
              <span className="text-sm font-medium text-gray-600">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 440 }}
      >
        <div style={{
          background: '#ffffff',
          border: '1px solid #E5E7EB',
          borderRadius: 24,
          padding: '2.5rem',
          boxShadow: '0 24px 64px -12px rgba(79,70,229,0.12), 0 8px 24px -4px rgba(0,0,0,0.08)',
          width: '100%',
        }}>

          {/* Mobile logo (hidden on lg) */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16, boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
            }}>
              <Building2 size={26} color="#fff" />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', margin: 0 }}>
              EduManage ERP
            </h1>
            <p style={{ fontSize: 14, color: '#9CA3AF', marginTop: 6 }}>College Administration Portal</p>
          </div>

          {/* Desktop card header */}
          <div className="hidden lg:block mb-8">
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', margin: 0 }}>
              Welcome back
            </h2>
            <p style={{ fontSize: 14, color: '#9CA3AF', marginTop: 6 }}>Sign in to your admin dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="admin@college.edu"
                  style={{
                    width: '100%', paddingLeft: 40, paddingRight: 16, paddingTop: 12, paddingBottom: 12,
                    background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: 12,
                    fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%', paddingLeft: 40, paddingRight: 48, paddingTop: 12, paddingBottom: 12,
                    background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: 12,
                    fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#DC2626' }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px 0',
                background: loading ? '#818CF8' : '#4F46E5',
                color: '#ffffff', fontWeight: 700, fontSize: 14,
                border: 'none', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 16px rgba(79,70,229,0.35)',
                transition: 'background 0.15s, transform 0.1s',
                marginTop: 8,
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Signing in...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          {/* Footer note */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20 }}>
            <ShieldCheck size={13} style={{ color: '#9CA3AF' }} />
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
              Authorized administrators only
            </p>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
