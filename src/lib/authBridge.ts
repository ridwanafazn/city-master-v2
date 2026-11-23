import type { Router } from 'vue-router'
import { setAuthTokenProvider, setUnauthorizedHandler } from '../api/client'

interface AuthStoreLike {
  getToken(force?: boolean): Promise<string | null>
  clearSession(): void
}

let authStore: AuthStoreLike | null = null
let appRouter: Router | null = null

export function registerAuthStore(store: AuthStoreLike): void {
  authStore = store
}

export function installAuthBridge(router: Router): void {
  appRouter = router

  setAuthTokenProvider(async () => {
    if (!authStore) return null
    return authStore.getToken()
  })

  setUnauthorizedHandler(() => {
    authStore?.clearSession()
    const current = appRouter?.currentRoute.value
    if (!current) return
    if (current.matched.some((record) => record.meta.requiresAuth)) {
      void appRouter?.replace({
        name: 'sign-in',
        query: { redirectTo: current.fullPath },
      })
    }
  })
}
