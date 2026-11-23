<template>
  <div class="plan-detail">
    <header class="page-head">
      <div class="page-head__copy">
        <RouterLink to="/app/plans" class="back-link">
          <ArrowLeft :size="15" aria-hidden="true" />
          Daftar plan
        </RouterLink>
        <div class="title-row">
          <h1>{{ plan?.title || 'Plan' }}</h1>
          <Badge v-if="plan" :variant="plan.status === 'active' ? 'success' : 'neutral'" :dot="plan.status === 'active'">
            {{ plan.status === 'active' ? 'Aktif' : plan.status }}
          </Badge>
        </div>
        <p v-if="plan" class="page-meta">
          {{ splitLabel(plan.split_type) }} · {{ plan.days.length }} hari · BMI
          {{ plan.bmi?.toFixed(1) ?? '—' }} ({{ plan.bmi_category || '—' }})
        </p>
      </div>
      <div class="page-actions">
        <AppButton variant="secondary" :loading="planStore.exporting" @click="exportPdf">
          <Download :size="16" aria-hidden="true" />
          PDF
        </AppButton>
        <AppButton variant="secondary" :loading="planStore.exporting" @click="exportIcs">
          <CalendarDays :size="16" aria-hidden="true" />
          ICS
        </AppButton>
      </div>
    </header>

    <ErrorState
      v-if="planStore.error && !plan"
      title="Plan tidak bisa dimuat"
      :message="planStore.error"
      @retry="loadPlan"
    />
    <p v-else-if="planStore.error" class="inline-error" role="alert">
      {{ planStore.error }}
    </p>
    <p v-if="planStore.notice" class="inline-notice" role="status">{{ planStore.notice }}</p>

    <div v-if="planStore.loadingPlan && !plan" class="detail-loading" aria-busy="true">
      <Skeleton width="40%" height="1.5rem" />
      <Skeleton :lines="4" height="0.75rem" />
    </div>

    <template v-else-if="plan">
      <div v-if="plan.warnings.length" class="warning-block" role="status">
        <strong>Catatan plan</strong>
        <ul>
          <li v-for="warning in plan.warnings" :key="warning">{{ warning }}</li>
        </ul>
      </div>

      <div class="plan-layout">
        <div class="plan-main">
          <Tabs v-model="activeDayKey" :tabs="dayTabs" label="Hari plan">
            <div v-if="activeDay" class="day-panel">
              <div class="day-head">
                <div>
                  <h2>{{ activeDay.day_focus }}</h2>
                  <p>{{ activeDay.exercises.length }} latihan · Day {{ activeDay.day }}</p>
                </div>
                <div class="day-actions">
                  <AppButton
                    variant="secondary"
                    size="sm"
                    :disabled="planStore.saving"
                    @click="regenerateDay"
                  >
                    <RefreshCw :size="15" aria-hidden="true" />
                    Regenerate
                  </AppButton>
                  <AppButton
                    size="sm"
                    class="day-head__start"
                    :loading="startingWorkout"
                    @click="startWorkout"
                  >
                    Mulai sesi
                  </AppButton>
                </div>
              </div>

              <div class="exercise-list">
                <article
                  v-for="exercise in activeDay.exercises"
                  :key="exercise.id"
                  class="exercise-row"
                >
                  <img
                    v-if="exercise.exercise_image"
                    :src="exercise.exercise_image"
                    :alt="exercise.exercise_name"
                    class="exercise-thumb"
                    loading="lazy"
                    width="56"
                    height="56"
                  />
                  <div class="exercise-row__main">
                    <h3>{{ exercise.exercise_name }}</h3>
                    <p>
                      {{ bodyPartLabel(exercise.body_part) }} ·
                      {{ exercise.equipment.join(', ') }}
                    </p>
                  </div>
                  <Badge v-if="exercise.locked" variant="outline">Locked</Badge>
                  <div class="exercise-row__actions">
                    <IconButton
                      :label="exercise.locked ? 'Buka kunci exercise' : 'Kunci exercise'"
                      variant="secondary"
                      :disabled="planStore.saving"
                      @click="toggleLock(exercise)"
                    >
                      <LockOpen v-if="exercise.locked" :size="17" />
                      <Lock v-else :size="17" />
                    </IconButton>
                    <IconButton
                      label="Ganti exercise"
                      variant="secondary"
                      :disabled="planStore.saving || exercise.locked"
                      @click="swapExercise(exercise)"
                    >
                      <RefreshCw :size="17" />
                    </IconButton>
                  </div>
                </article>
              </div>
            </div>
          </Tabs>

          <div class="sticky-start">
            <div>
              <span class="type-data">Day {{ activeDay?.day }} · {{ activeDay?.day_focus }}</span>
              <strong>{{ activeDay?.exercises.length }} latihan siap</strong>
            </div>
            <AppButton :loading="startingWorkout" @click="startWorkout">Mulai sesi</AppButton>
          </div>

          <section class="feedback-section" aria-labelledby="feedback-title">
            <h2 id="feedback-title">Feedback & safety</h2>
            <div class="feedback-grid">
              <FeedbackForm :plan-id="plan.id" title="Feedback plan" />
              <SafetyReportForm
                v-if="planSafetyExercises.length"
                :plan-id="plan.id"
                :exercises="planSafetyExercises"
              />
            </div>
          </section>
        </div>

        <aside class="plan-rail">
          <section class="rail-block" aria-labelledby="metadata-title">
            <h2 id="metadata-title">Ringkasan plan</h2>
            <dl class="rail-list">
              <div><dt>Split</dt><dd>{{ splitLabel(plan.split_type) }}</dd></div>
              <div><dt>Hari</dt><dd>{{ plan.days.length }}</dd></div>
              <div><dt>Versi</dt><dd>v{{ plan.current_version }}</dd></div>
              <div><dt>Dibuat</dt><dd>{{ formatDate(plan.created_at) }}</dd></div>
              <div><dt>Diperbarui</dt><dd>{{ formatDate(plan.updated_at) }}</dd></div>
            </dl>
          </section>

          <section class="rail-block" aria-labelledby="share-title">
            <h2 id="share-title">Bagikan plan</h2>
            <p class="rail-copy">
              Link read-only. Token hanya ditampilkan sekali setelah dibuat.
            </p>
            <div class="share-form">
              <AppSelect v-model="shareDaysModel" label="Masa berlaku" :options="shareOptions" />
              <AppButton :disabled="planStore.saving" @click="createShare">
                Buat link
              </AppButton>
            </div>
            <div v-if="planStore.share" class="share-result">
              <AppInput
                label="Share URL"
                :model-value="frontendShareUrl"
                readonly
              />
              <p class="rail-copy">Berakhir {{ formatDate(planStore.share.expires_at) }}</p>
              <div class="share-actions">
                <AppButton variant="secondary" size="sm" @click="copyShare">
                  <Copy :size="15" aria-hidden="true" />
                  Salin
                </AppButton>
                <AppButton variant="danger" size="sm" @click="revokeShare">
                  Cabut
                </AppButton>
              </div>
            </div>
          </section>

          <details class="rail-block versions">
            <summary>
              <span>Riwayat versi</span>
              <span class="type-data">{{ planStore.versions.length }}</span>
            </summary>
            <p v-if="!planStore.versions.length" class="rail-copy">Belum ada riwayat.</p>
            <ul v-else class="version-list">
              <li v-for="version in planStore.versions" :key="version.version">
                <span>v{{ version.version }} · {{ splitLabel(version.split_type) }}</span>
                <span>{{ formatDate(version.created_at) }}</span>
              </li>
            </ul>
          </details>

          <section class="rail-block rail-danger" aria-labelledby="danger-title">
            <h2 id="danger-title">Zona hapus</h2>
            <p class="rail-copy">Plan dan riwayat terkait akan dihapus permanen.</p>
            <AppButton variant="danger" size="sm" @click="deleteDialogOpen = true">
              <Trash2 :size="15" aria-hidden="true" />
              Hapus plan
            </AppButton>
          </section>
        </aside>
      </div>
    </template>

    <Dialog
      v-model:open="deleteDialogOpen"
      title="Hapus plan ini?"
      description="Plan dan riwayat yang terkait akan dihapus permanen. Tindakan ini tidak bisa dibatalkan."
      tone="danger"
      confirm-label="Hapus plan"
      :loading="planStore.saving"
      @confirm="deletePlan"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  CalendarDays,
  Copy,
  Download,
  Lock,
  LockOpen,
  RefreshCw,
  Trash2,
} from '@lucide/vue'
import AppButton from '../../components/ui-v2/AppButton.vue'
import AppInput from '../../components/ui-v2/AppInput.vue'
import AppSelect from '../../components/ui-v2/AppSelect.vue'
import Badge from '../../components/ui-v2/Badge.vue'
import Dialog from '../../components/ui-v2/Dialog.vue'
import ErrorState from '../../components/ui-v2/ErrorState.vue'
import IconButton from '../../components/ui-v2/IconButton.vue'
import Skeleton from '../../components/ui-v2/Skeleton.vue'
import Tabs from '../../components/ui-v2/Tabs.vue'
import FeedbackForm from '../../components/feedback/FeedbackForm.vue'
import SafetyReportForm from '../../components/feedback/SafetyReportForm.vue'
import { bodyPartLabel, SHARE_EXPIRY_OPTIONS, splitLabel } from '../../lib/planOptions'
import { usePlanStore } from '../../stores/planStore'
import { useProfileStore } from '../../stores/profileStore'
import { useWorkoutStore } from '../../stores/workoutStore'
import type { TabItem, UiOption } from '../../components/ui-v2'
import type { SafetyExercise } from '../../types/feedback'
import type { PlanExercise } from '../../types/plans'

