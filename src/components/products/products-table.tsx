import { ImageIcon, MoreHorizontal, Package, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatNumber, stockStatus } from '@/lib/format'
import type { Product, Shop } from '@/types'

interface ProductsTableProps {
  products: Product[]
  shopsById?: Record<string, Shop>
  showShop?: boolean
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  emptyTitle?: string
  emptyMessage?: string
}

export function ProductsTable({
  products,
  shopsById = {},
  showShop = true,
  onEdit,
  onDelete,
  emptyTitle = 'No products found',
  emptyMessage = 'Try adjusting your search or filters.',
}: ProductsTableProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Package className="size-5 text-muted-foreground" />
        </span>
        <div>
          <p className="font-medium">{emptyTitle}</p>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-[240px]">Product</TableHead>
            {showShop && <TableHead>Shop</TableHead>}
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Stock value</TableHead>
            <TableHead className="w-12 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const status = stockStatus(product.stock)
            return (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[product.sku, product.category]
                          .filter(Boolean)
                          .join(' · ') || '—'}
                      </p>
                      {product.description && (
                        <p className="mt-0.5 line-clamp-1 max-w-[36ch] text-xs text-muted-foreground/80">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>

                {showShop && (
                  <TableCell>
                    {shopsById[product.shopId] ? (
                      <Link
                        to={`/shops/${product.shopId}`}
                        className="text-sm hover:underline"
                      >
                        {shopsById[product.shopId].name}
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                )}

                <TableCell className="text-right tabular-nums">
                  {formatCurrency(product.price)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(product.stock)}
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCurrency(product.price * product.stock)}
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={`Actions for ${product.name}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => onEdit?.(product)}>
                        <Pencil className="size-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => onDelete?.(product)}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
