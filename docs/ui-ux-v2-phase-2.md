# JYMZ UI/UX v2 — Phase 2: shell, Today, auth

Status: **selesai, menunggu review**
Tanggal: **2026-11-23**
Branch: `feat/ui-v2`
Commit fase 0: `69ee8d2`
Commit fase 1: `7e6c0de`
Dev server: `http://127.0.0.1:5173` (supervisor loop aktif)

Fase 2 memindahkan shell, navigasi, Home/Today, dan auth ke UI v2. Halaman
Plans, Workout, Progress, Profile, dan onboarding masih memakai UI lama sampai
fase berikutnya.

---

## 1. Auth split

Sebelumnya `main.ts` mengimpor `authStore` secara statis dan memanggil
`auth.initialize()` di setiap load. Akibatnya landing publik mengunduh Neon Auth
(43,75 KB gzip) dan menjalankan `get-session`.

Sekarang:

- `main.ts` hanya memasang `installAuthBridge(router)`.
- Token provider memakai auth store **jika sudah terdaftar**; public flow tidak
  pernah mengimpor auth store.
- Router memakai dynamic import auth hanya untuk route yang membutuhkan sesi.
- `guestOnly` tidak lagi memblokir navigasi; SignIn/SignUp merender form lebih
  dulu, lalu memeriksa sesi di belakang.
- `authStore.ensureSession()` memisahkan sesi Neon dari `/me`.
- `/me` di-cache di localStorage dengan validasi user id; jika API dingin,
  profil terakhir tetap dipakai.
- `profileComplete` tidak lagi memaksa redirect onboarding saat `/me` gagal
  jaringan dan belum ada data.

Bukti:

| Pemeriksaan | Hasil |
|---|---|
| Public `/` memuat authStore/Neon | **tidak** |
| Public `/` mengunduh font | **tidak** |
| Public `/` Lighthouse mobile | **Perf 100**, BP 100, SEO 100 |
| Public `/` transfer | **82 KB** (baseline 125 KB) |
| Sign-in form terlihat | **252 ms** (produksi lokal) |
| `get-session` selesai | 770–1.831 ms |
| Sign-in Lighthouse mobile | **97 Perf / 100 A11y / 100 BP / 100 SEO** |
| Sign-in Lighthouse desktop | **100 / 100 / 100 / 100** |
| Sign-up 390 px | tidak overflow, 0 unlabelled, 0 target <44 px, 0 error |

Initial JS: `index` **65,0 KB gzip**; `authStore` **48,0 KB gzip** hanya dimuat
di route auth/app. Total transfer sign-in 241 KB termasuk 106 KB font.

---

## 2. AppShell dan navigasi

Desktop:

- sidebar 232 px, brand `JYMZ field log`;
- lima item: Hari ini, Plan, Sesi, Progres, Profil;
- account block di bawah (nama, email, link akun);
- tanpa status backend/API URL/milestone di UI.

Mobile/tablet (<1024 px):

- topbar ringkas dengan brand + avatar akun;
- bottom navigation lima item dengan safe-area padding;
- target sentuh ≥44 px;
- tidak ada menu horizontal ganda.

Aktif state memakai `aria-current="page"`, background surface, dan ikon signal.
Tidak ada border kiri berwarna.

`/app/debug` tetap tersedia sebagai route internal untuk health/ready/dataset;
tidak ditautkan dari navigasi.

---

## 3. Home / Today

Home baru:

- sapaan + tanggal;
- **Continue workout** jika ada sesi `in_progress`;
- **Next plan day** + `Mulai sesi` jika tidak ada sesi aktif;
- weekly ledger: sesi, volume, set, durasi, streak, 28 hari;
- recent sessions;
- profil belum lengkap → callout ke onboarding;
- empty state → buat plan.

Aksi `Mulai sesi` mengirim:

```json
{
  "plan_id": "plan-1",
  "day": 2,
  "plan_version": 2,
  "timezone": "Asia/Jakarta"
}
```

Lalu navigasi ke `/app/workouts/{id}`. Diuji dengan mock API: POST tepat,
navigasi berhasil, 0 console error.

### Cache dan cold start

- `jymz.home.v1` menyimpan active workout, last completed day, recent workouts,
  plan, insights, dan timestamp.
- `jymz.auth.me.v1` menyimpan `/me` terakhir.
- Saat cache tersedia, Home langsung menampilkan data terakhir dan menyegarkan
  di belakang; kegagalan parsial menampilkan catatan “data terakhir”.
- `ServerWakeBanner` dipasang di AppShell:
  - probe hanya `GET /ready` (bukan health+ready paralel);
  - banner muncul setelah 2 detik;
  - status “Server sedang bangun” + Retry setelah 8 detik;
  - hilang otomatis saat ready.
- Diuji dengan `/ready` ditunda 10 detik: connecting pada 2 detik, waking +
  Retry pada 8 detik, banner hilang setelah ready, 0 error.

---

## 4. Auth pages

`AuthShell` sekarang:

- paper/ink, split editorial di desktop, form fokus di mobile;
- specimen log latihan (bukan copy developer);
- tanpa “Managed auth by Neon / JWT verified by FastAPI”;
- h1 yang jelas, deskripsi singkat, footer tenang.

Sign in / sign up:

- `AppInput` dan `AppButton` UI v2;
- validasi inline per field;
- error server memakai alert full-border + tint;
- loading pada submit;
- link antar-auth;
- peringatan konfigurasi auth tidak menyebut env/JWT.

---

## 5. Verifikasi

| Cek | Hasil |
|---|---|
| `npm run type-check` | lolos |
| `npm run build` | lolos |
| Home mock 390/768/1440 | tidak overflow |
| Home small touch targets | 0 |
| Home input tanpa label | 0 |
| Home console error | 0 |
| Home fonts | Bricolage/Public Sans/JetBrains loaded |
| Start session | POST benar + navigasi `/app/workouts/workout-2` |
| Wake banner | 2 s connecting, 8 s waking, retry, hide on ready |
| Public flow auth requests | 0 |

Screenshot:

- `docs/ui-ux-v2-phase-2/home-active-390.png`
- `docs/ui-ux-v2-phase-2/home-active-768.png`
- `docs/ui-ux-v2-phase-2/home-active-1440.png`
- `docs/ui-ux-v2-phase-2/home-next-390.png`
- `docs/ui-ux-v2-phase-2/home-next-1440.png`
- `docs/ui-ux-v2-phase-2/signin-390.png`
- `docs/ui-ux-v2-phase-2/signin-1440.png`
- `docs/ui-ux-v2-phase-2/wake-connecting.png`
- `docs/ui-ux-v2-phase-2/wake-waking.png`

---

## 6. Batasan

- Lighthouse halaman terautentikasi dengan akun nyata belum dijalankan; Home
  diverifikasi dengan mock API + state auth karena tidak ada akun uji aman.
- Public recommendation flow masih UI lama (Lighthouse A11y 64); migrasinya di
  fase 5.
- Halaman Plans, Workout, Progress, Profile, dan onboarding masih UI lama;
  fase 3–4 memindahkannya.
- Start session diuji dengan mock; backend nyata tetap perlu smoke test setelah
  akun uji tersedia.
- Belum ada commit fase 2 dan belum ada deploy.
