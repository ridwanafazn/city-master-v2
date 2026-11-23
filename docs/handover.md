# JYMZ handover — status, deploy, dan verifikasi

Dokumen ini adalah titik masuk untuk handover proyek JYMZ. Isinya merangkum
status produk, repo, deployment produksi, cara deploy ulang, verifikasi, dan
batasan yang masih berlaku.

Spesifikasi fitur dan kontrak yang benar-benar diterapkan ada di
[`implementation-spec.md`](implementation-spec.md). Dokumen milestone/fase
adalah catatan historis; jika berbeda, implementation spec dan kode `main`
yang berlaku.

- Tanggal handover: **2026-11-24**
- Status: **M0–M5 + UI/UX v2 fase 0–6 selesai dan deployed**
- M6 (Collaboration) dan M7 (Release hardening): **deferred indefinitely**
- Dokumen status detail: [`project-status.md`](project-status.md)
- Bukti UI/UX v2: [`ui-ux-v2-phase-6.md`](ui-ux-v2-phase-6.md)

---

## 1. Ringkasan produk

JYMZ adalah aplikasi rekomendasi program latihan:

- Frontend: Vue 3 + Vite + Pinia + Vue Router.
- Backend: FastAPI + SQLAlchemy + rule engine + genetic algorithm.
- Database/auth: Neon Postgres + Neon Auth.
- Frontend hosting: Cloudflare Pages.
- Backend hosting: Railway Free.
- Public flow: form parameter → process console → weekly plan, tanpa login.
- App flow: auth → onboarding/profile → plan → workout → progress.

UI/UX v2 memakai arah **Signal Editorial** (field manual), bukan dashboard SaaS.
Aturan desain yang mengikat ada di [`../DESIGN.md`](../DESIGN.md).

---

## 2. Repo dan branch

| Komponen | Repo | Branch produksi | Commit terakhir |
|---|---|---|---|
| Frontend | `ridwanafazn/city-master-v2` | `main` | `818ff98` |
| Backend | `ridwanafazn/fitness-rs-api` | `main` | `971a6d9` |

Checkout lokal yang dipakai saat handover:

```text
C:\Users\Ridwan\Git-v2\city-master-v2   # frontend
C:\Users\Ridwan\Git-v2\jymz-hardening   # backend
```

Frontend feature branch `feat/ui-v2` sudah di-push dan di-merge ke `main`.
Working tree frontend bersih kecuali folder lokal `.agents/` yang tidak
di-commit. Working tree backend bersih.

---

## 3. Produksi

### Frontend

| Item | Nilai |
|---|---|
| URL | https://jymz.pages.dev |
| App | https://jymz.pages.dev/app |
| Cloudflare Pages project | `jymz` |
| Production branch | `main` |
| Build command | `npm run build` |
| Output | `dist` |
| Deployment app terakhir | `1307cc5a-4354-4683-abb7-f8e0cfaac37b` |
| Commit deployment app | `4ce0e58` |
| Deployment final (docs) | `82be0184-8d0d-44de-966f-5218e9349430` |
| Commit final | `818ff98` |

Deployment `82be0184` adalah build final dari `main` setelah commit dokumen.
Kode aplikasinya identik dengan `1307cc5a` / `4ce0e58`. Commit dokumen setelah
`818ff98` bisa berada lebih baru dari build produksi dan tidak mengubah bundle
aplikasi.

Environment variables di Cloudflare Pages (nama saja):

```text
VITE_API_BASE_URL=https://jymz-api-production.up.railway.app/api/v1
VITE_APP_NAME=JYMZ
VITE_NEON_AUTH_URL=<Neon Auth issuer>
```

Nilai rahasia tidak disimpan di repo.

### Backend

| Item | Nilai |
|---|---|
| URL | https://jymz-api-production.up.railway.app |
| Health | https://jymz-api-production.up.railway.app/health |
| Readiness | https://jymz-api-production.up.railway.app/ready |
| API docs | https://jymz-api-production.up.railway.app/docs |
| Railway project | `gregarious-rejoicing` (`0a2bcbce-6784-4835-9ee1-e493e2aa1b69`) |
| Railway service | `jymz-api` (`4494821b-6144-439f-af14-0be48f358250`) |
| Environment | `production` |
| Region | Southeast Asia |
| Deployment terakhir | `110567c8-5211-4ce8-9287-95f3f00fb404` |
| Source commit | `971a6d9` |
| Image digest | `sha256:f91b297340fe5abbdd1f4f7b62bda3877b19dd95ae2c81de9edba21c5cf5c2b6` |
| Healthcheck | `/ready`, timeout 300 s |
| Migrations head | `0010_outbox_lease` |

