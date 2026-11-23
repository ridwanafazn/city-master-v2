import { defineStore } from 'pinia'
import { ApiError } from '../api/client'
import { meService } from '../api/meService'
import { authClient, getAuthToken, isAuthConfigured } from '../lib/auth'
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

let initializePromise: Promise<void> | null = null
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

export const useAuthStore = defineStore('auth', {
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
    async initialize() {
      if (this.initialized) return
      if (initializePromise) return initializePromise
      initializePromise = (async () => {
        this.status = 'loading'
        try {
          await this.refreshSession()
        } finally {
          this.initialized = true
          initializePromise = null
        }
      })()
      await initializePromise
    },

    async refreshSession(): Promise<boolean> {
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
        await this.loadMe()
        this.status = 'authenticated'
        return true
      } catch (error) {
        this.error = mapAuthError(error, 'Gagal memuat sesi.')
        this.clearSession()
        return false
      }
    },

    async loadMe(): Promise<boolean> {
      try {
        this.me = await meService.getMe()
        return true
      } catch (error) {
        const apiError = error instanceof ApiError ? error : null
        if (apiError?.status === 401) {
          this.clearSession()
          return false
        }
        this.error = apiError?.message ?? 'Gagal memuat data akun.'
        return false
      }
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
    },
  },
})
