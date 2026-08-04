import { useMemo } from 'react'
import {
  AlertTriangle,
  Boxes,
  Package,
  Store,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'

import { StatCard } from '@/components/dashboard/stat-card'
import { PageHeader } from '@/components/layout/page-header'
import { ErrorState, LoadingState } from '@/components/shared/query-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Progress } from '@/components/ui/progress'
import { useInventory } from '@/features/inventory/use-inventory'
import { LOW_STOCK_THRESHOLD } from '@/lib/constants'
import {
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
  initialsOf,
  inventoryValue,
  stockStatus,
  totalStock,
} from '@/lib/format'
import type { StockStatusKey } from '@/types'

const statusChartConfig = {
  count: { label: 'Products' },
  in: { label: 'In stock', color: 'var(--chart-2)' },
  low: { label: 'Low stock', color: 'var(--chart-4)' },
  out: { label: 'Out of stock', color: 'var(--chart-5)' },
} satisfies ChartConfig

const shopChartConfig = {
  stock: { label: 'Units in stock', color: 'var(--chart-1)' },
} satisfies ChartConfig

export default function DashboardPage() {
  const { shops, products, isLoading, isError, error, refetch } = useInventory()

  const stats = useMemo(() => {
    const counts: Record<StockStatusKey, number> = { in: 0, low: 0, out: 0 }
    for (const product of products) counts[stockStatus(product.stock).key] += 1

    const byShop = shops
      .map((shop) => {
        const items = products.filter((p) => p.shopId === shop.id)
        return {
          id: shop.id,
          name: shop.name,
          short: shop.name.split(' ')[0],
          stock: totalStock(items),
          value: inventoryValue(items),
          products: items.length,
        }
      })
      .sort((a, b) => b.stock - a.stock)

    return {
      totalShops: shops.length,
      totalProducts: products.length,
      totalStock: totalStock(products),
      totalValue: inventoryValue(products),
      statusData: [
        { key: 'in', label: 'In stock', count: counts.in, fill: 'var(--chart-2)' },
        { key: 'low', label: 'Low stock', count: counts.low, fill: 'var(--chart-4)' },
        { key: 'out', label: 'Out of stock', count: counts.out, fill: 'var(--chart-5)' },
      ],
      topShops: byShop.slice(0, 5),
      lowStock: products
        .filter((p) => stockStatus(p.stock).key !== 'in')
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5),
    }
  }, [shops, products])

  if (isLoading) {
    return (
      <>
        <PageHeader title="Dashboard" description="Loading inventory…" />
        <LoadingState rows={2} />
      </>
    )
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <ErrorState error={error} onRetry={refetch} />
      </>
    )
  }

  const maxLowStock = Math.max(LOW_STOCK_THRESHOLD, 1)

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Inventory overview across all SARE shops"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/shops">Manage shops</Link>
            </Button>
            <Button asChild>
              <Link to="/products">View products</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          featured
          icon={Store}
          label="Total Shops"
          value={formatNumber(stats.totalShops)}
          hint="Active retail locations"
        />
        <StatCard
          icon={Package}
          label="Total Products"
          value={formatNumber(stats.totalProducts)}
          hint="Distinct SKUs tracked"
        />
        <StatCard
          icon={Boxes}
          label="Total Stock"
          value={formatNumber(stats.totalStock)}
          hint="Units on hand"
        />
        <StatCard
          icon={Wallet}
          label="Total Inventory Value"
          value={formatCompactCurrency(stats.totalValue)}
          hint={formatCurrency(stats.totalValue)}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4 text-muted-foreground" />
              Top 5 shops by stock
            </CardTitle>
            <CardDescription>Units on hand per location</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/shops">View all</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {stats.topShops.length === 0 ? (
              <EmptyChart message="No shops yet." />
            ) : (
              <ChartContainer
                config={shopChartConfig}
                className="aspect-auto h-[280px] w-full"
              >
                <BarChart data={stats.topShops} margin={{ left: -16, top: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="short"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    fontSize={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    width={56}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'var(--muted)' }}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(_, payload) =>
                          payload?.[0]?.payload?.name ?? ''
                        }
                      />
                    }
                  />
                  <Bar
                    dataKey="stock"
                    fill="var(--color-stock)"
                    radius={[6, 6, 4, 4]}
                    maxBarSize={56}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock status</CardTitle>
            <CardDescription>Products by availability</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.totalProducts === 0 ? (
              <EmptyChart message="No products yet." />
            ) : (
              <>
                <ChartContainer
                  config={statusChartConfig}
                  className="mx-auto aspect-square h-[200px]"
                >
                  <PieChart>
                    <ChartTooltip
                      content={<ChartTooltipContent nameKey="label" hideLabel />}
                    />
                    <Pie
                      data={stats.statusData}
                      dataKey="count"
                      nameKey="label"
                      innerRadius={56}
                      outerRadius={86}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {stats.statusData.map((entry) => (
                        <Cell key={entry.key} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <ul className="mt-2 space-y-2">
                  {stats.statusData.map((entry) => (
                    <li
                      key={entry.key}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span
                        className="size-2.5 rounded-full"
                        style={{ background: entry.fill }}
                      />
                      <span className="flex-1 text-muted-foreground">
                        {entry.label}
                      </span>
                      <span className="font-semibold tabular-nums">
                        {entry.count}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-chart-4" />
              Product stock alert
            </CardTitle>
            <CardDescription>
              At or below {LOW_STOCK_THRESHOLD} units
            </CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/products">View all</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.lowStock.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Every product is comfortably in stock.
              </p>
            ) : (
              stats.lowStock.map((product) => {
                const status = stockStatus(product.stock)
                return (
                  <div key={product.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate font-medium">{product.name}</span>
                      <span
                        className={
                          status.key === 'out'
                            ? 'shrink-0 text-xs font-semibold text-destructive'
                            : 'shrink-0 text-xs font-semibold text-chart-4'
                        }
                      >
                        {product.stock === 0
                          ? 'Out of stock'
                          : `${product.stock} units left`}
                      </span>
                    </div>
                    <Progress
                      value={(product.stock / maxLowStock) * 100}
                      className="h-2"
                    />
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shops at a glance</CardTitle>
            <CardDescription>Products and value per shop</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.topShops.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No shops yet.
              </p>
            ) : (
              stats.topShops.map((shop) => (
                <Link
                  key={shop.id}
                  to={`/shops/${shop.id}`}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-secondary-foreground">
                    {initialsOf(shop.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{shop.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {shop.products} products · {formatNumber(shop.stock)} units
                    </p>
                  </div>
                  <Badge variant="secondary" className="tabular-nums">
                    {formatCompactCurrency(shop.value)}
                  </Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  )
}