Railway Free memiliki `sleepApplication: true`. Service bisa tidur setelah idle;
frontend menangani ini lewat `ServerWakeBanner` dan status loading eksplisit.

---

## 4. Deploy ulang

### Frontend — Cloudflare Pages

Prasyarat: login Cloudflare yang punya akses ke project `jymz`.

1. Pastikan `main` sudah berisi commit yang akan dirilis:

   ```powershell
   git checkout main
   git pull --ff-only origin main
   npm ci
   npm run build
   ```

2. Deploy dari dashboard Cloudflare:

   ```text
   Workers & Pages → jymz → Deployments → Create deployment
   Branch: main
   ```

   Alternatif CLI jika Wrangler sudah terautentikasi:

   ```powershell
   npx wrangler pages deploy dist --project-name jymz --branch main
   ```

3. Catatan operasional: Git auto-deploy Cloudflare **tidak terpicu** pada
   push terakhir. Deployment final dipicu manual dari `main` lewat Cloudflare
   API/dashboard. Jangan mengandalkan push GitHub saja.

4. Verifikasi:

   ```powershell
   curl.exe -I https://jymz.pages.dev/
   ```

   Harus `200`, ada `x-content-type-options: nosniff`, dan HTML memuat preload
   font serta asset `/assets/index-*.js` terbaru.

### Backend — Railway

Prasyarat: Railway CLI login dan repo backend berada di `main` yang bersih.

```powershell
cd C:\Users\Ridwan\Git-v2\jymz-hardening
git status
git pull --ff-only origin main
railway up -d -y
```

Railway service **tidak punya Git source terhubung**. Karena itu:

- `railway redeploy --from-source` tidak bisa diandalkan untuk menarik commit
  GitHub terbaru.
- Gunakan `railway up` dari working tree backend yang sudah berada di `main`.
- `railway up` mengunggah source dan membangun image dari `Dockerfile`.

Cek deployment:

```powershell
railway deployment list `
  -p 0a2bcbce-6784-4835-9ee1-e493e2aa1b69 `
  -s 4494821b-6144-439f-af14-0be48f358250 `
  -e production --limit 3 --json
```

Jika ada migration baru:

```powershell
# jalankan dengan DATABASE_URL produksi dari secret manager, jangan ditulis di repo
alembic upgrade head
```

Migration terakhir yang diketahui: `0010_outbox_lease`. Deploy UI/UX v2 tidak
menambah migration baru.

---

## 5. Verifikasi produksi

### Frontend

| Cek | Hasil |
|---|---|
| `https://jymz.pages.dev/` | 200 |
| Judul halaman public | `Parameter latihan \| JYMZ` |
| Font preload | Bricolage + Public Sans loaded |
| Public config request auth/Neon | 0 |
| Sign-in | tampil normal |
| `/app` dan `/shared/test` SPA fallback | 200 |
| Console error pada smoke test | 0 |
| Overflow 390 px | tidak ada |

### Backend

| Cek | Hasil |
|---|---|
| `/health` | 200, `status: ok`, `version: 2.0.0` |
| `/ready` | 200, `database: ok`, dataset 222 |
| `/metrics` | metrik P2.3 `jymz_rate_limit_degraded_total` tersedia |
| `POST /api/v1/recommendation/` | 201, ~1,1 s warm |
| CORS | hanya `https://jymz.pages.dev` |
| Redis | `not_configured` (rate limit in-memory) |

Contoh payload recommendation minimal:

```json
{
  "gender": "male",
  "height_cm": 170,
  "weight_kg": 65,
  "injuries": [],
  "available_days": 3,
  "preferred_body_part": [],
  "preferred_equipment": []
}
```

---

## 6. Development lokal

### Frontend

```powershell
cd C:\Users\Ridwan\Git-v2\city-master-v2
Copy-Item .env.example .env.local
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

- Public: `http://127.0.0.1:5173/`
- App: `http://127.0.0.1:5173/app`
- Style guide: `http://127.0.0.1:5173/style-guide`