const route = useRoute()
const router = useRouter()
const planStore = usePlanStore()
const profileStore = useProfileStore()
const workoutStore = useWorkoutStore()

const planId = computed(() => String(route.params.planId))
const plan = computed(() => planStore.plan)
const activeDayKey = ref('1')
const shareDays = ref(7)
const deleteDialogOpen = ref(false)
const startingWorkout = ref(false)

const dayTabs = computed<TabItem[]>(() =>
  (plan.value?.days ?? []).map((day) => ({
    id: String(day.day),
    label: `Day ${day.day}`,
    count: day.exercises.length,
  })),
)

const activeDay = computed(() => {
  const days = plan.value?.days ?? []
  return days.find((day) => String(day.day) === activeDayKey.value) ?? days[0] ?? null
})

const shareOptions: UiOption[] = SHARE_EXPIRY_OPTIONS.map((days) => ({
  value: String(days),
  label: `${days} hari`,
}))

const shareDaysModel = computed({
  get: () => String(shareDays.value),
  set: (value: string) => {
    shareDays.value = Number(value)
  },
})

const planSafetyExercises = computed<SafetyExercise[]>(() => {
  if (!plan.value) return []
  return plan.value.days.flatMap((day) =>
    day.exercises.map((exercise) => ({
      id: `${day.day}-${exercise.id}`,
      label: `Day ${day.day} · ${exercise.exercise_name}`,
      exerciseId: exercise.exercise_id,
      planExerciseId: exercise.id,
    })),
  )
})

