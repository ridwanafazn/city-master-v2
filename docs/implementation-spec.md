# JYMZ implementation specification

Status: **implemented and deployed**  
Terakhir diverifikasi: **2026-11-24**  
Frontend produksi: app `4ce0e58` (deployment `1307cc5a`); deployment final
`82be0184` (`818ff98`).  
Backend produksi: `971a6d9` (deployment `110567c8`).  
Scope: **M0–M5 + UI/UX v2 fase 0–6**  
Di luar scope: **M6 Collaboration dan M7 Release hardening** (deferred)

Dokumen ini adalah rujukan tunggal untuk **spesifikasi yang benar-benar
diterapkan**, bukan hanya rencana atau catatan handover. Jika ada konflik dengan
dokumen fase lama, urutan prioritasnya:

1. kode di `main`;
2. dokumen ini;
3. dokumen fase UI/UX v2 fase 6;
4. dokumen milestone/fase historis;
5. dokumen rencana awal.

Dokumen operasional ada di [`handover.md`](handover.md). Aturan visual mengikat
ada di [`../DESIGN.md`](../DESIGN.md).

---

## 1. System map

```text
Browser
  ├── Public flow
  │     Config / Process / Dashboard
  │     POST /api/v1/recommendation
  │     GET  /api/v1/shared/{token}
  │
  └── App /app
        ├── Auth: Neon Auth (email/password) → JWT in memory
        ├── Profile / consent / equipment / injuries
        ├── Plans: generate, lock, swap, regenerate, share, PDF/ICS
        ├── Workouts: start, sets, substitute, complete, offline sync
        ├── Progress: 7/30/90 hari, volume, balance, PR, insights
        └── Feedback & safety reports

Cloudflare Pages (FE)  →  Railway (FastAPI)  →  Neon Postgres
                              │
                              ├── rule engine + genetic algorithm
                              ├── auth/JWKS
                              └── rate limit / metrics
```

Stack yang dipakai:

| Layer | Implementasi |
|---|---|
| Frontend | Vue 3.5, Vite 8, TypeScript, Pinia, Vue Router, Axios |
| UI | CSS tokens + 21 primitives; Lucide; tanpa chart/animasi library |
| Backend | FastAPI, SQLAlchemy, Alembic, Neon Postgres |
| Auth | Neon Auth / Better Auth session + short-lived JWT |
| Hosting | Cloudflare Pages + Railway Free |
| Observability | `/health`, `/ready`, `/metrics`, `X-Request-ID`, `X-Process-Time` |

---

## 2. Scope dan status fitur

| Area | Status | Bukti |
|---|---|---|
| M0 Foundation | selesai | [`m0-foundation.md`](m0-foundation.md) |
| M1 Auth & account | selesai | [`m1-auth-and-account.md`](m1-auth-and-account.md) |
| M2 Onboarding & profile | selesai | [`m2-onboarding-and-profile.md`](m2-onboarding-and-profile.md) |
| M3 Plan lifecycle | selesai | [`m3-plan-lifecycle.md`](m3-plan-lifecycle.md) |
| M4 Workout & offline sync | selesai | [`m4-workout-execution.md`](m4-workout-execution.md) |
| M5 Progress, feedback, safety | selesai | [`m5-progress-feedback.md`](m5-progress-feedback.md) |
| UI/UX v2 fase 0–6 | selesai & deployed | [`ui-ux-v2-phase-6.md`](ui-ux-v2-phase-6.md) |
| M6 Collaboration | deferred | tidak ada UI/flag produksi |
| M7 Release hardening | deferred | lightweight deploy, bukan M7 penuh |

Catatan: backend `main` juga berisi kode P1/P2 di balik flag (trainer,
notifications, organizations, research, ops). Produksi hanya mengekspos endpoint
M1–M5 + admin feedback/safety; route trainer/notifications/orgs/research/ops
tidak muncul di OpenAPI produksi. Jangan mengaktifkan flag tersebut tanpa
permintaan milestone baru.

---

## 3. Functional specification

### 3.1 Public recommendation flow

**Tujuan:** pengguna tanpa akun bisa mengisi parameter, menjalankan optimizer,
dan membaca plan mingguan.

