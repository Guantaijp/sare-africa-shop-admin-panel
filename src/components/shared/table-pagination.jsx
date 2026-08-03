import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Compact page list: first, last, current ±1, with gaps collapsed to "…". */
function pageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = new Set([1, total, current, current - 1, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)

  const out = []
  let prev = 0
  for (const page of sorted) {
    if (prev && page - prev > 1) out.push(`gap-${page}`)
    out.push(page)
    prev = page
  }
  return out
}

export function TablePagination({
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
}) {
  if (total === 0) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t px-5 py-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{from}</span>–
        <span className="font-medium text-foreground">{to}</span> of{' '}
        <span className="font-medium text-foreground">{total}</span>
      </p>

      {pageCount > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>

          {pageList(page, pageCount).map((item) =>
            typeof item === 'number' ? (
              <Button
                key={item}
                variant={item === page ? 'default' : 'outline'}
                size="icon"
                className={cn('size-8 tabular-nums', item === page && 'pointer-events-none')}
                onClick={() => onPageChange(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
              >
                {item}
              </Button>
            ) : (
              <span
                key={item}
                className="px-1 text-sm text-muted-foreground"
                aria-hidden
              >
                …
              </span>
            ),
          )}

          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page === pageCount}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
