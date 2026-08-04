import seed from '../../db.json'
import type { Product, Shop, UserRecord } from '@/types'

/**
 * Each visitor to the deployed demo gets their own copy of the seed data,
 * persisted to localStorage so their edits survive a reload. Clearing the key
 * (or the browser's site data) resets everything back to `db.json`.
 */
const STORAGE_KEY = 'sare.mock.db'

export interface MockDb {
  users: UserRecord[]
  shops: Shop[]
  products: Product[]
}

const fromSeed = (): MockDb => ({
  users: structuredClone(seed.users) as UserRecord[],
  shops: structuredClone(seed.shops) as Shop[],
  products: structuredClone(seed.products) as Product[],
})

function load(): MockDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<MockDb>
      if (
        Array.isArray(parsed.users) &&
        Array.isArray(parsed.shops) &&
        Array.isArray(parsed.products)
      ) {
        return parsed as MockDb
      }
    }
  } catch {
    // Corrupt or unavailable storage — fall back to a clean seed.
  }
  return fromSeed()
}

export const db: MockDb = load()

export function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // Quota or private mode: the session stays in memory only.
  }
}

/** Mirrors the opaque string ids JSON Server hands out. */
export function nextId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}
