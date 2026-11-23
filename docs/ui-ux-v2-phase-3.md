# JYMZ UI/UX v2 — Phase 3: Plans + Workout

Status: **selesai, menunggu review**
Tanggal: **2026-11-23**
Branch: `feat/ui-v2`
Commit fase 0: `69ee8d2`
Commit fase 1: `7e6c0de`
Fase 2: implemented, belum di-commit
Dev server: `http://127.0.0.1:5173`
Backend: `http://127.0.0.1:8080`

Fase 3 memigrasikan Plan library, Plan detail, Plan create, Workout history,
Workout logger, serta Feedback/Safety forms ke UI v2. Kontrak API tidak diubah.

---

## 1. Plan library

- Header dengan satu CTA `Buat plan`.
- Plan disajikan sebagai **ledger rows**, bukan grid kartu seragam.
- Setiap baris: judul, split, jumlah hari, versi, tanggal, status, `Buka`.
- Empty state, error state, skeleton, dan load more.
- Status aktif memakai badge hijau; versi dan tanggal memakai mono.

## 2. Plan detail

- Header: judul, status, split, hari, BMI; aksi PDF/ICS.
- Warning plan memakai tint penuh, tanpa border kiri berwarna.
- Day tabs memakai `Tabs` (keyboard Arrow/Home/End), dengan jumlah exercise.
- Exercise rows menampilkan nama, body part, equipment, lock/swap.
- `Regenerate` per hari; `Mulai sesi` di day header dan sticky bar mobile.
- Sidebar:
  - metadata (seed, dataset, algorithm, tanggal);
  - share link (masa berlaku, buat, salin, cabut);
  - riwayat versi collapsible;
  - hapus plan memakai `Dialog` konfirmasi.
- Feedback plan + safety report sudah memakai UI v2 (bukan PixelCard/PixelButton).
- Payload lock/swap/regenerate/start tetap sama dengan implementasi M3.

## 3. Plan create

- Form memakai `AppInput`, `SegmentedControl`, `Chip`, dan `AppButton`.
- Hari, fokus tubuh (maks 5), equipment (maks 10), seed.
- Ringkasan profil + constraint cedera di sidebar.
- Error `plan_invalid` tetap menampilkan saran yang actionable.
- Payload `recommendation` dan `Idempotency-Key` tidak berubah.

## 4. Workout history

- Sesi aktif dipin di atas dengan badge `Live`.
- Sesi selesai disajikan sebagai rows dengan tanggal, set, volume, durasi.
- Sync strip penuh + tombol `Sync sekarang`.
- Auto-sync saat mount jika ada mutation pending.
- Empty state mengarah ke Plan library.

## 5. Workout logger

- **Focus mode**: satu exercise terbuka, sisanya collapsed.
- Set table: set, reps, beban, RPE, catatan, aksi.
- Set editor:
  - stepper reps dan beban (44 px);
  - RPE 6–10 sebagai chip, opsional;
  - catatan set collapsed by default;
  - `Catat set` memakai `AppButton`.
- Set baru memulai **rest timer 90 detik**:
  - sticky bar di atas konten;
  - progress bar;
  - `+30 s`, `Lewati`;
  - hilang otomatis saat selesai.
- Offline/pending banner dengan `Sync sekarang`.
- `Selesaikan sesi` membuka `Sheet` berisi ringkasan set/reps/volume/durasi
  dan catatan akhir.
- Setelah selesai, ringkasan menjadi completion ledger (bukan empat kartu).
- `Ganti exercise` memakai `Sheet` kandidat; kontrak `by-focus` tetap.
- Feedback + safety report untuk sesi selesai memakai UI v2.

---

## 6. Verifikasi

| Cek | Hasil |
|---|---|
| `npm run type-check` | lolos |
| `npm run build` | lolos |
| Plan library 390/1440 | tidak overflow, 0 target <44 px, 0 input tanpa label |
| Plan detail 390/1440 | tidak overflow, 0 input tanpa label |
| Plan create 390/1440 | tidak overflow, 0 input tanpa label |
| Workout history 390/1440 | tidak overflow, 0 target <44 px |
| Workout logger 390/1440 | tidak overflow, 0 target <44 px |
| Console error | 0 pada lima halaman yang diaudit |
| `Catat set` | POST benar; set masuk; rest timer tampil |
| Rest timer | mulai 1:30, berjalan, bisa +30 s / Lewati |
| `Selesaikan sesi` | Sheet terbuka; POST complete; completion ledger tampil |
| `Mulai sesi` dari plan | POST start benar; navigasi ke workout baru |
| `Generate plan` | POST create benar; navigasi ke plan baru |

Payload yang terverifikasi:

```json
// POST /workouts/{id}/sets
{"workout_exercise_id":"we-2","set_number":1,"reps":8,"weight_kg":20,"rpe":8,"notes":null,"completed":true,"client_set_id":"..."}

// POST /workouts/start
{"plan_id":"plan-1","day":1,"plan_version":2,"timezone":"Asia/Jakarta","client_session_id":"..."}

// POST /plans
{"title":"My JYMZ Plan","recommendation":{"gender":"male","height_cm":170,"weight_kg":65,"injuries":[],"available_days":3,"preferred_body_part":[],"preferred_equipment":["barbell","dumbbell","cable","body weight"]}}
```

Screenshot:

- `docs/ui-ux-v2-phase-3/plans-390.png` / `plans-1440.png`
- `docs/ui-ux-v2-phase-3/plan-detail-390.png` / `plan-detail-1440.png`
- `docs/ui-ux-v2-phase-3/plan-create-390.png` / `plan-create-1440.png`
- `docs/ui-ux-v2-phase-3/workouts-390.png` / `workouts-1440.png`
- `docs/ui-ux-v2-phase-3/workout-detail-390.png` / `workout-detail-1440.png`
- `docs/ui-ux-v2-phase-3/workout-rest-390.png`
- `docs/ui-ux-v2-phase-3/workout-complete-sheet-390.png`

---

## 7. Bundle

| Chunk | Gzip |
|---|---:|
| `WorkoutDetailView` | 5,89 KB |
| `PlanDetailView` | 4,10 KB |
| `PlanCreateView` | 2,90 KB |
| `WorkoutHistoryView` | 2,08 KB |
| `PlanListView` | 1,58 KB |
| `index` | 65,36 KB |
| `authStore` (lazy) | 48,00 KB |

Tidak ada dependency baru pada fase ini. Semua halaman masih di bawah budget
initial JS 150 KB gzip.

---

## 8. Batasan

- Verifikasi UI memakai mock API + mock auth karena tidak ada akun uji aman.
- Lighthouse halaman terautentikasi dengan akun nyata belum dijalankan.
- Lock/swap/regenerate/share/delete sudah terhubung ke store yang sama, tetapi
  belum seluruhnya diuji terhadap backend nyata.
- Feedback/Safety submit belum diuji end-to-end dengan akun nyata.
- Progress, Profile, Account, dan onboarding masih UI lama; fase 4.
- Fase 2 dan fase 3 belum di-commit dan belum deploy.
