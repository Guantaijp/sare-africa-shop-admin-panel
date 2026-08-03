import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  Boxes,
  MapPin,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wallet,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { StatCard } from '@/components/dashboard/stat-card'
import { DeleteProductDialog } from '@/components/products/delete-product-dialog'
import { ProductFormDialog } from '@/components/products/product-form-dialog'
import { ProductsTable } from '@/components/products/products-table'
import { TablePagination } from '@/components/shared/table-pagination'
import { DeleteShopDialog } from '@/components/shops/delete-shop-dialog'
import { ShopFormDialog } from '@/components/shops/shop-form-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
  initialsOf,
  inventoryValue,
  stockStatus,
  totalStock,
} from '@/lib/format'
import { useInventory } from '@/store/use-inventory'

const PAGE_SIZE = 8

export default function ShopDetailPage() {
  const { shopId } = useParams()
  const navigate = useNavigate()
  const { getShop, getShopProducts } = useInventory()

  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [shopFormOpen, setShopFormOpen] = useState(false)
  const [shopDeleteOpen, setShopDeleteOpen] = useState(false)
  const [productFormOpen, setProductFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deletingProduct, setDeletingProduct] = useState(null)

  const shop = getShop(shopId)
  const products = useMemo(
    () => (shop ? getShopProducts(shop.id) : []),
    [shop, getShopProducts],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q),
    )
  }, [products, query])

  const totals = useMemo(() => {
    const counts = { in: 0, low: 0, out: 0 }
    for (const p of products) counts[stockStatus(p.stock).key] += 1
    return {
      products: products.length,
      stock: totalStock(products),
      value: inventoryValue(products),
      counts,
    }
  }, [products])

  if (!shop) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="font-medium">Shop not found</p>
          <p className="text-sm text-muted-foreground">
            It may have been deleted.
          </p>
          <Button asChild>
            <Link to="/shops">Back to shops</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="mb-3 -ml-2 text-muted-foreground"
        asChild
      >
        <Link to="/shops">
          <ArrowLeft className="size-4" />
          All shops
        </Link>
      </Button>

      <Card className="mb-4">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-secondary">
            {shop.logo ? (
              <img src={shop.logo} alt="" className="size-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-secondary-foreground">
                {initialsOf(shop.name)}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{shop.name}</h1>
            {shop.location && (
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5" />
                {shop.location}
              </p>
            )}
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {shop.description || 'No description provided.'}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
              <span>
                <span className="font-semibold text-chart-2">
                  {totals.counts.in}
                </span>{' '}
                in stock
              </span>
              <span>
                <span className="font-semibold text-chart-4">
                  {totals.counts.low}
                </span>{' '}
                low
              </span>
              <span>
                <span className="font-semibold text-destructive">
                  {totals.counts.out}
                </span>{' '}
                out of stock
              </span>
              <span>Created {shop.createdAt}</span>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <Button variant="outline" onClick={() => setShopFormOpen(true)}>
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setShopDeleteOpen(true)}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <StatCard
          featured
          icon={Package}
          label="Products"
          value={formatNumber(totals.products)}
          hint="Distinct SKUs in this shop"
        />
        <StatCard
          icon={Boxes}
          label="Total Stock"
          value={formatNumber(totals.stock)}
          hint="Units on hand"
        />
        <StatCard
          icon={Wallet}
          label="Inventory Value"
          value={formatCompactCurrency(totals.value)}
          hint={formatCurrency(totals.value)}
        />
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold">Products in this shop</h2>
            <p className="text-sm text-muted-foreground">
              {filtered.length} of {products.length} shown
            </p>
          </div>
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <div className="relative sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                placeholder="Search products"
                className="pl-9"
                aria-label="Search products in this shop"
              />
            </div>
            <Button
              onClick={() => {
                setEditingProduct(null)
                setProductFormOpen(true)
              }}
            >
              <Plus className="size-4" />
              Add product
            </Button>
          </div>
        </div>

        <ProductsTable
          products={visible}
          showShop={false}
          onEdit={(product) => {
            setEditingProduct(product)
            setProductFormOpen(true)
          }}
          onDelete={setDeletingProduct}
          emptyTitle={query ? 'No matching products' : 'No products yet'}
          emptyMessage={
            query
              ? 'Try a different search term.'
              : 'Add a product to start tracking stock for this shop.'
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

      <ShopFormDialog
        open={shopFormOpen}
        onOpenChange={setShopFormOpen}
        shop={shop}
      />
      <DeleteShopDialog
        open={shopDeleteOpen}
        onOpenChange={setShopDeleteOpen}
        shop={shop}
        onDeleted={() => navigate('/shops')}
      />
      <ProductFormDialog
        open={productFormOpen}
        onOpenChange={setProductFormOpen}
        product={editingProduct}
        defaultShopId={shop.id}
      />
      <DeleteProductDialog
        open={Boolean(deletingProduct)}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        product={deletingProduct}
      />
    </>
  )
}
