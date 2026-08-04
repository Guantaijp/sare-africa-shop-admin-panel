import { RefreshCw, ServerCrash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toErrorMessage } from '@/lib/api'

/** Card-shaped skeletons used while the first fetch is in flight. */
export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[124px] rounded-xl" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-40 rounded-xl" />
      ))}
    </div>
  )
}

export function ErrorState({
  error,
  onRetry,
}: {
  error: unknown
  onRetry?: () => void
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <ServerCrash className="size-5 text-destructive" />
        </span>
        <div>
          <p className="font-medium">Could not load data</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {toErrorMessage(error)}
          </p>
        </div>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="size-4" />
            Try again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
