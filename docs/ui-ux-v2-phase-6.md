# JYMZ UI/UX v2 — Phase 6: Performance + QA

Status: **selesai, menunggu review**  
Tanggal: **2026-11-24**  
Branch: `feat/ui-v2`  
Commit fase 0: `69ee8d2`  
Commit fase 1: `7e6c0de`  
Fase 2–6: implemented, belum di-commit  
Dev server: `http://127.0.0.1:5173`  
Preview produksi: `http://127.0.0.1:4173`

Fase 6 menutup UI/UX v2 dengan performance tuning, Lighthouse, QA lintas
viewport, dan pemeriksaan kesiapan deploy. Tidak ada fitur M6/M7, perubahan
kontrak API, atau deploy.

---

## 1. Performance changes

### Font preload statis

Dua font di atas fold sekarang di-preload dari `index.html`, bukan setelah
komponen Vue mount:

- `bricolage-grotesque-latin.woff2` untuk display/page title;
- `public-sans-latin.woff2` untuk body/form.

JetBrains Mono tetap on-demand untuk data, tabel, dan label. Total tiga font
self-host hanya **109,5 KB** transfer, di bawah target 160 KB.

### Devtools hanya di dev

`vite-plugin-vue-devtools` sekarang hanya aktif pada `vite dev`
(`command === 'serve'`). Build produksi tidak membawa plugin devtools.

### Intent prefetch navigasi app

Navbar app mem-prefetch chunk Plan, Sesi, Progres, Profil, dan Akun saat
hover/focus/touch, tanpa mengubah perilaku router. Chunk tetap route-level
lazy; prefetch hanya memanaskan cache sebelum klik.

### Perbaikan layout dan copy dari QA

- Workout detail overflow di 768 px diperbaiki: breakpoint set-editor naik ke
  900 px sehingga tablet memakai layout dua kolom.
- Metadata teknis (`seed`, `dataset`, `algorithm`) dihapus dari detail plan dan
  shared plan; diganti ringkasan yang berguna (split, hari, versi, tanggal).
- Judul route diseragamkan ke bahasa Indonesia.
- Heading publik diterjemahkan: Parameter latihan, Biometrik, Batasan,
  Peralatan, Ringkasan, Log eksekusi, Rencana mingguan.
- Istilah “dataset” pada copy dashboard diganti “katalog latihan”.
- Breadcrumb “Plan library” diganti “Daftar plan”.

---

## 2. Lighthouse

Audit memakai build produksi (`vite preview`), Chrome headless, kategori
performance/accessibility/best-practices/SEO.

| Kategori | Skor |
|---|---:|
| Performance | **100** |
| Accessibility | **100** |
| Best practices | **100** |
| SEO | **100** |

Metrik mobile:

| Metrik | Nilai | Target |
|---|---:|---:|
| FCP | 0,8 s | — |
| LCP | 0,8 s | < 2,5 s |
| TBT | 40 ms | — |
| CLS | 0 | < 0,1 |
| Speed Index | 1,2 s | — |
| TTI | 2,5 s | — |
| Total transfer | 205 KiB | — |
| Initial JS (gzip) | 67,6 KB | < 150 KB |
| Font transfer | 109,5 KB | < 160 KB |

- 26 request, 14 script, 3 font.
- Main-thread work 0,4 s; JS bootup 0,1 s.
- Unused JavaScript 31 KiB; tidak ada render-blocking resource yang dilaporkan.
- Report lengkap: `docs/ui-ux-v2-phase-6/lighthouse-mobile.html` dan
  `lighthouse-mobile.json`.

**Batasan Lighthouse:** preset desktop gagal di environment headless ini dengan
`NO_FCP` (“page did not paint any content”), termasuk saat diuji pada halaman
`/style-guide`. Mobile Lighthouse berhasil dan stabil. Desktop tetap diperiksa
lewat screenshot 1440 px dan audit DOM; kegagalan desktop bukan error aplikasi.

---

## 3. Bundle final

