import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from './use-auth'

/**
 * Gate for admin routes. Unauthenticated visitors bounce to /login, and we
 * remember where they were headed so login can send them back there.
 */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}

/** Keeps signed-in users off /login by sending them to the dashboard. */
export function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) return <Navigate to="/" replace />
  return <Outlet />
}
