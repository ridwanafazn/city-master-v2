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