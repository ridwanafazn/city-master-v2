# JYMZ Frontend — M4 Workout Execution & Offline Sync

Status: **complete**  
Branch: `feat/app-v2`  
Backend: local FastAPI with `PLANS_ENABLED=true`, `WORKOUTS_ENABLED=true`.

## 1. Goal

Run a saved plan day as a real workout:

- start from a plan day;
- log sets while training;
- edit/delete sets;
- substitute an exercise safely;
- complete the session;
- keep logging with the backend unavailable and sync later;
- review workout history.

## 2. Scope

### In scope

- Start workout from plan detail.
- Client-generated `client_session_id` for start idempotency.
- Live set logger: reps, weight, RPE, notes, completed.
- Edit and soft-delete sets.
- Complete workout with server totals/duration.
- Exercise substitution using safe candidates from `by-focus`.
- Offline queue for set create/update/delete, substitution, and completion.
- Batch sync via `POST /sync/batch`.
- Cached workout for reload while offline.
- Workout history.

### Out of scope

- Offline workout start (start requires a live server).
- Background sync/service worker.
- Rest timer persistence (future client-side enhancement).
- Progress aggregates, PR detection, and insights (M5).
- Workout deletion/archive.
- Trainer access to workout logs (M6).

## 3. Routes

| Route | Access | Purpose |
|---|---|---|
| `/app/plans/:planId` | authenticated + profile | Start workout from day |
| `/app/workouts` | authenticated + profile | Workout history |
| `/app/workouts/:workoutId` | authenticated + profile | Live workout / detail |

## 4. API layer

`src/api/workoutsService.ts`:

```text
POST   /workouts/start
GET    /workouts
GET    /workouts/{id}
PATCH  /workouts/{id}
POST   /workouts/{id}/complete
POST   /workouts/{id}/sets
PATCH  /sets/{id}
DELETE /sets/{id}
POST   /workouts/{id}/exercises/{exercise_id}/substitute
POST   /sync/batch
```

## 5. Start contract

From plan detail:

```text
plan_id
day
plan_version = current version
timezone = profile timezone (fallback UTC)
client_session_id = crypto.randomUUID()
```

The workout is created online. Offline start is intentionally not supported.

## 6. Live set logger

Per exercise:

- set number is next available number;
- reps, weight (kg), RPE, notes;
- add, edit, delete;
- completed sets contribute to totals.

Online actions update the local workout immediately and refresh totals from the
server for completion.

## 7. Substitution

`Substitute` opens safe candidates:

1. call `POST /recommendation/by-focus` with the workout focus, profile injuries,
   and profile equipment;
2. hide the current exercise and exercises already used in the workout;
3. choose a candidate;
4. call the workout substitution endpoint.

The backend enforces dataset membership, focus compatibility, injury safety, and
no duplicate exercise.

## 8. Offline queue

Storage:

```text
localStorage key: jymz.workout.pending.v1
```

A pending mutation:

```text
id (client_mutation_id), type, workoutId, payload, occurredAt
```

Supported local mutations:

- `set.create`
- `set.update`
- `set.delete`
- `workout.complete`
- `exercise.substitute`

Behavior:

- Network errors and 502/503/504 fall back to the queue.
- Optimistic local state is applied and cached in
  `jymz.workout.cache.v1:<workoutId>`.
- A reload while offline loads the cached workout.
- `Sync Now` posts the queue to `/sync/batch`.
- `applied` and `duplicate` results remove the queue item.
- `error` results remain for manual retry and are shown to the user.
- A successful sync reloads the workout and replaces temporary local sets with
  server IDs.
- Idempotency is provided by `client_mutation_id` and `client_set_id`.

## 9. Completion

- `POST /workouts/{id}/complete` is idempotent.
- Server recalculates total sets, reps, volume, and duration.
- Offline completion is queued and the UI marks the workout completed locally
  until sync.
- Post-completion set/substitution mutations are rejected by the backend.

## 10. Verification

Completed locally:

- [x] Start workout from plan day.
- [x] Live set logger renders 5 exercises.
- [x] Add set (10 reps, 20 kg, RPE 8, notes).
- [x] Edit set (12 reps, 25 kg, RPE 9).
- [x] Delete set and confirm removal.
- [x] Substitution candidate picker and successful exercise swap.
- [x] Offline set while backend stopped: queued in localStorage, optimistic row.
- [x] Backend restart + `Sync Now`: set applied, queue empty.
- [x] Complete workout online: totals 2 sets / 35 reps / 1,250 kg volume.
- [x] Offline completion while backend stopped: queued and marked completed.
- [x] Sync completion: queue empty, server state completed.
- [x] History shows both completed sessions with totals.
- [x] `npm run type-check` passes.
- [x] `npm run build` passes.
- [x] `npm audit --omit=dev` reports no vulnerabilities.

## 11. Known limitations

- Offline start is not supported; start a workout while online.
- Queue and cache are browser-local and not encrypted; they are cleared only by
  successful sync or user/browser data removal.
- No background sync; the user clicks Sync Now or the app syncs on mount/online.
- No rest timer or audio cues.
- Progress, personal records, feedback, and safety reports are implemented in
  M5.
- No workout delete/archive.
- Substitution candidates use the public `by-focus` endpoint and can take a
  moment to generate; no full dataset search UI.

## 12. Next milestone

**M5 — Progress, Feedback & Safety**

Implemented in [`m5-progress-feedback.md`](m5-progress-feedback.md):

1. Progress dashboard.
2. History and insights.
3. Personal records.
4. Feedback form.
5. Safety report.
