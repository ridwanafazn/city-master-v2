<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Trash2,
} from '@lucide/vue'
import {
  AppButton,
  AppCheckbox,
  AppInput,
  AppSelect,
  AppTextarea,
  Badge,
  Card,
  Chip,
  Dialog,
  EmptyState,
  ErrorState,
  IconButton,
  RadioGroup,
  SectionHeader,
  SegmentedControl,
  ServerWakeBanner,
  Sheet,
  Skeleton,
  StatTile,
  Tabs,
  Toast,
  type TabItem,
  type UiOption,
} from '../components/ui-v2'

interface LoggedSet {
  id: number
  exercise: string
  reps: number
  load: number
  rpe: number
  rest: string
}

interface PlanRow {
  exercise: string
  sets: string
  load: string
  note: string
}

const initialSets: LoggedSet[] = [
  { id: 1, exercise: 'Back squat', reps: 5, load: 80, rpe: 8, rest: '150 s' },
  { id: 2, exercise: 'Back squat', reps: 5, load: 80, rpe: 8, rest: '150 s' },
  { id: 3, exercise: 'Bench press', reps: 5, load: 60, rpe: 7, rest: '120 s' },
]
const loggedSets = ref<LoggedSet[]>(initialSets.map((set) => ({ ...set })))
const newestSetId = ref<number | null>(null)
let nextSetId = 4

const nextSet = { exercise: 'Back squat', reps: 5, load: 82.5, rpe: 8, rest: '150 s' }
const canLogSet = computed(() => loggedSets.value.length < 6)
const volumeLabel = computed(() =>
  new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(
    loggedSets.value.reduce((total, set) => total + set.reps * set.load, 0),
  ),
)

const indexItems = [
  { id: 'specimen', label: 'Specimen' },
  { id: 'type', label: 'Type' },
  { id: 'palette', label: 'Palette' },
  { id: 'controls', label: 'Controls' },
  { id: 'forms', label: 'Forms' },
  { id: 'data', label: 'Data & navigation' },
  { id: 'states', label: 'States' },
  { id: 'overlays', label: 'Overlays' },
  { id: 'specs', label: 'Specs' },
  { id: 'rules', label: 'Rules' },
]

const colophon = [
  ['Edisi', '01 · fase 1'],
  ['Status', 'Fondasi / belum di produksi'],
  ['Rute', '/style-guide'],
  ['Display', 'Bricolage Grotesque'],
  ['Body', 'Public Sans'],
  ['Data', 'JetBrains Mono'],
  ['Paper', '#F8F7F4'],
  ['Signal', '#C2410C untuk teks & CTA'],
  ['Gerak', '160–240 ms'],
]

const typeRows = [
  {
    role: 'Display 1',
    token: '--text-display-1',
    sample: 'Beban naik.',
    cls: 'fm-type-display-1',
    spec: '40–64 px · Bricolage 750 · -0,035em',
  },
  {
    role: 'Display 2',
    token: '--text-display-2',
    sample: 'Minggu ke-3 / lower strength',
    cls: 'fm-type-display-2',
    spec: '32–44 px · Bricolage 700',
  },
  {
    role: 'Heading',
    token: '--text-h2',
    sample: 'Catatan sesi',
    cls: 'fm-type-h2',
    spec: '24 px · Bricolage 700',
  },
  {
    role: 'Body',
    token: '--text-body',
    sample: 'Tambahkan beban 2,5 kg jika semua repetisi bersih dan RPE tetap di bawah 9.',
    cls: 'fm-type-body',
    spec: '16 px · Public Sans 400 · measure 65–75ch',
  },
  {
    role: 'Data',
    token: '--font-data',
    sample: '82,5 kg × 5 · RPE 8 · 150 s',
    cls: 'type-data',
    spec: 'JetBrains Mono · tabular nums',
  },
  {
    role: 'Label',
    token: '--text-label',
    sample: 'WAKTU ISTIRAHAT',
    cls: 'type-label',
    spec: '12 px · mono · hanya untuk metadata',
  },
]

const palette = [
  { name: 'Paper', token: '--color-paper', hex: '#F8F7F4', use: 'Permukaan utama', rule: 'Bukan untuk teks.' },
  { name: 'Ink', token: '--color-ink', hex: '#14160F', use: 'Teks dan aturan', rule: 'Kontras 17:1 di paper.' },
  { name: 'Muted', token: '--color-muted', hex: '#5A5E4E', use: 'Teks sekunder', rule: '6,2:1 di paper.' },
  { name: 'Line', token: '--color-line', hex: '#D9DED1', use: 'Hairline', rule: 'Bukan pengganti hierarki.' },
  { name: 'Surface', token: '--color-surface', hex: '#F1F2EC', use: 'Panel sekunder', rule: 'Untuk grouping, bukan dekorasi.' },
  { name: 'Signal', token: '--color-signal', hex: '#D9480F', use: 'Aksen/live', rule: 'Jangan untuk teks kecil.' },
  {
    name: 'Signal strong',
    token: '--color-signal-strong',
    hex: '#C2410C',
    use: 'CTA dan teks signal',
    rule: '5,18:1 dengan putih.',
  },
  { name: 'Data blue', token: '--color-data', hex: '#2563EB', use: 'Metrik terukur', rule: 'Bukan untuk CTA.' },
  { name: 'Success', token: '--color-success', hex: '#4D7C0F', use: 'Readiness/PR', rule: 'Selalu dengan teks.' },
  { name: 'Warning', token: '--color-warning', hex: '#B45309', use: 'Peringatan', rule: 'Bukan error.' },
  { name: 'Danger', token: '--color-danger', hex: '#B42318', use: 'Error/hapus', rule: 'Tindakan destruktif.' },
]

const dayOptions: UiOption[] = [
  { value: '2', label: '2 hari' },
  { value: '3', label: '3 hari' },
  { value: '4', label: '4 hari' },
  { value: '5', label: '5 hari' },
]
const goalOptions: UiOption[] = [
  { value: 'muscle_gain', label: 'Muscle gain', description: 'Volume dan hipertrofi.' },
  { value: 'fat_loss', label: 'Fat loss', description: 'Resistance + cardio.' },
  { value: 'general_health', label: 'General health', description: 'Seimbang dan berkelanjutan.' },
]
const experienceOptions: UiOption[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]
const rangeOptions: UiOption[] = [
  { value: '7d', label: '7 hari' },
  { value: '30d', label: '30 hari' },
  { value: '90d', label: '90 hari' },
]
const wakeOptions: UiOption[] = [
  { value: 'connecting', label: 'Connecting' },
  { value: 'waking', label: 'Waking' },
  { value: 'offline', label: 'Offline' },
]
const injuryOptions = ['Knee', 'Shoulder', 'Lower back', 'Wrist']

