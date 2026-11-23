<template>
  <div class="ui-v2-scope public-page">
    <header class="public-top">
      <RouterLink to="/" class="public-brand">JYMZ</RouterLink>
      <div class="public-top__actions">
        <span class="type-data">Engine publik</span>
        <RouterLink to="/auth/sign-in" class="text-link">Masuk</RouterLink>
      </div>
    </header>

    <main v-if="result" class="dashboard-main">
      <header class="dashboard-head">
        <div class="dashboard-head__copy">
          <h1>Hasil optimasi</h1>
          <p>
            Split dipilih rule engine dari {{ result.days.length }} hari yang
            tersedia. Exercise dipilih optimizer dengan penalti untuk cedera.
          </p>
        </div>
        <dl class="run-facts">
          <div>
            <dt>Waktu engine</dt>
            <dd class="type-data">{{ store.processTime }} s</dd>
          </div>
          <div>
            <dt>BMI</dt>
            <dd class="type-data">{{ result.bmi.toFixed(1) }}</dd>
          </div>
          <div>
            <dt>Kategori</dt>
            <dd><Badge :variant="bmiTone">{{ result.bmi_category }}</Badge></dd>
          </div>
        </dl>
      </header>

      <section class="decision" aria-labelledby="decision-title">
        <div class="decision__lead">
          <h2 id="decision-title">Split terpilih</h2>
          <p class="decision__value">{{ splitLabel(result.split_type) }}</p>
          <p class="decision__copy">
            {{ result.days.length }} hari latihan. Setiap hari berisi
            {{ averageExerciseCount }} exercise secara rata-rata.
          </p>
        </div>
        <ol class="decision__days">
          <li v-for="day in result.days" :key="`summary-${day.day}`">
            <span class="type-data">Hari {{ day.day }}</span>
            <strong>{{ day.day_focus }}</strong>
            <span class="type-data">{{ day.exercises.length }} exercise</span>
          </li>
        </ol>
      </section>

      <section class="blueprint" aria-labelledby="blueprint-title">
        <div class="section-head">
          <h2 id="blueprint-title">Rencana mingguan</h2>
          <span class="type-data">{{ result.days.length }} hari</span>
        </div>

        <div class="day-tabs" role="tablist" aria-label="Pilih hari latihan">
          <button
            v-for="day in result.days"
            :id="`day-tab-${day.day}`"
            :key="day.day"
            type="button"
            role="tab"
            class="day-tab"
            :class="{ 'is-active': activeDayIndex === day.day }"
            :aria-selected="activeDayIndex === day.day"
            :aria-controls="`day-panel-${day.day}`"
            @click="activeDayIndex = day.day"
          >
            <span class="type-data">Hari {{ day.day }}</span>
            <strong>{{ day.day_focus }}</strong>
          </button>
        </div>

        <div
          v-if="activeDayData"
          :id="`day-panel-${activeDayData.day}`"
          class="day-panel"
          role="tabpanel"
          :aria-labelledby="`day-tab-${activeDayData.day}`"
        >
          <div class="section-head">
            <h3>{{ activeDayData.day_focus }}</h3>
            <span class="type-data">{{ activeDayData.exercises.length }} exercise</span>
          </div>

          <div class="exercise-table-wrap">
            <table class="exercise-table">
              <caption class="sr-only">
                Latihan untuk hari {{ activeDayData.day }}, fokus
                {{ activeDayData.day_focus }}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Latihan</th>
                  <th scope="col">Target</th>
                  <th scope="col">Peralatan</th>
                  <th scope="col" class="exercise-table__preview">Pratinjau</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="exercise in activeDayData.exercises" :key="exercise.exercise_id">
                  <th scope="row">{{ exercise.exercise_name }}</th>
                  <td>
                    <span class="target-tag">{{ bodyPartLabel(exercise.body_part) }}</span>
                  </td>
                  <td>
                    <span class="equipment-list">
                      {{ exercise.equipment.length ? exercise.equipment.map(equipmentLabel).join(', ') : '—' }}
                    </span>
                  </td>
                  <td class="exercise-table__preview">
                    <img
                      v-if="exercise.exercise_image"
                      :src="exercise.exercise_image"
                      :alt="`Ilustrasi ${exercise.exercise_name}`"
                      width="56"
                      height="56"
                      loading="lazy"
                      decoding="async"
                    />
                    <span v-else class="thumb-fallback" aria-hidden="true">
                      {{ exercise.exercise_name.slice(0, 2).toUpperCase() }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p class="blueprint-note">
          Gambar exercise dimuat dari katalog latihan. Jika gagal dimuat, tabel
          tetap menampilkan nama, target, dan equipment.
        </p>
      </section>

      <div class="dashboard-actions">
        <AppButton variant="secondary" @click="recalibrate">Ubah parameter</AppButton>
        <AppButton @click="restart">
          Jalankan ulang
          <RotateCcw :size="16" aria-hidden="true" />
        </AppButton>
      </div>

      <p class="disclaimer">
        Hasil ini bukan diagnosis medis. Hentikan exercise yang menimbulkan nyeri
        dan konsultasikan ke tenaga medis bila perlu.
      </p>
    </main>

    <main v-else class="dashboard-empty">
      <h1>Belum ada hasil</h1>
      <p>Jalankan optimasi dari halaman parameter untuk melihat weekly blueprint.</p>
      <AppButton @click="recalibrate">Buka parameter</AppButton>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { RotateCcw } from '@lucide/vue'
import AppButton from '../components/ui-v2/AppButton.vue'
import Badge from '../components/ui-v2/Badge.vue'
import { bodyPartLabel, splitLabel } from '../lib/planOptions'
import { equipmentLabel } from '../lib/profileOptions'
import { preloadUiFonts } from '../lib/preloadFonts'
import { useFitnessStore } from '../stores/fitnessStore'

const router = useRouter()
const store = useFitnessStore()
const result = computed(() => store.recommendationResult)
const activeDayIndex = ref(1)

preloadUiFonts()

const activeDayData = computed(() => {
  if (!result.value) return null
  return result.value.days.find((day) => day.day === activeDayIndex.value) ?? null
})

const averageExerciseCount = computed(() => {
  if (!result.value?.days.length) return 0
  const total = result.value.days.reduce((sum, day) => sum + day.exercises.length, 0)
  return Math.round(total / result.value.days.length)
})

const bmiTone = computed(() => {
  const category = (result.value?.bmi_category ?? '').toLowerCase()
  if (category.includes('normal')) return 'success' as const
  if (category.includes('underweight') || category.includes('overweight')) {
    return 'warning' as const
  }
  return 'danger' as const
})

watch(result, (next) => {
  const firstDay = next?.days[0]
  if (firstDay) activeDayIndex.value = firstDay.day
})

function recalibrate() {
  void router.push('/')
}

function restart() {
  void router.push('/')
}

onMounted(() => {
  if (!result.value) return
  const firstDay = result.value.days[0]
  if (firstDay) activeDayIndex.value = firstDay.day
})
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

.dashboard-main {
  display: grid;
  gap: 40px;
  max-width: var(--content-max);
  margin: 0 auto;
  padding: 40px var(--gutter-mobile) 64px;
}

.dashboard-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-ink);
}

