'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Timer,
  CheckSquare,
  BarChart3,
  Trophy,
  Flame,
  Settings,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useAppContext } from '@/lib/app-context'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/timer',     label: 'Timer',        icon: Timer },
  { href: '/tasks',     label: 'Tasks',        icon: CheckSquare },
  { href: '/analytics', label: 'Analytics',   icon: BarChart3 },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/streaks',   label: 'Streaks',      icon: Flame },
  { href: '/settings',  label: 'Settings',     icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useAppContext()
  const streak = state.stats.currentStreak

  return (
    <Sidebar collapsible="icon">
      {/* Logo */}
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">ST</span>
          </div>
          <span className="font-bold text-base bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-data-[collapsible=icon]:hidden">
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
                const isActive = pathname === href
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
          {/* Red dot = not connected */}
          <span className="w-2 h-2 rounded-full bg-destructive shrink-0" />
          <span className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            Device not connected
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