const planTabs: TabItem[] = [
  { id: 'push', label: 'Push', count: 5 },
  { id: 'pull', label: 'Pull', count: 4 },
  { id: 'legs', label: 'Legs', count: 5 },
]
const planRows: Record<string, PlanRow[]> = {
  push: [
    { exercise: 'Dumbbell bench press', sets: '3 × 5', load: '60 kg', note: 'RPE 7–8' },
    { exercise: 'Overhead press', sets: '3 × 8', load: '30 kg', note: 'Tempo 2-0-1' },
    { exercise: 'Cable fly', sets: '3 × 12', load: '15 kg', note: 'Istirahat 75 s' },
  ],
  pull: [
    { exercise: 'Deadlift', sets: '3 × 5', load: '100 kg', note: 'RPE 8' },
    { exercise: 'Chest-supported row', sets: '3 × 8', load: '50 kg', note: 'Tempo 2-1-1' },
    { exercise: 'Face pull', sets: '3 × 15', load: '20 kg', note: 'Istirahat 60 s' },
  ],
  legs: [
    { exercise: 'Back squat', sets: '3 × 5', load: '80 kg', note: 'RPE 8' },
    { exercise: 'Romanian deadlift', sets: '3 × 8', load: '70 kg', note: 'Hinge, bukan squat' },
    { exercise: 'Calf raise', sets: '3 × 12', load: '40 kg', note: 'Pause 1 s' },
  ],
}
const activePlan = ref('pull')
const activePlanRows = computed(() => planRows[activePlan.value] ?? [])

const sessions = [
  { date: '21 Nov', focus: 'Lower strength', sets: 18, volume: '8.420 kg', duration: '58 m' },
  { date: '19 Nov', focus: 'Push', sets: 15, volume: '6.180 kg', duration: '46 m' },
  { date: '16 Nov', focus: 'Pull', sets: 16, volume: '7.040 kg', duration: '51 m' },
]

const spacings = [
  { token: '--space-1', px: 4 },
  { token: '--space-2', px: 8 },
  { token: '--space-3', px: 12 },
  { token: '--space-4', px: 16 },
  { token: '--space-5', px: 24 },
  { token: '--space-6', px: 32 },
  { token: '--space-7', px: 48 },
  { token: '--space-8', px: 64 },
]
const radii = [
  { token: '--radius-control', px: '10px', label: 'Control' },
  { token: '--radius-card', px: '12px', label: 'Card' },
  { token: '--radius-pill', px: '999px', label: 'Pill' },
]
const motions = [
  { token: '--motion-fast', value: '160 ms', use: 'Hover, focus, warna' },
  { token: '--motion-base', value: '200 ms', use: 'Set masuk, dialog, sheet' },
  { token: '--motion-slow', value: '240 ms', use: 'Perpindahan halaman' },
]

const doRules = [
  'Heading membawa maknanya sendiri; tanpa kicker di atasnya.',
  'Tabel untuk data berulang: set, beban, repetisi, RPE, volume.',
  'Satu CTA utama per viewport; offset shadow hanya untuk CTA hero.',
  'Mono hanya untuk data, satuan, ID, dan timestamp.',
  'Warna status selalu disertai teks atau ikon.',
  'Target sentuh 44 px dan focus ring yang terlihat.',
  'Copy menyebut aksi dan konsekuensi: “Catat set”, “Hapus plan”.',
]
const dontRules = [
  'Eyebrow/kicker di atas heading.',
  'Nomor section dekoratif.',
  'Border kiri berwarna pada kartu status.',
  'Grid overlay di hero tanpa alat ukur nyata.',
  'Empat kartu statistik seragam sebagai struktur halaman.',
  'Kartu di dalam kartu.',
  'Mono untuk paragraf panjang.',
  'Emoji atau glyph Unicode sebagai ikon.',
  'Gradient text, glassmorphism, atau shadow tebal tanpa alasan dunia.',
  'CTA palsu di halaman dokumentasi.',
]

const displayName = ref('Ridwan')
const email = ref('operator@jymz.app')
const notes = ref('Fokus ke kontrol tempo dan RPE di set terakhir.')
const goal = ref('muscle_gain')
const experience = ref('intermediate')
const availableDays = ref('3')
const consent = ref(true)
const selectedRange = ref('30d')
const selectedInjuries = ref<string[]>(['Knee'])
const dialogOpen = ref(false)
const sheetOpen = ref(false)
const showToast = ref(true)
const retryCount = ref(0)
const wakeState = ref<'connecting' | 'waking' | 'offline'>('waking')
const lastAction = ref('Belum ada aksi.')

function logSet() {
  if (!canLogSet.value) return
  const next = { id: nextSetId++, ...nextSet }
  loggedSets.value.push(next)
  newestSetId.value = next.id
}

function resetLog() {
  loggedSets.value = initialSets.map((set) => ({ ...set }))
  newestSetId.value = null
  nextSetId = 4
}

function toggleInjury(injury: string) {
  if (selectedInjuries.value.includes(injury)) {
    selectedInjuries.value = selectedInjuries.value.filter((item) => item !== injury)
  } else {
    selectedInjuries.value = [...selectedInjuries.value, injury]
  }
}

function onRetry() {
  retryCount.value += 1
  lastAction.value = `Retry dijalankan ${retryCount.value}×.`
}

function onDialogConfirm() {
  dialogOpen.value = false
  lastAction.value = 'Plan dihapus (demo).'
}

function onSheetSave() {
  sheetOpen.value = false
  lastAction.value = 'Sesi disimpan (demo).'
}
</script>

