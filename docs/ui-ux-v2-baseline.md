# JYMZ UI/UX v2 — Phase 0 baseline

Status: **audit selesai (phase 0)**
Tanggal: **2026-11-23**
Branch: `feat/ui-v2` (dibuat dari `feat/app-v2` @ `992e241`)
Lingkungan ukur: produksi `https://jymz.pages.dev` dan API
`https://jymz-api-production.up.railway.app`
Alat: Lighthouse 13.6.0, Chrome 158, Node 24.20, Vite build lokal, `curl`,
Puppeteer (viewport/DOM audit).

Dokumen ini adalah **baseline sebelum perubahan UI**. Tidak ada kode UI, kontrak
API, atau backend yang diubah pada fase ini.

---

## 1. Ringkasan eksekutif

| Area | Baseline | Target v2 | Status |
|---|---|---|---|
| Lighthouse mobile — Landing publik (`/`) | Perf **97** | ≥ 90 | ✅ |
| Lighthouse mobile — Sign in | Perf **98** | ≥ 90 | ✅ |
| Lighthouse desktop — Landing / Sign in | Perf **100 / 100** | ≥ 90 | ✅ |
| Accessibility mobile — Landing publik (`/`) | **52** | ≥ 95 | ❌ |
| Accessibility mobile — Sign in | **84** | ≥ 95 | ❌ |
| LCP mobile (simulasi 4G) | **0,8 s** | < 2,5 s | ✅ |
| CLS mobile | **0** | < 0,1 | ✅ |
| TBT mobile (proxy INP) | **190 ms / 150 ms** | INP < 200 ms | ⚠️ borderline |
| Initial JS (gzip) | **~110–122 KB** per route | < 150 KB | ✅ |
| Route chunk terbesar (gzip) | **4,3 KB** | < 60 KB | ✅ |
| Font payload | **0 KB** (belum ada font kustom) | < 160 KB | ✅ / belum diuji |
| API hangat `/health` | **0,34–0,95 s** (median 0,71 s) | < 300 ms | ❌ |
| Cold start Railway `/ready` | **3,69–8,04 s** TTFB | UX eksplisit | ❌ belum ada UX |
| Flow publik submit → dashboard (hangat) | **4,05 s** | UX eksplisit | ⚠️ |
| Console error halaman publik | **0** | 0 | ✅ |

Angka Lighthouse berasal dari satu run per form factor (mobile default
throttling, desktop preset), diukur 2026-11-23 sekitar 16:55–16:57 WIB.

**Kesimpulan singkat:** performa muat awal sudah baik dan berada di bawah
semua budget bundle. Masalah utama bukan kecepatan unduh, melainkan:

1. **aksesibilitas** (52/84, jauh dari target 95);
2. **Neon Auth dimuat di semua halaman publik** (43,75 KB gzip + 2 request,
   ~1,8 s rantai dependensi) padahal tidak dibutuhkan sebelum login;
3. **cold start 3,7–8,0 detik tanpa UX wake/retry** dan tanpa data cache;
4. **API hangat pun lambat** — median `/health` 0,71 s dan flow publik 4,05 s
   sampai dashboard, dengan komputasi backend hanya 0,05 s;
5. **tidak ada design token/komponen bersama** — 16 view, 11 komponen,
   188 pemakaian `font-mono`, 171 `uppercase`, 77 `border-3`, 0 `rounded`;
6. **aset statis tidak di-cache lama** (`max-age=0, must-revalidate`), sehingga
   setiap reload melakukan revalidasi.

---

## 2. Lingkup dan metode

### Yang diukur

- Lighthouse mobile + desktop untuk halaman publik utama:
  `/` (Engine Parameters) dan `/auth/sign-in`.
- Bundle produksi dan build lokal (`npm run build`), ukuran mentah + gzip per
  chunk, serta estimasi JS awal per route.
- Network waterfall dari Lighthouse JSON dan audit DOM Puppeteer pada viewport
  390, 768, dan 1440 px.
- Latensi API Railway: warm probe dan cold start.
- Inventaris UI/komponen dan pemeriksaan statis aksesibilitas.

