import type { User } from '@/types'

const STORAGE_KEY = 'sare.auth.user'

/**
 * "Remember me" decides which Storage backs the session: localStorage
 * survives a browser restart, sessionStorage dies with the tab.
 */
export type SessionScope = 'local' | 'session'

const storageFor = (scope: SessionScope): Storage =>
  scope === 'local' ? window.localStorage : window.sessionStorage

export function readStoredUser(): User | null {
  // Check both backends: we don't know which scope the session was saved under.
  for (const scope of ['local', 'session'] as const) {
    try {
      const raw = storageFor(scope).getItem(STORAGE_KEY)
      if (!raw) continue
      const parsed = JSON.parse(raw) as unknown
      if (isUser(parsed)) return parsed
      // Corrupt or stale shape — drop it rather than crash on boot.
      storageFor(scope).removeItem(STORAGE_KEY)
    } catch {
      // Private mode or disabled storage: fall through to the next scope.
    }
  }
  return null
}

export function storeUser(user: User, scope: SessionScope): void {
  try {
    clearStoredUser()
    storageFor(scope).setItem(STORAGE_KEY, JSON.stringify(user))
  } catch {
    // Non-fatal: the session simply won't survive a reload.
  }
}

export function clearStoredUser(): void {
  for (const scope of ['local', 'session'] as const) {
    try {
      storageFor(scope).removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }
}

function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string' &&
    (candidate.role === 'admin' || candidate.role === 'manager')
  )
}
