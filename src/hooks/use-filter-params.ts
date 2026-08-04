import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

type ParamValue = string | number
type ParamDefaults = Record<string, ParamValue>

/**
 * Mirrors a page's search/filter state into the URL query string.
 *
 * Chosen over writing to storage because the URL gives the same
 * survives-a-reload behaviour for free, and three things storage cannot: the
 * filtered view is shareable as a link, back/forward work, and there is no
 * mount effect copying storage into state.
 *
 * Values equal to their default are dropped from the query string, so an
 * unfiltered page stays a clean `/products`. Writes replace the current history
 * entry rather than pushing one, so search-as-you-type doesn't bury the back
 * button under a stack of keystrokes.
 *
 * `defaults` must be a stable reference — declare it at module scope, not
 * inline in the component.
 */
export function useFilterParams<T extends ParamDefaults>(defaults: T) {
  const [searchParams, setSearchParams] = useSearchParams()

  const values = useMemo(() => {
    const result: ParamDefaults = {}
    for (const [key, fallback] of Object.entries(defaults)) {
      const raw = searchParams.get(key)
      if (raw === null || raw === '') {
        result[key] = fallback
      } else if (typeof fallback === 'number') {
        // A hand-edited `?page=abc` falls back rather than poisoning the page.
        const parsed = Number(raw)
        result[key] = Number.isFinite(parsed) ? parsed : fallback
      } else {
        result[key] = raw
      }
    }
    return result as T
  }, [searchParams, defaults])

  /** Merges a partial update into the query string. */
  const setValues = useCallback(
    (patch: Partial<T>) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [key, value] of Object.entries(patch)) {
            if (value === undefined || value === defaults[key]) next.delete(key)
            else next.set(key, String(value))
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams, defaults],
  )

  /** Drops every managed key, leaving any unrelated params untouched. */
  const reset = useCallback(() => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        for (const key of Object.keys(defaults)) next.delete(key)
        return next
      },
      { replace: true },
    )
  }, [setSearchParams, defaults])

  return [values, setValues, reset] as const
}
