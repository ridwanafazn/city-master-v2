# JYMZ UI/UX v2 — Phase 1: field manual foundation

Status: **selesai, menunggu review**
Tanggal: **2026-11-23**
Branch: `feat/ui-v2`
Basis: [`ui-ux-v2-plan.md`](ui-ux-v2-plan.md), [`ui-ux-v2-baseline.md`](ui-ux-v2-baseline.md),
dan [`DESIGN.md`](../DESIGN.md)

Fase 1 membangun fondasi visual: token, font, primitif, dan satu specimen
hidup. Halaman produksi belum dimigrasi; fase 2 mulai dari AppShell dan
Home/Today. Commit fase 1: `7e6c0de`. Tidak ada deploy pada fase ini.

---

## 1. Keputusan yang mengikat

Fase 1 tidak berhenti di “warm paper + orange accent”. Arah yang dikunci:

> **JYMZ adalah catatan latihan lapangan, bukan dashboard SaaS.**

Konsekuensinya, specimen utama adalah **tabel log latihan** (set, beban, reps,
RPE, istirahat), bukan deretan kartu fitur. Aturan lengkap ada di
[`DESIGN.md`](../DESIGN.md).

### Yang dihapus dari draft awal

| Dihapus | Alasan |
|---|---|
| Eyebrow/kicker di atas heading | heading harus membawa maknanya sendiri |
| Nomor section dekoratif | tidak menambah informasi |
| Grid overlay di hero | tekstur tanpa alat ukur nyata |
| Border kiri berwarna pada toast/error/wake | diganti border penuh + tint |
| Hero metric + empat kartu statistik | template dashboard generik |
| Galeri kartu seragam | kartu dipakai hanya untuk unit mandiri |
| CTA palsu di halaman dokumentasi | style guide bukan landing page |
| Shimmer skeleton | diganti pulse yang lebih tenang |

### Yang dipertahankan

- Signal Editorial: paper `#F8F7F4`, ink `#14160F`, orange sebagai sinyal.
- Tanpa dark mode.
- Lucide sebagai satu-satunya ikon.
- Tanpa library chart/animasi besar.
- Offset shadow hanya untuk CTA hero.
- Mono hanya untuk data, satuan, ID, timestamp, dan label metadata.

---

## 2. Token

`src/styles/tokens.css`:

- palet + semantic aliases;
- `--font-display`, `--font-body`, `--font-data`;
- type scale `--text-display-1` sampai `--text-label`;
- spacing 8pt (`4–96px`);
- radius `10 / 12 / 999px`;
- shadow `card / raised / cta / focus`;
- motion `160 / 200 / 240 ms` + easing;
- layout `1240px`, measure `68ch`, gutter, touch target `44px`;
- browser surfaces: selection, caret, scrollbar, underline offset;
- `prefers-reduced-motion` guard.

### Kontras

| Pasangan | Rasio | Keputusan |
|---|---:|---|
| `#D9480F` di paper | 4,01:1 | aksen saja, bukan teks kecil |
| Putih di `#D9480F` | 4,30:1 | tidak untuk teks kecil |
| `#C2410C` di paper | 4,83:1 | teks signal |
| Putih di `#C2410C` | 5,18:1 | CTA primary |
| `#3F6212` di `#E8F5E1` | > 4,5:1 | teks success |

Karena itu token memisahkan `--color-signal` dan `--color-signal-strong`.
Tombol primary, badge signal, dan chip terpilih memakai `signal-strong`.

---

## 3. Font

Self-host, subset Latin, variable WOFF2, `font-display: swap`.

| Font | Peran | Ukuran |
|---|---|---:|
| Bricolage Grotesque | display, heading, angka besar | **40,4 KB** |
| Public Sans | body, form, instruksi | **26,2 KB** |
| JetBrains Mono | data, satuan, label metadata | **39,5 KB** |
| **Total** | | **106,1 KB** |

Lisensi SIL OFL: `public/fonts/licenses/`.

- Preload ditunda ke fase 2, saat AppShell/Home memakai font di atas fold.
- Halaman lama tetap memakai system mono. Tailwind `font-mono` sengaja
  diarahkan ke system stack; font baru hanya aktif di `.ui-v2-scope`.
- Smoke test build final: `/` dan `/auth/sign-in` **0 request font**.

---

## 4. Primitif

`src/components/ui-v2/` — 21 komponen:

| Kelompok | Komponen |
|---|---|
| Action | `AppButton`, `IconButton` |
| Layout | `Card`, `SectionHeader`, `StatTile` |
| Status | `Badge`, `Chip` |
| Form | `AppInput`, `AppSelect`, `AppTextarea`, `AppCheckbox`, `RadioGroup`, `SegmentedControl` |
| Navigasi | `Tabs` |
| Overlay | `Dialog`, `Sheet` |
| Feedback | `Toast`, `Skeleton`, `EmptyState`, `ErrorState`, `ServerWakeBanner` |
| Internal | `useFieldIds`, `useNativeDialog`, `types.ts` |

Perubahan penting dari draft awal:

- `SectionHeader` **tidak lagi menerima `eyebrow`**.
- `Card` default hanya border; shadow hanya untuk `variant="elevated"`.
- `StatTile` tidak memakai shadow; border saja.
- `Toast`, `ErrorState`, `ServerWakeBanner` memakai border penuh + tint,
  tanpa border kiri berwarna.
