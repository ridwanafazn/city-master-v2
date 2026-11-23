# JYMZ Frontend — M3 Plan Lifecycle

Status: **complete for the implemented frontend flows**  
Branch: `feat/app-v2`  
Backend: local FastAPI with `PLANS_ENABLED=true`.

## 1. Goal

Turn a generated recommendation into a durable plan the user can reopen, edit
safely, version, share, and export.

## 2. Scope

### In scope

- Create a server-generated plan with `POST /plans`.
- Required `Idempotency-Key`.
- Plan library with cursor pagination.
- Plan detail with day tabs.
- Lock/unlock, swap, and regenerate-day actions.
- Immutable version history.
- Revision-based optimistic concurrency (`expected_revision`).
- Share link creation/revocation and public read-only view.
- PDF and ICS downloads.
- Soft delete with confirmation.
- Profile-complete guard on plan routes.
- Actionable error states, especially `plan_invalid` and
  `plan_revision_conflict`.

### Out of scope

- Workout execution (M4).
- Trainer review UI (M6).
- Guest plan import UI (API exists).
- PDF worker/object storage.
- Rich plan comparison or drag-and-drop editing.

## 3. Routes

| Route | Access | Purpose |
|---|---|---|
| `/app/plans` | authenticated + profile | Plan library |
| `/app/plans/new` | authenticated + profile | Generate plan |
| `/app/plans/:planId` | authenticated + profile | Plan detail and actions |
| `/shared/:token` | public | Read-only shared plan |

## 4. API layer

`src/api/plansService.ts`:

```text
GET    /plans
POST   /plans
GET    /plans/{id}
PATCH  /plans/{id}
DELETE /plans/{id}
GET    /plans/{id}/versions
POST   /plans/{id}/share
DELETE /plans/{id}/share
GET    /plans/{id}/export.pdf
GET    /plans/{id}/export.ics
GET    /shared/{token}
```

Notes:

- `Idempotency-Key` is generated once per form state and rotated when the draft
  changes.
- Revision conflicts use `expected_revision` from the loaded plan.
- Version reads use a cache-busting query parameter so an action immediately
  shows the new version.
- PDF/ICS downloads go through the authenticated Axios client and are saved as
  blobs; `window.open` is not used because it would omit the bearer token.
- Share URLs displayed to users point at the frontend
  `/shared/{token}`, not the raw API URL.

## 5. Plan creation

Inputs:

- title;
- available days (1–5);
- preferred body parts (max 5);
- preferred equipment (max 10, defaults from profile);
- optional seed.

Injuries are read from the profile and always sent as constraints. The UI shows
active injuries and never lets the user remove them from the plan request.

On `plan_invalid`, the UI explains that the injury/equipment/focus combination
is too tight and suggests reducing constraints or changing the number of days.

## 6. Plan detail

- Day tabs from `plan.days`.
- Exercise cards with image, body part, equipment, lock, and swap.
- Locked exercises cannot be swapped.
- Regenerate day preserves locked exercises (backend behavior).
- Every action increments `revision` and creates a new immutable version.
- On stale revision:
  - backend returns `409 plan_revision_conflict`;
  - UI shows the conflict;
  - plan is refetched;
  - user repeats the action against the fresh revision.

## 7. Share

- Expiry options: 1, 7, 30, 90 days.
- Raw token is shown once by the backend; the UI stores it in memory for the
  current detail view only.
- Copy uses the frontend URL.
- Revoke removes the token server-side; the public page then returns an error.
- Public response excludes owner identity, email, injuries, and input snapshot.

## 8. Export

- PDF: A4, one section per day, exercise table, warnings.
- ICS: all-day events, starting next Monday.
- Both require the authenticated session.
- Files verified locally: PDF 2,401 bytes; ICS 567 bytes with valid
  `BEGIN:VCALENDAR`/`VEVENT`.

## 9. Verification

Completed locally with the active smoke account:

- [x] Plan library empty state.
- [x] Server-generated 1-day fullbody plan.
- [x] Plan detail day tab and exercise cards.
- [x] Lock creates v2 / revision 2.
- [x] Swap creates v3 / revision 3 and changes the exercise.
- [x] Regenerate day creates v4 and preserves the locked exercise.
- [x] Version list shows v1–v4.
- [x] Share link created and copied from the UI.
- [x] Public `/shared/{token}` renders without login and without owner PII.
- [x] Revoke hides the link and public page reports unavailable.
- [x] PDF download: 200, `application/pdf`, 2,401 bytes.
- [x] ICS download: 200, `text/calendar`, valid calendar payload.
- [x] Second plan created and deleted; library returns to one plan.
- [x] Two-tab revision conflict: stale update shows
      `PLAN_REVISION_CONFLICT` and refreshes to v5.
- [x] `npm run type-check` passes.
- [x] `npm run build` passes.
- [x] `npm audit --omit=dev` reports no vulnerabilities.

## 10. Known limitations

- **Backend caveat:** with an injury that excludes leg exercises, a 2–5 day plan
  can choose a cardio day; the recommender currently returns 2 cardio exercises
  while P0.2 validation expects 3. `POST /plans` therefore returns
  `422 plan_invalid` for those shapes. The frontend displays an actionable
  message. A 1-day fullbody plan works and was used for the M3 end-to-end test.
  Fixing this requires a backend P0.2 change.
- Preferred equipment defaults to the profile list; a restrictive list plus
  injuries can also produce `plan_invalid`. The form tells the user to reduce
  constraints.
- No guest plan import UI, no version restore, no drag-and-drop editing.
- Share token is only shown once; the UI does not persist it after leaving the
  page.
- PDF/ICS are synchronous and generated in-process.
- Plan list pagination is implemented but was not exercised beyond the first
  page.

## 11. Next milestone

**M4 — Workout execution & offline sync**

1. Start workout from a plan day.
2. Set logger and substitution.
3. Complete workout summary.
4. Offline queue + `POST /sync/batch`.
5. Workout history.
