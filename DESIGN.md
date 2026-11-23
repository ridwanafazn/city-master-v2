# JYMZ design agreement — Signal Editorial

Status: **locked for UI/UX v2 phase 1**
Tanggal: **2026-11-23**
Branch: `feat/ui-v2`
Berlaku untuk: seluruh halaman aplikasi, auth/onboarding, dan public
recommendation flow.

Dokumen ini sengaja lebih spesifik daripada “clean, modern, calm”. Jika sebuah
keputusan tidak bisa dijelaskan lewat aturan di bawah, keputusan itu belum
matang.

---

## 1. Dunia visual

JYMZ adalah **catatan latihan lapangan**, bukan dashboard SaaS.

Bayangkan tiga benda yang dipakai orang benar-benar di gym:

1. log latihan kertas yang diisi dengan pulpen, dengan kolom set, beban, reps,
   RPE, dan catatan;
2. program latihan tercetak yang ditempel di dinding, dengan hari dan exercise
   yang harus dibaca cepat;
3. papan sinyal/scoreboard sederhana: satu angka penting, satu status, satu
   aksi.

Dari situ lahir **Signal Editorial**:

- paper hangat, ink tegas, hairline seperti tabel cetak;
- orange sebagai sinyal aksi/status live, bukan hiasan;
- biru hanya untuk metrik terukur;
- hijau hanya untuk readiness, PR, dan keberhasilan;
- angka selalu tabular dan sejajar;
- ruang kosong dipakai untuk memisahkan kelompok, bukan untuk memperbesar kartu.

**Anti-reference:** landing page SaaS dengan gradient blob, tiga kartu fitur
seragam, empat kartu statistik, hero metric besar, glassmorphism, atau deretan
pill tanpa hierarki.

---

## 2. Mode per surface

| Surface | Mode | Sukses berarti |
|---|---|---|
| Home / Today | Operate | Pengguna tahu set berikutnya dalam < 3 detik |
| Plans | Operate | Plan terbaca sebagai program, bukan katalog kartu |
| Workout execution | Operate | Satu exercise fokus, input set cepat, istirahat jelas |
| Progress | Read + Operate | Tren dan PR terbaca seperti review editorial |
| Profile / onboarding | Operate | Satu keputusan per langkah, progress terlihat |
| Public recommendation | Persuade + Operate | Input jelas, proses transparan, hasil bisa dipercaya |
| Style guide / docs | Read | Aturan dan specimen bisa dipindai, bukan galeri komponen |

---

## 3. Aturan yang mengikat

### Tipografi

- **Bricolage Grotesque** hanya untuk display, page title, dan angka besar.
- **Public Sans** untuk body, form, instruction, dan tombol.
- **JetBrains Mono** hanya untuk data, satuan, ID, timestamp, dan label
  metadata pendek. Mono tidak boleh dipakai untuk paragraf.
- Body measure 65–75ch. Display tracking tidak lebih rapat dari `-0.035em`.
- Jangan memakai uppercase untuk kalimat. Uppercase hanya untuk label data
  pendek.
- Angka yang bisa berubah memakai `font-variant-numeric: tabular-nums`.

### Warna

- `#D9480F` adalah _accent_; jangan dipakai untuk teks kecil di paper.
- Teks dan CTA memakai `#C2410C` (5,18:1 dengan putih).
- Orange hanya untuk aksi utama, status live, PR, atau peringatan yang butuh
  perhatian.
- Biru hanya untuk metrik/data. Hijau hanya untuk readiness/success. Merah
  hanya untuk danger/error.
- Tidak ada gradient text, gradient dekoratif, atau warna yang tidak membawa
  makna.
- Status tidak boleh hanya dibedakan lewat warna; selalu ada teks atau ikon.

### Layout

- Grid 12 kolom, max width 1240 px, gutter 16/32 px.
- Gunakan **tabel/rule** untuk data berulang; gunakan kartu hanya untuk unit
  yang memang berdiri sendiri.
- Jangan menaruh kartu di dalam kartu.
- Jangan memakai empat kartu statistik seragam sebagai struktur halaman.
- Satu CTA utama per viewport. Offset shadow hanya untuk CTA hero.
- Default card: 1 px border, tanpa shadow. Shadow hanya untuk panel yang
  benar-benar mengambang.
- Radius: 10 px control, 12 px card, 999 px pill. Pill hanya untuk kontrol
  kecil.
- Jarak antar kelompok lebih besar daripada jarak di dalam kelompok.

### Komponen dan state

- Setiap form control punya label terlihat; placeholder bukan label.
- Hint muncul sebelum error. Error menyebut masalah dan pemulihannya.
- Target sentuh minimal 44×44 px. Focus ring harus terlihat.
- Setiap state punya teks: loading, empty, error, offline, success, disabled.
- Toast/error/wake banner memakai border penuh + tint; **tidak** memakai
  border kiri berwarna.
- Dialog/Sheet memakai native `<dialog>` untuk focus trap, Escape, dan
  pengembalian fokus.
- Ikon hanya Lucide, stroke konsisten, tanpa emoji/glyph Unicode sebagai ikon.

### Motion

- Duration 160–240 ms; easing entrance `cubic-bezier(.2,.8,.2,1)`.
- Satu momen yang disengaja per layar. Contoh: baris set baru masuk dengan
  fade + 8 px, bukan setiap section punya entrance yang sama.
- Hanya transform/opacity/color. Jangan menganimasikan width, height, top,
  left, atau box-shadow.
- Hormati `prefers-reduced-motion`.

### Copy

- Bahasa Indonesia, langsung, memakai istilah gym: set, repetisi, beban, RPE,
  tempo, istirahat, readiness, PR.
- Tombol menyebut aksi: “Catat set”, “Simpan plan”, “Hapus plan”.
- Hindari kata generik tanpa bukti: “seamless”, “delightful”, “calm”,
  “next-generation”.
- Jangan menampilkan CTA palsu di halaman dokumentasi.

---

## 4. Larangan keras

Ini bukan preferensi. Pelanggaran harus diperbaiki sebelum review:

1. Eyebrow/kicker di atas heading.
2. Nomor section dekoratif (`01 /`, `02 /`) tanpa urutan yang benar-benar
   dibutuhkan pembaca.
3. Border kiri berwarna pada kartu/status.
4. Grid overlay di hero tanpa alat ukur/blueprint nyata di bawahnya.
5. Empat kartu statistik seragam sebagai struktur halaman.
6. Kartu di dalam kartu.
7. Monospace untuk paragraf panjang.
8. Emoji atau glyph Unicode sebagai ikon.
9. Gradient text, glassmorphism, atau shadow tebal tanpa alasan dunia.
10. Fake CTA atau tombol yang tidak melakukan apa pun di halaman dokumentasi.
11. Klaim performa/angka yang tidak punya sumber; nilai contoh harus diberi
    label “contoh data”.

---

## 5. Penerapan fase 1

- Token: `src/styles/tokens.css`
- Font self-host: `public/fonts/` (Latin subset, OFL)
- Primitif: `src/components/ui-v2/`
- Specimen: `/style-guide`
- Bukti dan batasan: `docs/ui-ux-v2-phase-1.md`

Halaman produksi belum dimigrasi. Fase 2 mulai dari AppShell dan Home/Today,
dengan aturan ini sebagai acceptance criteria.
