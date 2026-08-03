import { Navigate, Route, Routes } from 'react-router-dom'

import { AppLayout } from '@/components/layout/app-layout'
import { Toaster } from '@/components/ui/sonner'
import DashboardPage from '@/pages/dashboard-page'
import ProductsPage from '@/pages/products-page'
import ShopDetailPage from '@/pages/shop-detail-page'
import ShopsPage from '@/pages/shops-page'
import { InventoryProvider } from '@/store/inventory-provider'

function App() {
  return (
    <InventoryProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="shops" element={<ShopsPage />} />
          <Route path="shops/:shopId" element={<ShopDetailPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors />
    </InventoryProvider>
  )
}

export default App
