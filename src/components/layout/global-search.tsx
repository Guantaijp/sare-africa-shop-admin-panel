import { useMemo, useRef, useState } from 'react'
import { ArrowRight, Package, Search, Store } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Input } from '@/components/ui/input'
import { useInventory } from '@/features/inventory/use-inventory'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

/** Shops and products are listed separately, so cap each group. */
const MAX_PER_GROUP = 4

type ResultKind = 'shop' | 'product' | 'all'

interface Result {
  key: string
  kind: ResultKind
  label: string
  hint: string
  to: string
}

/**
 * Top-bar search across both collections. It reads from the same TanStack Query
 * cache the sidebar and pages already use, so matching is instant and costs no
 * extra request.
 *
 * Selecting a shop opens its detail page; selecting a product opens the product
 * list filtered to it, which works because the list reads its filters from the
 * URL (see `use-filter-params`).
 */
export function GlobalSearch() {
  const navigate = useNavigate()
  const { shops, products } = useInventory()

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const trimmed = query.trim()

  const { shopHits, productHits, items } = useMemo(() => {
    const q = trimmed.toLowerCase()
    if (!q) return { shopHits: [], productHits: [], items: [] as Result[] }

    const shopHits: Result[] = shops
      .filter(
        (shop) =>
          shop.name.toLowerCase().includes(q) ||
          shop.location?.toLowerCase().includes(q) ||
          shop.description?.toLowerCase().includes(q),
      )
      .slice(0, MAX_PER_GROUP)
      .map((shop) => ({
        key: `shop-${shop.id}`,
        kind: 'shop',
        label: shop.name,
        hint: shop.location || 'Shop',
        to: `/shops/${shop.id}`,
      }))

    const shopNames = new Map(shops.map((shop) => [shop.id, shop.name]))

    const productHits: Result[] = products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(q) ||
          product.sku?.toLowerCase().includes(q) ||
          product.category?.toLowerCase().includes(q) ||
          product.description?.toLowerCase().includes(q),
      )
      .slice(0, MAX_PER_GROUP)
      .map((product) => ({
        key: `product-${product.id}`,
        kind: 'product',
        label: product.name,
        hint: `${shopNames.get(product.shopId) ?? 'Unknown shop'} · ${formatCurrency(product.price)}`,
        to: `/products?q=${encodeURIComponent(product.name)}`,
      }))

    // Always offer the full product search as a last row, so a query with no
    // direct hit still has somewhere to go.
    const seeAll: Result = {
      key: 'see-all',
      kind: 'all',
      label: `Search all products for “${trimmed}”`,
      hint: '',
      to: `/products?q=${encodeURIComponent(trimmed)}`,
    }

    return { shopHits, productHits, items: [...shopHits, ...productHits, seeAll] }
  }, [trimmed, shops, products])

  const isOpen = open && items.length > 0

  const applyQuery = (value: string) => {
    setQuery(value)
    setActive(0)
    setOpen(true)
  }

  const select = (item: Result) => {
    navigate(item.to)
    setQuery('')
    setOpen(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false)
      return
    }
    if (!items.length) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActive((current) => (current + 1) % items.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      setActive((current) => (current - 1 + items.length) % items.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      select(items[active] ?? items[items.length - 1])
    }
  }

  const renderItem = (item: Result, index: number) => {
    const Icon =
      item.kind === 'shop' ? Store : item.kind === 'product' ? Package : ArrowRight
    return (
      <button
        key={item.key}
        type="button"
        id={`global-search-option-${index}`}
        role="option"
        aria-selected={index === active}
        tabIndex={-1}
        // Keep focus on the input so the click isn't cancelled by a blur.
        onMouseDown={(event) => event.preventDefault()}
        onMouseEnter={() => setActive(index)}
        onClick={() => select(item)}
        className={cn(
          'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors',
          index === active ? 'bg-muted' : 'hover:bg-muted/60',
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background">
          <Icon className="size-3.5 text-muted-foreground" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{item.label}</span>
          {item.hint && (
            <span className="block truncate text-xs text-muted-foreground">
              {item.hint}
            </span>
          )}
        </span>
      </button>
    )
  }

  return (
    <div
      className="relative w-full max-w-sm"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={query}
        onChange={(event) => applyQuery(event.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search shops or products"
        className="h-10 rounded-full bg-muted/60 pl-9"
        aria-label="Search shops or products"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="global-search-results"
        aria-autocomplete="list"
        aria-activedescendant={
          isOpen ? `global-search-option-${active}` : undefined
        }
      />

      {isOpen && (
        <div
          id="global-search-results"
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border bg-popover p-1.5 shadow-lg"
        >
          {shopHits.length > 0 && (
            <div role="group" aria-label="Shops">
              <p className="px-2 pb-1 pt-1.5 text-xs font-medium text-muted-foreground">
                Shops
              </p>
              {shopHits.map((item, index) => renderItem(item, index))}
            </div>
          )}

          {productHits.length > 0 && (
            <div role="group" aria-label="Products">
              <p className="px-2 pb-1 pt-2 text-xs font-medium text-muted-foreground">
                Products
              </p>
              {productHits.map((item, index) =>
                renderItem(item, shopHits.length + index),
              )}
            </div>
          )}

          {shopHits.length === 0 && productHits.length === 0 && (
            <p className="px-2 py-3 text-center text-sm text-muted-foreground">
              No shops or products match “{trimmed}”.
            </p>
          )}

          <div className="my-1.5 border-t" role="presentation" />
          {renderItem(items[items.length - 1], items.length - 1)}
        </div>
      )}
    </div>
  )
}
