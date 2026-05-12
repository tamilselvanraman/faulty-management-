'use client'

import { usePathname } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'

const NO_SHELL_ROUTES = ['/login', '/register']

export default function ClientLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const noShell = NO_SHELL_ROUTES.some(r => pathname.startsWith(r))
  if (noShell) return <>{children}</>
  return <AppShell>{children}</AppShell>
}
