# JYMZ Frontend — M0 Foundation

Status: **complete**  
Branch: `feat/app-v2`  
Scope: frontend foundation only. Backend remains in `jymz-hardening`.

## 1. Product context

The existing frontend is a 3-view recommendation demo:

```text
/config → /process → /dashboard
```

The backend now exposes accounts, saved plans, workouts, progress, feedback,
trainer access, notifications, organizations, and research/ops APIs. The
frontend must become a real application without breaking the public
recommendation demo.

## 2. Milestones

| Milestone | Focus | Main outcome |
|---|---|---|
| **M0** | Foundation | App shell, local backend, typed API layer, status smoke test |
| **M1** | Auth & account | Neon Auth login/session, protected routes, `/me` |
| **M2** | Onboarding & profile | Profile, equipment, injuries, consent |
| **M3** | Plan lifecycle | Save/list/detail/edit/share/export plans |
| **M4** | Workout execution | Start, log sets, complete, offline sync |
| **M5** | Progress, feedback & safety | Progress charts, feedback, safety reports |
| **M6** | Collaboration | Trainer, notifications, organizations |
| **M7** | Release hardening | Staging, deployment, E2E, performance, rollback |

Do not start M4 before M3 is stable. Do not start M6 before auth, consent, and
plan lifecycle are stable.

> **Status update (2026-11-23):** M0–M5 are complete. **M6 and M7 are deferred
> indefinitely.** The next active workstream is UI/UX and performance v2; see
> [`ui-ux-v2-plan.md`](ui-ux-v2-plan.md) and
> [`project-status.md`](project-status.md).

## 3. M0 scope

### In scope

- Keep the public recommendation flow working.
- Add an application shell at `/app`.
- Add a typed API client with normalized backend errors.
- Add local environment values for the local FastAPI backend.
- Add a backend status view using `/health` and `/ready`.
- Document how to run both servers.
- Add placeholder navigation for future milestones without dead links.

### Out of scope

- Neon Auth login/session. That is M1.
- Profile/onboarding, plans, workouts, progress, trainer, notifications, org.
- Replacing the public recommendation UI.

## 4. Architecture

```text
src/
  api/
    client.ts          axios instance, auth token hook, error normalization
    healthService.ts   /health and /ready
    fitnessService.ts  existing public recommendation endpoints
    index.ts           service exports
  components/
    layout/
      AppShell.vue     authenticated app shell (auth added in M1)
    ui/                existing Pixel UI components
  router/
    index.ts           public routes + /app shell
  stores/
    appStore.ts        backend health/readiness state
    fitnessStore.ts    existing recommendation flow
  types/
    api.ts             backend envelope and health types
  views/
    app/
      AppHomeView.vue  M0 control room
    ConfigView.vue     existing public recommendation
    ProcessView.vue    existing public recommendation
    DashboardView.vue  existing public recommendation
```

### Routes

| Path | Purpose | Auth in M0 |
|---|---|---|
| `/` | Public recommendation config | no |
| `/process` | Public recommendation console | no |
| `/dashboard` | Public recommendation result | no |
| `/app` | App control room | no (M1 adds guard) |
| `/app/*` | Future application routes | no (M1 adds guard) |

### API base URL

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

The client falls back to `http://localhost:8080/api/v1` in development and
`/api/v1` in production if the env value is missing.

### Error contract

The backend returns errors in this shape:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Payload request tidak valid.",
    "details": [],
    "request_id": "..."
  }
}
```

`ApiError` normalizes `status`, `code`, `message`, `details`, and `requestId`
so views do not parse raw Axios errors.

### Auth hook

M0 does not log users in. The API client exposes:

```ts
setAuthTokenProvider(() => token)
```

M1 will connect this to the Neon Auth session store. No token is stored in
`localStorage` by M0 code.

## 5. Local development

### Backend

From `C:\Users\Ridwan\Git-v2\jymz-hardening`:

```powershell
# Load local Neon/Auth values; CORS for the Vite dev server.
Get-Content .env.local | ForEach-Object {
  if ($_ -match '^([^#=]+)=(.*)$') {
    Set-Item -Path "Env:$($matches[1])" -Value $matches[2].Trim('"')
  }
}
$env:CORS_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"
$env:RATE_LIMIT_ENABLED = "false"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8080
```

Verify:

```powershell
curl.exe http://127.0.0.1:8080/health
curl.exe http://127.0.0.1:8080/ready
```

New feature endpoints stay behind their backend flags until a frontend
milestone needs them.

### Frontend

```powershell
cd C:\Users\Ridwan\Git-v2\city-master-v2
npm install
Copy-Item .env.example .env.local
npm run dev -- --host 127.0.0.1 --port 5173
```

Open `http://localhost:5173`.

## 6. M0 acceptance

- [x] Backend `/health` and `/ready` respond locally.
- [x] Public recommendation flow still works.
- [x] `/app` renders with navigation and backend status.
- [x] API errors show a stable `code`/`message`/`requestId`.
- [x] `npm run type-check` passes.
- [x] `npm run build` passes.
- [x] No secret is stored in frontend source or committed env files.

## 7. Next milestone

**M1 — Auth & account**

1. Neon Auth client and callback.
2. Pinia session store.
3. Axios bearer token provider.
4. Protected `/app` routes.
5. `GET /me` bootstrap and account page.

Implemented in [`m1-auth-and-account.md`](m1-auth-and-account.md).
