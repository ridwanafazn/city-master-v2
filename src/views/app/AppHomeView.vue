<template>
  <div class="today">
    <header class="today-head">
      <div class="today-head__copy">
        <p class="today-date">{{ dateLabel }}</p>
        <h1 class="today-title">{{ greeting }}, {{ firstName }}.</h1>
        <p class="today-lede">
          Satu sesi yang jelas lebih baik daripada dashboard yang penuh angka.
          Mulai dari yang sudah tercatat.
        </p>
      </div>
      <div class="today-head__actions">
        <Badge v-if="auth.me && auth.profileComplete" variant="success" dot>Profil siap</Badge>
        <AppButton
          variant="ghost"
          size="sm"
          :loading="refreshing"
          @click="refresh"
        >
          <RefreshCw v-if="!refreshing" :size="15" aria-hidden="true" />
          Muat ulang
        </AppButton>
      </div>
    </header>

    <div
      v-if="auth.me && !auth.profileComplete"
      class="profile-callout"
      role="status"
    >
      <div>
        <strong>Profil belum lengkap.</strong>
        <p>
          Lengkapi tinggi, berat, equipment, cedera, dan consent agar JYMZ bisa
          membuat plan yang aman.
        </p>
      </div>
      <AppButton size="sm" @click="router.push('/app/onboarding')">
        Lengkapi profil
      </AppButton>
    </div>

    <p v-if="stale && savedAt" class="stale-note">
      Menampilkan data terakhir dari pukul {{ savedAtLabel }}. Tarik data terbaru
      saat koneksi stabil.
    </p>

    <div v-if="loading" class="today-grid" aria-busy="true" aria-label="Memuat hari ini">
      <div class="today-primary">
        <div class="skeleton-card">
          <Skeleton width="34%" height="0.75rem" />
          <Skeleton width="62%" height="2rem" />
          <Skeleton :lines="3" height="0.75rem" />
          <Skeleton width="46%" height="2.5rem" radius="control" />
        </div>
      </div>
      <aside class="today-rail">
        <div class="skeleton-card">
          <Skeleton width="46%" height="0.75rem" />
          <Skeleton :lines="4" height="0.75rem" />
        </div>
      </aside>
    </div>

    <ErrorState
      v-else-if="error && !hasData"
      title="Hari ini belum bisa dimuat"
      :message="error"
      retry-label="Coba lagi"
      @retry="refresh"
    />

    <div v-else class="today-grid">
      <div class="today-primary">
        <article v-if="activeWorkout" class="session-card session-card--live">
          <header class="session-card__head">
            <div>
              <h2>{{ activeWorkout.title }}</h2>
              <p class="session-meta">
                Day {{ activeWorkout.day_number ?? '—' }} · {{ activeWorkout.focus }}
              </p>
            </div>
            <Badge variant="signal" dot>Live</Badge>
          </header>

          <div class="session-stats">
            <div>
              <span>Set tercatat</span>
              <strong>{{ activeWorkout.total_sets }}</strong>
            </div>
            <div>
              <span>Volume</span>
              <strong>{{ formatKg(activeWorkout.total_volume_kg) }}</strong>
            </div>
            <div>
              <span>Latihan</span>
              <strong>{{ activeWorkout.exercise_count }}</strong>
            </div>
          </div>

          <div class="session-actions">
            <AppButton @click="continueWorkout">
              Lanjutkan sesi
              <ArrowRight :size="17" aria-hidden="true" />
            </AppButton>
            <AppButton variant="secondary" @click="router.push('/app/workouts')">
              Riwayat
            </AppButton>
          </div>
        </article>

        <article v-else-if="plan && nextDay" class="session-card">
          <header class="session-card__head">
            <div>
              <h2>Day {{ nextDay.day }} · {{ nextDay.day_focus }}</h2>
              <p class="session-meta">
                {{ plan.title }} · {{ nextDay.exercises.length }} latihan ·
                {{ plan.split_type }}
              </p>
            </div>
            <Badge variant="data">{{ plan.current_version ? `v${plan.current_version}` : 'Plan' }}</Badge>
          </header>

          <div class="exercise-list">
            <div
              v-for="exercise in nextDay.exercises.slice(0, 4)"
              :key="exercise.id"
              class="exercise-row"
            >
              <span>{{ exercise.exercise_name }}</span>
              <span>{{ exercise.body_part }}</span>
            </div>
          </div>

          <p v-if="startError" class="inline-error" role="alert">{{ startError }}</p>

          <div class="session-actions">
            <AppButton :loading="starting" @click="startNextSession">
              Mulai sesi
              <ArrowRight :size="17" aria-hidden="true" />
            </AppButton>
            <AppButton variant="secondary" @click="openPlan">Lihat plan</AppButton>
          </div>
        </article>

        <EmptyState
          v-else
          title="Belum ada plan untuk hari ini"
          description="Buat plan pertama dari profil Anda. Setelah itu JYMZ akan menandai sesi berikutnya di sini."
        >
          <template #icon><CalendarDays :size="24" /></template>
          <template #action>
            <AppButton @click="router.push('/app/plans/new')">
              <Plus :size="17" aria-hidden="true" />
              Buat plan
            </AppButton>
          </template>
        </EmptyState>

        <p v-if="error && hasData" class="inline-error" role="alert">
          Sebagian data gagal diperbarui. {{ error }}
        </p>

        <section v-if="recentWorkouts.length" class="recent" aria-labelledby="recent-title">
          <div class="recent__head">
            <h2 id="recent-title">Sesi terakhir</h2>
            <RouterLink to="/app/workouts">Semua</RouterLink>
          </div>
          <table class="recent__table">
            <caption class="sr-only">Sesi yang sudah selesai</caption>
            <thead>
              <tr>
                <th scope="col">Tanggal</th>
                <th scope="col">Sesi</th>
                <th scope="col">Set</th>
                <th scope="col">Volume</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="session in recentWorkouts" :key="session.id">
                <td>{{ formatSessionDate(session.started_at) }}</td>
                <td>{{ session.title }}</td>
                <td>{{ session.total_sets }}</td>
                <td>{{ formatKg(session.total_volume_kg) }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>

      <aside class="today-rail">
        <section class="ledger" aria-labelledby="week-ledger-title">
          <div class="ledger__head">
            <h2 id="week-ledger-title">Minggu ini</h2>
            <span class="type-data">{{ weekRangeLabel }}</span>
          </div>

          <table class="ledger__table">
            <caption class="sr-only">Ringkasan minggu ini</caption>
            <tbody>
              <tr>
                <th scope="row">Sesi</th>
                <td>{{ week?.workouts_completed ?? 0 }}</td>
              </tr>
              <tr>
                <th scope="row">Volume</th>
                <td>{{ formatKg(week?.total_volume_kg ?? 0) }}</td>
              </tr>
              <tr>
                <th scope="row">Set</th>
                <td>{{ week?.total_sets ?? 0 }}</td>
              </tr>
              <tr>
                <th scope="row">Durasi</th>
                <td>{{ formatDuration(week?.duration_seconds ?? 0) }}</td>
              </tr>
              <tr>
                <th scope="row">Streak</th>
                <td>{{ streakDays }} hari</td>
              </tr>
              <tr>
                <th scope="row">28 hari</th>
                <td>{{ workoutsLast28Days }} sesi</td>
              </tr>
            </tbody>
          </table>

          <p v-if="insights?.summary" class="ledger__summary">{{ insights.summary }}</p>
        </section>

        <nav class="rail-links" aria-label="Akses cepat">
          <RouterLink to="/app/progress">
            <span>Progres</span>
            <ArrowRight :size="16" aria-hidden="true" />
          </RouterLink>
          <RouterLink to="/app/workouts">
            <span>Riwayat sesi</span>
            <ArrowRight :size="16" aria-hidden="true" />
          </RouterLink>
          <RouterLink to="/app/plans">
            <span>Daftar plan</span>
            <ArrowRight :size="16" aria-hidden="true" />
          </RouterLink>
        </nav>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, CalendarDays, Plus, RefreshCw } from '@lucide/vue'
