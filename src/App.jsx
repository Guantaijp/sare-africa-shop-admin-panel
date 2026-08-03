import {
  LayoutDashboard,
  Moon,
  Package,
  ShoppingCart,
  Sun,
  Users,
} from 'lucide-react'

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTheme } from '@/hooks/use-theme'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Orders', icon: ShoppingCart },
  { label: 'Products', icon: Package },
  { label: 'Customers', icon: Users },
]

const stats = [
  { label: "Today's Sales", value: 'KES 365,976', trend: '+12.4%' },
  { label: 'Orders fulfilled', value: '35,142', trend: '+318' },
  { label: 'Active shops', value: '84', trend: '+6' },
]

const orders = [
  { id: '#1042', customer: 'Amina Yusuf', shop: 'Maasai Shop', total: 'KES 4,500', status: 'Paid' },
  { id: '#1041', customer: 'Kwame Mensah', shop: 'Kibera Mart', total: 'KES 1,200', status: 'Pending' },
  { id: '#1040', customer: 'Thabo Nkosi', shop: 'Maasai Shop', total: 'KES 8,750', status: 'Paid' },
  { id: '#1039', customer: 'Grace Wanjiru', shop: 'Mathare Store', total: 'KES 2,310', status: 'Refunded' },
]

const statusVariant = {
  Paid: 'default',
  Pending: 'secondary',
  Refunded: 'destructive',
}

function App() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex min-h-svh bg-background">
      <aside className="hidden w-60 shrink-0 flex-col gap-1 bg-sidebar p-4 text-sidebar-foreground md:flex">
        <div className="mb-6 px-2">
          <p className="text-lg font-bold tracking-tight">SARE</p>
          <p className="text-xs text-sidebar-foreground/70">powered by SHOFCO</p>
        </div>
        {navItems.map(({ label, icon: Icon, active }) => (
          <a
            key={label}
            href="#"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              active
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                : 'hover:bg-sidebar-accent/60'
            }`}
          >
            <Icon className="size-4" />
            {label}
          </a>
        ))}
      </aside>

      <main className="flex-1 p-6 md:p-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <header className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Shop performance at a glance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="size-4" />
                ) : (
                  <Moon className="size-4" />
                )}
              </Button>
              <Button>New product</Button>
            </div>
          </header>

          <section className="rounded-xl bg-accent p-6 text-accent-foreground">
            <p className="text-4xl font-bold tracking-tight">35k</p>
            <p className="mt-2 max-w-md text-sm">
              Over 35,000 orders fulfilled, 35,000+ smiles delivered — thank you
              for an amazing journey since June 2024.
            </p>
          </section>

          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map(({ label, value, trend }) => (
              <Card key={label}>
                <CardHeader>
                  <CardDescription>{label}</CardDescription>
                  <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
                  <CardAction>
                    <Badge variant="secondary">{trend}</Badge>
                  </CardAction>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent orders</CardTitle>
              <CardDescription>
                Latest activity across all connected shops.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Shop</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.shop}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[order.status]}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {order.total}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default App
