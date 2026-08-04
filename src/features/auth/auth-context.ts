import { createContext } from 'react'

import type { Credentials, User } from '@/types'

export interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (credentials: Credentials, remember: boolean) => Promise<User>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
