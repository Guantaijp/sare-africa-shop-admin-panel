import { LOW_STOCK_THRESHOLD } from '@/lib/constants'
import type { Product, StockStatus } from '@/types'

// Plain number + explicit "KES" prefix: Intl's en-KE currency style renders
// the symbol as "Ksh", which clashes with the compact "KES 374K" form.
const currency = new Intl.NumberFormat('en-KE', { maximumFractionDigits: 0 })

const compact = new Intl.NumberFormat('en-KE', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const plain = new Intl.NumberFormat('en-KE')

export const formatCurrency = (value: number): string =>
  `KES ${currency.format(Number(value) || 0)}`

export const formatCompactCurrency = (value: number): string =>
  `KES ${compact.format(Number(value) || 0)}`

export const formatNumber = (value: number): string =>
  plain.format(Number(value) || 0)

export const initialsOf = (name = ''): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')

export function stockStatus(stock: number): StockStatus {
  const n = Number(stock) || 0
  if (n <= 0) return { key: 'out', label: 'Out of stock', variant: 'destructive' }
  if (n <= LOW_STOCK_THRESHOLD)
    return { key: 'low', label: 'Low stock', variant: 'secondary' }
  return { key: 'in', label: 'In stock', variant: 'outline' }
}

export const inventoryValue = (products: Product[]): number =>
  products.reduce(
    (sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock) || 0),
    0,
  )

export const totalStock = (products: Product[]): number =>
  products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0)
