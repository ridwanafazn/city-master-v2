import type { MeResponse } from '../types/auth'

const CACHE_KEY = 'jymz.auth.me.v1'

interface CachedMe {
  savedAt: string
  me: MeResponse
}

function storage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function readMeCache(expectedUserId?: string): MeResponse | null {
  const store = storage()
  if (!store) return null
  try {
    const raw = store.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedMe
    if (!parsed?.me?.user?.id) return null
    if (expectedUserId && parsed.me.user.id !== expectedUserId) return null
    return parsed.me
  } catch {
    return null
  }
}

export function writeMeCache(me: MeResponse): void {
  const store = storage()
  if (!store) return
  try {
    const payload: CachedMe = { savedAt: new Date().toISOString(), me }
    store.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    // Cache is best-effort; quota or privacy mode must not block auth.
  }
}

export function clearMeCache(): void {
  const store = storage()
  if (!store) return
  try {
    store.removeItem(CACHE_KEY)
  } catch {
    // ignore
  }
}