<template>
  <div class="ui-v2-scope fm">
    <a class="fm-skip" href="#main">Lewati ke konten</a>

    <header class="fm-top">
      <div class="fm-top__brand">
        <RouterLink to="/" class="fm-logo">JYMZ</RouterLink>
        <span class="fm-top__edition">Field manual / edisi 01</span>
      </div>
      <RouterLink to="/" class="fm-back">
        <ArrowLeft :size="16" aria-hidden="true" />
        Kembali ke app
      </RouterLink>
    </header>

    <div class="fm-shell">
      <aside class="fm-index">
        <nav aria-label="Isi field manual">
          <a v-for="item in indexItems" :key="item.id" :href="`#${item.id}`">{{ item.label }}</a>
        </nav>
      </aside>

      <main id="main" class="fm-main">
        <section class="fm-masthead" aria-labelledby="fm-title">
          <div class="fm-masthead__copy">
            <h1 id="fm-title">
              Latihan adalah data.
              <span>Desain harus terasa seperti catatan lapangan.</span>
            </h1>
            <p class="fm-lede">
              JYMZ dipakai di antara set: tangan basah, sisa istirahat 40 detik, dan
              keputusan yang harus terbaca sebelum waktu habis. Bahasa visual ini
              dibuat untuk momen itu, bukan untuk tangkapan layar portofolio.
            </p>
          </div>

          <table class="fm-colophon">
            <caption class="fm-sr-only">Spesifikasi field manual</caption>
            <tbody>
              <tr v-for="[label, value] in colophon" :key="label">
                <th scope="row">{{ label }}</th>
                <td>{{ value }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section id="specimen" class="fm-section">
          <SectionHeader
            title="Specimen: satu sesi, dari rencana sampai set terakhir"
            description="Tabel lebih cepat dibanding kartu ketika angka harus dibandingkan. Kartu dipakai hanya untuk unit yang memang berdiri sendiri."
          />

          <div class="fm-specimen">
            <article class="fm-workout" aria-labelledby="workout-title">
              <header class="fm-workout__head">
                <div>
                  <h3 id="workout-title">Lower strength / Day 2</h3>
                  <p class="fm-workout__meta-line">Minggu ke-3 · 5 latihan · target 55 menit</p>
                </div>
                <Badge variant="success" dot>Live</Badge>
              </header>

              <div class="fm-readiness">
                <div>
                  <span class="fm-label">Readiness</span>
                  <strong>82</strong>
                </div>
                <div>
                  <span class="fm-label">Tidur</span>
                  <strong>7j 20m</strong>
                </div>
                <div>
                  <span class="fm-label">HRV</span>
                  <strong>64 ms</strong>
                </div>
              </div>

              <div class="fm-table-scroll">
                <table class="fm-log">
                  <caption class="fm-sr-only">Set yang sudah dicatat pada sesi ini</caption>
                  <thead>
                    <tr>
                      <th scope="col">Set</th>
                      <th scope="col">Latihan</th>
                      <th scope="col">Reps</th>
                      <th scope="col">Beban</th>
                      <th scope="col">RPE</th>
                      <th scope="col">Istirahat</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="set in loggedSets"
                      :key="set.id"
                      :class="{ 'fm-set--new': set.id === newestSetId }"
                    >
                      <td>{{ set.id }}</td>
                      <td>{{ set.exercise }}</td>
                      <td>{{ set.reps }}</td>
                      <td>{{ set.load }} kg</td>
                      <td>{{ set.rpe }}</td>
                      <td>{{ set.rest }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <footer class="fm-workout__footer">
                <div>
                  <span class="fm-label">Volume sesi</span>
                  <strong class="type-data" aria-live="polite">{{ volumeLabel }} kg</strong>
                </div>
                <div class="fm-actions">
                  <AppButton size="sm" :disabled="!canLogSet" @click="logSet">
                    <Plus :size="16" aria-hidden="true" />
                    {{ canLogSet ? 'Catat set' : 'Sesi penuh' }}
                  </AppButton>
                  <AppButton size="sm" variant="ghost" @click="resetLog">Reset</AppButton>
                </div>
              </footer>
            </article>

            <aside class="fm-notes">
              <h3>Kenapa tabel, bukan kartu</h3>
              <p>
                Set adalah baris yang berulang. Tabel menjaga kolom beban, reps, dan RPE
                tetap sejajar, sehingga mata bisa membandingkan tanpa membaca ulang.
                Kartu memecah perbandingan itu.
              </p>
              <dl class="fm-notes__list">
                <div>
                  <dt>Angka</dt>
                  <dd>Tabular, mono, satuan menempel pada nilai.</dd>
                </div>
                <div>
                  <dt>Aksi</dt>
                  <dd>Satu tombol utama: Catat set. Reset adalah aksi sekunder.</dd>
                </div>
                <div>
                  <dt>Gerak</dt>
                  <dd>Baris baru masuk dengan fade + 8 px, 200 ms. Tidak ada efek lain.</dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>

        <section id="type" class="fm-section">
          <SectionHeader
            title="Type"
            description="Display untuk pernyataan; body untuk instruksi; mono hanya untuk beban, repetisi, waktu, dan ID. Mono tidak dipakai untuk paragraf."
          />

          <div class="fm-type-statement">
            <p>Kalau angkanya salah, latihannya salah.</p>
            <span>Bricolage Grotesque · display 750</span>
          </div>

          <div class="fm-table-scroll">
            <table class="fm-table fm-type-table">
              <caption class="fm-sr-only">Skala tipografi</caption>
              <thead>
                <tr>
                  <th scope="col">Peran</th>
                  <th scope="col">Contoh</th>
                  <th scope="col">Spesifikasi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in typeRows" :key="row.token">
                  <td>
                    <span class="fm-role">{{ row.role }}</span>
                    <code>{{ row.token }}</code>
                  </td>
                  <td><span :class="row.cls">{{ row.sample }}</span></td>
                  <td class="fm-spec">{{ row.spec }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="palette" class="fm-section">
          <SectionHeader
            title="Palette"
            description="Signal hanya untuk aksi dan status live. Data biru untuk metrik terukur. Hijau untuk readiness dan PR. Tidak ada warna yang dipakai hanya untuk dekorasi."
          />

          <div class="fm-table-scroll">
            <table class="fm-table fm-palette">
              <caption class="fm-sr-only">Token warna dan aturannya</caption>
              <thead>
                <tr>
                  <th scope="col">Warna</th>
                  <th scope="col">Token</th>
                  <th scope="col">Pakai</th>
                  <th scope="col">Aturan</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="color in palette" :key="color.token">
                  <td>
                    <span class="fm-swatch" :style="{ background: color.hex }" aria-hidden="true" />
                    <span class="fm-color-name">{{ color.name }}</span>
                    <code>{{ color.hex }}</code>
                  </td>
                  <td><code>{{ color.token }}</code></td>
                  <td>{{ color.use }}</td>
                  <td class="fm-spec">{{ color.rule }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="fm-callout">
            <strong>Ambang kontras:</strong> #D9480F hanya 4,01:1 di paper. Teks
            dan CTA memakai #C2410C; putih di atasnya 5,18:1.
          </p>
        </section>

        <section id="controls" class="fm-section">
          <SectionHeader
            title="Controls"
            description="Satu aksi utama per viewport. Tombol hero memakai offset shadow; tombol lain hanya border dan perubahan warna."
          />

          <div class="fm-controls">
            <div class="fm-control-row">
              <span class="fm-control-row__label">Aksi utama</span>
              <div class="fm-control-row__items">
                <AppButton>
                  <Plus :size="16" aria-hidden="true" />
                  Catat set
                </AppButton>
                <AppButton loading>Menyimpan set…</AppButton>
                <AppButton disabled>Disabled</AppButton>
              </div>
            </div>
            <div class="fm-control-row">
              <span class="fm-control-row__label">Sekunder</span>
              <div class="fm-control-row__items">
                <AppButton variant="secondary">Lihat riwayat</AppButton>
                <AppButton variant="ghost">Lewati</AppButton>
                <AppButton variant="secondary" size="sm">Detail</AppButton>
              </div>
            </div>
            <div class="fm-control-row">
              <span class="fm-control-row__label">Destruktif</span>
              <div class="fm-control-row__items">
                <AppButton variant="danger">
                  <Trash2 :size="16" aria-hidden="true" />
                  Hapus plan
                </AppButton>
                <IconButton label="Hapus set" variant="danger">
                  <Trash2 :size="20" />
                </IconButton>
              </div>
            </div>
            <div class="fm-control-row">
              <span class="fm-control-row__label">Icon-only</span>
              <div class="fm-control-row__items">
                <IconButton label="Cari latihan">
                  <Search :size="20" />
                </IconButton>
                <IconButton label="Filter equipment" variant="secondary">
                  <SlidersHorizontal :size="20" />
                </IconButton>
                <IconButton label="Pengaturan sesi">
                  <Settings :size="20" />
                </IconButton>
              </div>
            </div>
            <div class="fm-control-row">
              <span class="fm-control-row__label">Status</span>
              <div class="fm-control-row__items">
                <Badge variant="neutral">Draft</Badge>
                <Badge variant="signal" dot>Aktif</Badge>
                <Badge variant="data">Volume</Badge>
                <Badge variant="success" dot>Ready</Badge>
                <Badge variant="warning">Cedera</Badge>
                <Badge variant="danger">Gagal</Badge>
                <Badge variant="outline">Manual</Badge>
              </div>
            </div>
            <div class="fm-control-row">
              <span class="fm-control-row__label">Hero CTA</span>
              <div class="fm-control-row__items">
                <AppButton hero>
                  Mulai sesi
                  <ArrowRight :size="18" aria-hidden="true" />
                </AppButton>
                <span class="fm-inline-note">Offset shadow hanya di sini.</span>
              </div>
            </div>
          </div>
        </section>

        <section id="forms" class="fm-section">
          <SectionHeader
            title="Forms"
            description="Label selalu terlihat. Hint menjelaskan sebelum error muncul. Error menyebut masalah dan pemulihannya, bukan sekadar “invalid”."
          />

          <div class="fm-form-layout">
            <div class="fm-form-sheet">
              <div class="fm-form-grid">
                <AppInput
                  v-model="displayName"
                  label="Nama tampilan"
                  hint="Muncul di header sesi."
                  autocomplete="name"
                />
                <AppInput
                  v-model="email"
                  label="Email"
                  type="email"
                  autocomplete="email"
                  error="Email belum diverifikasi. Cek inbox atau kirim ulang."
                />
                <AppSelect
                  v-model="availableDays"
                  label="Hari tersedia"
                  :options="dayOptions"
                  hint="Plan akan memakai jumlah ini."
                />
                <AppSelect v-model="experience" label="Level" :options="experienceOptions" />
                <div class="fm-form-grid__full">
                  <AppTextarea
                    v-model="notes"
                    label="Catatan sesi"
                    hint="Maksimal 2.000 karakter. RPE boleh dikosongkan."
                    :rows="3"
                  />
                </div>
                <div class="fm-form-grid__full">
                  <RadioGroup v-model="goal" label="Tujuan latihan" :options="goalOptions" />
                </div>
                <div class="fm-form-grid__full">
                  <AppCheckbox
                    v-model="consent"
                    label="Saya setuju pemrosesan data kesehatan"
                    description="Diperlukan untuk menyimpan cedera dan menghasilkan plan yang aman."
                  />
                </div>
              </div>
            </div>

            <aside class="fm-form-notes">
              <h3>Aturan form</h3>
              <ol>
                <li>Label di luar placeholder; placeholder bukan label.</li>
                <li>Hint dulu, error kemudian.</li>
                <li>Angka dan satuan memakai mono/tabular.</li>
                <li>Target sentuh 44 px, focus ring terlihat.</li>
                <li>Tombol menyebut aksi: “Simpan plan”, bukan “Submit”.</li>
              </ol>
              <div class="fm-form-sample">
                <AppSelect v-model="availableDays" label="Hari tersedia" :options="dayOptions" />
                <SegmentedControl v-model="selectedRange" label="Rentang progres" :options="rangeOptions" />
                <div class="fm-chips">
                  <Chip
                    v-for="injury in injuryOptions"
                    :key="injury"
                    :selected="selectedInjuries.includes(injury)"
                    @toggle="toggleInjury(injury)"
                  >
                    {{ injury }}
                  </Chip>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section id="data" class="fm-section">
          <SectionHeader
            title="Data & navigation"
            description="Stat tile dipakai satu per konteks, bukan empat kotak seragam. Tabs membawa nama hari; isi panel tetap tabel latihan."
          />

          <div class="fm-data-layout">
            <div class="fm-data-main">
              <StatTile
                label="Volume minggu ini"
                :value="8420"
                unit="kg"
                :trend="{ direction: 'up', label: '+8,4% vs minggu lalu', tone: 'positive' }"
              >
                <template #icon><Activity :size="20" /></template>
              </StatTile>

              <div class="fm-table-scroll">
                <table class="fm-table fm-session-table">
                  <caption class="fm-sr-only">Sesi terakhir (contoh data)</caption>
                  <thead>
                    <tr>
                      <th scope="col">Tanggal</th>
                      <th scope="col">Fokus</th>
                      <th scope="col">Set</th>
                      <th scope="col">Volume</th>
                      <th scope="col">Durasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="session in sessions" :key="session.date">
                      <td>{{ session.date }}</td>
                      <td>{{ session.focus }}</td>
                      <td>{{ session.sets }}</td>
                      <td>{{ session.volume }}</td>
                      <td>{{ session.duration }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <Card padding="none">
              <template #header>
                <div class="fm-card-head">
                  <span class="fm-label">Next session</span>
                  <Badge variant="data">Day 2</Badge>
                </div>
              </template>
              <div class="fm-plan-tabs">
                <Tabs v-model="activePlan" :tabs="planTabs" label="Hari plan">
                  <div class="fm-plan-table">
                    <div v-for="row in activePlanRows" :key="row.exercise" class="fm-plan-row">
                      <div>
                        <strong>{{ row.exercise }}</strong>
                        <span>{{ row.note }}</span>
                      </div>
                      <span class="type-data">{{ row.sets }}</span>
                      <span class="type-data">{{ row.load }}</span>
                    </div>
                  </div>
                </Tabs>
              </div>
              <template #footer>
                <div class="fm-card-foot">
                  <span class="fm-label">5 latihan · 55 menit</span>
                  <AppButton size="sm" @click="lastAction = 'Mulai sesi (demo).'">Mulai sesi</AppButton>
                </div>
              </template>
            </Card>
          </div>
        </section>

        <section id="states" class="fm-section">
          <SectionHeader
            title="States"
            description="Status tidak hanya warna. Setiap state punya kalimat, ikon, dan jalur pemulihan. Tidak ada border kiri berwarna; gunakan border penuh dan tint."
          />

          <div class="fm-state-list">
            <div class="fm-state-row">
              <span class="fm-control-row__label">Server bangun</span>
              <div>
                <ServerWakeBanner
                  :state="wakeState"
                  :elapsed-seconds="wakeState === 'waking' ? 12 : undefined"
                  :can-retry="wakeState !== 'connecting'"
                  @retry="onRetry"
                />
                <div class="fm-state-tools">
                  <SegmentedControl v-model="wakeState" label="Status server" :options="wakeOptions" />
                  <span class="type-data fm-muted">{{ lastAction }}</span>
                </div>
              </div>
            </div>

            <div class="fm-state-row">
              <span class="fm-control-row__label">Set offline</span>
              <div class="fm-state-stack">
                <Toast
                  v-if="showToast"
                  title="Koneksi terputus"
                  message="2 set menunggu sinkronisasi. Tetap bisa mencatat; antrean dikirim saat online."
                  variant="offline"
                  @dismiss="showToast = false"
                />
                <AppButton v-else variant="secondary" size="sm" @click="showToast = true">
                  Tampilkan lagi
                </AppButton>
                <Toast
                  title="Set tersimpan"
                  message="Volume sesi diperbarui menjadi 2.312,5 kg."
                  variant="success"
                  :dismissible="false"
                />
              </div>
            </div>

            <div class="fm-state-row">
              <span class="fm-control-row__label">Plan kosong</span>
              <EmptyState
                title="Belum ada plan tersimpan"
                description="Buat plan pertama dari profil, equipment, dan cedera Anda."
              >
                <template #icon><CalendarDays :size="24" /></template>
                <template #action>
                  <AppButton @click="lastAction = 'Buat plan (demo).'">
                    <Plus :size="16" aria-hidden="true" />
                    Buat plan
                  </AppButton>
                </template>
              </EmptyState>
            </div>

            <div class="fm-state-row">
              <span class="fm-control-row__label">Gagal memuat</span>
              <ErrorState
                title="Plan gagal dimuat"
                message="Server belum merespons. Draft plan tetap tersimpan; coba lagi."
                request-id="req_8f2c1a"
                @retry="onRetry"
              />
            </div>

            <div class="fm-state-row">
              <span class="fm-control-row__label">Menyiapkan</span>
              <div class="fm-skeleton-card">
                <Skeleton width="38%" height="0.75rem" />
                <Skeleton width="64%" height="1.5rem" />
                <Skeleton :lines="3" height="0.75rem" />
              </div>
            </div>
          </div>
        </section>

        <section id="overlays" class="fm-section">
          <SectionHeader
            title="Overlays"
            description="Dialog untuk keputusan yang menghentikan alur; sheet untuk aksi mobile. Keduanya native dialog: focus trap, Escape, dan pengembalian fokus sudah dari browser."
          />

          <div class="fm-overlay-row">
            <AppButton variant="danger" @click="dialogOpen = true">Hapus plan</AppButton>
            <AppButton variant="secondary" @click="sheetOpen = true">Selesaikan sesi</AppButton>
            <span class="type-data fm-muted">{{ lastAction }}</span>
          </div>
        </section>

        <section id="specs" class="fm-section">
          <SectionHeader
            title="Specs"
            description="8pt scale, radius 10/12/999, shadow tipis, dan motion 160–240 ms. Semua animasi menghormati prefers-reduced-motion."
          />

          <div class="fm-specs">
            <div class="fm-spec-block">
              <h3>Spacing</h3>
              <div class="fm-space-list">
                <div v-for="space in spacings" :key="space.token" class="fm-space-row">
                  <code>{{ space.token }}</code>
                  <span class="fm-space-bar" :style="{ width: `${space.px}px` }" />
                  <span class="type-data">{{ space.px }}px</span>
                </div>
              </div>
            </div>

            <div class="fm-spec-block">
              <h3>Radius & shadow</h3>
              <div class="fm-radius-row">
                <div v-for="radius in radii" :key="radius.token" class="fm-radius-item">
                  <div class="fm-radius-box" :style="{ borderRadius: radius.px }" />
                  <span>{{ radius.label }}</span>
                  <code>{{ radius.px }}</code>
                </div>
              </div>
              <div class="fm-shadow-row">
                <div class="fm-shadow fm-shadow--raised">Raised</div>
                <div class="fm-shadow fm-shadow--cta">CTA</div>
              </div>
            </div>

            <div class="fm-spec-block fm-spec-block--full">
              <h3>Motion</h3>
              <div class="fm-table-scroll">
                <table class="fm-table">
                  <caption class="fm-sr-only">Token motion</caption>
                  <thead>
                    <tr>
                      <th scope="col">Token</th>
                      <th scope="col">Nilai</th>
                      <th scope="col">Dipakai untuk</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="motion in motions" :key="motion.token">
                      <td><code>{{ motion.token }}</code></td>
                      <td class="type-data">{{ motion.value }}</td>
                      <td>{{ motion.use }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p class="fm-motion-note">
                Satu momen yang disengaja: baris set baru masuk dengan fade + 8 px.
                Easing <code>cubic-bezier(.2,.8,.2,1)</code>. Tidak ada entrance
                identik di setiap section.
              </p>
            </div>
          </div>
        </section>

        <section id="rules" class="fm-section">
          <SectionHeader
            title="Rules"
            description="Kesepakatan fase 1 yang mengikat. Aturan ini yang mencegah halaman berikutnya kembali menjadi dashboard SaaS generik."
          />

          <div class="fm-rules">
            <div>
              <h3>Gunakan</h3>
              <ul class="fm-rule-list">
                <li v-for="rule in doRules" :key="rule">{{ rule }}</li>
              </ul>
            </div>
            <div>
              <h3>Jangan</h3>
              <ul class="fm-rule-list fm-rule-list--ban">
                <li v-for="rule in dontRules" :key="rule">{{ rule }}</li>
              </ul>
            </div>
          </div>
        </section>

        <footer class="fm-footer">
          <div>
            <p class="fm-footer__title">JYMZ Field Manual / Edisi 01</p>
            <p>
              Fase 1 mengunci token, font, primitif, dan aturan. Halaman produksi
              menyusul di fase 2; style guide ini bukan route yang ditautkan dari
              navigasi.
            </p>
          </div>
          <RouterLink to="/" class="fm-back">
            <ArrowLeft :size="16" aria-hidden="true" />
            Kembali ke app
          </RouterLink>
        </footer>
      </main>
    </div>

    <Dialog
      v-model:open="dialogOpen"
      title="Hapus plan ini?"
      description="Plan dan riwayat yang terkait akan dihapus permanen. Tindakan ini tidak bisa dibatalkan."
      tone="danger"
      confirm-label="Hapus plan"
      @confirm="onDialogConfirm"
    />

    <Sheet v-model:open="sheetOpen" title="Selesaikan sesi" description="Ringkasan sebelum disimpan.">
      <div class="fm-sheet-summary">
        <div><span class="fm-label">Set</span><strong>18</strong></div>
        <div><span class="fm-label">Reps</span><strong>196</strong></div>
        <div><span class="fm-label">Volume</span><strong>2.312,5 kg</strong></div>
      </div>
      <AppInput label="Catatan akhir" model-value="" hint="Opsional, maksimal 2.000 karakter." />
      <template #footer>
        <AppButton block @click="onSheetSave">Simpan sesi</AppButton>
        <AppButton variant="ghost" block @click="sheetOpen = false">Kembali</AppButton>
      </template>
    </Sheet>
  </div>
</template>

<style scoped>
.fm {
  min-height: 100vh;
  background: var(--color-paper);
}

.fm-skip {
  position: absolute;
  left: -9999px;
  top: 8px;
  z-index: 100;
  padding: 10px 14px;
  border: 1px solid var(--color-ink);
  border-radius: var(--radius-control);
  background: var(--color-surface-raised);
  color: var(--color-ink);
  font-weight: 600;
}

.fm-skip:focus {
  left: 16px;
}

.fm-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.fm-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: var(--content-max);
  margin: 0 auto;
  padding: 20px var(--gutter-mobile);
  border-bottom: 1px solid var(--color-ink);
}

.fm-top__brand {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.fm-logo {
  display: inline-flex;
  align-items: center;
  min-height: var(--touch-target);
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  text-decoration: none;
}

.fm-top__edition {
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.fm-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: var(--touch-target);
  color: var(--color-ink);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
}

.fm-back:hover {
  color: var(--color-signal-strong);
}

.fm-shell {
  display: grid;
  grid-template-columns: 176px minmax(0, 1fr);
  gap: 48px;
  max-width: var(--content-max);
  margin: 0 auto;
  padding: 0 var(--gutter-mobile) var(--space-9);
}

.fm-index {
  position: sticky;
  top: 24px;
  align-self: start;
  min-width: 0;
  padding-top: 48px;
}

.fm-index nav {
  display: grid;
  min-width: 0;
  border-top: 1px solid var(--color-line);
}

.fm-index a {
  display: flex;
  align-items: center;
  min-height: var(--touch-target);
  border-bottom: 1px solid var(--color-line);
  color: var(--color-muted);
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
}

.fm-index a:hover {
  color: var(--color-ink);
}

.fm-main {
  min-width: 0;
}

.fm-masthead {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(220px, 0.6fr);
  gap: 48px;
  padding: 48px 0 40px;
  border-bottom: 1px solid var(--color-ink);
}

.fm-masthead h1 {
  max-width: 15ch;
  margin: 0;
  font-size: clamp(2.5rem, 5.2vw, 4.5rem);
  font-weight: 750;
  letter-spacing: -0.035em;
  line-height: 0.96;
}

.fm-masthead h1 span {
  color: var(--color-signal-strong);
}

.fm-lede {
  max-width: 66ch;
  margin: 24px 0 0;
  color: var(--color-muted);
  font-size: var(--text-body-lg);
  line-height: var(--leading-relaxed);
}

.fm-colophon {
  width: 100%;
  align-self: end;
  border-collapse: collapse;
  font-size: 0.8125rem;
}

.fm-colophon th,
.fm-colophon td {
  padding: 8px 0;
  border-bottom: 1px solid var(--color-line);
  text-align: left;
  vertical-align: top;
}

.fm-colophon th {
  width: 38%;
  color: var(--color-muted);
  font-weight: 500;
}

.fm-colophon td {
  color: var(--color-ink);
  font-family: var(--font-data);
  font-size: 0.75rem;
}

.fm-section {
  padding-top: 64px;
  scroll-margin-top: 24px;
}

.fm-specimen {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(220px, 0.5fr);
  gap: 32px;
  align-items: start;
  margin-top: 24px;
}

.fm-workout {
  overflow: hidden;
  border: 1px solid var(--color-ink);
  border-radius: var(--radius-card);
  background: var(--color-surface-raised);
}

.fm-workout__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-line);
}

.fm-workout__head h3 {
  margin: 0;
  font-size: var(--text-h3);
  line-height: var(--leading-snug);
}

.fm-workout__meta-line {
  margin: 4px 0 0;
  color: var(--color-muted);
  font-size: 0.8125rem;
}

.fm-readiness {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-bottom: 1px solid var(--color-line);
}

.fm-readiness div {
  display: grid;
  gap: 2px;
  padding: 12px 16px;
  border-right: 1px solid var(--color-line);
}

.fm-readiness div:last-child {
  border-right: 0;
}

.fm-readiness strong {
  font-family: var(--font-data);
  font-size: 1.125rem;
  font-variant-numeric: tabular-nums;
}

.fm-label {
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  line-height: 1.3;
  text-transform: uppercase;
}

.fm-table-scroll {
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: thin;
}

.fm-log {
  width: 100%;
  border-collapse: collapse;
}

.fm-log th {
  padding: 10px 16px;
  border-bottom: 1px solid var(--color-ink);
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-align: left;
  text-transform: uppercase;
}

.fm-log td {
  padding: 11px 16px;
  border-bottom: 1px solid var(--color-line);
  font-family: var(--font-data);
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
}

.fm-log td:nth-child(2) {
  font-family: var(--font-body);
  font-weight: 600;
}

.fm-workout__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 24px;
  background: var(--color-surface);
}

.fm-workout__footer strong {
  display: block;
  margin-top: 2px;
  font-size: 1.125rem;
}

.fm-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fm-notes {
  padding-top: 2px;
}

.fm-notes h3 {
  margin: 0;
  font-size: var(--text-h3);
}

.fm-notes p {
  max-width: 38ch;
  margin: 8px 0 0;
  color: var(--color-muted);
  font-size: var(--text-small);
  line-height: var(--leading-relaxed);
}

.fm-notes__list {
  margin: 20px 0 0;
  border-top: 1px solid var(--color-line);
}

.fm-notes__list div {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-line);
}

.fm-notes__list dt {
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
  text-transform: uppercase;
}

.fm-notes__list dd {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.45;
}

.fm-type-statement {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
  padding: 24px 0;
  border-top: 1px solid var(--color-ink);
  border-bottom: 1px solid var(--color-line);
}

.fm-type-statement p {
  max-width: 20ch;
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2rem, 4.6vw, 3.25rem);
  font-weight: 750;
  letter-spacing: -0.03em;
  line-height: 1;
}

.fm-type-statement span {
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.fm-table {
  width: 100%;
  margin-top: 24px;
  border-collapse: collapse;
}

.fm-table th {
  padding: 8px 12px 8px 0;
  border-bottom: 1px solid var(--color-ink);
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-align: left;
  text-transform: uppercase;
}

.fm-table td {
  padding: 12px 12px 12px 0;
  border-bottom: 1px solid var(--color-line);
  font-size: 0.875rem;
  vertical-align: top;
}

.fm-table td:first-child {
  width: 150px;
}

.fm-role {
  display: block;
  margin-bottom: 2px;
  color: var(--color-ink);
  font-weight: 600;
}

.fm-table code {
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
}

.fm-spec {
  color: var(--color-muted);
  font-size: 0.8125rem;
  line-height: 1.45;
}

.fm-type-display-1 {
  font-family: var(--font-display);
  font-size: var(--text-display-1);
  font-weight: 750;
  letter-spacing: -0.035em;
  line-height: 1;
}

.fm-type-display-2 {
  font-family: var(--font-display);
  font-size: var(--text-display-2);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.05;
}

.fm-type-h2 {
  font-family: var(--font-display);
  font-size: var(--text-h2);
  font-weight: 700;
  line-height: var(--leading-snug);
}

.fm-type-body {
  font-family: var(--font-body);
  font-size: var(--text-body);
  line-height: var(--leading-relaxed);
}

.fm-palette td:first-child {
  width: 210px;
}

.fm-swatch {
  display: block;
  width: 100%;
  height: 24px;
  margin-bottom: 6px;
  border: 1px solid var(--color-line);
  border-radius: 3px;
}

.fm-color-name {
  display: block;
  margin-bottom: 2px;
  color: var(--color-ink);
  font-weight: 600;
}

.fm-callout {
  max-width: 72ch;
  margin: 20px 0 0;
  padding: 12px 0 12px 16px;
  border-top: 1px solid var(--color-line);
  border-bottom: 1px solid var(--color-line);
  color: var(--color-muted);
  font-size: 0.875rem;
  line-height: 1.5;
}

.fm-callout strong {
  color: var(--color-ink);
}

.fm-controls {
  margin-top: 24px;
  border-top: 1px solid var(--color-ink);
}

.fm-control-row {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 24px;
  align-items: center;
  padding: 18px 0;
  border-bottom: 1px solid var(--color-line);
}

.fm-control-row__label {
  color: var(--color-muted);
  font-size: 0.8125rem;
}

.fm-control-row__items {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.fm-inline-note {
  color: var(--color-muted);
  font-size: 0.75rem;
}

.fm-form-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(220px, 0.75fr);
  gap: 32px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--color-ink);
}

.fm-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.fm-form-grid__full {
  grid-column: 1 / -1;
}

.fm-form-notes h3 {
  margin: 0 0 12px;
  font-size: var(--text-h3);
}

.fm-form-notes ol {
  margin: 0;
  padding-left: 18px;
  color: var(--color-muted);
  font-size: 0.8125rem;
  line-height: 1.55;
}

.fm-form-notes li + li {
  margin-top: 6px;
}

.fm-form-sample {
  display: grid;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--color-line);
}