Catatan tooling: Playwright belum terpasang di repo, jadi screenshot dan audit
DOM memakai Puppeteer + Chrome headless pada viewport 390, 768, dan 1440 px.
Lighthouse dijalankan satu kali per form factor; variasi antar-run tidak
diukur.

### Yang tidak bisa diukur (gap baseline)

- **Halaman terautentikasi** (`/app`, `/app/plans`, `/app/workouts`,
  `/app/progress`, `/app/account`, onboarding) **belum diukur dengan
  Lighthouse/waterfall produksi**. Penyebab: tidak ada akun uji yang aman;
  membuat akun di produksi akan menulis ke database produksi, dan password
  pribadi tidak boleh dipakai.
- Backend lokal di `jymz-hardening/.env.local` menunjuk ke Neon project yang
  **sama** dengan produksi (`ep-shiny-king-b3gh2lv3`), sehingga seeding akun
  lokal juga tidak dilakukan.
- Field data INP/CLS pengguna nyata belum tersedia; TBT Lighthouse hanya proxy
  laboratorium.
- Screenshot halaman terautentikasi memakai aset M5 yang sudah ada di
  `docs/assets/jymz-banners/screens/`, bukan capture baru.

Rekomendasi: siapkan **akun uji khusus + Neon branch terpisah** sebelum fase 1
selesai, supaya waterfall login → Home → Plans → Workout bisa diukur tanpa
menyentuh data produksi.

---

## 3. Lighthouse

### 3.1 Skor kategori

| Halaman | Form factor | Performance | Accessibility | Best practices | SEO |
|---|---|---:|---:|---:|---:|
| `/` | Mobile | **97** | **52** | 100 | 82 |
| `/` | Desktop | **100** | **52** | 100 | 82 |
| `/auth/sign-in` | Mobile | **98** | **84** | 100 | 82 |
| `/auth/sign-in` | Desktop | **100** | **84** | 100 | 82 |

### 3.2 Metrik lab

| Metrik | Landing mobile | Landing desktop | Sign in mobile | Sign in desktop |
|---|---:|---:|---:|---:|
| FCP | 0,8 s | 0,2 s | 0,8 s | 0,2 s |
| LCP | 0,8 s | 0,2 s | 0,8 s | 0,2 s |
| TBT | 190 ms | 0 ms | 150 ms | 0 ms |
| CLS | 0 | 0 | 0 | 0 |
| Speed Index | 1,4 s | 0,4 s | 2,0 s | 0,4 s |
| TTI | 2,1 s | 0,2 s | 2,1 s | 0,2 s |
| Max potential FID | 160 ms | 40 ms | 170 ms | 30 ms |
| Server response | 60 ms | 30 ms | 40 ms | 40 ms |
| Total transfer | 125 KiB | 125 KiB | 123 KiB | 123 KiB |

LCP landing adalah teks `<h1>ENGINE PARAMETERS</h1>` (bukan gambar). Breakdown
mobile: TTFB 159 ms + render delay 343 ms. Tidak ada gambar LCP yang perlu
dioptimalkan.

Catatan: `SEO 82` dan `Agentic browsing 25–50` bukan target utama v2, tetapi
penyebabnya sama: `index.html` tidak punya meta description, `robots.txt`
tidak valid, dan tidak ada `llms.txt`.

### 3.3 Audit aksesibilitas yang gagal

**Landing publik (`/`) — skor 52:**

