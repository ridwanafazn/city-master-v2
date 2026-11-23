# JYMZ UI/UX v2 — Phase 4: Progress, Profile, Account, Onboarding

Status: **selesai, menunggu review**
Tanggal: **2026-11-23**
Branch: `feat/ui-v2`
Commit fase 0: `69ee8d2`
Commit fase 1: `7e6c0de`
Fase 2–4: implemented, belum di-commit
Dev server: `http://127.0.0.1:5173`
Backend: `http://127.0.0.1:8080`

Fase 4 memigrasikan Progress deck, Profile settings, Account, dan Onboarding.
Kontrak API tidak diubah.

---

## 1. Progress deck

- Empat stat utama: sesi, volume, streak, personal record.
- Range selector 7 / 30 / 90 hari memakai `SegmentedControl`; pilihan
  dinonaktifkan saat request berjalan.
- Volume chart custom SVG (`VolumeChart.vue`), tanpa library chart:
  - bar harian;
  - label puncak dan rentang tanggal;
  - ringkasan aksesibel.
- Set/reps/durasi menjadi ledger sekunder, bukan kartu tambahan.
- Balance otot sebagai horizontal bars berurutan.
- Personal records sebagai daftar prioritas dengan label record.
- Weekly review dan insight di rail kanan.
- Sesi terakhir sebagai rows; link ke seluruh riwayat.
- Tidak ada kartu “Next: M6”.
- Empty state untuk chart, balance, PR, weekly review, dan riwayat.

## 2. Profile settings

- Section: identitas & profil, equipment, cedera, consent.
- `ProfileFields` dimigrasi ke `AppInput`/`AppSelect` (label, hint, 44 px).
- `EquipmentPicker`, `InjuryPicker`, `ConsentPanel` memakai `Chip` dan
  `AppCheckbox` UI v2.
- Status konsen dan peringatan revoke tetap dipertahankan.
- Data export dan link Advanced/diagnostics di rail.
- Save per section tetap memakai store/API yang sama:
  `PATCH /me/profile`, `PUT /me/equipment`, `PUT /me/injuries`,
  `POST /me/consents`.

## 3. Account

- Identitas ringkas: nama, email, role, verifikasi, tanggal bergabung.
- Consent state per jenis consent.
- Advanced collapsible: user ID, auth subject, link `/app/debug`.
- Refresh `/me`, edit profil, keluar.
- Hapus akun memakai `Dialog` konfirmasi; request tetap memakai
  `DELETE /me` dan mengakhiri sesi.
- ID teknis tidak lagi tampil di area utama.

## 4. Onboarding

- Lima langkah: Profil, Equipment, Cedera, Consent, Review.
- Progress indicator yang bisa kembali ke langkah sebelumnya; langkah depan
  terkunci sampai dilewati.
- Satu topik per panel; label dan hint terlihat.
- Equipment/cedera memakai chip 44 px.
- Consent memakai bahasa manusia dan menandai health consent sebagai wajib
  untuk cedera.
- Review menampilkan profil dan constraint sebelum simpan.
- Action bar sticky di mobile (di atas bottom nav), statis di desktop.
- Payload `POST /me/onboarding` tetap sama; sukses kembali ke
  `/app/account?onboarding=done`.

---

## 5. Komponen baru/dimigrasi

| File | Perubahan |
|---|---|
| `src/components/progress/VolumeChart.vue` | Chart SVG harian |
| `src/components/profile/ProfileFields.vue` | Form profil UI v2 |
| `src/components/profile/EquipmentPicker.vue` | Chip equipment |
| `src/components/profile/InjuryPicker.vue` | Chip cedera + warning consent |
| `src/components/profile/ConsentPanel.vue` | Checkbox consent UI v2 |
| `src/views/app/ProgressView.vue` | Progress deck |
| `src/views/app/ProfileSettingsView.vue` | Profile sections |
| `src/views/app/AccountView.vue` | Account console |
| `src/views/app/OnboardingView.vue` | 5-step onboarding |

---

## 6. Verifikasi

| Cek | Hasil |
|---|---|
| `npm run type-check` | lolos |
| `npm run build` | lolos |
| Progress 390/1440 | tidak overflow, 0 input tanpa label |
| Range 30 → 7 hari | request `/me/progress` dengan rentang baru |
| Profile 390/1440 | tidak overflow, 0 input tanpa label |
| `Simpan profil` | `PATCH /me/profile` terkirim |
| Account 390/1440 | tidak overflow, 0 target <44 px |
| Dialog hapus akun | terbuka dan bisa ditutup |
| Onboarding 390/1440 | tidak overflow, 0 input tanpa label |
| Onboarding review | langkah 5/5 tampil |
| Simpan onboarding | `POST /me/onboarding` terkirim; redirect account |
| Console error | 0 pada auditan mock |

Hidden native inputs 1×1 px (radio segmented/checkbox) tidak dihitung sebagai
target visual; labelnya 44 px.

Screenshot:

- `docs/ui-ux-v2-phase-4/progress-390.png` / `progress-1440.png`
- `docs/ui-ux-v2-phase-4/profile-390.png` / `profile-1440.png`
- `docs/ui-ux-v2-phase-4/account-390.png` / `account-1440.png`
- `docs/ui-ux-v2-phase-4/onboarding-390.png` / `onboarding-1440.png`
- `docs/ui-ux-v2-phase-4/onboarding-review-390.png`

---

## 7. Bundle

| Chunk | Gzip |
|---|---:|
| `ProgressView` | 4,22 KB |
| `OnboardingView` | 3,02 KB |
| `ProfileSettingsView` | 2,41 KB |
| `AccountView` | 2,38 KB |
| `VolumeChart` | termasuk chunk Progress |
| `index` | 65,57 KB |
| `authStore` (lazy) | 48,00 KB |

Tidak ada dependency chart/animasi baru.

---

## 8. Batasan

- Verifikasi UI memakai mock auth/API; Lighthouse halaman terautentikasi
  dengan akun nyata belum dijalankan.
- Onboarding diuji pada state profil yang sudah ada; alur first-run dengan
  profil kosong belum diuji terhadap backend nyata.
- Submit feedback/safety dan consent save sudah terhubung ke kontrak lama,
  tetapi belum seluruhnya diuji end-to-end dengan akun nyata.
- Fase 2–4 belum di-commit dan belum deploy.
- Berikutnya fase 5: public recommendation flow + motion polish.
