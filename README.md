# ⚡ Fitness Recommendation System Hybrid AI Optimization Dashboard

[![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)]()
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)]()
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)]()
[![Pinia](https://img.shields.io/badge/Pinia-State_Management-FFD166?style=for-the-badge&logo=vue.js&logoColor=black)]()

> Antarmuka pengguna berkinerja tinggi untuk Sistem Rekomendasi Program Kebugaran. Dibangun untuk memvisualisasikan hasil optimasi dari **Expert System** menggunakan experta dan **Genetic Algorithm** menggunakan pygad secara *real-time* pada FastAPI yang berjalan di python 3.9.11.

![Bento Grid Dashboard Preview](https://pub-602fa6026a04465d944bea72bc0f7d73.r2.dev/Screenshot%202026-05-09%20112455.png)

## 📖 Ringkasan
Repositori ini berisi *source code* lapisan *Frontend* dari proyek tugas akhir **Sistem Rekomendasi Program Fitness Berbasis Aturan dan Algoritma Optimasi Genetika**. Aplikasi ini dirancang untuk menggantikan purwarupa UI statis menjadi *Single Page Application (SPA)* yang interaktif, modular, dan memiliki *Type-Safety* penuh secara *End-to-End*.

Estetika visual menggunakan gaya **Neo-Brutalism** —mengutamakan fungsionalitas, kontras tinggi, dan nuansa *Engineering Console* yang selaras dengan kompleksitas algoritma di belakang layar.

## ✨ Fitur Utama

- **⚙️ Algorithmic Engine Parameters,** formulir masukan reaktif yang menampilkan perhitungan *Live Logic* seperti metrik BMI dan kontrol batasan genetik menggunakan *Interactive Badges*.
- **🖥️ Processing Console,** layar simulasi terminal yang menangkap status komputasi (*X-Process-Time*) dan transisi algoritma dari Rule Engine ke PyGAD untuk memberikan *feedback* visual yang transparan kepada pengguna.
- **🍱 Bento-Grid Analytics Dashboard,** presentasi hasil optimasi genetik jadwal mingguan menggunakan *layout* Bento Box yang adaptif dan navigasi *Tabbed Daily Operations* untuk mencegah *infinite scrolling*.
- **🧠 Centralized State Management,** memanfaatkan **Pinia** untuk mempertahankan profil biometrik pengguna dan hasil *fitness score* tanpa harus melakukan *re-fetch* data antar rute.

## 🏗️ Arsitektur Sistem

Aplikasi ini menerapkan pemisahan tugas (*Separation of Concerns*) yang ketat
1. `src/types/`: Kontrak antarmuka data.
2. `src/api/`: *Service layer* untuk komunikasi HTTP dengan FastAPI.
3. `src/stores/`: Manajemen memori lokal aplikasi dengan Pinia.
4. `src/views/`: Alur pengguna 3-tahap (`Config` -> `Process` -> `Dashboard`).

## 📸 UI Showcase

Bagian ini menyoroti antarmuka pengguna yang disajikan dalam presentasi sidang skripsi.

| Input | Transition | Output |
| :---: | :---: | :---: |
| ![Config View](https://pub-602fa6026a04465d944bea72bc0f7d73.r2.dev/Screenshot%202026-05-09%20112301.png) | ![Process View](https://pub-602fa6026a04465d944bea72bc0f7d73.r2.dev/Screenshot%202026-05-09%20112351.png) | ![Daily View](https://pub-602fa6026a04465d944bea72bc0f7d73.r2.dev/Screenshot%202026-05-09%20112902.png) |
| *Parameter Biometrik dan Batasan Genetik* | *Live Log Eksekusi Algoritma* | *Tab Navigasi Jadwal Harian* |

## 🧱 App v2 development (M0)

Frontend JYMZ penuh sudah berjalan di `main`; UI/UX v2 selesai dan deployed.
Rancangan milestone dan kontrak M0 ada di
[`docs/m0-foundation.md`](docs/m0-foundation.md).

Ringkasan lokal:

```powershell
# backend (repo jymz-hardening)
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8080

# frontend
Copy-Item .env.example .env.local
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

- Public recommendation: `http://localhost:5173/`
- App control room: `http://localhost:5173/app`
- API base URL: `VITE_API_BASE_URL` (default `http://localhost:8080/api/v1`)
- Backend flags stay off until their frontend milestone needs them.

Auth milestone: [`docs/m1-auth-and-account.md`](docs/m1-auth-and-account.md).  
Profile milestone: [`docs/m2-onboarding-and-profile.md`](docs/m2-onboarding-and-profile.md).  
Plan milestone: [`docs/m3-plan-lifecycle.md`](docs/m3-plan-lifecycle.md).  
Workout milestone: [`docs/m4-workout-execution.md`](docs/m4-workout-execution.md).  
Progress, feedback & safety milestone:
[`docs/m5-progress-feedback.md`](docs/m5-progress-feedback.md).

Current status and deployment links:
[`docs/project-status.md`](docs/project-status.md).  
UI/UX & performance v2 plan:
[`docs/ui-ux-v2-plan.md`](docs/ui-ux-v2-plan.md).  
UI/UX v2 baseline:
[`docs/ui-ux-v2-baseline.md`](docs/ui-ux-v2-baseline.md).  
UI/UX v2 phase 1 (tokens, fonts, primitives):
[`docs/ui-ux-v2-phase-1.md`](docs/ui-ux-v2-phase-1.md).  
UI/UX v2 phase 2 (shell, Today, auth):
[`docs/ui-ux-v2-phase-2.md`](docs/ui-ux-v2-phase-2.md).  
UI/UX v2 phase 3 (plans, workout):
[`docs/ui-ux-v2-phase-3.md`](docs/ui-ux-v2-phase-3.md).  
UI/UX v2 phase 4 (progress, profile, onboarding):
[`docs/ui-ux-v2-phase-4.md`](docs/ui-ux-v2-phase-4.md).  
UI/UX v2 phase 5 (public flow, motion):
[`docs/ui-ux-v2-phase-5.md`](docs/ui-ux-v2-phase-5.md).  
UI/UX v2 phase 6 (performance, QA):
[`docs/ui-ux-v2-phase-6.md`](docs/ui-ux-v2-phase-6.md).  
Binding design agreement:
[`DESIGN.md`](DESIGN.md).  
Style guide lokal: `http://localhost:5173/style-guide` (route publik, tidak
ditautkan dari navigasi).

M1 needs the backend restarted with `AUTH_ENABLED=true`,
`AUTH_PROFILES_ENABLED=true`, and `VITE_NEON_AUTH_URL` set in the frontend env.  
M5 needs `PROGRESS_ENABLED=true` and `FEEDBACK_ENABLED=true` in addition to the
workout flags.

> **Scope update (2026-11-24):** M0–M5 and UI/UX v2 are complete and deployed.
> **M6 (Collaboration) and M7 (Release hardening) are deferred indefinitely.**
> Future work is maintenance unless a milestone is explicitly reopened.

Live services:

- App: https://jymz.pages.dev
- API: https://jymz-api-production.up.railway.app
- Asset downloads: https://jymz-assets.pages.dev
- Project page: https://ridwanafazn.my.id/projects/jymz
