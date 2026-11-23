# JYMZ Frontend — M1 Auth & Account

Status: **complete**  
Branch: `feat/app-v2`  
Backend: local FastAPI with `AUTH_ENABLED=true`, `AUTH_PROFILES_ENABLED=true`.

## 1. Goal

Turn the public recommendation SPA into an authenticated application shell without
breaking the public demo.

M1 proves the full identity chain:

```text
Vue 3
  → @neon/auth sign-up/sign-in/getSession
  → Neon Managed Better Auth session cookie
  → short-lived EdDSA JWT
  → Authorization: Bearer <token>
  → FastAPI JWKS verification
  → users / user_roles / profiles
  → GET /api/v1/me
```

## 2. Scope

### In scope

- Neon Auth browser client using the vanilla adapter.
- Email/password sign-up, sign-in, sign-out.
- Session restoration after reload.
- In-memory JWT for FastAPI; no token in `localStorage`.
- Axios bearer interceptor and automatic 401 handling.
- Protected `/app` routes with safe redirect.
- `GET /me` bootstrap.
- Account page: identity, roles, profile completeness, consent state, deletion request.
- Auth pages with loading, validation, and friendly error states.

### Out of scope

- Social OAuth (Google/GitHub/etc.).
- Magic link, email OTP, phone auth, MFA, passkeys.
- Password reset UI.
- Onboarding/profile/equipment/injuries (M2).
- Server-side sessions in this SPA; Neon Auth owns the session.
- Persisting JWT in storage.

## 3. Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | public | Existing recommendation config |
| `/process` | public | Existing recommendation console |
| `/dashboard` | public | Existing recommendation result |
| `/auth/sign-in` | guest only | Email/password sign-in |
| `/auth/sign-up` | guest only | Create account |
| `/app` | authenticated | Control room |
| `/app/account` | authenticated | Account and session |

Guards:

- `requiresAuth` waits for `auth.initialize()` and redirects to
  `/auth/sign-in?redirectTo=...` if unauthenticated.
- `guestOnly` sends an authenticated user to `/app`.
- `redirectTo` is accepted only when it is a same-origin path (`/...`) and not
  `//host`.

## 4. Auth client

`src/lib/auth.ts`:

```ts
const neonAuth = createInternalNeonAuth(VITE_NEON_AUTH_URL, {
  adapter: BetterAuthVanillaAdapter({
    fetchOptions: { credentials: 'include' },
  }),
})

export const authClient = neonAuth.adapter
export const getAuthToken = () => neonAuth.getJWTToken()
```

Why `createInternalNeonAuth`:

- `createAuthClient()` exposes only the Better Auth client.
- The internal factory also exposes `getJWTToken()`, which the SDK uses to obtain
  the Neon JWT expected by FastAPI.
- The vanilla adapter is correct for Vue; the React adapter is only for React
  hooks.

## 5. Session store

`src/stores/authStore.ts`:

```text
user        Better Auth identity mapped to the backend user
token       short-lived JWT kept in memory
me          GET /api/v1/me response
status      idle | loading | authenticated | anonymous
initialized one-time bootstrap guard
error       user-facing auth error
deletion    account deletion request response
```

Behavior:

- `initialize()` runs once and restores the Better Auth session.
- `getToken()` returns a cached JWT until it is within 30 seconds of expiry,
  then asks Neon Auth for a fresh token.
- The token is never written to `localStorage` or source.
- `refreshSession()` maps `data.user`, fetches a token, then calls `/me`.
- `loadMe()` tolerates backend outages without discarding a valid session; a 401
  clears the session.
- `signIn`, `signUp`, and `signOut` expose boolean/void results and always clear
  loading state.
- `requestDeletion()` calls `DELETE /api/v1/me`, then signs out.

## 6. API client

`src/api/client.ts`:

- async token provider (`setAuthTokenProvider`) so expired JWTs can refresh
  before a request;
- `Authorization: Bearer <token>` injection;
- normalized `ApiError` with `status`, `code`, `message`, `details`, `requestId`;
- 401 handler clears the session and redirects protected routes to sign-in;
- `/health` and `/ready` use the API origin, not the `/api/v1` base path.

## 7. Account page

`/app/account` shows:

- display name and email;
- backend user id and Neon auth subject;
- app roles from `user_roles`;
- profile completeness;
- active consent flags;
- refresh `/me`, sign out, and account deletion request;
- notice that consent management and onboarding arrive in M2.

Deletion is guarded by an explicit confirmation step.

## 8. Error behavior

| Situation | UI |
|---|---|
| Wrong password | “Email atau password salah.” |
| Existing email | “Email sudah terdaftar. Coba masuk.” |
| Unverified email | “Email belum diverifikasi…” |
| Too many attempts | “Terlalu banyak percobaan…” |
| Missing `VITE_NEON_AUTH_URL` | Config warning on auth page |
| Backend 401 | Session cleared, redirect to sign-in |
| Backend offline | Account/status error, session retained unless 401 |

## 9. Local configuration

Backend (from `jymz-hardening`):

```powershell
Get-Content .env.local | ForEach-Object {
  if ($_ -match '^([^#=]+)=(.*)$') {
    Set-Item -Path "Env:$($matches[1])" -Value $matches[2].Trim('"')
  }
}
$env:AUTH_ENABLED = "true"
$env:AUTH_PROFILES_ENABLED = "true"
$env:AUTH_ALGORITHMS = "EdDSA"
$env:AUTH_DEV_MODE = "false"
$env:CORS_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"
$env:RATE_LIMIT_ENABLED = "false"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8080
```

Frontend `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_APP_NAME=JYMZ
VITE_NEON_AUTH_URL=https://<branch-host>/<database>/auth
```

Neon Auth trusted domains must include the browser origin. `localhost:5173` is
trusted on the current branch; use `http://localhost:5173`, not
`http://127.0.0.1:5173`, unless that origin is also added.

The current branch has:

```text
email/password enabled
sign-up enabled
email verification on sign-up: false
email verification on sign-in: false
```

## 10. Verification

Completed on the local stack:

- [x] Sign-up with a new email creates a Neon Auth user.
- [x] Browser redirects to `/app` after sign-up.
- [x] `GET /me` returns the mapped FastAPI user and role `user`.
- [x] Protected `/app` redirects anonymous users to
      `/auth/sign-in?redirectTo=/app`.
- [x] Session survives a full page reload.
- [x] Account page shows identity/roles/profile/consent.
- [x] Sign-out returns to auth and protects `/app` again.
- [x] Wrong-password and missing-config states are handled.
- [x] Public recommendation flow still works.
- [x] `npm run type-check` passes.
- [x] `npm run build` passes.
- [x] `npm audit --omit=dev` reports no vulnerabilities.

## 11. Known limitations

- Email/password only. Social login is a separate milestone.
- No password reset UI.
- JWT lives in memory; a full reload re-fetches it from the Neon session.
- Account deletion cannot be cancelled from the UI.
- No onboarding/profile screens yet; account page is read-only except deletion.
- M1 is a frontend milestone; backend avatar/notification preferences are not
  wired.

## 12. Next milestone

**M2 — Onboarding & Profile**

1. Onboarding wizard.
2. Profile, equipment, injuries.
3. Health-data consent gate.
4. Consent management and data export.
5. Profile-complete guard before plans/workouts.
