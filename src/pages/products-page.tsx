import { useMemo, useState } from 'react'
import { Plus, Search, X } from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { DeleteProductDialog } from '@/components/products/delete-product-dialog'
import { ProductFormDialog } from '@/components/products/product-form-dialog'
import { ProductsTable } from '@/components/products/products-table'
import { ErrorState, LoadingState } from '@/components/shared/query-state'
import { TablePagination } from '@/components/shared/table-pagination'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useInventory } from '@/features/inventory/use-inventory'
import { useFilterParams } from '@/hooks/use-filter-params'
import { PAGE_SIZE } from '@/lib/constants'
import type { Product, Shop } from '@/types'

type SortKey = 'price-asc' | 'price-desc' | 'stock-desc' | 'stock-asc' | 'name-asc'

const SORTS: Record<
  SortKey,
  { label: string; fn: (a: Product, b: Product) => number }
> = {
  'price-asc': { label: 'Price: low to high', fn: (a, b) => a.price - b.price },
  'price-desc': { label: 'Price: high to low', fn: (a, b) => b.price - a.price },
  'stock-desc': { label: 'Stock: high to low', fn: (a, b) => b.stock - a.stock },
  'stock-asc': { label: 'Stock: low to high', fn: (a, b) => a.stock - b.stock },
  'name-asc': {
    label: 'Name: A to Z',
    fn: (a, b) => a.name.localeCompare(b.name),
  },
}

/** Module scope so the reference stays stable across renders. */
const FILTER_DEFAULTS = { q: '', shop: 'all', sort: 'price-asc', page: 1 }

export default function ProductsPage() {
  const { products, shops, isLoading, isError, error, refetch } = useInventory()

  // Filters live in the URL, so a filtered view survives a reload and can be
  // shared as a link.
  const [filters, setFilters, clearFilters] = useFilterParams(FILTER_DEFAULTS)
  const query = filters.q
  // Both params are user-editable, so neither is trusted: an unknown sort key
  // would crash the lookup below, and a stale shop id would leave the select
  // showing its placeholder.
  const sortKey = (filters.sort in SORTS ? filters.sort : 'price-asc') as SortKey
  const shopFilter = shops.some((s) => s.id === filters.shop)
    ? filters.shop
    : 'all'

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)

  const shopsById = useMemo(
    () =>
      Object.fromEntries(shops.map((shop) => [shop.id, shop])) as Record<
        string,
        Shop
      >,
    [shops],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const rows = products.filter((product) => {
      if (shopFilter !== 'all' && product.shopId !== shopFilter) return false
      if (!q) return true
      return (
        product.name.toLowerCase().includes(q) ||
        product.sku?.toLowerCase().includes(q) ||
        product.category?.toLowerCase().includes(q) ||
        product.description?.toLowerCase().includes(q) ||
        shopsById[product.shopId]?.name.toLowerCase().includes(q)
      )
    })
    return [...rows].sort(SORTS[sortKey].fn)
  }, [products, query, shopFilter, sortKey, shopsById])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  // Clamp during render rather than syncing in an effect: deleting the last
  // row on the final page — or a hand-edited `?page=99` — would otherwise
  // leave the user on an empty page.
  const safePage = Math.min(Math.max(filters.page, 1), pageCount)
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const hasFilters = query !== '' || shopFilter !== 'all'

  // Any filter change sends the user back to page 1.
  const applyQuery = (value: string) => setFilters({ q: value, page: 1 })
  const applyShopFilter = (value: string) => setFilters({ shop: value, page: 1 })
  const applySort = (value: string) => setFilters({ sort: value, page: 1 })
  const setPage = (value: number) => setFilters({ page: value })

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    setFormOpen(true)
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title="Products" description="Loading products…" />
        <LoadingState rows={2} />
      </>
    )
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Products" />
        <ErrorState error={error} onRetry={refetch} />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Products"
        description={`${products.length} product${products.length === 1 ? '' : 's'} across ${shops.length} shop${shops.length === 1 ? '' : 's'}`}
        actions={
          <Button onClick={openCreate} disabled={shops.length === 0}>
            <Plus className="size-4" />
            Add product
          </Button>
        }
      />

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1 lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => applyQuery(e.target.value)}
              placeholder="Search by name, SKU or category"
              className="pl-9"
              aria-label="Search products"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <Select value={shopFilter} onValueChange={applyShopFilter}>
              <SelectTrigger className="w-[190px]" aria-label="Filter by shop">
                <SelectValue placeholder="All shops" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All shops</SelectItem>
                {shops.map((shop) => (
                  <SelectItem key={shop.id} value={shop.id}>
                    {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortKey} onValueChange={applySort}>
              <SelectTrigger className="w-[190px]" aria-label="Sort products">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SORTS).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                <X className="size-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        <ProductsTable
          products={visible}
          shopsById={shopsById}
          onEdit={openEdit}
          onDelete={setDeleting}
          emptyTitle={
            hasFilters ? 'No products match your filters' : 'No products yet'
          }
          emptyMessage={
            hasFilters
              ? 'Try a different search term or shop.'
              : 'Add your first product to start tracking stock.'
          }
        />

        <TablePagination
          page={safePage}
          pageCount={pageCount}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </Card>

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editing}
      />
      <DeleteProductDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        product={deleting}
      />
    </>
  )
}
