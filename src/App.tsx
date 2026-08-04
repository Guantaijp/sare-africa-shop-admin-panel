import { Navigate, Route, Routes } from 'react-router-dom'

import { AppLayout } from '@/components/layout/app-layout'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/features/auth/auth-provider'
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from '@/features/auth/route-guards'
import DashboardPage from '@/pages/dashboard-page'
import LoginPage from '@/pages/login-page'
import ProductsPage from '@/pages/products-page'
import ShopDetailPage from '@/pages/shop-detail-page'
import ShopsPage from '@/pages/shops-page'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Signed-in users never see the login screen. */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Everything below requires a session. */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="shops" element={<ShopsPage />} />
            <Route path="shops/:shopId" element={<ShopDetailPage />} />
            <Route path="products" element={<ProductsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  )
}

export default App
