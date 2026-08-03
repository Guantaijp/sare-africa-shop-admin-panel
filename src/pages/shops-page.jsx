import { useMemo, useState } from 'react'
import {
  Eye,
  MapPin,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Search,
  Store,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/layout/page-header'
import { DeleteShopDialog } from '@/components/shops/delete-shop-dialog'
import { ShopFormDialog } from '@/components/shops/shop-form-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  formatCompactCurrency,
  formatNumber,
  initialsOf,
  inventoryValue,
  totalStock,
} from '@/lib/format'
import { useInventory } from '@/store/use-inventory'

export default function ShopsPage() {
  const { shops, products } = useInventory()
  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return shops
      .map((shop) => {
        const items = products.filter((p) => p.shopId === shop.id)
        return {
          ...shop,
          productCount: items.length,
          stock: totalStock(items),
          value: inventoryValue(items),
        }
      })
      .filter(
        (shop) =>
          !q ||
          shop.name.toLowerCase().includes(q) ||
          shop.description?.toLowerCase().includes(q) ||
          shop.location?.toLowerCase().includes(q),
      )
  }, [shops, products, query])

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (shop) => {
    setEditing(shop)
    setFormOpen(true)
  }

  return (
    <>
      <PageHeader
        title="Shops"
        description={`${shops.length} location${shops.length === 1 ? '' : 's'} in the network`}
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Add shop
          </Button>
        }
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search shops"
          className="pl-9"
        />
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Store className="size-5 text-muted-foreground" />
            </span>
            <div>
              <p className="font-medium">
                {query ? 'No shops match your search' : 'No shops yet'}
              </p>
              <p className="text-sm text-muted-foreground">
                {query
                  ? 'Try a different name or location.'
                  : 'Create your first shop to start tracking inventory.'}
              </p>
            </div>
            {!query && (
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                Add shop
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((shop) => (
            <Card key={shop.id} className="gap-0 overflow-hidden py-0">
              <CardContent className="flex flex-1 gap-4 p-5">
                <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-secondary">
                  {shop.logo ? (
                    <img
                      src={shop.logo}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-secondary-foreground">
                      {initialsOf(shop.name)}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/shops/${shop.id}`}
                      className="truncate font-semibold hover:underline"
                    >
                      {shop.name}
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="-mr-2 -mt-1 size-8 shrink-0"
                          aria-label={`Actions for ${shop.name}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/shops/${shop.id}`}>
                            <Eye className="size-4" />
                            View shop
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => openEdit(shop)}>
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => setDeleting(shop)}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {shop.location && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" />
                      {shop.location}
                    </p>
                  )}
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {shop.description || 'No description provided.'}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Package className="size-3" />
                      {shop.productCount} product
                      {shop.productCount === 1 ? '' : 's'}
                    </Badge>
                    <Badge variant="outline" className="tabular-nums">
                      {formatNumber(shop.stock)} units
                    </Badge>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="justify-between border-t bg-muted/40 px-5 py-3">
                <span className="text-xs text-muted-foreground">
                  Inventory value
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {formatCompactCurrency(shop.value)}
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <ShopFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        shop={editing}
      />
      <DeleteShopDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        shop={deleting}
      />
    </>
  )
}
