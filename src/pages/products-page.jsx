import { useMemo, useState } from 'react'
import { Plus, Search, X } from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { DeleteProductDialog } from '@/components/products/delete-product-dialog'
import { ProductFormDialog } from '@/components/products/product-form-dialog'
import { ProductsTable } from '@/components/products/products-table'
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
import { useInventory } from '@/store/use-inventory'

const PAGE_SIZE = 8

const SORTS = {
  'price-asc': { label: 'Price: low to high', fn: (a, b) => a.price - b.price },
  'price-desc': { label: 'Price: high to low', fn: (a, b) => b.price - a.price },
  'stock-desc': { label: 'Stock: high to low', fn: (a, b) => b.stock - a.stock },
  'stock-asc': { label: 'Stock: low to high', fn: (a, b) => a.stock - b.stock },
  'name-asc': {
    label: 'Name: A to Z',
    fn: (a, b) => a.name.localeCompare(b.name),
  },
}

export default function ProductsPage() {
  const { products, shops } = useInventory()

  const [query, setQuery] = useState('')
  const [shopFilter, setShopFilter] = useState('all')
  const [sortKey, setSortKey] = useState('price-asc')
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const shopsById = useMemo(
    () => Object.fromEntries(shops.map((shop) => [shop.id, shop])),
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
        shopsById[product.shopId]?.name.toLowerCase().includes(q)
      )
    })
    return [...rows].sort(SORTS[sortKey].fn)
  }, [products, query, shopFilter, sortKey, shopsById])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  // Clamp during render rather than syncing in an effect: deleting the last
  // row on the final page would otherwise leave the user on an empty page.
  const safePage = Math.min(page, pageCount)
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const hasFilters = query !== '' || shopFilter !== 'all'

  // Any filter change sends the user back to page 1.
  const applyQuery = (value) => {
    setQuery(value)
    setPage(1)
  }
  const applyShopFilter = (value) => {
    setShopFilter(value)
    setPage(1)
  }
  const applySort = (value) => {
    setSortKey(value)
    setPage(1)
  }

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    setFormOpen(true)
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
              <Button
                variant="ghost"
                onClick={() => {
                  setQuery('')
                  setShopFilter('all')
                }}
              >
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