| Spec | Implementasi |
|---|---|
| Routes | `/` config, `/process` console, `/dashboard` hasil, `/shared/:token` read-only |
| Auth | tidak perlu login; public flow tidak memanggil Neon Auth |
| Input | gender, tinggi, berat, hari 1–5, cedera, target fokus, equipment |
| Validasi | tinggi 100–250 cm, berat 30–200 kg, pesan UI v2; `novalidate` + validasi sendiri |
| Request | `POST /api/v1/recommendation/` dengan payload `RecommendationRequest` |
| Output | BMI, kategori, split, daftar hari, exercise, equipment, gambar/fallback |
| Process | log engine, elapsed timer, status berjalan/selesai/gagal, auto-redirect 1,5 s |
| Shared plan | `GET /api/v1/shared/{token}`; read-only, warning, expiry, tanpa identitas owner |
| Error | pesan + retry/ubah parameter; parameter tidak hilang |

Detail kontrak:

```text
POST /api/v1/recommendation/
{
  gender, height_cm, weight_kg, injuries[],
  available_days, preferred_body_part[], preferred_equipment[]
}

POST /api/v1/recommendation/by-focus
{ day_focus, injuries?, preferred_equipment?, preferred_body_part?, bmi? }

GET /api/v1/shared/{token}
```

Batasan: satu CTA utama per layar, tanpa progress bar palsu, log memakai mono
karena data. Bukti: [`ui-ux-v2-phase-5.md`](ui-ux-v2-phase-5.md).

### 3.2 Auth dan account

| Spec | Implementasi |
|---|---|
| Provider | Neon Auth / Better Auth, email + password |
| Token | JWT disimpan **di memory**, tidak di `localStorage`; refresh jika <30 s kedaluwarsa |
| Routes | `/auth/sign-in`, `/auth/sign-up`, `/app/account` |
| Guard | `requiresAuth`, `requiresProfile`, `guestOnly`; redirect aman same-origin |
| Bootstrap | `GET /api/v1/me` setelah sesi; cache `/me` best-effort |
| Account | identitas, role, verifikasi email, consent, advanced diagnostics, export link, sign out, delete |
| Deletion | `DELETE /api/v1/me`, dialog konfirmasi, sesi berakhir |
| Error | 401 clear session + redirect; backend offline tidak menghapus sesi valid |

Endpoint:

```text
GET    /api/v1/me
DELETE /api/v1/me
```

Tidak ada social login, password reset UI, MFA, atau passkey. Bukti:
[`m1-auth-and-account.md`](m1-auth-and-account.md) dan
[`ui-ux-v2-phase-4.md`](ui-ux-v2-phase-4.md).

### 3.3 Onboarding, profile, dan consent

| Spec | Implementasi |
|---|---|
| Onboarding | 5 langkah: profil, equipment, cedera, consent, review |
| Profil | gender, tinggi, berat, goal, experience, session minutes, timezone, locale, unit |
| Equipment | vocabulary canonical; kosong = semua equipment |
| Injuries | vocabulary canonical; wajib health consent |
| Consent | health, research, trainer sharing, marketing; policy version dari backend |
| Revoke health | cedera tersimpan dihapus; UI memberi peringatan |
| Export | `GET /api/v1/me/export` → file JSON |
| Route | `/app/onboarding`, `/app/profile`; `requiresProfile` untuk plans/workouts |

Endpoint:

```text
POST /api/v1/me/onboarding
GET  /api/v1/me/profile
PATCH /api/v1/me/profile
PUT  /api/v1/me/equipment
PUT  /api/v1/me/injuries
GET  /api/v1/me/consents
POST /api/v1/me/consents
GET  /api/v1/me/export
```

Canonical values:

```text
gender: male | female
goal: muscle_gain | fat_loss | general_health
experience: beginner | intermediate | advanced
session_minutes: 30 | 45 | 60 | 90
unit_system: metric | imperial
locale: id-ID | en-US
```

Batasan: belum ada unit conversion UI; nilai tetap cm/kg. Bukti:
[`m2-onboarding-and-profile.md`](m2-onboarding-and-profile.md).

### 3.4 Plan lifecycle

