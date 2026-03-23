import { Navbar } from '@/components/navbar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppProvider } from '@/lib/app-context'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Sticky top bar */}
          <header className="flex items-center gap-1 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50 h-16 px-2">
            <SidebarTrigger className="shrink-0" />
            <div className="flex-1">
              <Navbar />
            </div>
          </header>
          {/* Page content — fade in on each navigation */}
          <main className="flex-1 animate-in fade-in duration-200">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AppProvider>
  )
}
