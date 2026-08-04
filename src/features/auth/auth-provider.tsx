import { useCallback, useMemo, useState, type ReactNode } from 'react'

import type { Credentials, User } from '@/types'
import { login as loginRequest } from './auth-api'
import { AuthContext, type AuthContextValue } from './auth-context'
import { clearStoredUser, readStoredUser, storeUser } from './auth-storage'

export function AuthProvider({ children }: { children: ReactNode }) {
  // Read storage in the initialiser so a refresh restores the session before
  // the first paint — no effect, so no flash of the login screen.
  const [user, setUser] = useState<User | null>(() => readStoredUser())

  const login = useCallback(
    async (credentials: Credentials, remember: boolean): Promise<User> => {
      const authenticated = await loginRequest(credentials)
      storeUser(authenticated, remember ? 'local' : 'session')
      setUser(authenticated)
      return authenticated
    },
    [],
  )

  const logout = useCallback(() => {
    clearStoredUser()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, login, logout }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
