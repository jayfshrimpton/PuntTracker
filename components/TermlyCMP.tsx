'use client'

import { useEffect, useMemo, useRef } from 'react'

const SCRIPT_SRC_BASE = 'https://app.termly.io'

interface TermlyCMPProps {
  autoBlock?: boolean
  masterConsentsOrigin?: string
  websiteUUID: string
}

export default function TermlyCMP({ 
  autoBlock, 
  masterConsentsOrigin, 
  websiteUUID 
}: TermlyCMPProps) {
  const scriptSrc = useMemo(() => {
    const src = new URL(SCRIPT_SRC_BASE)
    src.pathname = `/resource-blocker/${websiteUUID}`
    if (autoBlock) {
      src.searchParams.set('autoBlock', 'on')
    }
    if (masterConsentsOrigin) {
      src.searchParams.set('masterConsentsOrigin', masterConsentsOrigin)
    }
    return src.toString()
  }, [autoBlock, masterConsentsOrigin, websiteUUID])

  const isScriptAdded = useRef(false)

  useEffect(() => {
    if (isScriptAdded.current) return
    if (typeof window === 'undefined') return
    
    const script = document.createElement('script')
    script.src = scriptSrc
    script.async = true
    document.head.appendChild(script)
    isScriptAdded.current = true

    // Initialize Termly when script loads
    script.onload = () => {
      if ((window as any).Termly) {
        (window as any).Termly.initialize()
      }
    }
  }, [scriptSrc])

  // Re-initialize on route changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleRouteChange = () => {
      if ((window as any).Termly) {
        (window as any).Termly.initialize()
      }
    }

    // Listen for Next.js route changes
    window.addEventListener('popstate', handleRouteChange)
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [])

  return null
}

