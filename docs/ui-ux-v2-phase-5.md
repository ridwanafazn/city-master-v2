# JYMZ UI/UX v2 — Phase 5: Public flow + motion

Status: **selesai, menunggu review**  
Tanggal: **2026-11-23**  
Branch: `feat/ui-v2`  
Commit fase 0: `69ee8d2`  
Commit fase 1: `7e6c0de`  
Fase 2–5: implemented, belum di-commit  
Dev server: `http://127.0.0.1:5173`  
Backend: `http://127.0.0.1:8080`

Fase 5 memigrasikan public recommendation flow dan menambahkan motion
system. Public flow tetap berjalan tanpa login; kontrak API tidak berubah.

---

## 1. Public config (`/`)

- Header publik: brand, label “Public engine”, dan link masuk.
- Form dibagi menjadi Biometrics, Constraints, dan Equipment.
- `AppInput`, `AppSelect`, `SegmentedControl`, dan `Chip` UI v2.
- BMI tampil sebagai satu panel ringkas dengan kategori, bukan empat kartu.
- Hari tersedia memakai segmented control 1–5 hari.
- Injury dan target focus memakai chip 44 px; equipment memakai chip.
- Validasi tinggi/berat memakai pesan UI v2, bukan bubble native. Form memakai
  `novalidate`; error hilang begitu nilai masuk rentang valid.
- Run summary di rail memuat BMI, hari, cedera, target, equipment, dan CTA
  utama. Di mobile rail turun ke bawah form.
- CTA tetap memanggil `POST /recommendation/` dengan payload yang sama:
  `gender`, `height_cm`, `weight_kg`, `injuries`, `available_days`,
  `preferred_body_part`, `preferred_equipment`.

## 2. Process (`/process`)

- Status, salinan, dan tone berubah untuk idle, berjalan, selesai, dan gagal.
- Ledger parameter yang benar-benar dikirim: BMI, hari, cedera, target,
  equipment, dan elapsed time.
- Log engine tetap ada dan tetap mono karena berisi data/log, bukan paragraf.
- Log memakai `role="log"` dan `aria-live="polite"`, auto-scroll, caret saat
  menunggu, serta status sukses/gagal yang eksplisit.
- Timer berjalan nyata selama request; tidak ada progress bar palsu.
- Sukses tetap redirect otomatis ke `/dashboard` setelah 1,5 detik dan tetap
  menyediakan tombol “Buka hasil”.
- Error menyediakan “Ubah parameter” dan “Coba lagi”; parameter tidak hilang.
- Guard refresh tetap: membuka `/process` tanpa proses aktif kembali ke `/`.

## 3. Dashboard (`/dashboard`)

- Header hasil memuat waktu engine, BMI, dan kategori.
- Split terpilih ditampilkan sebagai keputusan utama, disertai daftar hari.
- Rencana mingguan memakai day tabs dengan `role="tab"`, `aria-selected`, dan
  panel yang terhubung.
- Tabel latihan memuat nama, target, peralatan, dan pratinjau gambar 56×56.
  Gambar memakai `loading="lazy"`, `decoding="async"`, dan fallback inisial.
- Semua data tetap berasal dari `recommendationResult`; tidak ada perhitungan
  baru atau field API baru.
- Empty state tersedia jika `/dashboard` dibuka tanpa hasil.
- CTA sekunder: ubah parameter atau jalankan ulang.

## 4. Shared plan (`/shared/:token`)

- Read-only, tanpa login, memakai token yang sama.
- Loading skeleton, error state dengan request ID, dan tombol kembali.
- Header plan memuat judul, split, jumlah hari, dan masa berlaku.
- Warnings tetap tampil sebagai catatan plan.
- Day tabs dan tabel latihan memakai pola yang sama dengan dashboard.
- Footer menjelaskan plan dibagikan tanpa identitas pemilik dan bukan diagnosis
  medis.

## 5. Motion

- Route transition global: fade + 8 px, `200ms` masuk, `160ms` keluar.
- Transisi dipasang di root router view dan di dalam `AppShell`, sehingga
  perpindahan public → app dan antarhalaman app memakai pola yang sama.
