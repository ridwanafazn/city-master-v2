# JYMZ project status

Last updated: **2026-11-23**  
Branch: `feat/ui-v2`  
Scope decision: **feature milestones stop at M5 for now**.

## 1. Status summary

| Area | Status |
|---|---|
| Product milestones M0–M5 | ✅ Complete |
| M6 — Collaboration | ⏸ Deferred indefinitely |
| M7 — Release hardening | ⏸ Deferred indefinitely |
| Frontend production | ✅ Cloudflare Pages |
| Backend production | ✅ Railway |
| Database / auth | ✅ Neon Postgres + Neon Auth |
| Public recommendation flow | ✅ Preserved |
| Portfolio project page | ✅ Updated in Neon |
| Banner/screenshot assets | ✅ Generated and published |
| UI/UX v2 | ✅ Complete & deployed (phase 6) |

M6 and M7 are intentionally deferred until further notice. They are not
required for the current product scope. The next active workstream is the
UI/UX and performance overhaul described in
[`ui-ux-v2-plan.md`](ui-ux-v2-plan.md).

## 2. Completed milestones

| Milestone | Commit | Notes |
|---|---|---|
| M0 Foundation | `e8d1e60` | App shell, API client, health/readiness |
| M1 Auth & account | `4cd184f` | Neon Auth, protected `/app`, account page |
| M2 Onboarding & profile | `cc36e28` | Profile, equipment, injuries, consent, export |
| M3 Plan lifecycle | `1611d28` | Save/list/detail/lock/swap/share/PDF/ICS |
| M4 Workout execution | `e146af8` | Live logger, substitution, completion, offline sync |
| M5 Progress, feedback & safety | `49024f6` | Progress deck, PR, insights, feedback, safety reports |

## 3. Live services

| Service | URL |
|---|---|
| Frontend | https://jymz.pages.dev |
| App | https://jymz.pages.dev/app |
| Backend | https://jymz-api-production.up.railway.app |
| API base | https://jymz-api-production.up.railway.app/api/v1 |
| Health | https://jymz-api-production.up.railway.app/health |
| Readiness | https://jymz-api-production.up.railway.app/ready |
| API docs | https://jymz-api-production.up.railway.app/docs |
| Asset downloads | https://jymz-assets.pages.dev |
| Portfolio page | https://ridwanafazn.my.id/projects/jymz |

Deployment targets:

- Frontend: Cloudflare Pages project `jymz`.
- Backend: Railway project `gregarious-rejoicing`, service `jymz-api`,
  region Southeast Asia.
- Asset pack: Cloudflare Pages project `jymz-assets`.
- Frontend API env: Railway API base.
- CORS: exact origin `https://jymz.pages.dev`.

## 4. Event log

### 2026-11-24

- Completed UI/UX v2 phases 2–6; commit `4ce0e58` on `feat/ui-v2` and `main`.
- Deployed frontend to Cloudflare Pages production `jymz`:
  deployment `1307cc5a-4354-4683-abb7-f8e0cfaac37b`, commit `4ce0e58`.
- Deployed backend to Railway service `jymz-api` from local `main`
  `971a6d9`: deployment `110567c8-5211-4ce8-9287-95f3f00fb404`.
- Verified production: `/health` 200, `/ready` database `ok`, P2.3 metric
  `jymz_rate_limit_degraded_total` present in `/metrics`, public
  recommendation `201` (~1.1 s warm), CORS `https://jymz.pages.dev`.
- Verified frontend production: static font preloads, title
  `Parameter latihan | JYMZ`, sign-in render, 0 auth/Neon requests on public
  config.

### 2026-11-23

- Completed M5 frontend work.
- Merged `feat/app-v2` to `main` and deployed frontend to
  `https://jymz.pages.dev`.
- Deployed backend to Railway at
  `https://jymz-api-production.up.railway.app`; database readiness `ok`.
- Applied Alembic migrations; current revision `0010_outbox_lease`.
- Verified production auth, plans, workouts, progress, feedback, and public
  recommendation flow.
- Generated HTML-rendered banner assets and screenshot pack.
- Published asset download page at `https://jymz-assets.pages.dev`.
- Copied banner assets to `portofx/public/jymz/`.
- Updated the JYMZ portfolio project row in the `portofx-v2` Neon project:
  description, long description, role, stack, highlights, links, gallery
  order/captions, and SEO.
- Decided UI/UX v2 direction:
  - Style A: Signal Editorial.
  - Scope: all pages, including public flow.
  - No dark mode.
  - Keep cold-start UX for Railway Free.
  - Use Lucide icons.
- Deferred M6 and M7 indefinitely.
- Created `feat/ui-v2` from `feat/app-v2` @ `992e241`.
- Completed UI/UX v2 phase 0: baseline Lighthouse, bundle, waterfall, cold
  start, and responsive screenshots in
  [`ui-ux-v2-baseline.md`](ui-ux-v2-baseline.md). Commit `69ee8d2`.
