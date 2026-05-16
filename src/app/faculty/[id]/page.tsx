'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Edit2, Download, Briefcase, Calendar, MapPin, Mail, Phone, BookOpen, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Mock data to match the design
const mockProfile = {
  id: '1',
  name: 'Dr. Elena Rodriguez',
  designation: 'SENIOR PROFESSOR',
  qualification: 'PHD IN PHYSICS',
  status: 'Permanent',
  type: 'Full-time',
  emp_id: '#EDU-7742',
  joined_date: 'Aug 12, 2018',
  location: 'Building A, Room 402',
  performance: {
    rating: '4.8/5',
    papers: 12
  },
  department: 'Applied Physical Sciences & Research',
  email: 'elena.rodriguez@educore.edu',
  current_role: 'Head of Quantum Mechanics Research Lab',
  extension: '+1 (555) 012-4432',
  subjects: [
    { code: 'PHY-401', name: 'Advanced Quantum Mechanics', batches: '02', credits: '4.0' },
    { code: 'PHY-205', name: 'Thermodynamics & Statistical Mechanics', batches: '03', credits: '3.0' },
    { code: 'RES-901', name: 'Research Methodology for Scientists', batches: '01', credits: '2.0' }
  ]
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }),
}

export default function FacultyProfilePage() {
  const params = useParams()
  // In a real app, fetch data based on params.id
  const profile = mockProfile

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Breadcrumbs & Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
        <div className="flex items-center gap-2 text-[13px] font-medium">
          <Link href="/faculty" className="text-gray-500 hover:text-indigo-600 transition-colors">Faculty</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-[#3b2dd3]">{profile.name}</span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <h1 className="text-[32px] font-bold text-gray-900 tracking-tight">Faculty Profile</h1>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-gray-700 rounded-lg text-[14px] font-semibold transition-all">
              <Edit2 size={16} /> Edit Profile
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#3b2dd3] hover:bg-[#3427ba] text-white rounded-lg text-[14px] font-semibold transition-all shadow-md">
              <Download size={18} /> Export Dossier
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Profile Card */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-8 flex flex-col items-center border-b border-[#E5E7EB]">
              <div className="relative mb-4">
                <img src={`https://ui-avatars.com/api/?name=${profile.name}&background=random&size=120`} alt={profile.name} className="w-28 h-28 rounded-2xl object-cover shadow-sm border border-gray-100" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <h2 className="text-[22px] font-bold text-gray-900 text-center">{profile.name}</h2>
              <p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mt-1 text-center">
                {profile.designation} • {profile.qualification}
              </p>
              <div className="flex gap-2 mt-4">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[12px] font-bold rounded-full">{profile.status}</span>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[12px] font-bold rounded-full">{profile.type}</span>
              </div>
            </div>
            
            <div className="p-6 space-y-4 bg-gray-50/50">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#3b2dd3] shadow-sm"><Briefcase size={16} /></div>
                <div>
                  <p className="text-[11px] text-gray-500 font-medium">Emp ID</p>
                  <p className="text-[14px] font-semibold text-gray-900">{profile.emp_id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#3b2dd3] shadow-sm"><Calendar size={16} /></div>
                <div>
                  <p className="text-[11px] text-gray-500 font-medium">Joined</p>
                  <p className="text-[14px] font-semibold text-gray-900">{profile.joined_date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#3b2dd3] shadow-sm"><MapPin size={16} /></div>
                <div>
                  <p className="text-[11px] text-gray-500 font-medium">Location</p>
                  <p className="text-[14px] font-semibold text-gray-900">{profile.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-gradient-to-br from-[#4e40e5] to-[#3b2dd3] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <p className="text-[12px] font-bold uppercase tracking-wider text-white/80 mb-4">Performance Summary</p>
            <div className="flex items-center gap-8">
              <div>
                <p className="text-[32px] font-bold leading-none">{profile.performance.rating}</p>
                <p className="text-[11px] uppercase tracking-wider text-white/70 mt-1 font-semibold">Student Rating</p>
              </div>
              <div>
                <p className="text-[32px] font-bold leading-none">{profile.performance.papers}</p>
                <p className="text-[11px] uppercase tracking-wider text-white/70 mt-1 font-semibold">Research Papers</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Details */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} className="lg:col-span-8 space-y-6">
          
          {/* Academic Appointment */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2 text-[#3b2dd3] font-bold">
                <Briefcase size={18} />
                <span>Academic Appointment</span>
              </div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Last Updated: Jan 2024</span>
            </div>
            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
              <div>
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-1">Department</p>
                <p className="text-[16px] font-bold text-gray-900">{profile.department}</p>
              </div>
              <div>
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-1">Direct Contact</p>
                <p className="text-[15px] font-semibold text-gray-800">{profile.email}</p>
              </div>
              <div>
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-1">Current Designation</p>
                <p className="text-[16px] font-bold text-gray-900">{profile.current_role}</p>
              </div>
              <div>
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-1">Office Extension</p>
                <p className="text-[15px] font-semibold text-gray-800">{profile.extension}</p>
              </div>
            </div>
          </div>

          {/* Subjects Handled */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2 text-[#3b2dd3] font-bold">
                <BookOpen size={18} />
                <span>Subjects Handled</span>
              </div>
              <button className="text-[13px] font-bold text-[#3b2dd3] hover:underline">View All History</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Course Code</th>
                    <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Subject Name</th>
                    <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Batches</th>
                    <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Credits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {profile.subjects.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <span className="text-[13px] font-bold text-[#3b2dd3]">{sub.code}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[14px] font-bold text-gray-800">{sub.name}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[14px] font-medium text-gray-600">{sub.batches}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[15px] font-bold text-gray-900">{sub.credits}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
        </motion.div>

      </div>
    </div>
  )
}