.dashboard-head h1 {
  margin: 0;
  font-size: clamp(2.25rem, 4.6vw, 3.75rem);
  letter-spacing: -0.035em;
  line-height: 0.98;
}

.dashboard-head p {
  max-width: 58ch;
  margin: 14px 0 0;
  color: var(--color-muted);
  font-size: var(--text-body);
  line-height: var(--leading-relaxed);
}

.run-facts {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  gap: 20px;
  margin: 0;
}

.run-facts > div {
  display: grid;
  gap: 4px;
}

.run-facts dt {
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.5625rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.run-facts dd {
  margin: 0;
  font-size: 0.8125rem;
}

.decision {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 40px;
  align-items: start;
}

.decision__lead h2 {
  margin: 0;
  color: var(--color-muted);
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0;
}

.decision__value {
  margin: 8px 0 0;
  font-family: var(--font-display);
  font-size: clamp(2rem, 4.4vw, 3.5rem);
  font-weight: 750;
  letter-spacing: -0.035em;
  line-height: 1;
}

.decision__copy {
  max-width: 46ch;
  margin: 12px 0 0;
  color: var(--color-muted);
  font-size: 0.875rem;
  line-height: 1.55;
}

.decision__days {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--color-ink);
  list-style: none;
}

.decision__days li {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: baseline;
  padding: 11px 0;
  border-bottom: 1px solid var(--color-line);
}