.fm-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.fm-data-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.9fr);
  gap: 32px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--color-ink);
}

.fm-data-main {
  display: grid;
  gap: 24px;
  align-content: start;
}

.fm-session-table {
  margin-top: 0;
}

.fm-session-table td {
  padding-top: 10px;
  padding-bottom: 10px;
}

.fm-session-table td:first-child {
  width: auto;
  font-family: var(--font-data);
  font-size: 0.75rem;
}

.fm-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.fm-plan-tabs {
  padding: 0 20px 16px;
}

.fm-plan-table {
  border-top: 1px solid var(--color-line);
}

.fm-plan-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 56px 64px;
  gap: 12px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-line);
}

.fm-plan-row div {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.fm-plan-row strong {
  font-size: 0.875rem;
}

.fm-plan-row div span {
  color: var(--color-muted);
  font-size: 0.75rem;
}

.fm-plan-row > span {
  text-align: right;
  font-size: 0.8125rem;
}

.fm-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.fm-state-list {
  margin-top: 24px;
  border-top: 1px solid var(--color-ink);
}

.fm-state-row {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
  padding: 20px 0;
  border-bottom: 1px solid var(--color-line);
}

.fm-state-stack {
  display: grid;
  gap: 10px;
}

.fm-state-tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}

.fm-skeleton-card {
  display: grid;
  gap: 12px;
  max-width: 420px;
  padding: 20px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  background: var(--color-surface-raised);
}