import AppButton from '../../components/ui-v2/AppButton.vue'
import Badge from '../../components/ui-v2/Badge.vue'
import EmptyState from '../../components/ui-v2/EmptyState.vue'
import ErrorState from '../../components/ui-v2/ErrorState.vue'
import Skeleton from '../../components/ui-v2/Skeleton.vue'
import { plansService } from '../../api/plansService'
import { progressService } from '../../api/progressService'
import { workoutsService } from '../../api/workoutsService'
import { readHomeCache, writeHomeCache } from '../../lib/homeCache'
import { browserTimezone } from '../../lib/profileOptions'
import { useAuthStore } from '../../stores/authStore'
import { useWorkoutStore } from '../../stores/workoutStore'
import type { Plan, PlanDay } from '../../types/plans'
import type { InsightsResponse } from '../../types/progress'
import type { WorkoutSummary } from '../../types/workouts'

const auth = useAuthStore()
const workoutStore = useWorkoutStore()
const router = useRouter()

const loading = ref(true)
const refreshing = ref(false)
const stale = ref(false)
const error = ref('')
const savedAt = ref<string | null>(null)
const activeWorkout = ref<WorkoutSummary | null>(null)
const lastCompletedDay = ref<number | null>(null)
const recentWorkouts = ref<WorkoutSummary[]>([])
const plan = ref<Plan | null>(null)
const insights = ref<InsightsResponse | null>(null)
const starting = ref(false)
const startError = ref('')