.decision__days .type-data {
  color: var(--color-muted);
  font-size: 0.625rem;
  text-transform: uppercase;
}

.decision__days strong {
  font-size: 0.9375rem;
}

.blueprint {
  display: grid;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid var(--color-ink);
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.section-head h2,
.section-head h3 {
  margin: 0;
  font-size: var(--text-h2);
}

.section-head h3 {
  font-size: var(--text-h3);
}

.section-head .type-data {
  color: var(--color-muted);
  font-size: 0.6875rem;
}

.day-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.day-tab {
  display: grid;
  min-width: 128px;
  min-height: 56px;
  gap: 2px;
  padding: 8px 12px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-control);
  background: var(--color-surface-raised);
  color: var(--color-ink);
  cursor: pointer;
  font-family: var(--font-body);
  text-align: left;
  transition:
    border-color var(--motion-fast) var(--ease-exit),
    background-color var(--motion-fast) var(--ease-exit),
    transform var(--motion-fast) var(--ease-exit);
}

.day-tab:hover {
  border-color: #b9c0ae;
  transform: translateY(-1px);
}

.day-tab .type-data {
  color: var(--color-muted);
  font-size: 0.5625rem;
  text-transform: uppercase;
}

.day-tab strong {
  font-size: 0.875rem;
  font-weight: 650;
}

.day-tab.is-active {
  border-color: var(--color-ink);
  background: var(--color-ink);
  color: var(--color-paper);
}

.day-tab.is-active .type-data {
  color: #b9c0ae;
}

.day-panel {
  display: grid;
  gap: 12px;
  animation: panel-enter var(--motion-base) var(--ease-entrance);
}

@keyframes panel-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.exercise-table-wrap {
  overflow-x: auto;
}

.exercise-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.exercise-table th,
.exercise-table td {
  padding: 10px 12px 10px 0;
  border-bottom: 1px solid var(--color-line);
  text-align: left;
  vertical-align: middle;
}

.exercise-table thead th {
  border-top: 1px solid var(--color-ink);
  border-bottom: 1px solid var(--color-ink);
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.exercise-table tbody th {
  font-weight: 600;
}

.target-tag {
  display: inline-flex;
  min-height: 26px;
  align-items: center;
  padding: 0 8px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  font-family: var(--font-data);
  font-size: 0.625rem;
  text-transform: uppercase;
}

.equipment-list {
  color: var(--color-muted);
  font-size: 0.8125rem;
}

.exercise-table__preview {
  width: 64px;
  text-align: right;
}

.exercise-table td.exercise-table__preview {
  padding-right: 0;
}

.exercise-table img,
.thumb-fallback {
  display: inline-grid;
  width: 56px;
  height: 56px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-control);
  background: var(--color-surface);
  object-fit: cover;
}

.thumb-fallback {
  place-items: center;
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
}

.blueprint-note {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.75rem;
  line-height: 1.5;
}

.dashboard-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--color-ink);
}

.disclaimer {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.75rem;
  line-height: 1.55;
}

.dashboard-empty {
  display: grid;
  justify-items: start;
  gap: 14px;
  max-width: 640px;
  margin: 0 auto;
  padding: 72px var(--gutter-mobile);
}

.dashboard-empty h1 {
  margin: 0;
  font-size: var(--text-h1);
}

.dashboard-empty p {
  margin: 0;
  color: var(--color-muted);
  line-height: var(--leading-relaxed);
}

@media (min-width: 641px) {
  .public-top,
  .dashboard-main {
    padding-left: var(--gutter-desktop);
    padding-right: var(--gutter-desktop);
  }
}

@media (max-width: 900px) {
  .dashboard-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .decision {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

@media (max-width: 620px) {
  .dashboard-main {
    gap: 32px;
  }

  .decision__days li {
    grid-template-columns: 62px minmax(0, 1fr) auto;
    gap: 8px;
  }

  .exercise-table thead th:nth-child(3),
  .exercise-table tbody td:nth-child(3) {
    display: none;
  }

  .exercise-table th,
  .exercise-table td {
    padding-right: 8px;
  }

  .dashboard-actions :deep(.ui-btn) {
    flex: 1 1 auto;
  }
}
</style>