.fm-overlay-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--color-ink);
}

.fm-specs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 32px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--color-ink);
}

.fm-spec-block--full {
  grid-column: 1 / -1;
}

.fm-spec-block h3 {
  margin: 0 0 16px;
  font-size: var(--text-h3);
}

.fm-space-list {
  display: grid;
  gap: 8px;
}

.fm-space-row {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr) 48px;
  gap: 12px;
  align-items: center;
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
}

.fm-space-bar {
  display: block;
  height: 10px;
  border-radius: var(--radius-pill);
  background: var(--color-signal-strong);
}

.fm-radius-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.fm-radius-item {
  display: grid;
  gap: 3px;
  color: var(--color-muted);
  font-size: 0.75rem;
}

.fm-radius-item code {
  font-family: var(--font-data);
  font-size: 0.6875rem;
}

.fm-radius-box {
  width: 70px;
  height: 46px;
  border: 1px solid var(--color-line);
  background: var(--color-surface);
}

.fm-shadow-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 20px;
}

.fm-shadow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 110px;
  height: 54px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  background: var(--color-surface-raised);
  font-family: var(--font-data);
  font-size: 0.6875rem;
}

.fm-shadow--raised {
  box-shadow: var(--shadow-raised);
}

.fm-shadow--cta {
  border-color: var(--color-ink);
  box-shadow: var(--shadow-cta);
}

