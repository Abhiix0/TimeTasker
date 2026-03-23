'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const [isDark, setIsDark] = useState(true) // default dark
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('theme')
    const prefersDark = saved ? saved === 'dark' : true
    document.documentElement.classList.toggle('dark', prefersDark)
    setIsDark(prefersDark)
  }, [])

  const toggleDarkMode = () => {
    if (!mounted) return
    const next = !isDark
    document.documentElement.classList.toggle('dark', next)
    setIsDark(next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <div className="flex items-center justify-between h-16 px-4">
      {/* Logo — shown in landing layout; hidden in app layout (sidebar has it) */}
      <Link href="/" className="flex items-center gap-2 md:hidden">
        <div className="w-7 h-7 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">ST</span>
        </div>
        <span className="font-bold text-base bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Smart Time
        </span>
      </Link>

      {/* Spacer for desktop (sidebar has the logo) */}
      <div className="hidden md:block" />

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDarkMode}
        className="rounded-full ml-auto"
        aria-label="Toggle dark mode"
      >
        {mounted ? (isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <Moon className="w-5 h-5" />}
      </Button>
    </div>
  )
}