const hasData = computed(
  () => Boolean(activeWorkout.value || plan.value || insights.value),
)
const week = computed(() => insights.value?.current_week ?? null)
const streakDays = computed(() => insights.value?.streak_days ?? 0)
const workoutsLast28Days = computed(() => insights.value?.workouts_last_28_days ?? 0)

const nextDay = computed<PlanDay | null>(() => {
  const days = plan.value?.days ?? []
  if (!days.length) return null
  const last = lastCompletedDay.value
  const nextNumber = last ? (last % days.length) + 1 : 1
  return days.find((day) => day.day === nextNumber) ?? days[0] ?? null
})

const dateLabel = computed(() => {
  const label = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
  return label.charAt(0).toUpperCase() + label.slice(1)
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 19) return 'Selamat sore'
  return 'Selamat malam'
})

const firstName = computed(() => auth.displayName.trim().split(/\s+/)[0] || 'atlet')

const savedAtLabel = computed(() => {
  if (!savedAt.value) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(savedAt.value))
})

const weekRangeLabel = computed(() => {
  if (!week.value?.week_start) return '—'
  const start = new Date(`${week.value.week_start}T00:00:00`)
  const end = new Date(start.getTime() + 6 * 86_400_000)
  const fmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' })
  return `${fmt.format(start)} – ${fmt.format(end)}`
})

function formatKg(value: number): string {
  return `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(value)} kg`
}

