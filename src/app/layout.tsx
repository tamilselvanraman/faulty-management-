import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import ClientLayoutShell from '@/components/layout/ClientLayoutShell'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'EduManage ERP — College Administration Portal',
  description: 'Enterprise College Management System for faculty, students, classes, timetable, events, committees, and tasks.',
  keywords: 'college management, ERP, faculty, students, timetable',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <body className={`${inter.variable} font-sans antialiased bg-background text-on-background overflow-x-hidden`}>
        <ClientLayoutShell>
          {children}
        </ClientLayoutShell>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#111827',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
            },
          }}
        />
      </body>
    </html>
  )
}
