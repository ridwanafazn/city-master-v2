<template>
  <div class="ui-v2-scope shared-page">
    <header class="shared-top">
      <RouterLink to="/" class="shared-brand">
        <span class="shared-brand__mark">JYMZ</span>
        <span class="shared-brand__sub">Plan dibagikan</span>
      </RouterLink>
      <div class="shared-top__actions">
        <Badge variant="neutral">Hanya baca</Badge>
        <RouterLink to="/" class="text-link">Coba engine</RouterLink>
      </div>
    </header>

    <main class="shared-main">
      <div v-if="loading" class="shared-loading" aria-busy="true">
        <Skeleton width="42%" height="2.25rem" />
        <Skeleton :lines="3" height="0.8rem" />
        <Skeleton width="100%" height="220px" />
      </div>

      <ErrorState
        v-else-if="error"
        title="Share link tidak tersedia"
        :message="error"
        retry-label="Kembali ke engine"
        @retry="router.push('/')"
      />

      <template v-else-if="plan">
        <header class="plan-head">
          <div class="plan-head__copy">
            <Badge variant="outline">Plan dibagikan</Badge>
            <h1>{{ plan.title }}</h1>
            <p>
              {{ splitLabel(plan.split_type) }} · {{ plan.days.length }} hari ·
              kedaluwarsa {{ formatDate(plan.expires_at) }}
            </p>
          </div>
          <dl class="plan-meta">
            <div>
              <dt>Split</dt>
              <dd>{{ splitLabel(plan.split_type) }}</dd>
            </div>
            <div>
              <dt>Hari</dt>
              <dd class="type-data">{{ plan.days.length }}</dd>
            </div>
            <div>
              <dt>Kedaluwarsa</dt>
              <dd class="type-data">{{ formatDate(plan.expires_at) }}</dd>
            </div>
          </dl>
        </header>

        <section v-if="plan.warnings.length" class="warnings" aria-labelledby="warnings-title">
          <h2 id="warnings-title">Catatan plan</h2>
          <ul>
            <li v-for="warning in plan.warnings" :key="warning">{{ warning }}</li>
          </ul>
        </section>

        <section class="plan-body" aria-labelledby="days-title">
          <div class="section-head">
            <h2 id="days-title">Rencana mingguan</h2>
            <span class="type-data">{{ plan.days.length }} hari</span>
          </div>

          <div class="day-tabs" role="tablist" aria-label="Pilih hari latihan">
            <button
              v-for="day in plan.days"
              :id="`shared-day-tab-${day.day}`"
              :key="day.day"
              type="button"
              role="tab"
              class="day-tab"
              :class="{ 'is-active': activeDayNumber === day.day }"
              :aria-selected="activeDayNumber === day.day"
              :aria-controls="`shared-day-panel-${day.day}`"
              @click="activeDayNumber = day.day"
            >
              <span class="type-data">Hari {{ day.day }}</span>
              <strong>{{ day.day_focus }}</strong>
            </button>
          </div>

          <div
            v-if="activeDay"
            :id="`shared-day-panel-${activeDay.day}`"
            class="day-panel"
            role="tabpanel"
            :aria-labelledby="`shared-day-tab-${activeDay.day}`"
          >
            <div class="section-head">
              <h3>{{ activeDay.day_focus }}</h3>
              <span class="type-data">{{ activeDay.exercises.length }} exercise</span>
            </div>

            <div class="exercise-table-wrap">
              <table class="exercise-table">
                <caption class="sr-only">
                  Latihan untuk hari {{ activeDay.day }}, fokus
                  {{ activeDay.day_focus }}
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
                  <tr v-for="exercise in activeDay.exercises" :key="exercise.id">
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
        </section>

        <footer class="shared-foot">
          <p>
            Dibagikan oleh pengguna JYMZ tanpa identitas pemilik. Plan ini bukan
            diagnosis medis.
          </p>
          <AppButton variant="secondary" size="sm" @click="router.push('/')">
            Buat plan sendiri
          </AppButton>
        </footer>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppButton from '../../components/ui-v2/AppButton.vue'