| Spec | Implementasi |
|---|---|
| Routes | `/app/plans`, `/app/plans/new`, `/app/plans/:planId`, `/shared/:token` |
| Create | `POST /api/v1/plans` + `Idempotency-Key` |
| List | cursor pagination |
| Detail | day tabs, exercise rows, lock/swap/regenerate |
| Concurrency | `expected_revision`; 409 `plan_revision_conflict` → refetch |
| Versions | immutable version list |
| Share | expiry 1/7/30/90 hari; token hanya tampil sekali; revoke |
| Export | PDF A4 dan ICS all-day |
| Delete | soft delete + dialog konfirmasi |
| Error | `plan_invalid` menampilkan saran mengurangi constraint |
| Public share | read-only, tanpa PII owner |

Endpoint:

```text
GET    /api/v1/plans
POST   /api/v1/plans
GET    /api/v1/plans/{id}
PATCH  /api/v1/plans/{id}
DELETE /api/v1/plans/{id}
GET    /api/v1/plans/{id}/versions
POST   /api/v1/plans/{id}/share
DELETE /api/v1/plans/{id}/share
GET    /api/v1/plans/{id}/export.pdf
GET    /api/v1/plans/{id}/export.ics
POST   /api/v1/plans/import        # API tersedia; belum ada UI guest import
GET    /api/v1/shared/{token}
```

Input create: title, available days 1–5, preferred body parts maks 5,
preferred equipment maks 10 (default dari profil), seed opsional. Injuries
selalu dibaca dari profil.

Batasan: `plan_invalid` backend untuk kombinasi cedera + hari banyak dapat
muncul (lihat bagian 8); PDF/ICS synchronous; belum ada version restore atau
drag-and-drop. Bukti: [`m3-plan-lifecycle.md`](m3-plan-lifecycle.md).

### 3.5 Workout execution dan offline sync

| Spec | Implementasi |
|---|---|
| Routes | `/app/workouts`, `/app/workouts/:workoutId` |
| Start | hanya online; `POST /workouts/start` + `client_session_id` |
| Logger | focus mode, set table, stepper reps/beban, RPE 6–10, notes |
| Set | create/edit/delete; `client_set_id` untuk idempotensi |
| Rest timer | 90 detik, +30 s, Lewati; tidak dipersist setelah reload |
| Substitute | `POST /recommendation/by-focus` lalu endpoint substitute |
| Complete | `POST /workouts/{id}/complete` idempotent; server menghitung totals |
| Offline | queue localStorage untuk set/update/delete, substitute, complete |
| Sync | `POST /sync/batch`; item `applied`/`duplicate` dihapus, `error` disimpan |
| History | sesi aktif dipin, sesi selesai sebagai rows, sync strip |

Endpoint:

```text
POST   /api/v1/workouts/start
GET    /api/v1/workouts
GET    /api/v1/workouts/{id}
PATCH  /api/v1/workouts/{id}
POST   /api/v1/workouts/{id}/complete
POST   /api/v1/workouts/{id}/sets
PATCH  /api/v1/sets/{id}
DELETE /api/v1/sets/{id}
POST   /api/v1/workouts/{id}/exercises/{id}/substitute
POST   /api/v1/sync/batch
```

Local storage:

```text
jymz.workout.pending.v1          queue mutation
jymz.workout.cache.v1:<id>       cache workout untuk reload offline
```

Batasan: offline start tidak didukung; queue tidak terenkripsi; belum ada
background sync/service worker; rest timer tidak persisten; tidak ada audio
cue. Bukti: [`m4-workout-execution.md`](m4-workout-execution.md) dan
[`ui-ux-v2-phase-3.md`](ui-ux-v2-phase-3.md).

### 3.6 Progress

| Spec | Implementasi |
|---|---|
| Route | `/app/progress` |
| Range | 7 / 30 / 90 hari, `SegmentedControl`; disabled saat load |
| Stat utama | sesi, volume, streak, personal record |
| Chart | `VolumeChart.vue`, SVG harian, tanpa library chart |
| Balance | horizontal bars per body part |
| PR | `max_weight`, `max_reps`, `max_volume` dari backend |
| Weekly review | sesi, set, volume, durasi, summary |
| Insight | 28 hari, streak, PR count |
| History | sesi terakhir + link riwayat |

Endpoint:

```text
GET /api/v1/me/progress?from_date&to_date&timezone
GET /api/v1/me/history?limit&cursor
GET /api/v1/me/insights?timezone
```