- `Skeleton` memakai pulse opacity, bukan shimmer sweep.
- Semua target sentuh terlihat minimal 44 px; input radio/checkbox native
  disembunyikan 1×1 px dan label-nya yang menjadi target.
- `Dialog`/`Sheet` memakai native `<dialog>`: focus trap, Escape, dan
  pengembalian fokus sudah diuji.
- `Tabs` mendukung ArrowLeft/Right/Up/Down/Home/End.
- `prefers-reduced-motion` dihormati.

---

## 5. Style guide

Route: **`/style-guide`** (publik, tidak ditautkan dari navigasi, diblokir
`robots.txt`).

Bentuknya bukan galeri komponen, melainkan **field manual**:

- masthead + colophon (edisi, status, rute, font, palet, motion);
- indeks samping yang menjadi navigasi;
- **specimen log latihan hidup**: 3 set awal, tombol `Catat set` menambah baris
  dan memperbarui volume dengan animasi 200 ms;
- tabel tipe, palet, session history, motion;
- specimen form profil, state server/offline/empty/error, dialog, sheet;
- aturan “Gunakan / Jangan” yang eksplisit.

Screenshot review:

- `docs/ui-ux-v2-phase-1/style-guide-390.jpg`
- `docs/ui-ux-v2-phase-1/style-guide-768.jpg`
- `docs/ui-ux-v2-phase-1/style-guide-1440.jpg`
- `docs/ui-ux-v2-phase-1/style-guide-dialog-1440.jpg`
- `docs/ui-ux-v2-phase-1/style-guide-sheet-390.jpg`

---

## 6. Verifikasi

### Build

```text
npm run type-check  → lolos
npm run build       → lolos
```

### DOM dan interaksi (Puppeteer, build produksi lokal)

| Viewport | Overflow | Font | Console | Input tanpa label | Border kiri berwarna |
|---|---|---|---|---|---|
| 390 | tidak | loaded | 0 error | 0 | 0 |
| 768 | tidak | loaded | 0 error | 0 | 0 |
| 1440 | tidak | loaded | 0 error | 0 | 0 |

- `Catat set`: 3 → 4 baris; volume 1.100 → 1.512,5 kg.
- Dialog: terbuka, `aria-labelledby`/`aria-describedby` terpasang, Escape
  menutup, fokus kembali ke trigger.
- Sheet: terbuka dan Escape menutup.
- Focus ring input terukur `0 0 0 3px rgba(194,65,12,.38)`.

### Lighthouse style guide

| Form factor | Performance | Accessibility | Best practices | SEO |
|---|---:|---:|---:|---:|
| Mobile | 86 | **100** | 100 | 63 |
| Desktop | **100** | **100** | 100 | 63 |

- Mobile TBT 560 ms, CLS 0,05, LCP 0,8 s, transfer 254 KiB.
- Performance 86 adalah **halaman demo** yang merender seluruh field manual
  (899 node). Ini bukan route produksi dan tidak masuk target aplikasi.
- SEO 63 disengaja: `/style-guide` diblokir robots dan bukan halaman publik.

### Regresi halaman lama

`/` dan `/auth/sign-in`:

- tetap memakai system mono;
- 0 request font;
- 0 console error;
- tidak ada overflow 390 px.

### Bundle

| Ukuran | Baseline | Fase 1 | Delta |
|---|---:|---:|---:|
| Initial JS gzip | 107,67 KB | **108,69 KB** | +1,02 KB |
| Initial CSS gzip | 4,77 KB | **6,51 KB** | +1,74 KB |
| Style guide JS + CSS gzip | — | 17,36 + 6,39 KB | lazy |
| Font | 0 | 0 legacy / 106,1 KB style guide | on demand |
| Total `dist` gzip | 166,9 KB | 306,7 KB | termasuk font + lisensi |

---

## 7. Perubahan file

| File | Perubahan |
|---|---|
| `DESIGN.md` | kesepakatan desain yang mengikat + larangan eksplisit |
| `src/styles/tokens.css` | token, font-face, browser surfaces |
| `src/styles/ui-v2.css` | field chrome bersama |
| `src/components/ui-v2/*` | 21 primitif + 2 composable + types |
| `src/views/StyleGuideView.vue` | field manual + specimen hidup |
| `src/router/index.ts` | route `/style-guide` |
| `src/main.ts` | import tokens/ui-v2 |
| `tailwind.config.js` | token warna/font/radius/shadow; legacy mono tetap sistem |
| `index.html` | `lang`, title, meta description, theme-color, light scheme |
| `public/_headers` | asset/font immutable, HTML revalidate, security headers |
| `public/robots.txt` | robots valid; disallow `/app` dan `/style-guide` |
| `package.json` | `@lucide/vue` |

---

## 8. Batasan dan berikutnya

1. Halaman produksi belum memakai token/font baru; fase 2 mulai dari AppShell
   dan Home/Today.
2. Preload font belum dipasang; ukur ulang LCP/CLS setelah diterapkan.
3. Style guide performance mobile 86 karena kepadatan specimen; bukan target
   route aplikasi.
4. Baseline halaman terautentikasi masih menunggu akun uji + Neon branch.
5. Fase 2 harus mengikuti `DESIGN.md`, termasuk larangan kicker, section
   numbers, left bars, dan kartu seragam.

Sudah di-commit sebagai `7e6c0de`. Belum ada deploy.