import Badge from '../../components/ui-v2/Badge.vue'
import ErrorState from '../../components/ui-v2/ErrorState.vue'
import Skeleton from '../../components/ui-v2/Skeleton.vue'
import { plansService } from '../../api/plansService'
import { bodyPartLabel, splitLabel } from '../../lib/planOptions'
import { equipmentLabel } from '../../lib/profileOptions'
import { preloadUiFonts } from '../../lib/preloadFonts'
import type { PublicPlan } from '../../types/plans'

const route = useRoute()
const router = useRouter()
const plan = ref<PublicPlan | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const activeDayNumber = ref(1)

preloadUiFonts()

const activeDay = computed(() => {
  if (!plan.value) return null
  return (
    plan.value.days.find((day) => day.day === activeDayNumber.value) ??
    plan.value.days[0] ??
    null
  )
})

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

onMounted(async () => {
  try {
    plan.value = await plansService.getShared(String(route.params.token))
    activeDayNumber.value = plan.value.days[0]?.day ?? 1
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : 'Share link tidak ditemukan atau sudah kedaluwarsa.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.shared-page {
  min-height: 100vh;
  background: var(--color-paper);
  color: var(--color-ink);
}

.shared-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: var(--content-max);
  margin: 0 auto;
  padding: 16px var(--gutter-mobile);
  border-bottom: 1px solid var(--color-ink);
}

.shared-brand {
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
  min-height: var(--touch-target);
  color: var(--color-ink);
  text-decoration: none;
}

.shared-brand__mark {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.shared-brand__sub {
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.625rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.shared-top__actions {
  display: flex;
  align-items: center;
  gap: 14px;
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

.shared-main {
  display: grid;
  gap: 32px;
  max-width: var(--content-max);
  margin: 0 auto;
  padding: 40px var(--gutter-mobile) 64px;
}

.shared-loading {
  display: grid;
  gap: 18px;
}

.plan-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-ink);
}

.plan-head__copy h1 {
  max-width: 24ch;
  margin: 10px 0 0;
  font-size: clamp(2.25rem, 4.6vw, 3.75rem);
  letter-spacing: -0.035em;
  line-height: 0.98;
}

.plan-head__copy p {
  margin: 12px 0 0;
  color: var(--color-muted);
  font-size: 0.875rem;
  line-height: 1.55;
}

.plan-meta {
  display: flex;
  flex: 0 0 auto;
  gap: 22px;
  margin: 0;
}

.plan-meta > div {
  display: grid;
  gap: 4px;
}

.plan-meta dt {
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.5625rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.plan-meta dd {
  margin: 0;
  font-size: 0.75rem;
}

.warnings {
  padding: 14px 16px;
  border: 1px solid #f2d9b2;
  border-radius: var(--radius-card);
  background: var(--color-warning-bg);
}

.warnings h2 {
  margin: 0 0 6px;
  font-size: 0.875rem;
}

.warnings ul {
  display: grid;
  gap: 4px;
  margin: 0;
  padding-left: 18px;
  color: var(--color-ink);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.plan-body {
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

.shared-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid var(--color-line);
}

.shared-foot p {
  max-width: 58ch;
  margin: 0;
  color: var(--color-muted);
  font-size: 0.75rem;
  line-height: 1.55;
}

@media (min-width: 641px) {
  .shared-top,
  .shared-main {
    padding-left: var(--gutter-desktop);
    padding-right: var(--gutter-desktop);
  }
}

@media (max-width: 900px) {
  .plan-head {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 620px) {
  .shared-brand__sub,
  .shared-top__actions .ui-badge {
    display: none;
  }

  .plan-meta {
    flex-wrap: wrap;
    gap: 16px;
  }

  .exercise-table thead th:nth-child(3),
  .exercise-table tbody td:nth-child(3) {
    display: none;
  }

  .exercise-table th,
  .exercise-table td {
    padding-right: 8px;
  }
}
</style>
