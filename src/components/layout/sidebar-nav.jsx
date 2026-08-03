import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  Package,
  Settings,
  Store,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useInventory } from '@/store/use-inventory'

export function SidebarNav({ onNavigate }) {
  const { shops, products } = useInventory()

  const sections = [
    {
      title: 'General',
      items: [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/shops', label: 'Shops', icon: Store, count: shops.length },
        {
          to: '/products',
          label: 'Products',
          icon: Package,
          count: products.length,
        },
      ],
    },
    {
      title: 'Inventory',
      items: [
        { to: '/stock', label: 'Stock levels', icon: Boxes, soon: true },
        { to: '/reports', label: 'Reports', icon: BarChart3, soon: true },
      ],
    },
    {
      title: 'Management',
      items: [{ to: '/settings', label: 'Settings', icon: Settings, soon: true }],
    },
  ]

  return (
    <nav className="flex flex-col gap-6 px-3 py-4">
      {sections.map((section) => (
        <div key={section.title} className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {section.title}
          </p>
          {section.items.map(({ to, label, icon: Icon, count, end, soon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'size-4 shrink-0',
                      isActive
                        ? 'text-sidebar-primary'
                        : 'text-muted-foreground group-hover:text-sidebar-primary',
                    )}
                  />
                  <span className="flex-1 truncate">{label}</span>
                  {count !== undefined && (
                    <Badge
                      variant="secondary"
                      className="h-5 rounded-full px-2 text-[11px] font-medium tabular-nums"
                    >
                      {count}
                    </Badge>
                  )}
                  {soon && (
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60">
                      Soon
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  )
}