.fm-motion-note {
  max-width: 72ch;
  margin: 16px 0 0;
  color: var(--color-muted);
  font-size: 0.875rem;
  line-height: 1.5;
}

.fm-motion-note code {
  color: var(--color-ink);
  font-family: var(--font-data);
  font-size: 0.75rem;
}

.fm-rules {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 32px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--color-ink);
}

.fm-rules h3 {
  margin: 0 0 8px;
  font-size: var(--text-h3);
}

.fm-rule-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.fm-rule-list li {
  padding: 10px 0;
  border-bottom: 1px solid var(--color-line);
  font-size: 0.875rem;
  line-height: 1.45;
}

.fm-rule-list li::before {
  content: '—';
  margin-right: 8px;
  color: var(--color-signal-strong);
}

.fm-rule-list--ban li::before {
  color: var(--color-danger);
}

.fm-footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 32px;
  margin-top: 64px;
  padding-top: 24px;
  border-top: 1px solid var(--color-ink);
}

.fm-footer__title {
  margin: 0 0 6px;
  color: var(--color-ink);
  font-family: var(--font-display);
  font-weight: 700;
}

.fm-footer p {
  max-width: 62ch;
  margin: 0;
  color: var(--color-muted);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.fm-sheet-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: var(--space-4);
}

