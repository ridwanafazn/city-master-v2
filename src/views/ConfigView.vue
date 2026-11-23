<template>
  <div class="ui-v2-scope public-page">
    <header class="public-top">
      <RouterLink to="/" class="public-brand">JYMZ</RouterLink>
      <div class="public-top__actions">
        <span class="type-data">Engine publik</span>
        <RouterLink to="/auth/sign-in" class="text-link">Masuk</RouterLink>
      </div>
    </header>

    <main class="config-main">
      <header class="config-head">
        <div>
          <h1>Parameter latihan</h1>
          <p>
            Isi biometrik dan batasan. Rule engine menyusun split, lalu
            genetic optimizer memilih exercise yang aman untuk cedera dan
            equipment Anda.
          </p>
        </div>
        <div class="bmi-panel">
          <span class="type-label">BMI</span>
          <strong class="type-data">{{ store.currentBmi.toFixed(1) }}</strong>
          <Badge :variant="bmiTone">{{ bmiCategory.label }}</Badge>
        </div>
      </header>

      <p v-if="localError" class="inline-error" role="alert">{{ localError }}</p>

      <form class="config-layout" novalidate @submit.prevent="startEngine">
        <div class="config-form">
          <section class="form-block" aria-labelledby="biometrics-title">
            <h2 id="biometrics-title">Biometrik</h2>
            <p class="form-lede">
              Dasar perhitungan volume dan batas latihan mingguan.
            </p>
            <div class="form-grid">
              <AppSelect
                v-model="store.userProfile.gender"
                label="Gender"
                :options="genderOptions"
                hint="Fokus upper/lower mengikuti pilihan ini."
              />
              <AppInput
                v-model="heightModel"
                label="Tinggi (cm)"
                type="number"
                min="100"
                max="250"
                step="0.5"
                required
                inputmode="decimal"
                :error="heightError"
              />
              <AppInput
                v-model="weightModel"
                label="Berat (kg)"
                type="number"
                min="30"
                max="200"
                step="0.5"
                required
                inputmode="decimal"
                :error="weightError"
              />
            </div>

            <div class="days-row">
              <div>
                <span class="field-title">Hari tersedia / minggu</span>
                <p class="form-hint">Plan akan mengisi jumlah hari ini.</p>
              </div>
              <SegmentedControl v-model="daysModel" label="Hari tersedia per minggu" :options="dayOptions" />
            </div>
          </section>

          <section class="form-block" aria-labelledby="constraints-title">
            <h2 id="constraints-title">Batasan</h2>
            <p class="form-lede">
              Tandai area yang harus dihindari dan area yang ingin diprioritaskan.
            </p>

            <div class="chip-section">
              <div class="chip-section__head">
                <h3>Batasan cedera</h3>
                <span class="type-data">{{ store.userProfile.injuries.length }} dipilih</span>
              </div>
              <p class="form-hint">Klik untuk memilih. Area ini akan dihindari.</p>
              <div class="chip-grid">
                <Chip
                  v-for="part in BODY_PART_OPTIONS"
                  :key="`injury-${part}`"
                  :selected="store.userProfile.injuries.includes(part)"
                  @toggle="toggle(store.userProfile.injuries, part)"
                >
                  {{ bodyPartLabel(part) }}
                </Chip>
              </div>
            </div>

            <div class="chip-section">
              <div class="chip-section__head">
                <h3>Target fokus</h3>
                <span class="type-data">{{ store.userProfile.preferred_body_part.length }} dipilih</span>
              </div>
              <p class="form-hint">Opsional. Kosong berarti split otomatis.</p>
              <div class="chip-grid">
                <Chip
                  v-for="part in BODY_PART_OPTIONS"
                  :key="`focus-${part}`"
                  :selected="store.userProfile.preferred_body_part.includes(part)"
                  @toggle="toggle(store.userProfile.preferred_body_part, part)"
                >
                  {{ bodyPartLabel(part) }}
                </Chip>
              </div>
            </div>
          </section>

          <section class="form-block" aria-labelledby="equipment-title">
            <div class="chip-section__head">
              <h2 id="equipment-title">Peralatan</h2>
              <span class="type-data">{{ store.userProfile.preferred_equipment.length }} dipilih</span>
            </div>
            <p class="form-lede">
              Kosong berarti semua equipment dianggap tersedia.
            </p>
            <div class="chip-grid">
              <Chip
                v-for="item in EQUIPMENT_OPTIONS"
                :key="item"
                :selected="store.userProfile.preferred_equipment.includes(item)"
                @toggle="toggle(store.userProfile.preferred_equipment, item)"
              >
                {{ equipmentLabel(item) }}
              </Chip>
            </div>
          </section>
        </div>

        <aside class="config-rail">
          <div class="run-panel">
            <h2>Ringkasan</h2>
            <dl class="rail-list">
              <div><dt>BMI</dt><dd>{{ store.currentBmi.toFixed(1) }} · {{ bmiCategory.label }}</dd></div>
              <div><dt>Hari</dt><dd>{{ store.userProfile.available_days }}</dd></div>
              <div><dt>Cedera</dt><dd>{{ store.userProfile.injuries.length }}</dd></div>
              <div><dt>Target</dt><dd>{{ store.userProfile.preferred_body_part.length }}</dd></div>
              <div><dt>Equipment</dt><dd>{{ store.userProfile.preferred_equipment.length || 'Semua' }}</dd></div>
            </dl>
            <AppButton type="submit" hero block size="lg" :loading="store.isProcessing">
              Jalankan optimasi
              <ArrowRight :size="18" aria-hidden="true" />
            </AppButton>
            <p class="run-note">
              Proses berjalan di server. Anda tidak perlu akun untuk mencoba
              engine publik.
            </p>
          </div>
        </aside>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@lucide/vue'
