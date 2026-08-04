import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  Package,
  Settings,
  Store,
  type LucideIcon,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { useInventory } from '@/features/inventory/use-inventory'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  icon: LucideIcon
  /** Omitted for placeholder items — they are labels, not destinations. */
  to?: string
  count?: number
  end?: boolean
  soon?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { shops, products } = useInventory()

  const sections: NavSection[] = [
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
        { label: 'Stock levels', icon: Boxes, soon: true },
        { label: 'Reports', icon: BarChart3, soon: true },
      ],
    },
    {
      title: 'Management',
      items: [{ label: 'Settings', icon: Settings, soon: true }],
    },
  ]

  const base =
    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors'

  const renderContent = (item: NavItem, isActive: boolean) => (
    <>
      <item.icon
        className={cn(
          'size-4 shrink-0',
          item.soon
            ? 'text-muted-foreground/50'
            : isActive
              ? 'text-sidebar-primary'
              : 'text-muted-foreground group-hover:text-sidebar-primary',
        )}
      />
      <span className="flex-1 truncate">{item.label}</span>
      {item.count !== undefined && (
        <Badge
          variant="secondary"
          className="h-5 rounded-full px-2 text-[11px] font-medium tabular-nums"
        >
          {item.count}
        </Badge>
      )}
      {item.soon && (
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60">
          Soon
        </span>
      )}
    </>
  )

  return (
    <nav className="flex flex-col gap-6 px-3 py-4">
      {sections.map((section) => (
        <div key={section.title} className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {section.title}
          </p>
          {section.items.map((item) =>
            // Planned sections render as inert labels. Making them links would
            // hand the user a destination that does not exist — the catch-all
            // route would bounce them to the dashboard with no explanation.
            item.to === undefined ? (
              <p
                key={item.label}
                aria-disabled="true"
                title="Not available yet"
                className={cn(base, 'cursor-not-allowed text-muted-foreground/60')}
              >
                {renderContent(item, false)}
              </p>
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    base,
                    isActive
                      ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                  )
                }
              >
                {({ isActive }) => renderContent(item, isActive)}
              </NavLink>
            ),
          )}
        </div>
      ))}
    </nav>
  )
}