function formatDuration(seconds: number): string {
  if (!seconds) return '—'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} m`
  const hours = Math.floor(minutes / 60)
  return `${hours}j ${minutes % 60}m`
}

function formatSessionDate(value: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(value))
}

function hydrateCache(): void {
  const cached = readHomeCache()
  if (!cached) return
  activeWorkout.value = cached.activeWorkout
  lastCompletedDay.value = cached.lastCompletedDay
  recentWorkouts.value = cached.recentWorkouts ?? []
  plan.value = cached.plan
  insights.value = cached.insights
  savedAt.value = cached.savedAt
  stale.value = true
  loading.value = false
}

async function refresh(): Promise<void> {
  if (!hasData.value) loading.value = true
  refreshing.value = true
  error.value = ''
  startError.value = ''

  const zone = browserTimezone()
  const [workoutsResult, plansResult, insightsResult] = await Promise.allSettled([
    workoutsService.list(undefined, 10),
    plansService.list(),
    progressService.getInsights(zone),
  ])

  let failures = 0
  let successes = 0

  if (workoutsResult.status === 'fulfilled') {
    successes += 1
    const items = workoutsResult.value.items
    activeWorkout.value = items.find((item) => item.status === 'in_progress') ?? null
    recentWorkouts.value = items
      .filter((item) => item.status === 'completed')
      .slice(0, 3)
    const lastCompleted = items.find(
      (item) => item.status === 'completed' && typeof item.day_number === 'number',
    )
    lastCompletedDay.value = lastCompleted?.day_number ?? null
  } else {
    failures += 1
  }

  if (plansResult.status === 'fulfilled') {
    successes += 1
    const first = plansResult.value.items[0]
    if (!first) {
      plan.value = null
    } else {
      try {
        plan.value = await plansService.get(first.id)
      } catch {
        failures += 1
        // Keep the cached plan if its detail cannot be refreshed.
      }
    }
  } else {
    failures += 1
  }

  if (insightsResult.status === 'fulfilled') {
    successes += 1
    insights.value = insightsResult.value
  } else {
    failures += 1
  }

  if (successes > 0) {
    stale.value = failures > 0
    const now = new Date().toISOString()
    savedAt.value = now
    writeHomeCache({
      activeWorkout: activeWorkout.value,
      lastCompletedDay: lastCompletedDay.value,
      recentWorkouts: recentWorkouts.value,
      plan: plan.value,
      insights: insights.value,
    })
  } else if (!hasData.value) {
    error.value = 'Server belum merespons. Data hari ini belum tersedia.'
  } else {
    stale.value = true
    error.value = 'Server belum merespons. Menampilkan data terakhir.'
  }

  loading.value = false
  refreshing.value = false
}

function continueWorkout(): void {
  if (activeWorkout.value) {
    void router.push(`/app/workouts/${activeWorkout.value.id}`)
  }
}

function openPlan(): void {
  if (plan.value) void router.push(`/app/plans/${plan.value.id}`)
}

async function startNextSession(): Promise<void> {
  if (!plan.value || !nextDay.value) return
  starting.value = true
  startError.value = ''
  try {
    const workout = await workoutStore.start({
      plan_id: plan.value.id,
      day: nextDay.value.day,
      plan_version: plan.value.current_version,
      timezone: browserTimezone(),
    })
    if (workout) {
      await router.push(`/app/workouts/${workout.id}`)
    } else {
      startError.value = workoutStore.error || 'Gagal memulai sesi. Coba lagi.'
    }
  } finally {
    starting.value = false
  }
}

onMounted(() => {
  hydrateCache()
  void refresh()
})
</script>

<style scoped>
.today {
  display: grid;
  gap: var(--space-5);
}

.today-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-5);
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--color-ink);
}

.today-head__copy {
  min-width: 0;
}

.today-date {
  margin: 0 0 8px;
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.today-title {
  max-width: 18ch;
  margin: 0;
  font-size: clamp(2.25rem, 4.6vw, 3.5rem);
  font-weight: 750;
  letter-spacing: -0.035em;
  line-height: 0.98;
}

.today-lede {
  max-width: 58ch;
  margin: 14px 0 0;
  color: var(--color-muted);
  font-size: var(--text-body);
  line-height: var(--leading-relaxed);
}

.today-head__actions {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.profile-callout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: 14px 16px;
  border: 1px solid #f2d9b2;
  border-radius: var(--radius-card);
  background: var(--color-warning-bg);
}

.profile-callout strong {
  font-size: var(--text-small);
}

.profile-callout p {
  max-width: 68ch;
  margin: 3px 0 0;
  color: var(--color-muted);
  font-size: 0.8125rem;
  line-height: 1.45;
}

.stale-note {
  margin: 0;
  color: var(--color-warning);
  font-family: var(--font-data);
  font-size: 0.75rem;
}

.today-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(260px, 0.55fr);
  gap: 32px;
  align-items: start;
}

.today-primary {
  display: grid;
  gap: 16px;
  min-width: 0;
}

.today-rail {
  display: grid;
  gap: 24px;
  min-width: 0;
}

.session-card,
.skeleton-card {
  padding: var(--space-5);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  background: var(--color-surface-raised);
}

.session-card--live {
  border-color: var(--color-ink);
}

.session-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-line);
}

.session-card__head h2 {
  margin: 0;
  font-size: clamp(1.5rem, 3vw, 2rem);
  line-height: 1.05;
}

.session-meta {
  margin: 6px 0 0;
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.75rem;
  line-height: 1.45;
}

.session-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-bottom: 1px solid var(--color-line);
}

.session-stats div {
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  border-right: 1px solid var(--color-line);
}

.session-stats div:last-child {
  border-right: 0;
}

.session-stats span {
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.625rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.session-stats strong {
  font-family: var(--font-data);
  font-size: 1.125rem;
  font-variant-numeric: tabular-nums;
}

.session-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: var(--space-4);
}

.exercise-list {
  padding: 4px 0;
  border-bottom: 1px solid var(--color-line);
}

.exercise-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-line);
  font-size: 0.875rem;
}

.exercise-row:last-child {
  border-bottom: 0;
}

.exercise-row span:first-child {
  font-weight: 600;
}

.exercise-row span:last-child {
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
  text-transform: uppercase;
}

.inline-error {
  margin: 12px 0 0;
  padding: 10px 12px;
  border: 1px solid #f7d1cd;
  border-radius: var(--radius-control);
  background: var(--color-danger-bg);
  color: var(--color-danger);
  font-size: 0.8125rem;
  line-height: 1.45;
}

.recent {
  border-top: 1px solid var(--color-ink);
}

.recent__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
}

.recent__head h2 {
  margin: 0;
  font-size: var(--text-h3);
}

.recent__head a {
  display: inline-flex;
  align-items: center;
  min-width: var(--touch-target);
  min-height: var(--touch-target);
  justify-content: flex-end;
  color: var(--color-signal-strong);
  font-size: 0.8125rem;
  font-weight: 650;
  text-decoration: underline;
  text-underline-offset: 0.18em;
}

.recent__table {
  width: 100%;
  border-collapse: collapse;
}

.recent__table th {
  padding: 8px 10px 8px 0;
  border-bottom: 1px solid var(--color-ink);
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.625rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-align: left;
  text-transform: uppercase;
}

.recent__table td {
  padding: 10px 10px 10px 0;
  border-bottom: 1px solid var(--color-line);
  font-size: 0.8125rem;
}

.recent__table td:first-child,
.recent__table td:nth-child(3),
.recent__table td:nth-child(4) {
  font-family: var(--font-data);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.recent__table td:last-child,
.recent__table th:last-child {
  padding-right: 0;
  text-align: right;
}

.ledger {
  border-top: 1px solid var(--color-ink);
}

.ledger__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
}

.ledger__head h2 {
  margin: 0;
  font-size: var(--text-h3);
}

.ledger__head span {
  color: var(--color-muted);
  font-size: 0.6875rem;
}

.ledger__table {
  width: 100%;
  border-collapse: collapse;
}

.ledger__table th,
.ledger__table td {
  padding: 10px 0;
  border-bottom: 1px solid var(--color-line);
  text-align: left;
}

.ledger__table th {
  color: var(--color-muted);
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 500;
}

.ledger__table td {
  color: var(--color-ink);
  font-family: var(--font-data);
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.ledger__summary {
  margin: 14px 0 0;
  color: var(--color-muted);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.rail-links {
  display: grid;
  border-top: 1px solid var(--color-line);
}

.rail-links a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: var(--touch-target);
  border-bottom: 1px solid var(--color-line);
  color: var(--color-ink);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
}

.rail-links a:hover {
  color: var(--color-signal-strong);
}

.skeleton-card {
  display: grid;
  gap: 16px;
}

@media (max-width: 960px) {
  .today-grid {
    grid-template-columns: 1fr;
  }

  .today-head {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .today-head__actions {
    width: 100%;
    justify-content: space-between;
  }

  .profile-callout {
    flex-direction: column;
    align-items: flex-start;
  }

  .session-card,
  .skeleton-card {
    padding: var(--space-4);
  }

  .session-stats div {
    padding: 12px 10px;
  }

  .session-card__head {
    flex-direction: column;
  }
}
</style>