- Day panel memakai fade + 8 px saat tab berganti.
- Hanya `opacity` dan `transform` yang dianimasikan.
- `prefers-reduced-motion` sudah ditangani guard global di `tokens.css`.
- Tidak ada library animasi baru.

## 6. File yang berubah

| File | Perubahan |
|---|---|
| `src/views/ConfigView.vue` | Public config UI v2 |
| `src/views/ProcessView.vue` | Status + ledger + execution log |
| `src/views/DashboardView.vue` | Hasil optimasi + day tabs + tabel |
| `src/views/shared/PublicPlanView.vue` | Shared plan UI v2 |
| `src/App.vue` | Route transition |
| `src/components/layout/AppShell.vue` | Child route transition |
| `src/styles/ui-v2.css` | Kelas transisi halaman |
| `src/lib/planOptions.ts` | `splitLabel` mengganti semua `+` |

---

## 7. Verifikasi

Audit memakai Puppeteer + mock `POST /recommendation/`,
`GET /shared/:token`, dan respons auth. Tidak ada akun nyata yang dipakai.

| Cek | Hasil |
|---|---|
| `npm run type-check` | lolos |
| `npm run build` | lolos |
| Config 390/1440 | tidak overflow, 0 target <44 px, 0 input tanpa label |
| Validasi tinggi 300 cm | pesan “Isi tinggi antara 100–250 cm.” tampil |
| Isi form valid + chip | injury dan target terpilih, hari berubah |
| `Jalankan optimasi` | route `/process`, `POST /recommendation/` terkirim |
| Process | status berjalan, log masuk, timer berjalan |
| Process selesai | redirect otomatis ke `/dashboard` |
| Dashboard 390/1440 | tidak overflow, 0 target <44 px, 0 input tanpa label |
| Ganti day tab | panel hari berubah (Push → Legs) |
| Dashboard tanpa hasil | empty state + CTA |
| Shared plan 390/1440 | tidak overflow, 0 target <44 px |
| Ganti day tab shared | panel Pull tampil |
| Shared token invalid | error state + request ID |
| Request auth/Neon di public flow | **0** |
| Console error alur utama | **0** |
| Focus keyboard | outline 2 px `#C2410C` terlihat |
| Reduced motion | transisi 0,00001 s, scroll auto |

Satu console error hanya muncul pada uji error state shared, yaitu respons mock
404 yang sengaja dibuat; bukan error aplikasi.

Screenshot:

- `docs/ui-ux-v2-phase-5/config-390.png` / `config-1440.png`
- `docs/ui-ux-v2-phase-5/process-390.png` / `process-1440.png`
- `docs/ui-ux-v2-phase-5/dashboard-390.png` / `dashboard-1440.png`
- `docs/ui-ux-v2-phase-5/shared-390.png` / `shared-1440.png`

---

## 8. Bundle

| Chunk | Gzip |
|---|---:|
| `ConfigView` | 2,79 KB |
| `ProcessView` | 2,24 KB |
| `DashboardView` | 2,57 KB |
| `PublicPlanView` | 2,33 KB |
| `index` | 67,64 KB |
| `authStore` (lazy) | 47,99 KB |

Public flow tidak memuat `authStore`. Tidak ada dependency baru.

---

## 9. Batasan

- Audit public flow memakai mock API; belum dijalankan terhadap backend Railway
  yang dingin/nyala dengan data nyata.
- Lighthouse public flow belum diukur ulang pada fase ini; itu bagian fase 6.
- Onboarding first-run dengan profil kosong masih belum diuji terhadap backend
  nyata.
- `ProcessView` masih memakai istilah teknis dari log engine lama
  (“Experta”, “PyGAD”). Istilah ini dipertahankan karena log memang menjelaskan
  proses backend, bukan copy marketing.
- Fase 2–5 belum di-commit dan belum deploy.
- Berikutnya fase 6: performance + QA, termasuk Lighthouse, waterfall, dan
  screenshot akhir.
