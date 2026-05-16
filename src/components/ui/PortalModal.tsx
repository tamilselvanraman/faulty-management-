'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Renders children inside a React Portal at document.body.
 * This fixes modals broken by framer-motion transform parents
 * which create new containing blocks for `position: fixed`.
 */
export default function PortalModal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null
  return createPortal(<>{children}</>, document.body)
}