- Completed UI/UX v2 phase 1: `tokens.css`, self-hosted Latin fonts, 21 UI-v2
  primitives, `/style-guide`, `_headers`, and `robots.txt`. The style guide was
  rebuilt as a JYMZ field manual with a live training-log specimen; binding
  design rules live in [`DESIGN.md`](../DESIGN.md). Commit `7e6c0de`.
  See [`ui-ux-v2-phase-1.md`](ui-ux-v2-phase-1.md).
- Implemented UI/UX v2 phase 2: lazy auth bridge (public flow no Neon Auth),
  new AppShell with desktop sidebar/mobile bottom navigation, Today dashboard
  with next/active session, weekly ledger and local cache, redesigned auth
  pages, wired `ServerWakeBanner`, and hidden `/app/debug`. Pending review and
  commit. See [`ui-ux-v2-phase-2.md`](ui-ux-v2-phase-2.md).
- Implemented UI/UX v2 phase 3: Plan library/detail/create, Workout history,
  focus-mode workout logger, set steppers, RPE chips, rest timer, offline sync
  strip, completion sheet, substitute sheet, and UI-v2 feedback/safety forms.
  Mock-verified set/start/complete/create payloads and routes. Pending review
  and commit. See [`ui-ux-v2-phase-3.md`](ui-ux-v2-phase-3.md).
- Implemented UI/UX v2 phase 4: Progress deck with custom SVG volume chart,
  body-part balance, personal records, weekly review, profile sections,
  account console, 5-step onboarding, and UI-v2 profile/consent components.
  Mock-verified range change, profile save, account deletion dialog, and
  onboarding submit. Pending review and commit. See
  [`ui-ux-v2-phase-4.md`](ui-ux-v2-phase-4.md).
- Implemented UI/UX v2 phase 5: public config/process/dashboard and shared-plan
  pages, plus route and day-panel motion. Public flow verified without auth or
  Neon requests, with mocked recommendation/share responses, validation,
  auto-redirect, and reduced-motion checks. Pending review and commit. See
  [`ui-ux-v2-phase-5.md`](ui-ux-v2-phase-5.md).
- Implemented UI/UX v2 phase 6: static font preload, dev-only Vue devtools,
  intent-based route prefetch, 768 px workout layout fix, removal of technical
  plan metadata, Indonesian route titles/copy, Lighthouse mobile
  100/100/100/100, and a 51-screenshot QA matrix at 390/768/1440. Pending
  review, commit, and deploy. See
  [`ui-ux-v2-phase-6.md`](ui-ux-v2-phase-6.md).

## 5. Known limitations

1. Railway Free sleeps after idle. First request may be slow; this is accepted
   for now and must be handled in the UI as a wake/loading state.
2. Multi-day plans with a `knee` injury can still return `422 plan_invalid`
   from the backend validation bug (cardio day has 2 exercises, validator
   expects 3). The frontend surfaces an actionable message.
3. Progress aggregates rebuild on read. Parallel progress/insights requests can
   hit a unique constraint; the frontend serializes requests.
4. M5 test data is small (two completed sessions), so charts and pagination are
   lightly exercised.
5. No admin triage UI for safety reports.
6. No user-facing feedback history.
7. The banner source and final assets are currently documentation files, not
   part of the app bundle.

## 6. Deferred work

### M6 — Collaboration

Trainer profile and clients, invitations and scopes, comments and reviews,
notifications/calendar, organizations.

**Status:** deferred indefinitely. Do not start without a new explicit request.

### M7 — Release hardening

Staging environment, E2E suite, performance gates, rollback plan, operational
runbook.

**Status:** deferred indefinitely. The current deployment is a lightweight
production deploy, not full M7 hardening.

## 7. Next workstream

**UI/UX v2 is complete and deployed.** No active feature milestone.

M6 (Collaboration) and M7 (Release hardening) remain deferred indefinitely.
Future work is maintenance, bug fixes, and operational monitoring unless a new
explicit request reopens a milestone.

- Baseline: [`ui-ux-v2-baseline.md`](ui-ux-v2-baseline.md)
- Phase 1: [`ui-ux-v2-phase-1.md`](ui-ux-v2-phase-1.md)
- Phase 2: [`ui-ux-v2-phase-2.md`](ui-ux-v2-phase-2.md)
- Phase 3: [`ui-ux-v2-phase-3.md`](ui-ux-v2-phase-3.md)
- Phase 4: [`ui-ux-v2-phase-4.md`](ui-ux-v2-phase-4.md)
- Phase 5: [`ui-ux-v2-phase-5.md`](ui-ux-v2-phase-5.md)
- Phase 6: [`ui-ux-v2-phase-6.md`](ui-ux-v2-phase-6.md)
- Plan: [`ui-ux-v2-plan.md`](ui-ux-v2-plan.md)