import AppButton from '../components/ui-v2/AppButton.vue'
import AppInput from '../components/ui-v2/AppInput.vue'
import AppSelect from '../components/ui-v2/AppSelect.vue'
import Badge from '../components/ui-v2/Badge.vue'
import Chip from '../components/ui-v2/Chip.vue'
import SegmentedControl from '../components/ui-v2/SegmentedControl.vue'
import { BODY_PART_OPTIONS, bodyPartLabel } from '../lib/planOptions'
import { EQUIPMENT_OPTIONS, equipmentLabel } from '../lib/profileOptions'
import { preloadUiFonts } from '../lib/preloadFonts'
import { useFitnessStore } from '../stores/fitnessStore'
import type { UiOption } from '../components/ui-v2'

const router = useRouter()
const store = useFitnessStore()
const localError = ref('')
const heightError = ref('')
const weightError = ref('')

preloadUiFonts()

const genderOptions: UiOption[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
]
const dayOptions: UiOption[] = [1, 2, 3, 4, 5].map((days) => ({
  value: String(days),
  label: `${days} hari`,
}))

const heightModel = computed({
  get: () => String(store.userProfile.height_cm),
  set: (value: string) => {
    store.userProfile.height_cm = Number(value)
  },
})
const weightModel = computed({
  get: () => String(store.userProfile.weight_kg),
  set: (value: string) => {
    store.userProfile.weight_kg = Number(value)
  },
})
const daysModel = computed({
  get: () => String(store.userProfile.available_days),
  set: (value: string) => {
    store.userProfile.available_days = Number(value)
  },
})

watch(
  () => store.userProfile.height_cm,
  (value) => {
    if (value >= 100 && value <= 250) heightError.value = ''
  },
)

watch(
  () => store.userProfile.weight_kg,
  (value) => {
    if (value >= 30 && value <= 200) weightError.value = ''
  },
)

const bmiCategory = computed(() => {
  const bmi = store.currentBmi
  if (bmi < 18.5) return { label: 'Underweight', tone: 'warning' as const }
  if (bmi < 25) return { label: 'Normal', tone: 'success' as const }
  if (bmi < 30) return { label: 'Overweight', tone: 'warning' as const }
  return { label: 'Obese', tone: 'danger' as const }
})
const bmiTone = computed(() => bmiCategory.value.tone)

function toggle(array: string[], item: string) {
  const index = array.indexOf(item)
  if (index >= 0) array.splice(index, 1)
  else array.push(item)
}

function validate(): boolean {
  localError.value = ''
  heightError.value = ''
  weightError.value = ''
  if (!store.userProfile.height_cm || store.userProfile.height_cm < 100 || store.userProfile.height_cm > 250) {
    heightError.value = 'Isi tinggi antara 100–250 cm.'
  }
  if (!store.userProfile.weight_kg || store.userProfile.weight_kg < 30 || store.userProfile.weight_kg > 200) {
    weightError.value = 'Isi berat antara 30–200 kg.'
  }
  return !heightError.value && !weightError.value
}

