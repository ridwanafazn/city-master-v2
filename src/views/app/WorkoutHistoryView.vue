<template>
  <div class="history-page">
    <header class="page-head">
      <div class="page-head__copy">
        <h1>Riwayat sesi</h1>
        <p>
          Sesi aktif tetap di atas. Semua set yang tercatat tersimpan sebagai
          log latihan, bukan ringkasan samar.
        </p>
      </div>
      <div class="page-head__actions">
        <AppButton
          v-if="workoutStore.pendingCount"
          variant="secondary"
          :loading="workoutStore.syncing"
          @click="sync"
        >
          Sync {{ workoutStore.pendingCount }}
        </AppButton>
        <AppButton @click="router.push('/app/plans')">
          Mulai dari plan
          <ArrowRight :size="17" aria-hidden="true" />
        </AppButton>
      </div>
    </header>

    <ErrorState
      v-if="workoutStore.error && !workoutStore.workouts.length"
      title="Riwayat tidak bisa dimuat"
      :message="workoutStore.error"
      @retry="reload"
    />
    <p v-else-if="workoutStore.error" class="inline-error" role="alert">
      {{ workoutStore.error }}
    </p>

    <p v-if="workoutStore.notice" class="inline-notice" role="status">
      {{ workoutStore.notice }}
    </p>

    <div
      v-if="workoutStore.pendingCount"
      class="sync-strip"
      role="status"
    >
      <div>
        <strong>{{ workoutStore.pendingCount }} perubahan menunggu sinkronisasi</strong>
        <p>Set tetap tersimpan di perangkat ini. Kirim saat koneksi stabil.</p>
      </div>
      <AppButton variant="secondary" :loading="workoutStore.syncing" @click="sync">
        Sync sekarang
      </AppButton>
    </div>

    <div v-if="workoutStore.loadingList && !workoutStore.workouts.length" class="history-loading" aria-busy="true">
      <div v-for="n in 4" :key="n" class="history-loading__row">
        <Skeleton width="28%" height="1.1rem" />
        <Skeleton width="45%" height="0.75rem" />
      </div>
    </div>

    <EmptyState
      v-else-if="!workoutStore.workouts.length"
      title="Belum ada sesi"
      description="Buka plan dan mulai sesi pertama. Setelah selesai, sesi akan muncul di sini."
    >
      <template #icon><Dumbbell :size="24" /></template>
      <template #action>
        <AppButton @click="router.push('/app/plans')">
          Buka plan
          <ArrowRight :size="17" aria-hidden="true" />
        </AppButton>
      </template>
    </EmptyState>

    <template v-else>
      <section v-if="activeWorkouts.length" class="history-section" aria-labelledby="active-title">
        <div class="history-section__head">
          <h2 id="active-title">Sesi aktif</h2>
          <span class="type-data">{{ activeWorkouts.length }}</span>
        </div>
        <RouterLink
          v-for="workout in activeWorkouts"
          :key="workout.id"
          :to="`/app/workouts/${workout.id}`"
          class="workout-row workout-row--active"
        >
          <div class="workout-row__title">
            <h3>{{ workout.title }}</h3>
            <p>{{ workout.focus }}</p>
          </div>
          <div class="workout-row__meta">
            <span>{{ workout.total_sets }} set</span>
            <span>{{ formatKg(workout.total_volume_kg) }}</span>
          </div>
          <Badge variant="signal" dot>Live</Badge>
          <span class="workout-row__open">
            Lanjutkan
            <ArrowRight :size="15" aria-hidden="true" />
          </span>
        </RouterLink>
      </section>

      <section class="history-section" aria-labelledby="completed-title">
        <div class="history-section__head">
          <h2 id="completed-title">Sesi selesai</h2>
          <span class="type-data">{{ completedWorkouts.length }}</span>
        </div>

        <p v-if="!completedWorkouts.length" class="history-empty">
          Belum ada sesi yang selesai.
        </p>

        <RouterLink
          v-for="workout in completedWorkouts"
          :key="workout.id"
          :to="`/app/workouts/${workout.id}`"
          class="workout-row"
        >
          <div class="workout-row__title">
            <h3>{{ workout.title }}</h3>
            <p>{{ workout.focus }}</p>
          </div>
          <div class="workout-row__meta">
            <span>{{ workout.total_sets }} set</span>
            <span>{{ formatKg(workout.total_volume_kg) }}</span>
            <span>{{ formatDuration(workout.duration_seconds) }}</span>
          </div>
          <span class="workout-row__date">{{ formatDate(workout.started_at) }}</span>
          <span class="workout-row__open">
            Buka
            <ArrowRight :size="15" aria-hidden="true" />
          </span>
        </RouterLink>
      </section>

      <div v-if="workoutStore.nextCursor" class="load-more">
        <AppButton variant="secondary" :loading="workoutStore.loadingList" @click="loadMore">
          Muat lagi
        </AppButton>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Dumbbell } from '@lucide/vue'
