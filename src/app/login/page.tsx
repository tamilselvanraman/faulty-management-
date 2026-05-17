"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Loader2,
  AlertCircle,
  GraduationCap,
  Calendar,
  BarChart3,
  Bell,
  ShieldCheck
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        setError(authError.message);
        setLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-4 sm:p-6 md:p-10 relative overflow-y-auto font-sans antialiased">
      {/* Background ambient decorative shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-100/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-100/25 blur-[120px] pointer-events-none" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Unified Container Card ("Big Box") */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[1024px] bg-white rounded-3xl border border-slate-100 shadow-[0_32px_80px_-20px_rgba(79,70,229,0.08)] grid grid-cols-1 md:grid-cols-12 overflow-hidden relative z-10 min-h-[580px]"
      >
        {/* Left Side Pane - Branding & Features (Premium Deep Corporate Slate/Indigo Gradient) */}
        <div className="md:col-span-6 lg:col-span-7 bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#0F172A] p-6 sm:p-10 md:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/20 relative overflow-hidden">
          {/* Subtle light leak gradient overlay */}
          <div className="absolute top-[-20%] right-[-20%] w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
          
          {/* Logo */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Building2 size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              EduManage ERP
            </span>
          </div>

          {/* Marketing Content */}
          <div className="my-auto py-10 md:py-0 relative z-10">
            <h1 className="text-3xl sm:text-4xl md:text-[40px] font-extrabold leading-[1.2] tracking-tight text-white">
              Manage your <br />
              <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">college smarter.</span>
            </h1>
            
            <p className="hidden sm:block mt-4 text-slate-400 font-medium text-sm md:text-[15px] max-w-[420px] leading-relaxed">
              All-in-one platform for faculty, students, timetables, events, and administration.
            </p>

            {/* Checklist with clean Lucide icons instead of emojis */}
            <ul className="hidden md:block mt-8 space-y-4">
              {[
                { icon: GraduationCap, iconColor: "text-indigo-400", bgAccent: "bg-indigo-950/50 border border-indigo-900/40", text: "Faculty & Student Management" },
                { icon: Calendar, iconColor: "text-blue-400", bgAccent: "bg-blue-950/50 border border-blue-900/40", text: "Smart Timetable Scheduling" },
                { icon: BarChart3, iconColor: "text-emerald-400", bgAccent: "bg-emerald-950/50 border border-emerald-900/40", text: "Real-time Analytics Dashboard" },
                { icon: Bell, iconColor: "text-rose-400", bgAccent: "bg-rose-950/50 border border-rose-900/40", text: "Events, Tasks & Notifications" }
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-4 text-slate-300 font-semibold text-sm md:text-[15px] hover:translate-x-1 transition-transform duration-200"
                >
                  <div className={`w-9 h-9 rounded-lg ${item.bgAccent} flex items-center justify-center flex-shrink-0`}>
                    <item.icon size={18} className={item.iconColor} />
                  </div>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Side Pane - Login Form */}
        <div className="md:col-span-6 lg:col-span-5 p-6 sm:p-10 md:p-16 flex flex-col justify-center bg-white">
          <div className="space-y-1.5 mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-slate-400 font-medium">
              Sign in to your admin dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 tracking-wide block">
                Email address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@college.edu"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-300 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 tracking-wide block">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-300 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-rose-50 border border-rose-100 text-rose-600 text-xs px-4 py-3 rounded-2xl flex items-start gap-2.5 shadow-sm"
                >
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <p className="leading-relaxed font-semibold">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:scale-100 disabled:opacity-80 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-white" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>SIGN IN TO DASHBOARD</span>
              )}
            </button>
          </form>

          {/* Secure disclaimer */}
          <div className="flex items-center justify-center gap-2 mt-8 text-slate-400 select-none">
            <ShieldCheck size={14} className="text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              AUTHORIZED ADMINISTRATORS ONLY
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}