Urutan load **sequential** (`progress` → `insights` → `history`) karena backend
melakukan rebuild-on-read untuk `daily_metrics`; request paralel bisa memicu
race unique constraint. Insights optional: jika gagal, progress tetap tampil.
Bukti: [`m5-progress-feedback.md`](m5-progress-feedback.md) dan
[`ui-ux-v2-phase-4.md`](ui-ux-v2-phase-4.md).

### 3.7 Feedback dan safety report

| Spec | Implementasi |
|---|---|
| Plan feedback | rating 1–5, difficulty, pain, comment ≤2.000 |
| Workout feedback | konteks `plan_id` + `workout_session_id` |
| Safety report | exercise, severity, reason 5–2.000 karakter |
| Admin API | feedback/safety/audit/quality-summary tersedia di backend |
| Admin UI | **tidak ada**; triage belum dibangun |

Endpoint:

```text
POST /api/v1/feedback
POST /api/v1/safety-reports
GET  /api/v1/admin/feedback
GET  /api/v1/admin/safety-reports
PATCH /api/v1/admin/safety-reports/{id}
GET  /api/v1/admin/audit
GET  /api/v1/admin/quality-summary
```

Admin endpoint ada karena `FEEDBACK_ENABLED=true`, tetapi tidak diekspos di
navigasi user. Bukti: [`m5-progress-feedback.md`](m5-progress-feedback.md).

### 3.8 Diagnostics internal

| Spec | Implementasi |
|---|---|
| Route | `/app/debug` |
| Akses | authenticated, tidak ada di navigasi |
| Isi | API base, health, ready, database, redis, rate limit, dataset, environment, last check |
| Aksi | `Periksa ulang` memanggil `checkBackend()` |

Route ini sengaja menyimpan detail teknis yang tidak boleh muncul di halaman
user. Bukti: `src/views/app/DebugView.vue`.

---

## 4. State, cache, dan kontrak data

### Error envelope

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

`ApiError` menormalkan `status`, `code`, `message`, `details`, `requestId`.
UI tidak mem-parse Axios error mentah.

### Cache dan local storage

| Key | Isi | Sifat |
|---|---|---|
| `jymz.auth.me.v1` | snapshot `/me` per user | best-effort, tidak menyimpan token |
| `jymz.home.v1` | plan, workout, insights terakhir | best-effort untuk cold start |
| `jymz.workout.pending.v1` | queue mutation offline | harus disync; tidak terenkripsi |
| `jymz.workout.cache.v1:<id>` | workout untuk reload offline | best-effort |

JWT **tidak** disimpan di storage. Queue offline bisa berisi data latihan, jadi
perlakukan browser profile sebagai data sensitif.

### Idempotensi

| Operasi | Kunci |
|---|---|
| Create plan | `Idempotency-Key` per form state |
| Start workout | `client_session_id` |
| Create set | `client_set_id` |
| Sync batch | `client_mutation_id` |
| Complete workout | endpoint idempotent |

### Server wake / cold start

- App shell langsung render.
- `/ready` probe berjalan saat shell mount.
- Banner muncul setelah **2 detik** menunggu.
- State “server sedang bangun” setelah **8 detik**.
- Retry manual; tidak ada retry agresif.
- Public process menampilkan log/wait/error tanpa progress palsu.

---

## 5. UI/UX specification

### Arah visual

**Signal Editorial / field manual**, bukan dashboard SaaS:

- paper `#F8F7F4`, ink `#14160F`, muted `#5A5E4E`;
- signal `#D9480F` sebagai accent; teks/CTA `#C2410C`;
- biru hanya metrik/data; hijau hanya success/readiness; merah hanya danger;
- tanpa dark mode;
- Lucide satu-satunya ikon;
- tanpa chart/animasi library besar;
- tabel/rule untuk data berulang; kartu hanya unit mandiri;
- tanpa eyebrow, nomor section dekoratif, border kiri berwarna, kartu dalam
  kartu, empat kartu statistik seragam, mono untuk paragraf, gradient text.

Aturan lengkap: [`../DESIGN.md`](../DESIGN.md).

### Token dan font

| Item | Nilai |
|---|---|
| Display | Bricolage Grotesque, 40,4 KB |
| Body | Public Sans, 26,2 KB |
| Data | JetBrains Mono, 39,5 KB |
| Total font | 106,1 KiB di disk; 109,5 KB transfer |
| Radius | 10 px control, 12 px card, 999 px pill |
| Touch target | minimal 44×44 px |
| Max width | 1240 px |
| Measure | 68 ch |
| Motion | 160/200/240 ms, entrance `cubic-bezier(.2,.8,.2,1)` |
| Reduced motion | guard global |