| Chunk | Gzip |
|---|---:|
| `index` (initial) | 67,64 KB |
| `index` CSS | 4,44 KB |
| `authStore` (lazy) | 47,99 KB |
| `ConfigView` | 2,79 KB |
| `ProcessView` | 2,24 KB |
| `DashboardView` | 2,57 KB |
| `PublicPlanView` | 2,33 KB |
| `AppHomeView` | 4,00 KB |
| `PlanDetailView` | 4,12 KB |
| `WorkoutDetailView` | 5,92 KB |
| `ProgressView` | 4,23 KB |
| `StyleGuideView` | 11,78 KB |

Semua route chunk di bawah 60 KB. Tidak ada dependency baru; chart dan motion
tetap CSS/SVG.

---

## 4. QA matrix

Screenshot final tersedia di
`docs/ui-ux-v2-phase-6/screenshots/`:

- **51 screenshot**, 17 route × 3 viewport (390, 768, 1440).
- Public: config, process, dashboard, shared plan, sign-in, style guide.
- App: home, plans, plan detail, plan create, workouts, workout detail,
  progress, profile, account, onboarding, debug.
- Screenshot app memakai viewport (bukan full page) agar bottom nav tetap pada
  posisinya; public memakai full page.

Hasil audit DOM pada semua route:

| Cek | Hasil |
|---|---|
| Horizontal overflow 390/768/1440 | **0** setelah perbaikan workout detail |
| Target interaktif < 44 px | **0** |
| Input/select/textarea tanpa label | **0** |
| Console error | **0** |
| Developer leak di halaman user | **0** setelah metadata dibersihkan |
| Bottom nav < 1024 px | tampil |
| Sidebar ≥ 1024 px | tampil |
| Public flow request auth/Neon | **0** sebelum membuka sign-in |
| Sign-in | hanya `get-session` Neon, sesuai perilaku auth |

QA juga mengulang regresi fase 4: range progress, simpan profil, dialog hapus
akun, review onboarding, dan submit onboarding tetap berjalan. Smoke test fase 3
(set, rest timer, complete, start plan, plan generate) tetap lolos pada mock.

---

## 5. Deployment readiness

- `npm run type-check` lolos.
- `npm run build` lolos.
- `dist/index.html` memuat preload font dan asset fingerprint.
- `public/_headers`: HTML `max-age=0, must-revalidate`; `/assets/*` dan
  `/fonts/*` immutable selama setahun; `nosniff`, referrer policy, dan
  permissions policy aktif.
- `public/_redirects`: SPA fallback `/* /index.html 200`.
- `public/robots.txt`: `/app` dan `/style-guide` disallow.
- Font self-host; tidak ada Google Fonts runtime.
- Public flow tetap berjalan tanpa login.
- Tidak ada perubahan backend, schema, atau kontrak API.
- **Belum di-deploy.**

---

## 6. Batasan

- Lighthouse terautentikasi belum bisa dijalankan: belum ada akun uji aman dan
  Neon branch terpisah.
- Preset Lighthouse desktop gagal di environment ini (`NO_FCP`), meski mobile
  berhasil 100.
- Cold start Railway belum diukur ulang pada fase ini; UI wake state sudah ada
  dari fase 2.
- Pengujian 200% zoom belum diotomasi terpisah; layout sudah diuji pada 390,
  768, dan 1440 px, fokus keyboard dan reduced motion sudah diverifikasi pada
  fase 5.
- Fase 2–6 belum di-commit dan belum deploy.

---

## 7. Status akhir UI/UX v2

| Fase | Status |
|---|---|
| 0 — baseline | selesai, commit `69ee8d2` |
| 1 — tokens/fonts/primitives | selesai, commit `7e6c0de` |
| 2 — shell/Today/auth | selesai, uncommitted |
| 3 — plans/workout | selesai, uncommitted |
| 4 — progress/profile/onboarding | selesai, uncommitted |
| 5 — public flow/motion | selesai, uncommitted |
| 6 — performance/QA | selesai, uncommitted |

Langkah berikutnya: review, commit fase 2–6, lalu deploy. M6/M7 tetap deferred.
