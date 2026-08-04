import { useState } from 'react'
import {
  Bell,
  ChevronsUpDown,
  LogOut,
  Menu,
  Moon,
  Search,
  ShoppingBag,
  Sun,
} from 'lucide-react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { SidebarNav } from '@/components/layout/sidebar-nav'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/features/auth/use-auth'
import { useTheme } from '@/hooks/use-theme'
import { initialsOf } from '@/lib/format'

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

function UserMenu({ collapsed = false }: { collapsed?: boolean }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const handleLogout = () => {
    logout()
    toast.success('Signed out')
    navigate('/login', { replace: true })
  }

  const avatar = (
    <Avatar className="size-9">
      {user.avatar && <AvatarImage src={user.avatar} alt="" />}
      <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
        {initialsOf(user.name)}
      </AvatarFallback>
    </Avatar>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {collapsed ? (
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-full"
            aria-label="Account menu"
          >
            {avatar}
          </Button>
        ) : (
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl border bg-card p-2.5 text-left transition-colors hover:bg-muted"
            aria-label="Account menu"
          >
            {avatar}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">
                {user.name}
              </span>
              <span className="block truncate text-xs capitalize text-muted-foreground">
                {user.role}
              </span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side="top" className="w-56">
        <DropdownMenuLabel>
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
            <UserMenu />
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
              <div className="lg:hidden">
                <UserMenu collapsed />
              </div>
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