function startEngine() {
  if (!validate() || store.isProcessing) return
  void router.push('/process')
  void store.generateWeeklySchedule()
}
</script>

<style scoped>
.public-page {
  min-height: 100vh;
  background: var(--color-paper);
  color: var(--color-ink);
}

.public-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: var(--content-max);
  margin: 0 auto;
  padding: 20px var(--gutter-mobile);
  border-bottom: 1px solid var(--color-ink);
}

.public-brand {
  display: inline-flex;
  align-items: center;
  min-height: var(--touch-target);
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  text-decoration: none;
}

.public-top__actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.public-top__actions .type-data {
  color: var(--color-muted);
  font-size: 0.625rem;
  text-transform: uppercase;
}

.text-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--touch-target);
  min-height: var(--touch-target);
  color: var(--color-signal-strong);
  font-size: 0.8125rem;
  font-weight: 650;
  text-decoration: underline;
  text-underline-offset: 0.18em;
}

.config-main {
  display: grid;
  gap: 32px;
  max-width: var(--content-max);
  margin: 0 auto;
  padding: 40px var(--gutter-mobile) 64px;
}

.config-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-ink);
}

.config-head h1 {
  max-width: 16ch;
  margin: 0;
  font-size: clamp(2.5rem, 5vw, 4.25rem);
  font-weight: 750;
  letter-spacing: -0.035em;
  line-height: 0.96;
}

.config-head p {
  max-width: 62ch;
  margin: 16px 0 0;
  color: var(--color-muted);
  font-size: var(--text-body-lg);
  line-height: var(--leading-relaxed);
}

.bmi-panel {
  display: grid;
  flex: 0 0 auto;
  gap: 4px;
  min-width: 150px;
  padding: 16px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  background: var(--color-surface-raised);
}

.bmi-panel strong {
  font-size: 2.25rem;
  line-height: 1;
}

.config-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.6fr);
  gap: 48px;
  align-items: start;
}

.config-form {
  display: grid;
  gap: 32px;
}

.form-block {
  display: grid;
  gap: 14px;
  padding-top: 18px;
  border-top: 1px solid var(--color-ink);
}

.form-block h2 {
  margin: 0;
  font-size: var(--text-h2);
}

.form-lede {
  max-width: 62ch;
  margin: 0;
  color: var(--color-muted);
  font-size: var(--text-small);
  line-height: var(--leading-relaxed);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

.days-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding-top: 8px;
}

.field-title {
  font-size: 0.875rem;
  font-weight: 600;
}

.form-hint {
  margin: 3px 0 0;
  color: var(--color-muted);
  font-size: 0.75rem;
  line-height: 1.45;
}

.chip-section {
  display: grid;
  gap: 8px;
  margin-top: 8px;
}

.chip-section__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.chip-section h3,
.chip-section__head h2 {
  margin: 0;
  font-size: var(--text-h3);
}

.chip-section__head span {
  color: var(--color-muted);
  font-size: 0.625rem;
}

.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.config-rail {
  position: sticky;
  top: 24px;
}

.run-panel {
  display: grid;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--color-ink);
  border-radius: var(--radius-card);
  background: var(--color-surface-raised);
}

.run-panel h2 {
  margin: 0;
  font-size: var(--text-h3);
}

.rail-list {
  margin: 0;
}

.rail-list div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-line);
}

.rail-list dt {
  color: var(--color-muted);
  font-size: 0.75rem;
}

.rail-list dd {
  margin: 0;
  font-family: var(--font-data);
  font-size: 0.6875rem;
  text-align: right;
}

.run-note {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.75rem;
  line-height: 1.5;
}

.inline-error {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid #f7d1cd;
  border-radius: var(--radius-control);
  background: var(--color-danger-bg);
  color: var(--color-danger);
  font-size: 0.8125rem;
}

@media (min-width: 641px) {
  .public-top,
  .config-main {
    padding-left: var(--gutter-desktop);
    padding-right: var(--gutter-desktop);
  }
}

@media (max-width: 900px) {
  .config-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .bmi-panel {
    width: 100%;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 12px;
  }

  .config-layout {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .config-rail {
    position: static;
  }
}

@media (max-width: 620px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .days-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
