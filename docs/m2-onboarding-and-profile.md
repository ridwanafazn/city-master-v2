# JYMZ Frontend — M2 Onboarding & Profile

Status: **complete**  
Branch: `feat/app-v2`  
Backend: local FastAPI with Neon Auth and profile/consent endpoints.

## 1. Goal

Collect the minimum profile needed for safe plans and workouts:

- identity/profile fields;
- available equipment;
- injuries;
- health-data consent;
- optional research/trainer/marketing consent;
- profile export.

M2 must enforce the health-data consent gate and make the profile editable.

## 2. Scope

### In scope

- Five-step onboarding wizard.
- Profile, equipment, injuries, consent, review.
- `POST /me/onboarding` idempotent submit.
- `GET/PATCH /me/profile`, `PUT /me/equipment`, `PUT /me/injuries`.
- `GET/POST /me/consents` and policy version.
- `GET /me/export` download.
- Profile settings page.
- Profile completeness state in `/me`, account, and control room.
- Profile-complete route meta support for future plans/workouts.
- Auth redirect: incomplete profiles go to onboarding after sign-in/sign-up.

### Out of scope

- Plan generation (M3).
- Workout logging (M4).
- Trainer invitation UI (M6).
- Unit conversion between metric/imperial inputs; values stay cm/kg and the
  preference is stored.
- Free-text injury search; the UI exposes a curated valid vocabulary.

## 3. Routes

| Route | Access | Purpose |
|---|---|---|
| `/app/onboarding` | authenticated | 5-step setup |
| `/app/profile` | authenticated | Edit profile/equipment/injuries/consent/export |
| `/app/account` | authenticated | Identity, roles, consent state, deletion |

After sign-in/sign-up:

```text
if profile_complete:
  go to redirectTo or /app
else:
  go to /app/onboarding
```

`requiresProfile` route meta is available for M3/M4 routes.

## 4. Onboarding steps

1. **Profile**
   - display name (optional; updates `users.display_name`)
   - gender
   - height / weight
   - goal
   - experience
   - session length
   - IANA timezone
   - locale (`id-ID`, `en-US`)
   - unit preference
2. **Equipment**
   - curated canonical backend values;
   - empty selection means “all equipment allowed”.
3. **Injuries**
   - curated valid terms such as knee, lower back, shoulder, ACL, sciatica;
   - if injuries are selected, health consent is required.
4. **Consent**
   - health data processing (required for injuries);
   - research analytics;
   - trainer sharing;
   - marketing;
   - policy version is shown and submitted.
5. **Review**
   - summary of profile, constraints, and consent;
   - submit via `POST /me/onboarding`.

The submit button is disabled without required profile fields or while injuries
exist without health consent.

## 5. Consent behavior

- `health_data_processing` gates injuries in the UI and backend.
- Revoking health consent deletes stored injuries immediately; the UI warns
  before applying the change.
- Consent updates use the backend policy version, not a hardcoded string in the
  request.
- `GET /me` is refreshed after every profile/consent mutation so the app shell,
  account page, and route guards stay consistent.

## 6. Profile settings

`/app/profile` has independent save actions:

- profile fields → `PATCH /me/profile`;
- equipment → `PUT /me/equipment`;
- injuries → `PUT /me/injuries`;
- consent changes → one `POST /me/consents` per changed kind;
- data export → `GET /me/export` and browser download.

This keeps a failed equipment save from discarding profile edits, and vice
versa.

## 7. Data contract

The frontend mirrors:

```text
ProfileResponse { profile, equipment, injuries[] }
ProfileInput {
  gender, height_cm, weight_kg, goal, experience, session_minutes,
  timezone, locale, unit_system
}
Injury { id, term, body_parts, created_at }
ConsentStateResponse { policy_version, active, records[] }
ExportResponse { user, profile, equipment, injuries, consents, roles, account }
```

Canonical values:

- `gender`: `male`, `female`
- `goal`: `muscle_gain`, `fat_loss`, `general_health`
- `experience`: `beginner`, `intermediate`, `advanced`
- `session_minutes`: `30`, `45`, `60`, `90`
- `unit_system`: `metric`, `imperial`
- locales: `id-ID`, `en-US`

## 8. Local verification

Completed with the M1 smoke account:

- [x] Incomplete profile redirects to `/app/onboarding` after sign-in.
- [x] Profile step accepts height/weight/timezone/goal/experience.
- [x] Equipment selection saves three values.
- [x] Injury selection requires health consent.
- [x] Consent step grants health + research.
- [x] Review shows the expected values.
- [x] `POST /me/onboarding` returns profile complete.
- [x] Account page shows `PROFILE COMPLETE: yes` and granted consents.
- [x] `PATCH /me/profile` updates weight.
- [x] Equipment save persists.
- [x] Injuries save persists.
- [x] Consent change (trainer sharing) applies.
- [x] `GET /me/export` downloads `jymz-export-<date>.json`.
- [x] `npm run type-check` passes.
- [x] `npm run build` passes.
- [x] `npm audit --omit=dev` reports no vulnerabilities.

## 9. Known limitations

- No unit conversion UI; height/weight always display cm/kg.
- Injury choices are curated; no free-text search.
- Display name is editable during onboarding, not in profile settings.
- No avatar upload.
- Consent history is exposed by the API but not rendered as a timeline.
- Profile-complete guard is implemented as route meta; Plans/Workouts use it in
  later milestones.

## 10. Next milestone

**M3 — Plan lifecycle**

1. Generate and save plans with idempotency keys.
2. Plan list/detail.
3. Revision conflict handling.
4. Versions.
5. Share links and PDF/ICS export.
