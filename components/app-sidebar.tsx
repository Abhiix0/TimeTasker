'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Timer,
  CheckSquare,
  BarChart3,
  Trophy,
  Flame,
  Settings,
  Info,
  Cpu,
  UserCircle,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useAppContext } from '@/lib/app-context'
import { useAuth } from '@/lib/use-auth'
import { useEsp32 } from '@/lib/use-esp32'

const NAV_ITEMS = [
  { href: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/timer',       label: 'Timer',        icon: Timer },
  { href: '/tasks',       label: 'Tasks',        icon: CheckSquare },
  { href: '/analytics',   label: 'Analytics',    icon: BarChart3 },
  { href: '/leaderboard', label: 'Leaderboard',  icon: Trophy },
  { href: '/streaks',     label: 'Streaks',      icon: Flame },
  { href: '/profile',     label: 'Profile',      icon: UserCircle },
  { href: '/settings',    label: 'Settings',     icon: Settings },
]

const INFO_ITEMS = [
  { href: '/about',  label: 'About',  icon: Info },
  { href: '/device', label: 'Device', icon: Cpu  },
]

function isActiveRoute(pathname: string, href: string): boolean {
  // Dashboard must be exact — it's the root app route
  if (href === '/dashboard') return pathname === href
  return pathname === href || pathname.startsWith(href + '/')
}

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useAppContext()
  const { user } = useAuth()
  const { status: deviceStatus } = useEsp32(user?.uid ?? null)
  const streak = state.stats.currentStreak

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const onOnline  = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online',  onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online',  onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  return (
    <Sidebar collapsible="icon">
      {/* Logo */}
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-linear-to-br from-primary to-accent rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">ST</span>
          </div>
          <span className="font-bold text-base bg-linear-to-r from-primary to-accent bg-clip-text text-transparent group-data-[collapsible=icon]:hidden">
            Smart Time
          </span>
        </Link>
      </SidebarHeader>

      {/* Nav items */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const isActive = isActiveRoute(pathname, href)
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={label}
                      className={isActive ? 'text-primary font-semibold' : ''}
                    >
                      <Link href={href}>
                        <Icon className={isActive ? 'text-primary' : ''} />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Info section */}
        <SidebarGroup>
          <SidebarGroupLabel>Info</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {INFO_ITEMS.map(({ href, label, icon: Icon }) => {
                const isActive = isActiveRoute(pathname, href)
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={label}
                      className={isActive ? 'text-primary font-semibold' : ''}
                    >
                      <Link href={href}>
                        <Icon className={isActive ? 'text-primary' : ''} />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer — streak + ESP32 status */}
      <SidebarFooter className="p-4 space-y-3">
        {/* Streak */}
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <span className="text-lg">🔥</span>
          <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">
            {streak} day{streak !== 1 ? 's' : ''} streak
          </span>
        </div>

        {/* ESP32 connection status */}
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <span className={`w-2 h-2 rounded-full shrink-0 ${
            deviceStatus === 'connected'   ? 'bg-green-500'  :
            deviceStatus === 'connecting'  ? 'bg-yellow-400' :
            'bg-destructive'
          }`} />
          <span className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            {deviceStatus === 'connected'  ? 'Device connected'  :
             deviceStatus === 'connecting' ? 'Connecting...'     :
             deviceStatus === 'error'      ? 'Device error'      :
             'Device not connected'}
          </span>
        </div>

        {/* Sync status — only shown when logged in */}
        {user && (
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <span className={`w-2 h-2 rounded-full shrink-0 ${isOnline ? 'bg-green-500' : 'bg-yellow-400'}`} />
            <span className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
              {isOnline ? 'Synced' : 'Offline'}
            </span>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}