### Backend

```powershell
cd C:\Users\Ridwan\Git-v2\jymz-hardening
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8080
```

Flag yang dipakai untuk M1–M5 ada di README dan `.env.example`. Jangan
mengaktifkan flag M6/M7 tanpa permintaan eksplisit.

> **Peringatan:** `.env.local` backend saat handover menunjuk ke Neon project
> yang sama dengan produksi. Jangan seed, truncate, atau mutasi data lokal tanpa
> izin dan backup.

---

## 7. Kualitas dan performa

- Lighthouse mobile public config: **100 performance / 100 accessibility /
  100 best-practices / 100 SEO**.
- FCP/LCP 0,8 s; TBT 40 ms; CLS 0; total transfer 205 KiB.
- Initial JS 67,6 KB gzip; font total 109,5 KB.
- QA final: 51 screenshot pada 390/768/1440, 0 overflow, 0 target <44 px,
  0 input tanpa label, 0 console error.
- Screenshot dan report:
  [`ui-ux-v2-phase-6/`](ui-ux-v2-phase-6/).

Batasan:

- Lighthouse halaman terautentikasi belum dijalankan karena belum ada akun uji
  aman dan Neon branch terpisah.
- Lighthouse preset desktop gagal di environment headless (`NO_FCP`), bukan
  error aplikasi.
- Cold start Railway Free belum diukur ulang pada fase 6.
- PWA/service worker belum ada.

---

## 8. Keamanan dan kredensial

- Jangan commit `.env.local`, token Cloudflare, token Railway, atau connection
  string Neon.
- Environment frontend diatur di Cloudflare Pages; environment backend diatur di
  Railway Variables.
- Railway CLI dan Cloudflare CLI menyimpan sesi login di mesin lokal. Jika
  transkrip terminal atau file konfigurasi pernah dibagikan, revoke/rotate token
  lalu login ulang.
- CORS produksi sengaja exact-origin ke `https://jymz.pages.dev`; jangan memakai
  wildcard.
- Auth memakai Neon Auth. Public recommendation tetap anonymous dan tidak
  memanggil Neon Auth.

---

## 9. Checklist handover

- [x] Frontend `main` memuat kode produksi (`4ce0e58`); deployment final
      `82be0184` dibangun dari `818ff98`
- [x] Backend `main` = `971a6d9`, working tree bersih
- [x] Frontend deployed ke Cloudflare Pages
- [x] Backend deployed ke Railway
- [x] `/health` dan `/ready` produksi 200
- [x] Public config, sign-in, recommendation, CORS diverifikasi
- [x] Dokumen status, phase 6, dan plan diperbarui
- [x] Lighthouse mobile 100/100/100/100
- [ ] Lighthouse terautentikasi (blocked)
- [ ] M6/M7 (deferred)

Catatan: commit dokumen setelah handover ini bisa membuat `main` lebih baru
dari deployment produksi. Selama tidak ada perubahan `src/`, bundle aplikasi
tetap sama; redeploy hanya perlu jika menginginkan commit produksi sama persis.

---

## 10. Dokumen terkait

- [`implementation-spec.md`](implementation-spec.md) — spesifikasi fitur,
  kontrak API, state, UI, dan batasan yang diterapkan.
- [`project-status.md`](project-status.md) — status dan event log.
- [`ui-ux-v2-plan.md`](ui-ux-v2-plan.md) — rencana dan acceptance criteria.
- [`ui-ux-v2-phase-6.md`](ui-ux-v2-phase-6.md) — performance, QA, deployment.
- [`ui-ux-v2-phase-5.md`](ui-ux-v2-phase-5.md) — public flow dan motion.
- [`ui-ux-v2-phase-4.md`](ui-ux-v2-phase-4.md) — progress/profile/onboarding.
- [`ui-ux-v2-phase-3.md`](ui-ux-v2-phase-3.md) — plans/workout.
- [`ui-ux-v2-phase-2.md`](ui-ux-v2-phase-2.md) — shell/Today/auth.
- [`m0-foundation.md`](m0-foundation.md) — arsitektur dan milestone.
- [`../DESIGN.md`](../DESIGN.md) — aturan desain.