const frontendShareUrl = computed(() => {
  if (!planStore.share) return ''
  return `${window.location.origin}/shared/${planStore.share.token}`
})

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

async function loadPlan() {
  await planStore.load(planId.value)
  const firstDay = plan.value?.days[0]
  if (firstDay) activeDayKey.value = String(firstDay.day)
}

async function reloadVersions() {
  await planStore.loadVersions(planId.value)
}

async function toggleLock(exercise: PlanExercise) {
  if (!plan.value) return
  const ok = await planStore.update(planId.value, {
    action: 'lock',
    expected_revision: plan.value.revision,
    plan_exercise_id: exercise.id,
    locked: !exercise.locked,
  })
  if (ok) await reloadVersions()
}

async function swapExercise(exercise: PlanExercise) {
  if (!plan.value) return
  const ok = await planStore.update(planId.value, {
    action: 'swap',
    expected_revision: plan.value.revision,
    plan_exercise_id: exercise.id,
  })
  if (ok) await reloadVersions()
}

async function regenerateDay() {
  if (!plan.value || !activeDay.value) return
  const ok = await planStore.update(planId.value, {
    action: 'regenerate_day',
    expected_revision: plan.value.revision,
    day: activeDay.value.day,
  })
  if (ok) await reloadVersions()
}

async function startWorkout() {
  if (!plan.value || !activeDay.value) return
  startingWorkout.value = true
  try {
    await profileStore.load()
    const workout = await workoutStore.start({
      plan_id: plan.value.id,
      day: activeDay.value.day,
      plan_version: plan.value.current_version,
      timezone: profileStore.profile?.timezone ?? 'UTC',
      client_session_id: crypto.randomUUID(),
    })
    if (workout) {
      await router.push({
        name: 'app-workout-detail',
        params: { workoutId: workout.id },
      })
    }
  } finally {
    startingWorkout.value = false
  }
}

async function createShare() {
  const ok = await planStore.createShare(planId.value, shareDays.value)
  if (ok) await copyShare()
}

async function copyShare() {
  if (!frontendShareUrl.value) return
  try {
    await navigator.clipboard.writeText(frontendShareUrl.value)
    planStore.notice = 'Share link disalin.'
  } catch {
    planStore.notice = 'Share link siap; salin manual dari field.'
  }
}

async function revokeShare() {
  const ok = await planStore.revokeShare(planId.value)
  if (ok) planStore.notice = 'Share link dicabut.'
}

async function exportPdf() {
  await planStore.downloadPdf(planId.value)
}

async function exportIcs() {
  await planStore.downloadIcs(planId.value)
}

async function deletePlan() {
  const ok = await planStore.remove(planId.value)
  if (ok) {
    deleteDialogOpen.value = false
    await router.replace({ name: 'app-plans' })
  }
}