Font display/body di-preload statis dari `index.html`. JetBrains Mono on-demand.

### Primitives

`src/components/ui-v2/` — 21 komponen:

```text
AppButton, IconButton, Card, SectionHeader, StatTile,
Badge, Chip, AppInput, AppSelect, AppTextarea, AppCheckbox,
RadioGroup, SegmentedControl, Tabs, Dialog, Sheet,
Toast, Skeleton, EmptyState, ErrorState, ServerWakeBanner
```

### Route inventory

| Route | Akses | Status |
|---|---|---|
| `/` | public | config |
| `/process` | public | console |
| `/dashboard` | public | hasil |
| `/shared/:token` | public | read-only |
| `/style-guide` | public, robots-disallow | specimen internal |
| `/auth/sign-in` | guest | login |
| `/auth/sign-up` | guest | register |
| `/app` | authenticated | Today |
| `/app/account` | authenticated | account |
| `/app/onboarding` | authenticated | 5-step setup |
| `/app/profile` | authenticated | profile/consent/export |
| `/app/plans` | auth + profile | daftar plan |
| `/app/plans/new` | auth + profile | generate plan |
| `/app/plans/:planId` | auth + profile | detail/aksi |
| `/app/workouts` | auth + profile | riwayat |
| `/app/workouts/:workoutId` | auth + profile | logger/detail |
| `/app/progress` | auth + profile | progress |
| `/app/debug` | authenticated, hidden | diagnostics |
| fallback | public | redirect `/` |

### Responsive dan aksesibilitas

- ≥1024 px: sidebar 232 px; <1024 px: bottom nav 5 item.
- Workout set-editor berubah ke dua kolom ≤900 px.
- Semua form control punya label terlihat; placeholder bukan label.
- Status selalu punya teks/ikon, bukan warna saja.
- Focus ring 2 px signal terlihat.
- Dialog/Sheet memakai native `<dialog>`.
- Tabel punya caption/heading; tab memakai role dan keyboard.
- Reduced motion menghasilkan transisi ~0 s.

### Performance budget dan hasil

| Metrik | Target | Hasil |
|---|---:|---:|
| Lighthouse mobile performance | ≥90 | **100** |
| Accessibility / best practices / SEO | ≥95 | **100 / 100 / 100** |
| LCP mobile | <2,5 s | **0,8 s** |
| INP/TBT | <200 ms | **40 ms TBT** |
| CLS | <0,1 | **0** |
| Initial JS gzip | <150 KB | **67,64 KB** |
| Route chunk gzip | <60 KB | maks **11,78 KB** (style guide); user maks **5,92 KB** |
| Font total | <160 KB | **109,5 KB transfer** |

Bukti: [`ui-ux-v2-phase-6/lighthouse-mobile.html`](ui-ux-v2-phase-6/lighthouse-mobile.html)
dan [`ui-ux-v2-phase-6.md`](ui-ux-v2-phase-6.md).

---

## 6. Non-functional specification

### Security

- CORS produksi exact origin `https://jymz.pages.dev`.
- JWT di memory; tidak ada token di localStorage.
- `_headers`: `nosniff`, referrer policy, permissions policy, HTML revalidate,
  assets/fonts immutable.
- Public flow tidak memanggil Neon Auth.
- Admin endpoint backend tidak diekspos di UI.
- Secret tidak disimpan di repo; environment diatur di Cloudflare/Railway.
- Rate limit produksi memakai in-memory (`redis: not_configured`); metrik
  degradasi tersedia.

### Reliability

- Cold-start UX eksplisit (2 s/8 s/retry).
- Error envelope + request ID.
- Idempotensi pada plan, start workout, set, sync, complete.
- Offline queue + cache untuk workout.
- Progress request serial untuk menghindari race backend.
- Cache `/me` dan Home untuk tampilan terakhir saat backend lambat.

### Observability

- `/health`, `/ready`, `/metrics`.
- `X-Request-ID` dan `X-Process-Time`.
- Frontend `/app/debug` untuk diagnostics.
- Tidak ada APM/tracing eksternal.