- `html lang=""` — bahasa dokumen kosong.
- `color-contrast` — tombol primer `bg-blue-500` (#3B82F6) dengan teks putih =
  **3,68:1** (butuh 4,5:1).
- `label` — 4 kontrol tanpa label: gender select, tinggi, berat, dan slider
  hari tersedia.
- `select-name` — select tanpa nama aksesibel.
- `heading-order` — lompat dari `h1` ke `h3` (tidak ada `h2`).
- `landmark-one-main` — tidak ada `<main>` di flow publik.
- 25 target sentuh < 44×44 px (chip 28 px tinggi, input 41–42 px, slider 16 px).
- 94 pemakaian teks `text-[10px]`/`text-[11px]` di seluruh `src`.

**Sign in (`/auth/sign-in`) — skor 84:**

- `html lang=""`.
- `color-contrast` pada tombol submit yang sama (`#3B82F6` + putih).
- 6 target sentuh < 44 px; tombol submit hanya 30 px tinggi.
- Form sudah punya `<main>` dan heading yang benar.

**Pemeriksaan statis seluruh `src`:**

- `aria-label` = 0, `aria-live` = 0, `role=` = 0, `aria-describedby` = 0.
- `prefers-reduced-motion` = 0, `:focus-visible` = 0.
- `focus:outline-none` dipakai tanpa pengganti focus ring; pengukuran
  terfokus pada `.pixel-input` menunjukkan `outline: solid 2px transparent`
  dan ring-shadow 0 px — tidak ada indikator fokus yang terlihat. Chip/button
  masih memakai outline default browser.
- Belum ada skip link.
- Bahasa UI campur Indonesia/Inggris; `lang` perlu diputuskan (kemungkinan
  `id` untuk copy utama).

Implikasi: target Accessibility ≥ 95 kemungkinan besar tidak tercapai hanya
dengan mengganti warna. Perlu label eksplisit, landmark, urutan heading,
focus ring, `aria-live` untuk status async, dan target sentuh 44 px.

---

## 4. Bundle size

Build lokal pada `992e241` (`npm run build`, type-check lolos):

| Kelompok | File | Raw | Gzip |
|---|---:|---:|---:|
| Total `dist` | 41 file | 493,5 KB | **166,9 KB** |
| JavaScript (semua route) | 34 file | 463,3 KB | 160,4 KB |
| CSS | 4 file | 25,5 KB | 5,3 KB |
| Favicon | 1 file | 4,2 KB | 0,9 KB |
| Font | 0 file | 0 | **0** |

### 4.1 Chunk terbesar

| Chunk | Isi | Gzip |
|---|---|---:|
| `index-*.js` | Vue, Router, Pinia, Axios, bootstrap app | **63,92 KB** |
| `client-*.js` | **Neon Auth / Better Auth client** | **43,75 KB** |
| `index-*.css` | Tailwind base + komponen | 4,77 KB |
| `WorkoutDetailView` | route chunk terbesar | 4,29 KB |
| `ProgressView` | route chunk | 3,57 KB |
| `PlanDetailView` | route chunk | 3,39 KB |
| `OnboardingView` | route chunk | 2,80 KB |
| `AppHomeView` | route chunk | 2,57 KB |
| `workoutStore` | store | 2,52 KB |

Semua route chunk < 5 KB gzip. Tidak ada chunk route yang mendekati batas
60 KB.

### 4.2 Estimasi JS awal per route (gzip, termasuk shared chunks)

| Route | JS | CSS |
|---|---:|---:|
| `/` publik (Config) | 111,6 KB | 5,1 KB |
| `/auth/sign-in` | 110,3 KB | 4,8 KB |
| `/auth/sign-up` | 110,3 KB | 4,8 KB |
| `/shared/:token` | 110,6 KB | 4,8 KB |
| `/app` (Home) | 117,4 KB | 4,8 KB |
| `/app/account` | 113,1 KB | 4,8 KB |
| `/app/plans` | 113,4 KB | 4,8 KB |
| `/app/onboarding` | 118,6 KB | 4,8 KB |
| `/app/profile` | 117,6 KB | 4,8 KB |
| `/app/plans/new` | 117,7 KB | 4,8 KB |
| `/app/plans/:id` | **121,6 KB** | 4,8 KB |
| `/app/workouts` | 114,6 KB | 4,8 KB |
| `/app/workouts/:id` | 121,1 KB | 4,8 KB |
| `/app/progress` | 116,4 KB | 4,8 KB |

**~40% JS awal adalah Neon Auth** (43,75 KB) dan dimuat di **semua route**,
termasuk landing publik dan shared plan. Lighthouse mencatat ±47 KB JS tidak
terpakai pada landing; sebagian besar berasal dari chunk auth tersebut.

Catatan: hash produksi berbeda dari build lokal (env build berbeda), tetapi
total transfer produksi (125 KB) konsisten dengan hasil build lokal.

### 4.3 Font

Tidak ada `@font-face`, file font, atau dependensi font. `tailwind.config.js`
mendeklarasikan `"JetBrains Mono"` tetapi **font tidak pernah diunduh**;
browser memakai fallback `ui-monospace/Consolas`. Jadi identitas tipografi saat
ini bergantung pada font sistem, dan penambahan 3 font v2 nanti akan menaikkan
payload dari 0 menjadi sesuatu yang harus dijaga < 160 KB.

### 4.4 Caching aset

Header aset produksi:

```text
Cache-Control: public, max-age=0, must-revalidate
ETag: W/"..."
Content-Encoding: br
```

Aset ber-hash tidak memakai `immutable`/`max-age` panjang. Setiap reload masih
melakukan revalidasi (bisa 304, tapi tetap ada RTT). Belum ada `_headers` di
`public/`.

---

## 5. Network waterfall

### 5.1 Landing publik `/` — mobile, simulasi 4G

| Mulai | Durasi | Transfer | Resource |
|---:|---:|---:|---|
| 0,000 s | 0,159 s | 1 KB | document `/` |
| 0,175 s | 0,050 s | 65 KB | `index-*.js` |
| 0,178 s | 0,140 s | 46 KB | `client-*.js` (Neon Auth) |
| 0,178 s | 0,052 s | 5 KB | `index-*.css` |
| 0,367 s | 0,124 s | 0 KB | preflight Neon Auth |
| 0,368 s | 0,041 s | 3 KB | `ConfigView-*.js` |
| 0,369 s | 0,053 s | 1 KB | `fitnessStore-*.js` |
| 0,370 s | 0,050 s | 1 KB | `PixelCard-*.js` |
| 0,370 s | 0,034 s | 1 KB | `PixelButton-*.js` |
| 0,370 s | 0,042 s | 1 KB | `ConfigView-*.css` |
| 0,418 s | 0,024 s | 1 KB | favicon |
| 0,491 s | **1,298 s** | 0 KB | `get-session` Neon Auth (selesai 1,789 s) |

**12 request, 125 KB.** Rantai dependensi terpanjang adalah
`document → index.js → get-session` (1,79 s). Request auth ini tidak terlihat
oleh pengguna di landing, tetapi memakan bandwidth dan menjaga jaringan tetap
sibuk; ia juga memblokir inisialisasi auth sebelum route berikutnya.
Lighthouse mencatat server response Neon Auth ±607 ms (RTT 27 ms), jadi biaya
auth bukan hanya ukuran bundle.

### 5.2 Sign in `/auth/sign-in` — mobile, simulasi 4G

| Mulai | Durasi | Transfer | Resource |
|---:|---:|---:|---|
| 0,000 s | 0,084 s | 1 KB | document |
| 0,102 s | 0,471 s | 65 KB | `index-*.js` |
| 0,102 s | 0,879 s | 46 KB | `client-*.js` |
| 0,102 s | 0,284 s | 5 KB | `index-*.css` |
| 1,039 s | 0,241 s | 0 KB | preflight Neon Auth |
| 1,044 s | 0,049 s | 1 KB | favicon |
| 1,280 s | 0,255 s | 0 KB | `get-session` |
| **1,541 s** | 0,070 s | 2 KB | `SignInView-*.js` |
| 1,541 s | 0,049 s | 1 KB | `navigation-*.js` |
| 1,542 s | 0,071 s | 1 KB | `PixelButton-*.js` |

**10 request, 123 KB.** `SignInView` baru diunduh **setelah** `get-session`
selesai (±1,54 s), karena router guard `guestOnly` menunggu
`auth.initialize()`. Shell auth sudah tampil lebih awal, tetapi form baru siap
setelah rantai auth selesai.

### 5.3 `/app` tanpa sesi

`/app` → redirect ke `/auth/sign-in?redirectTo=/app` tanpa memanggil Railway.
Tidak ada request API sebelum login berhasil.

### 5.4 Waterfall terautentikasi

Belum dapat diukur (lihat §2). Estimasi dari kode:

- App shell memanggil `GET /health` dan `GET /ready` **paralel** saat mount
  (`AppShell.vue` → `appStore.checkBackend()`).
- `/ready` melakukan pemeriksaan database dan lebih berat daripada `/health`;
  memanggil keduanya sekaligus memperbesar beban saat server bangun.
- Tidak ada timeout, retry/backoff, atau probe bertahap.

### 5.5 Flow publik end-to-end (submit → Process → Dashboard)

Diukur dengan Puppeteer 390×844, service API sudah hangat:

| Titik | Waktu |
|---|---:|
| Klik submit → route `/process` tampil | **123 ms** (run pertama: 546 ms) |
| `POST /api/v1/recommendation/` | **2,20 s** total; preflight `OPTIONS` 1,38 s |
| `x-process-time` (komputasi backend) | **0,0515 s** |
| Klik submit → `/dashboard` tampil | **4,05 s** (run pertama: 3,84 s) |
| Console error | 0 |

Rincian request kedua:

```text
OPTIONS /api/v1/recommendation/  200  1,378 s  (preflight CORS)
POST    /api/v1/recommendation/  201  2,197 s  (termasuk menunggu preflight)
X-Process-Time: 0.0515 sec
X-RateLimit-Remaining: 118
```

**Hanya ±2,3% dari waktu tunggu adalah komputasi rekomendasi.** Sisanya adalah
preflight, ingress Railway, dan proses HTTP. Ditambah delay 1,5 detik sebelum
redirect otomatis ke dashboard, pengguna menunggu ±4 detik meski server sudah
hangat. Jika request pertama jatuh saat service tidur, tambahkan cold start
3,7–8,0 detik.

Dashboard 390 px tidak mengalami overflow (`scrollWidth = innerWidth = 390`).
Screenshot: `docs/ui-ux-v2-baseline/process-390.png`,
`dashboard-390.png`, `dashboard-768.png`, `dashboard-1440.png`.

---

## 6. Cold start Railway

Pengukuran dari Indonesia ke region Southeast Asia (Singapore), `curl` tanpa
keep-alive. Semua waktu adalah TTFB.

### 6.1 Request pertama setelah idle (dingin)

| Request | DNS | Connect | TLS | TTFB | Total |
|---|---:|---:|---:|---:|---:|
| `GET /ready` (membangunkan service) | 0,053 s | 0,079 s | 0,132 s | **8,044 s** | 8,044 s |
| `GET /health` (3 detik setelahnya) | 0,074 s | 0,074 s | 0,132 s | 1,341 s | 1,341 s |

TLS/network hanya ±0,13 s; **hampir seluruh 8 detik adalah waktu bangun
service**. Ini baseline cold start yang harus ditangani frontend.

### 6.2 Setelah hangat

Batch pertama (tepat setelah bangun):

| Request | TTFB |
|---|---:|
| `/health` #1 | 0,952 s |
| `/health` #2 | 0,811 s |
| `/health` #3 | 0,378 s |
| `/health` #4 | 0,605 s |
| `/health` #5 | 0,366 s |
| `/ready` | 1,561 s |

Batch kedua (setelah flow publik, service aktif):

| Request | TTFB |
|---|---:|
| `/health` #1 | 0,903 s |
| `/health` #2 | 0,346 s |
| `/health` #3 | 0,819 s |
| `/health` #4 | 0,845 s |
| `/health` #5 | 0,342 s |
| `/ready` #1 | 1,557 s |
| `/ready` #2 | 1,592 s |
| `/ready` #3 | 1,504 s |
| `OPTIONS` preflight #1 | 0,936 s |
| `OPTIONS` preflight #2 | 0,671 s |
| `OPTIONS` preflight #3 | 0,753 s |

Gabungan 10 sampel `/health`: **median ≈ 0,71 s** (min 0,34 s, max 0,95 s).
`/ready` konsisten **1,50–1,59 s**. Preflight CORS `OPTIONS` — yang seharusnya
dijawab instan oleh middleware — tetap **0,67–0,94 s**.

Target v2 “API feedback setelah server hangat < 300 ms” **belum terpenuhi**
pada endpoint ini. Perlu dicatat: `/health` hanya mengembalikan 5 field tanpa
query database, dan preflight tidak menyentuh database sama sekali. Jadi
latensi ini bukan biaya query; kemungkinan besar berasal dari overhead free
tier/ingress Railway. `/ready` memang memeriksa database dan Redis. Endpoint
domain (plans, workouts, progress) belum bisa diukur tanpa akun uji, jadi angka
ini belum boleh dipakai untuk menyimpulkan seluruh API. Yang penting untuk v2:
**frontend tidak bisa mengandalkan API < 300 ms** selama infrastruktur ini
dipakai.

### 6.3 Uji cold start kedua (idle 15 menit)

| Request | TTFB | Catatan |
|---|---:|---|
| `GET /ready` (membangunkan service) | **3,685 s** | request pertama setelah 15 menit idle |
| `GET /health` (+3 s) | 0,426 s | sudah hangat |
| `GET /ready` (+3 s) | 1,829 s | hangat |

Jadi rentang cold start yang terukur adalah **3,7–8,0 s** (8,04 s pada probe
pertama setelah idle panjang, 3,69 s pada probe kedua setelah 15 menit).
Untuk desain UX, anggap **minimal ~4 detik dan worst-case ~8 detik** sebelum
request pertama selesai. Variasi ini wajar untuk free tier dan bukan bug
aplikasi.

### 6.4 Perilaku frontend saat cold start

Dari kode saat ini:

- `main.ts` memanggil `auth.initialize()` tanpa syarat di setiap load.
- `AppShell.vue` memanggil `/health` + `/ready` jika status masih `unknown`.
- Tidak ada `ServerWakeBanner`, timeout 8 detik, retry/backoff, atau skeleton.
- Pesan error menyebut “Pastikan backend lokal berjalan di port 8080”, copy
  pengembangan yang muncul di produksi.
- Hanya mutation workout yang punya cache lokal (`workoutCache.ts`); profil,
  plan, dan progress tidak punya cache last-known.
- Home menampilkan status backend, API base URL, dataset, rate limit, dan
  checklist M5 — diagnostik developer bercampur dengan dashboard pengguna.

---

## 7. Inventaris UI saat ini

| Item | Jumlah |
|---|---:|
| View (`src/views/**/*.vue`) | 16 |
| Komponen (`src/components/**/*.vue`) | 11 |
| Primitif UI bersama | 3 (`PixelButton`, `PixelCard`, `StatusRow`) |
| Baris `src/assets/main.css` | 26 |
| File design token | 0 |
| `font-mono` | 188 |
| `uppercase` | 171 |
| `border-3` | 77 |
| `shadow-[...]` (offset shadow) | 20 |
| `bg-slate-*` | 60 |
| `rounded-*` | 0 (semua radius dipaksa 0) |
| Teks 10–11 px | 94 |
| `aria-label` / `aria-live` / `role` | 0 / 0 / 0 |
| `prefers-reduced-motion` / `:focus-visible` | 0 / 0 |
| Library chart | 0 (sesuai rencana) |
| Library animasi | 0 (sesuai rencana) |
| Lucide | belum terpasang |

Struktur visual saat ini adalah “engineering console”: semua body monospace,
border tebal, hard shadow, label uppercase, dan badge milestone. Ini konsisten
dengan temuan kualitatif di `docs/ui-ux-v2-plan.md`.

Screenshot baseline publik (capture baru, full page):

- `docs/ui-ux-v2-baseline/home-390.png`
- `docs/ui-ux-v2-baseline/home-768.png`
- `docs/ui-ux-v2-baseline/home-1440.png`
- `docs/ui-ux-v2-baseline/signin-390.png`
- `docs/ui-ux-v2-baseline/signin-768.png`
- `docs/ui-ux-v2-baseline/signin-1440.png`

Screenshot halaman app yang sudah ada (dari paket M5, bukan capture baru):
`docs/assets/jymz-banners/screens/plan-detail.png`,
`docs/assets/jymz-banners/screens/progress.png`,
`docs/assets/jymz-banners/screens/workout-detail.png`,
`docs/assets/jymz-banners/screens/mobile-progress.png`.

Screenshot flow publik (process + dashboard):

- `docs/ui-ux-v2-baseline/process-390.png`
- `docs/ui-ux-v2-baseline/dashboard-390.png`
- `docs/ui-ux-v2-baseline/dashboard-768.png`
- `docs/ui-ux-v2-baseline/dashboard-1440.png`

---

## 8. Kesesuaian terhadap target v2

| Target | Baseline | Status |
|---|---|---|
| Lighthouse mobile performance ≥ 90 | 97 / 98 | ✅ |
| Accessibility ≥ 95 | 52 / 84 | ❌ |
| Best practices ≥ 95 | 100 | ✅ |
| LCP mobile 4G < 2,5 s | 0,8 s | ✅ |
| INP < 200 ms | TBT 190/150 ms | ⚠️ perlu verifikasi lapangan |
| CLS < 0,1 | 0 | ✅ |
| Initial JS < 150 KB gzip | 110–122 KB | ✅ (tetapi 44 KB tidak perlu di publik) |
| Route chunk < 60 KB gzip | maks 4,3 KB | ✅ |
| Font payload < 160 KB | 0 KB (belum ada font) | ⏳ akan berubah di fase 1 |
| API hangat < 300 ms | median 0,71 s `/health`; preflight 0,67–0,94 s | ❌ |
| Cold start UX eksplisit | tidak ada | ❌ |
| Flow publik hangat | 4,05 s submit → dashboard | ⚠️ |
| Console error bersih | 0 | ✅ |

---

## 9. Temuan utama (prioritas)

### P0 — harus ditangani di fase 1–2

1. **Aksesibilitas jauh di bawah target.** `lang` kosong, 4 kontrol tanpa
   label, tanpa `<main>` di flow publik, heading melompat, kontras 3,68:1,
   target sentuh 28–30 px, tanpa focus ring/`aria-live`.
2. **Neon Auth di public bundle.** 43,75 KB gzip + 2 request + rantai 1,8 s
   pada setiap load publik. Pisahkan inisialisasi auth dari entry publik;
   muat hanya untuk route yang membutuhkan sesi.
3. **Cold start 3,7–8,0 detik tanpa UX, plus API hangat yang tetap lambat.**
   Perlu banner wake non-blocking, timeout 8 detik + retry, skeleton, dan cache
   data terakhir. Karena `/health` hangat saja 0,34–0,95 s, skeleton dan
   optimistic UI harus menjadi default, bukan pengecualian.
4. **Tidak ada token/komponen bersama.** 16 view menduplikasi gaya; semua
   radius 0 dan semua teks monospace. Ini yang membuat migrasi mahal jika
   tidak dimulai dari `tokens.css` + primitif.

### P1 — fase 1–3

5. **Font belum benar-benar ada.** JetBrains Mono hanya nama di config.
   Penambahan 3 font v2 harus subset + preload; hitung payload dan ukur CLS.
6. **Aset statis tidak immutable.** Tambahkan `_headers` untuk `/assets/*`
   dan pisahkan cache HTML.
7. **Waterfall sign-in diblokir auth.** Route chunk sign-in baru dimuat
   setelah `get-session`; pertimbangkan render shell + form segera, validasi
   sesi di belakang.
8. **API hangat > 300 ms.** `/health` median 0,71 s, preflight CORS 0,67–0,94 s,
   dan flow publik 4,05 s (komputasi hanya 0,05 s). Ukur endpoint domain dengan
   akun uji sebelum menyimpulkan; jika tetap tinggi, sesuaikan ekspektasi UX
   (skeleton/optimistic, bukan spinner).
9. **SEO dasar.** `index.html` masih `<title>Vite App</title>`, `lang=""`,
   tanpa meta description; `robots.txt` mengembalikan HTML.

### P2 — fase 5–6

10. **Copy developer di UI.** API base URL, dataset, rate limit, checklist M5,
    dan error “localhost:8080” harus pindah ke `/app/debug` atau section
    Advanced.
11. **Unused JS ±47 KB** di landing; sebagian besar hilang setelah auth
    dipisah.
12. **Forced reflow 48,8 ms** dari chunk utama (kecil, pantau setelah refactor).
13. **Label menyesatkan di dashboard publik.** “API RESPONSE TIME” menampilkan
    `x-process-time` (waktu komputasi backend, 0,05 s), bukan waktu respons
    jaringan (2,20 s). Perbaiki copy saat migrasi flow publik.

---

## 10. Rekomendasi fase 1

Fokus fase 1: **tokens, font, primitif, style guide** — belum migrasi halaman.

1. **Buat `src/styles/tokens.css`** untuk warna, type scale, spacing, radius,
   shadow, dan motion. Jangan hardcode warna Tailwind di halaman baru.
2. **Uji kontras palet yang sudah dikunci sebelum implementasi:**
   - `#D9480F` di atas `#F8F7F4` = **4,01:1** dan putih di atas `#D9480F` =
     **4,30:1** → tidak lolos AA untuk teks normal.
   - `#C2410C` di atas paper = **4,83:1** → aman untuk teks signal.
   - `#4D7C0F` di atas `#E8F5E1` = **4,42:1** → hampir, perlu digelapkan
     sedikit untuk teks kecil.
   - Rekomendasi: pakai `#C2410C` untuk teks signal, atau teks ink di atas
     tombol orange; jangan teks putih kecil di atas `#D9480F`.
3. **Siapkan font pipeline** (self-host, subset Latin, `font-display: swap`,
   preload hanya display/body). Ukur payload aktual dan CLS setelah dipasang.
4. **Bangun primitif** `AppButton`, `IconButton`, `Card`, `Badge`, `Input`,
   `Select`, `Skeleton`, `EmptyState`, `ErrorState`, `ServerWakeBanner` dengan
   label, focus ring, dan target 44 px sejak awal.
5. **Pasang Lucide** dengan import per ikon; jangan import namespace.
6. **Buat style guide route** (`/app/style-guide` atau route dev) untuk
   review visual sebelum migrasi Home.
7. **Perbaiki `index.html`** (`lang`, title, meta description) dan tambahkan
   `public/headers`/`_headers` untuk cache aset — ini perubahan kecil dengan
   dampak besar.
8. **Pisahkan auth dari public entry** sebagai eksperimen terukur: target
   landing publik turun dari ~112 KB ke ~68 KB gzip dan rantai `get-session`
   hilang dari first load.
9. **Siapkan lingkungan ukur terautentikasi**: akun uji + Neon branch/staging,
   supaya fase 1 bisa langsung mengukur Home/Plans/Workout.

---

## 11. Artefak dan reproduksi

Artefak mentah (di luar repo, folder temp sesi):

```text
C:\Users\Ridwan\AppData\Local\Temp\opencode\jymz-baseline\
  lh-mobile-home.report.{json,html}
  lh-desktop-home.report.{json,html}
  lh-mobile-signin.report.{json,html}
  lh-desktop-signin.report.{json,html}
  railway-probe.txt
  railway-warm-2.txt
  coldstart-2.txt
  pw\page-audit.json
  pw\public-flow.json
  shots\
```

Perintah utama:

```powershell
# Lighthouse
npx lighthouse "https://jymz.pages.dev/" --output=json --output=html --output-path=...
npx lighthouse "https://jymz.pages.dev/" --preset=desktop ...
npx lighthouse "https://jymz.pages.dev/auth/sign-in" ...

# Build & bundle
npm run build

# Cold start (curl)
curl.exe -sS -o NUL -w "ttfb=%{time_starttransfer}s total=%{time_total}s" `
  "https://jymz-api-production.up.railway.app/ready"
```

Tidak ada perubahan UI, konfigurasi produksi, atau commit pada fase ini.