.fm-sheet-summary div {
  display: grid;
  gap: 2px;
  padding: 10px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-control);
  background: var(--color-surface);
}

.fm-sheet-summary strong {
  font-family: var(--font-data);
  font-size: 1rem;
}

.fm-muted {
  color: var(--color-muted);
}

.fm-set--new {
  animation: fm-set-in var(--motion-base) var(--ease-entrance) both;
}

@keyframes fm-set-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 641px) {
  .fm-top,
  .fm-shell {
    padding-left: var(--gutter-desktop);
    padding-right: var(--gutter-desktop);
  }
}

@media (max-width: 960px) {
  .fm-shell {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .fm-index {
    position: static;
    padding-top: 24px;
  }

  .fm-index nav {
    display: flex;
    flex-wrap: wrap;
    min-width: 0;
    gap: 4px;
    overflow: visible;
    border-top: 1px solid var(--color-line);
    border-bottom: 1px solid var(--color-line);
    padding: 6px 0;
  }

  .fm-index a {
    flex: 0 0 auto;
    min-height: var(--touch-target);
    padding: 0 12px;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-pill);
    white-space: nowrap;
  }

  .fm-index a:hover {
    background: var(--color-surface);
  }

  .fm-masthead {
    grid-template-columns: 1fr;
    gap: 28px;
    padding-top: 32px;
  }

  .fm-colophon {
    max-width: 480px;
  }

  .fm-specimen,
  .fm-form-layout,
  .fm-data-layout,
  .fm-specs,
  .fm-rules {
    grid-template-columns: 1fr;
  }

  .fm-notes {
    padding-top: 8px;
  }
}