### Compliance/consent

- Health data processing wajib untuk cedera.
- Revoke health consent menghapus cedera tersimpan.
- Consent memakai policy version backend.
- Export data user tersedia.
- Deletion request memiliki masa tenggang backend.

---

## 7. Traceability matrix

| Spec area | Implementasi utama | Verifikasi |
|---|---|---|
| Public flow | `ConfigView`, `ProcessView`, `DashboardView`, `PublicPlanView`, `fitnessStore` | phase 5, production smoke |
| Auth/account | `authStore`, `lib/auth.ts`, `api/client.ts`, `AccountView` | M1, phase 4 |
| Profile/consent | `profileStore`, `ProfileSettingsView`, `ConsentPanel` | M2, phase 4 |
| Plans | `planStore`, `plansService`, `Plan*View` | M3, phase 3 |
| Workouts/offline | `workoutStore`, `workoutsService`, `WorkoutDetailView` | M4, phase 3 |
| Progress | `progressStore`, `progressService`, `ProgressView`, `VolumeChart` | M5, phase 4 |
| Feedback/safety | `feedbackService`, `FeedbackForm`, `SafetyReportForm` | M5, phase 3 |
| Design system | `tokens.css`, `ui-v2/*`, `DESIGN.md` | phase 1/6, `/style-guide` |
| Performance | `index.html`, `vite.config.ts`, `AppShell` prefetch | phase 6 Lighthouse |
| Deploy | Cloudflare Pages + Railway | [`handover.md`](handover.md) |

---

## 8. Known limitations dan deviasi

1. **`plan_invalid` backend:** kombinasi cedera yang mengecualikan kaki pada plan
   2–5 hari dapat memilih cardio day dengan 2 exercise, sementara validasi
   mengharapkan 3. Frontend menampilkan pesan actionable; fix memerlukan
   perubahan backend.
2. **Progress rebuild-on-read:** `daily_metrics` dihapus lalu diinsert ulang.
   Frontend men-serialize progress/insights/history; client lain harus melakukan
   hal yang sama sampai backend memakai upsert.
3. **Lighthouse terautentikasi belum dijalankan:** belum ada akun uji aman dan
   Neon branch terpisah. Yang ada baru public flow.
4. **Lighthouse desktop `NO_FCP`:** kegagalan environment headless, bukan error
   aplikasi. Layout desktop diperiksa lewat screenshot 1440 dan DOM.
5. **Railway Free sleep:** `sleepApplication: true`; cold start diterima dan
   ditangani banner/wake state.
6. **Auth terbatas:** email/password; belum ada password reset UI, social login,
   MFA, atau passkey.
7. **Unit conversion:** preferensi imperial disimpan, tetapi input/display tetap
   cm/kg.
8. **Guest plan import:** endpoint `POST /plans/import` ada; UI belum ada.
9. **PDF/ICS:** dibuat synchronous di proses API; belum worker/object storage.
10. **Share/version:** token share hanya tampil sekali; belum ada version restore
    atau drag-and-drop editing.
11. **Offline workout:** start harus online; queue tidak terenkripsi; belum ada
    background sync/service worker.
12. **Rest timer:** ada di UI v2 (90 s, +30, Lewati), tetapi tidak persisten
    setelah reload dan tanpa audio cue.
13. **Admin triage:** endpoint admin feedback/safety/audit ada, tetapi belum ada
    UI admin; belum ada feedback history untuk user.
14. **PWA:** belum ada manifest/service worker.
15. **M6/M7:** deferred; jangan mengaktifkan flag atau membangun UI-nya tanpa
    permintaan eksplisit.
16. **Database lokal:** `.env.local` backend menunjuk Neon project yang sama
    dengan produksi; jangan seed/mutate tanpa izin.

---

## 9. Change control

Jika fitur/API berubah:

1. update tipe di `src/types/`;
2. update service di `src/api/`;
3. update store/page;
4. jalankan `npm run type-check`, `npm run build`, dan smoke test;
5. update dokumen ini dan dokumen fase terkait;
6. deploy lewat [`handover.md`](handover.md) dan verifikasi produksi;
7. jangan mengubah kontrak backend tanpa memperbarui backend dan frontend
   bersamaan.

Dokumen ini tidak menggantikan `DESIGN.md`; aturan visual tetap mengikat.
