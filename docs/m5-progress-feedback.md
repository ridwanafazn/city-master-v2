# JYMZ Frontend — M5 Progress, Feedback & Safety

Status: **complete**  
Branch: `feat/app-v2`  
Backend: local FastAPI with `PROGRESS_ENABLED=true`, `FEEDBACK_ENABLED=true`,
`WORKOUTS_ENABLED=true`, and `AUTH_PROFILES_ENABLED=true`.

## 1. Goal

Close the core training loop:

- show consistency, volume, and body-part balance;
- show personal records and a weekly review;
- let users rate a plan or workout;
- let users report an unsafe exercise;
- keep the public recommendation flow untouched.

## 2. Scope

In scope:

- 7/30/90-day progress ranges.
- Daily volume bars and aggregate totals.
- Streak, workout count, sets, reps, volume, and duration.
- Body-part balance.
- Personal records (`max_weight`, `max_reps`, `max_volume`).
- Weekly review and textual insights.
- Recent completed workouts linked to workout detail.
- Plan feedback and workout feedback.
- Safety reports tied to a plan exercise or workout exercise.

Out of scope:

- Admin triage UI.
- Trainer commentary (M6).
- Wearable imports (later milestone).
- Charts library; dashboard UI v2 memakai custom SVG `VolumeChart`, bukan
  library chart.
- Background analytics or a data warehouse.

## 3. Routes and entry points

| Route | Access | Purpose |
|---|---|---|
| `/app/progress` | authenticated + profile | Progress dashboard |
| `/app/plans/:planId` | authenticated + profile | Plan feedback + safety report |
| `/app/workouts/:workoutId` | authenticated + profile | Workout feedback + safety report (completed sessions) |

Progress is linked from the app navigation, the control room, and workout
history.

## 4. API layer

`src/api/progressService.ts`:

```text
GET /me/progress?from_date&to_date&timezone
GET /me/history?limit&cursor
GET /me/insights?timezone
```

`src/api/feedbackService.ts`:

```text
POST /feedback
POST /safety-reports
```

The response contracts live in `src/types/progress.ts` and
`src/types/feedback.ts`.

## 5. Progress dashboard

`src/views/app/ProgressView.vue` uses `src/stores/progressStore.ts`.

- `Progress` returns daily metrics and totals for the selected range.
- `Insights` returns streak, 28-day workout count, current-week review,
  body-part balance, and personal records.
- `History` returns completed workouts for the recent workout list.

The store loads the range from the profile timezone, falling back to the
browser timezone. Range selection is disabled while a load is in progress.

### Backend concurrency note

Progress aggregates are rebuilt on read. The backend performs a
delete-then-insert for `daily_metrics`, so calling progress and insights in
parallel can race and violate `uq_daily_metrics_owner_date`.

The frontend therefore:

1. calls `/me/progress`, `/me/insights`, and `/me/history` sequentially;
2. blocks concurrent range loads;
3. treats insights as optional, so the dashboard still shows progress if the
   insights call fails.

## 6. Personal records and formatting

Records come from the insights payload:

- `max_weight` → shown in kg;
- `max_reps` → shown in reps;
- `max_volume` → shown in kg.

The dashboard does not compute records client-side; it displays the backend
aggregate.

## 7. Feedback

`src/components/feedback/FeedbackForm.vue`:

- rating 1–5 (optional);
- difficulty `too_easy` / `just_right` / `too_hard`;
- pain flag and optional pain area;
- comment up to 2,000 characters;
- at least one value is required before submit.

Context is attached automatically:

- plan feedback: `plan_id`;
- workout feedback: `plan_id` and `workout_session_id`.

The form is shown for completed workouts and on plan detail.

## 8. Safety report

`src/components/feedback/SafetyReportForm.vue`:

- exercise selector;
- severity `low` / `medium` / `high` / `critical`;
- reason (minimum 5 characters, maximum 2,000);
- sends `plan_id`, `plan_exercise_id` or `exercise_id`, and
  `workout_session_id` when available.

On plan detail the selector lists every plan exercise. On workout detail it
lists the exercises in that workout, including substituted exercises.

The backend validates the report context and returns the stored report. There
is no admin UI in M5.

## 9. Verification

Completed locally against the local backend:

- [x] `/app/progress` loads totals: 2 workouts, 2 sets, 35 reps, 1,250 kg.
- [x] 7-day range updates the from-date and keeps totals.
- [x] 90-day range updates the from-date and keeps totals.
- [x] Daily volume bars and body-part balance render.
- [x] Personal records render as `40 kg`, `20 reps`, and `800 kg`.
- [x] Weekly review and insights render.
- [x] Recent completed workouts link to workout detail.
- [x] Plan feedback submits and shows a success notice.
- [x] Workout feedback submits and shows a success notice.
- [x] Plan safety report submits and shows a success notice.
- [x] Workout safety report submits and shows a success notice.
- [x] No console errors after a clean load.
- [x] Type-check, build, and production audit pass.

## 10. Known limitations

- Functional test data is small (two completed sessions), so charts and
  pagination are exercised lightly.
- Range changes are blocked while a load is running; the buttons are disabled.
- Insights are optional and fail silently; progress still renders.
- No admin triage screen for safety reports.
- No feedback history screen for the user.
- The backend rebuild-on-read behavior is sensitive to concurrent requests;
  the frontend serializes calls, but other clients should do the same until the
  backend uses an upsert.

## 11. Next milestone

> **Status update (2026-11-23):** M6 and M7 are **deferred indefinitely**.
> The next active workstream is the UI/UX and performance overhaul in
> [`ui-ux-v2-plan.md`](ui-ux-v2-plan.md). The list below is retained as the
> original M6 outline, not as active work.

**M6 — Collaboration**

1. Trainer profile and client list.
2. Invitations and scopes.
3. Comments and plan reviews.
4. Notifications and calendar.
5. Organizations.