@media (max-width: 640px) {
  .fm-top__edition {
    display: none;
  }

  .fm-section {
    padding-top: 48px;
  }

  .fm-masthead h1 {
    font-size: clamp(2.25rem, 9vw, 3rem);
  }

  .fm-lede {
    font-size: var(--text-body);
  }

  .fm-control-row,
  .fm-state-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .fm-form-grid {
    grid-template-columns: 1fr;
  }

  .fm-form-grid__full {
    grid-column: auto;
  }

  .fm-workout__head,
  .fm-workout__footer {
    padding-left: 16px;
    padding-right: 16px;
  }

  .fm-readiness div {
    padding: 10px 12px;
  }

  .fm-workout__footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .fm-actions {
    width: 100%;
  }

  .fm-actions :deep(.ui-btn) {
    flex: 1;
  }

  .fm-palette td:first-child {
    width: 130px;
  }

  .fm-type-table thead {
    display: none;
  }

  .fm-type-table,
  .fm-type-table tbody,
  .fm-type-table tr,
  .fm-type-table td {
    display: block;
    width: 100%;
  }

  .fm-type-table tr {
    padding: 16px 0;
    border-bottom: 1px solid var(--color-line);
  }

  .fm-type-table td {
    padding: 0;
    border: 0;
  }

  .fm-type-table td:first-child {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 6px;
  }

  .fm-type-table td:nth-child(2) {
    margin-bottom: 4px;
  }

  .fm-type-table td:nth-child(3) {
    color: var(--color-muted);
  }

  .fm-log th:nth-child(6),
  .fm-log td:nth-child(6) {
    display: none;
  }

  .fm-data-layout {
    gap: 24px;
  }

  .fm-plan-tabs {
    padding-left: 16px;
    padding-right: 16px;
  }

  .fm-specs {
    gap: 24px;
  }

  .fm-footer {
    flex-direction: column;
  }

  .fm-index a {
    min-height: var(--touch-target);
  }
}
</style>
