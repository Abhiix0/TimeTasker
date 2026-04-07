'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Navbar } from '@/components/navbar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppProvider } from '@/lib/app-context'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/lib/use-auth'
import { useIsMobile } from '@/hooks/use-mobile'
import { LayoutDashboard, Timer, CheckSquare, TrendingUp } from 'lucide-react'

const BOTTOM_NAV = [
  { href: '/dashboard', label: 'Home',      icon: LayoutDashboard },
  { href: '/timer',     label: 'Timer',     icon: Timer           },
  { href: '/tasks',     label: 'Tasks',     icon: CheckSquare     },
  { href: '/analytics', label: 'Analytics', icon: TrendingUp      },
]

function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md flex">
      {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] transition-colors
              ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
            `}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    // Not logged in → login page
    if (!user) { router.replace('/login'); return }

    // Already on profile page — don't redirect again
    if (pathname === '/profile') return

    // Check if display name is set; if not, redirect to profile setup.
    // Google users have displayName on the Auth object; email users need
    // the Firestore doc checked.
    if (user.displayName) return

    getDoc(doc(db, 'users', user.uid)).then((snap) => {
      const hasName = snap.exists() && !!snap.data()?.displayName
      if (!hasName) router.replace('/profile')
    }).catch(console.error)
  }, [user, loading, pathname, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}

function AppShell({ children }: { children: React.ReactNode }) {
  // Start as false (matches SSR — no window available).
  // Flip to real value after first paint to avoid hydration mismatch.
  const [mounted, setMounted] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => { setMounted(true) }, [])

  // Before mount, always render the sidebar layout so SSR and first client
  // render are identical — React won't see a mismatch.
  if (!mounted || !isMobile) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex items-center gap-1 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50 h-16 px-2">
            <SidebarTrigger className="shrink-0" />
            <div className="flex-1">
              <Navbar />
            </div>
          </header>
          <main className="flex-1 animate-in fade-in duration-200">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50 h-16 px-4">
        <div className="flex-1">
          <Navbar />
        </div>
      </header>
      <main className="flex-1 animate-in fade-in duration-200 pb-16">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AuthGuard>
        <AppShell>{children}</AppShell>
      </AuthGuard>
    </AppProvider>
  )
}
