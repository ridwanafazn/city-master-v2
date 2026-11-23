import { defineStore, type Pinia } from 'pinia'
import { ApiError } from '../api/client'
import { meService } from '../api/meService'
import { authClient, getAuthToken, isAuthConfigured } from '../lib/auth'
import { clearMeCache, readMeCache, writeMeCache } from '../lib/authCache'
import { registerAuthStore } from '../lib/authBridge'
import { clearHomeCache } from '../lib/homeCache'
import type { AccountDeletionResponse, MeResponse } from '../types/auth'

export interface AuthUser {
  id: string
  email?: string | null
  name?: string | null
  emailVerified?: boolean
}

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'anonymous'

interface AuthState {
  user: AuthUser | null
  token: string | null
  me: MeResponse | null
  deletion: AccountDeletionResponse | null
  status: AuthStatus
  initialized: boolean
  error: string | null
}

let sessionPromise: Promise<boolean> | null = null
let mePromise: Promise<boolean> | null = null
let tokenPromise: Promise<string | null> | null = null

function tokenIsFresh(token: string | null): boolean {
  if (!token) return false
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? '')) as { exp?: number }
    if (typeof payload.exp !== 'number') return false
    return payload.exp * 1000 - Date.now() > 30_000
  } catch {
    return false
  }
}

function mapAuthError(error: unknown, fallback: string): string {
  const record = error as { message?: unknown; code?: unknown } | null
  const message =
    record && typeof record.message === 'string' ? record.message : ''
  const code = record && typeof record.code === 'string' ? record.code : ''
  const text = `${code} ${message}`.toLowerCase()

  if (
    text.includes('invalid') &&
    (text.includes('email') || text.includes('password') || text.includes('credential'))
  ) {
    return 'Email atau password salah.'
  }
  if (text.includes('already') || text.includes('exists')) {
    return 'Email sudah terdaftar. Coba masuk.'
  }
  if (text.includes('verif')) {
    return 'Email belum diverifikasi. Periksa inbox Anda.'
  }
  if (text.includes('rate') || text.includes('too many')) {
    return 'Terlalu banyak percobaan. Coba lagi nanti.'
  }
  if (text.includes('password') && (text.includes('short') || text.includes('length'))) {
    return 'Password minimal 8 karakter.'
  }
  return message || fallback
}

const useAuthStoreInternal = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    me: null,
    deletion: null,
    status: 'idle',
    initialized: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.user && state.token),
    displayName: (state) =>
      state.me?.user.display_name ||
      state.user?.name ||
      state.user?.email ||
      'Operator',
    email: (state) => state.me?.user.email || state.user?.email || '',
    roles: (state) => state.me?.user.roles ?? [],
    profileComplete: (state) => state.me?.profile_complete ?? false,
    consents: (state) => state.me?.consents ?? {},
  },

  actions: {
    async ensureSession(force = false): Promise<boolean> {
      if (this.initialized && !force) return this.isAuthenticated
      if (sessionPromise) return sessionPromise
      const promise = (async () => {
        this.status = 'loading'
        this.error = null
        try {
          const { data, error } = await authClient.getSession()
          if (error || !data?.user) {
            this.clearSession()
            return false
          }
          const user = data.user as {
            id: string
            email?: string | null
            name?: string | null
            emailVerified?: boolean
          }
          this.user = {
            id: user.id,
            email: user.email ?? null,
            name: user.name ?? null,
            emailVerified: user.emailVerified,
          }
          const token = await this.getToken(true)
          if (!token) {
            this.clearSession()
            return false
          }
          const cached = readMeCache(user.id)
          if (cached) {
            this.me = cached
          } else if (this.me?.user.id !== user.id) {
            this.me = null
          }
          this.status = 'authenticated'
          return true
        } catch (error) {
          this.error = mapAuthError(error, 'Gagal memuat sesi.')
          this.clearSession()
          return false
        } finally {
          this.initialized = true
          sessionPromise = null
        }
      })()
      sessionPromise = promise
      return promise
    },

    async initialize(): Promise<void> {
      const ok = await this.ensureSession()
      if (ok && !this.me) await this.loadMe()
    },

    async refreshSession(): Promise<boolean> {
      const ok = await this.ensureSession(true)
      if (!ok) return false
      if (!this.me) await this.loadMe()
      this.status = 'authenticated'
      return true
    },

    async loadMe(): Promise<boolean> {
      if (mePromise) return mePromise
      const promise = (async () => {
        try {
          const me = await meService.getMe()
          this.me = me
          writeMeCache(me)
          return true
        } catch (error) {
          const apiError = error instanceof ApiError ? error : null
          if (apiError?.status === 401) {
            this.clearSession()
            return false
          }
          const cached = readMeCache(this.user?.id)
          if (cached) {
            this.me = cached
            this.error = null
            return true
          }
          this.error = apiError?.message ?? 'Gagal memuat data akun.'
          return false
        } finally {
          mePromise = null
        }
      })()
      mePromise = promise
      return promise
    },

    async getToken(force = false): Promise<string | null> {
      if (!force && tokenIsFresh(this.token)) {
        return this.token
      }
      if (!tokenPromise) {
        tokenPromise = (async () => {
          try {
            const token = await getAuthToken()
            if (!token) {
              return null
            }
            this.token = token
            return this.token
          } catch {
            return null
          } finally {
            tokenPromise = null
          }
        })()
      }
      return tokenPromise
    },

    async signIn(email: string, password: string): Promise<boolean> {
      if (!isAuthConfigured) {
        this.error = 'VITE_NEON_AUTH_URL belum dikonfigurasi.'
        return false
      }
      this.error = null
      this.status = 'loading'
      try {
        const { error } = await authClient.signIn.email({ email, password })
        if (error) {
          this.error = mapAuthError(error, 'Email atau password salah.')
          this.status = 'anonymous'
          return false
        }
        const ok = await this.refreshSession()
        if (!ok) {
          this.status = 'anonymous'
        }
        return ok
      } catch (error) {
        this.error = mapAuthError(error, 'Gagal masuk. Coba lagi.')
        this.status = 'anonymous'
        return false
      }
    },

    async signUp(name: string, email: string, password: string): Promise<boolean> {
      if (!isAuthConfigured) {
        this.error = 'VITE_NEON_AUTH_URL belum dikonfigurasi.'
        return false
      }
      this.error = null
      this.status = 'loading'
      try {
        const { error } = await authClient.signUp.email({ name, email, password })
        if (error) {
          this.error = mapAuthError(error, 'Gagal membuat akun.')
          this.status = 'anonymous'
          return false
        }
        const ok = await this.refreshSession()
        if (ok) return true
        return await this.signIn(email, password)
      } catch (error) {
        this.error = mapAuthError(error, 'Gagal membuat akun.')
        this.status = 'anonymous'
        return false
      }
    },

    async signOut(): Promise<void> {
      try {
        await authClient.signOut()
      } finally {
        this.clearSession()
      }
    },

    async requestDeletion(): Promise<boolean> {
      this.error = null
      try {
        this.deletion = await meService.requestDeletion()
        await this.signOut()
        return true
      } catch (error) {
        this.error = error instanceof ApiError ? error.message : 'Gagal mengajukan penghapusan akun.'
        return false
      }
    },

    clearSession(): void {
      this.user = null
      this.token = null
      this.me = null
      this.status = 'anonymous'
      clearMeCache()
      clearHomeCache()
    },
  },
})

export function useAuthStore(pinia?: Pinia) {
  const store = useAuthStoreInternal(pinia)
  registerAuthStore(store)
  return store
}
