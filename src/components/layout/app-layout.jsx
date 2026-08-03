import { useState } from 'react'
import { Bell, Menu, Moon, Search, ShoppingBag, Sun } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

import { SidebarNav } from '@/components/layout/sidebar-nav'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useTheme } from '@/hooks/use-theme'

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-4 py-1">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <ShoppingBag className="size-4.5" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-base font-bold tracking-tight">SARE</span>
        <span className="text-[10px] text-muted-foreground">
          powered by SHOFCO
        </span>
      </span>
    </Link>
  )
}

function UserCard() {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-2.5">
      <Avatar className="size-9">
        <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
          MW
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">Marcus W.</p>
        <p className="truncate text-xs text-muted-foreground">Inventory admin</p>
      </div>
    </div>
  )
}

export function AppLayout() {
  const { theme, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-svh bg-canvas">
      <div className="flex min-h-svh w-full">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r bg-sidebar lg:flex">
          <div className="py-4">
            <Brand />
          </div>
          <Separator />
          <div className="flex-1 overflow-y-auto">
            <SidebarNav />
          </div>
          <div className="p-3">
            <UserCard />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur md:px-6">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-sidebar p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="py-4">
                  <Brand />
                </div>
                <Separator />
                <SidebarNav onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search shops or products"
                className="h-10 rounded-full bg-muted/60 pl-9"
                aria-label="Global search"
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="size-4" />
                ) : (
                  <Moon className="size-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hidden rounded-full sm:inline-flex"
                aria-label="Notifications"
              >
                <Bell className="size-4" />
              </Button>
              <Avatar className="size-9 lg:hidden">
                <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
                  MW
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