import AppButton from '../../components/ui-v2/AppButton.vue'
import Badge from '../../components/ui-v2/Badge.vue'
import EmptyState from '../../components/ui-v2/EmptyState.vue'
import ErrorState from '../../components/ui-v2/ErrorState.vue'
import Skeleton from '../../components/ui-v2/Skeleton.vue'
import { useWorkoutStore } from '../../stores/workoutStore'

const workoutStore = useWorkoutStore()
const router = useRouter()

const activeWorkouts = computed(() =>
  workoutStore.workouts.filter((workout) => workout.status === 'in_progress'),
)
const completedWorkouts = computed(() =>
  workoutStore.workouts.filter((workout) => workout.status === 'completed'),
)

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function formatKg(value: number): string {
  return `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(value)} kg`
}

function formatDuration(seconds?: number | null): string {
  if (!seconds) return '—'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} m`
  return `${Math.floor(minutes / 60)}j ${minutes % 60}m`
}

async function sync() {
  await workoutStore.syncPending()
  await workoutStore.list(true)
}

async function reload() {
  await workoutStore.list(true)
}

function loadMore() {
  void workoutStore.list(false)
}

onMounted(async () => {
  workoutStore.refreshPending()
  await workoutStore.list(true)
  if (workoutStore.pendingCount) {
    await sync()
  }
})
</script>

<style scoped>
.history-page {
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
  margin: 0;
  font-size: var(--text-h1);
  line-height: var(--leading-tight);
}

.page-head__copy p {
  max-width: 62ch;
  margin: 10px 0 0;
  color: var(--color-muted);
  font-size: var(--text-body);
  line-height: var(--leading-relaxed);
}

.page-head__actions {
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

.sync-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid #f2d9b2;
  border-radius: var(--radius-card);
  background: var(--color-warning-bg);
}

.sync-strip strong {
  font-size: var(--text-small);
}

.sync-strip p {
  margin: 3px 0 0;
  color: var(--color-muted);
  font-size: 0.8125rem;
}

.history-loading {
  border-top: 1px solid var(--color-ink);
}

.history-loading__row {
  display: grid;
  gap: 8px;
  padding: 18px 0;
  border-bottom: 1px solid var(--color-line);
}

.history-section {
  border-top: 1px solid var(--color-ink);
}

.history-section__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
}

.history-section__head h2 {
  margin: 0;
  font-size: var(--text-h3);
}

.history-section__head span {
  color: var(--color-muted);
  font-size: 0.6875rem;
}

.workout-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto auto;
  gap: 20px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-line);
  color: var(--color-ink);
  text-decoration: none;
}

.workout-row:hover {
  background: var(--color-surface);
}

.workout-row--active {
  border-color: var(--color-ink);
  background: var(--color-surface);
  padding-left: 12px;
  padding-right: 12px;
}

.workout-row__title h3 {
  margin: 0;
  font-size: 1.0625rem;
}

.workout-row__title p {
  margin: 4px 0 0;
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
  text-transform: uppercase;
}

.workout-row__meta {
  display: flex;
  gap: 12px;
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
}

.workout-row__date {
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
}

.workout-row__open {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-signal-strong);
  font-size: 0.8125rem;
  font-weight: 650;
}

.history-empty {
  margin: 0;
  padding: 20px 0;
  color: var(--color-muted);
  font-size: 0.875rem;
}

.load-more {
  display: flex;
  justify-content: center;
  padding-top: var(--space-4);
}

@media (max-width: 860px) {
  .page-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .workout-row {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 6px 16px;
  }

  .workout-row__meta {
    grid-column: 1;
    grid-row: 2;
    flex-wrap: wrap;
  }

  .workout-row > :deep(.ui-badge) {
    grid-column: 2;
    grid-row: 1;
    justify-self: end;
  }

  .workout-row__date {
    grid-column: 1;
    grid-row: 3;
  }

  .workout-row__open {
    grid-column: 2;
    grid-row: 2;
    justify-self: end;
  }
}
</style>
