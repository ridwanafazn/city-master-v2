import { createInternalNeonAuth } from '@neon/auth'
import { BetterAuthVanillaAdapter } from '@neon/auth/vanilla/adapters'

const configuredAuthUrl = import.meta.env.VITE_NEON_AUTH_URL
const fallbackAuthUrl = 'http://localhost:9999/auth'

export const isAuthConfigured = Boolean(configuredAuthUrl)

/**
 * Managed Neon Auth (Better Auth) browser client.
 *
 * `createInternalNeonAuth` exposes both the Better Auth client and the
 * Neon-managed JWT helper. Vue uses the vanilla adapter (no React hooks), and
 * the JWT helper handles the short-lived token expected by FastAPI.
 */
const neonAuth = createInternalNeonAuth(configuredAuthUrl || fallbackAuthUrl, {
  adapter: BetterAuthVanillaAdapter({
    fetchOptions: { credentials: 'include' },
  }),
})

export const authClient = neonAuth.adapter
export const getAuthToken = (): Promise<string | null> => neonAuth.getJWTToken()

