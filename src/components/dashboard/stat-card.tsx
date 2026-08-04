import type { LucideIcon } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon?: LucideIcon
  label: string
  value: string
  hint?: string
  delta?: string
  featured?: boolean
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  delta,
  featured = false,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'relative gap-0 overflow-hidden p-5',
        featured && 'border-transparent bg-primary text-primary-foreground',
      )}
    >
      {featured && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-14 size-44 rounded-full bg-white/10"
        />
      )}
      <div className="relative flex items-center gap-2">
        {Icon && (
          <Icon
            className={cn(
              'size-4',
              featured ? 'text-primary-foreground/90' : 'text-muted-foreground',
            )}
          />
        )}
        <span
          className={cn(
            'text-sm font-medium',
            featured ? 'text-primary-foreground/90' : 'text-muted-foreground',
          )}
        >
          {label}
        </span>
      </div>

      <div className="relative mt-4 flex items-end gap-2">
        <span className="text-3xl font-bold tracking-tight tabular-nums">
          {value}
        </span>
        {delta && (
          <span
            className={cn(
              'pb-1 text-xs font-semibold',
              featured ? 'text-primary-foreground/90' : 'text-sare-blue',
            )}
          >
            {delta}
          </span>
        )}
      </div>

      {hint && (
        <p
          className={cn(
            'relative mt-2 text-xs',
            featured ? 'text-primary-foreground/75' : 'text-muted-foreground',
          )}
        >
          {hint}
        </p>
      )}
    </Card>
  )
}