onMounted(async () => {
  await loadPlan()
  await reloadVersions()
})
</script>

<style scoped>
.plan-detail {
  display: grid;
  gap: var(--space-5);
}

.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-5);
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--color-ink);
}

.page-head__copy h1 {
  max-width: 20ch;
  margin: 6px 0 0;
  font-size: var(--text-h1);
  line-height: 1.02;
}

.title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.page-meta {
  margin: 8px 0 0;
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
  text-transform: uppercase;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: var(--touch-target);
  color: var(--color-muted);
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
}

.back-link:hover {
  color: var(--color-ink);
}

.page-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.inline-error,
.inline-notice {
  margin: 0;
  padding: 10px 12px;
  border-radius: var(--radius-control);
  font-size: 0.8125rem;
  line-height: 1.45;
}

.inline-error {
  border: 1px solid #f7d1cd;
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.inline-notice {
  border: 1px solid #cfe6bf;
  background: var(--color-success-bg);
  color: var(--color-success-ink);
}

.detail-loading {
  display: grid;
  gap: 12px;
}

.warning-block {
  padding: 14px 16px;
  border: 1px solid #f2d9b2;
  border-radius: var(--radius-control);
  background: var(--color-warning-bg);
}

.warning-block strong {
  font-size: var(--text-small);
}

.warning-block ul {
  margin: 6px 0 0;
  padding-left: 18px;
  color: var(--color-ink);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.plan-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(260px, 0.55fr);
  gap: 40px;
  align-items: start;
}

.plan-main {
  min-width: 0;
}

.day-panel {
  display: grid;
  gap: 16px;
  padding-top: 4px;
}

.day-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-line);
}

.day-head h2 {
  margin: 0;
  font-size: var(--text-h2);
}

.day-head p {
  margin: 4px 0 0;
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
  text-transform: uppercase;
}

.day-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.exercise-list {
  border-top: 1px solid var(--color-ink);
}

.exercise-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid var(--color-line);
}

.exercise-thumb {
  width: 56px;
  height: 56px;
  flex: 0 0 auto;
  object-fit: cover;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-control);
  background: var(--color-surface);
}

.exercise-row__main {
  min-width: 0;
  flex: 1 1 auto;
}

.exercise-row__main h3 {
  margin: 0;
  font-size: 1rem;
  line-height: 1.25;
}

.exercise-row__main p {
  margin: 3px 0 0;
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
  text-transform: uppercase;
}

.exercise-row__actions {
  display: flex;
  gap: 4px;
  flex: 0 0 auto;
}

.sticky-start {
  display: none;
}

.feedback-section {
  display: grid;
  gap: 16px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--color-ink);
}

.feedback-section h2 {
  margin: 0;
  font-size: var(--text-h3);
}

.feedback-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.plan-rail {
  display: grid;
  gap: 24px;
}

.rail-block {
  border-top: 1px solid var(--color-ink);
  padding-top: 10px;
}

.rail-block h2 {
  margin: 0 0 8px;
  font-size: var(--text-h3);
}

.rail-copy {
  margin: 0 0 10px;
  color: var(--color-muted);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.rail-list {
  margin: 0;
}

.rail-list div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding: 7px 0;
  border-bottom: 1px solid var(--color-line);
}

.rail-list dt {
  color: var(--color-muted);
  font-size: 0.75rem;
}

.rail-list dd {
  margin: 0;
  overflow-wrap: anywhere;
  font-family: var(--font-data);
  font-size: 0.6875rem;
  text-align: right;
}

.share-form {
  display: grid;
  gap: 10px;
}

.share-result {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}

.share-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.versions summary {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  font-size: var(--text-h3);
  font-weight: 700;
}

.version-list {
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}

.version-list li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-line);
  font-family: var(--font-data);
  font-size: 0.6875rem;
}

.version-list li span:last-child {
  color: var(--color-muted);
}

.rail-danger {
  border-top-color: #f7d1cd;
}

@media (max-width: 1023px) {
  .plan-layout {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .day-head__start {
    display: none;
  }

  .sticky-start {
    position: sticky;
    bottom: calc(64px + env(safe-area-inset-bottom, 0px));
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 8px;
    padding: 10px 0;
    border-top: 1px solid var(--color-ink);
    background: var(--color-paper);
  }

  .sticky-start span {
    display: block;
    color: var(--color-muted);
    font-size: 0.625rem;
  }

  .sticky-start strong {
    display: block;
    margin-top: 2px;
    font-size: 0.875rem;
  }

  .feedback-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .page-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .day-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .exercise-row {
    flex-wrap: wrap;
  }

  .exercise-row__actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
