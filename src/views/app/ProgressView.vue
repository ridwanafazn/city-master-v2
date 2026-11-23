<template>
  <div class="progress-page">
    <header class="page-head">
      <div class="page-head__copy">
        <h1>Progres</h1>
        <p>
          Konsistensi, volume, balance otot, dan personal records. Angka dihitung
          dari set yang benar-benar selesai.
        </p>
      </div>
      <div class="page-head__actions">
        <SegmentedControl
          v-model="rangeModel"
          label="Rentang progres"
          :options="rangeOptions"
        />
        <RouterLink to="/app/workouts" class="action-link">Riwayat sesi</RouterLink>
      </div>
    </header>

    <ErrorState
      v-if="progressStore.error && !progressStore.progress"
      title="Progres tidak bisa dimuat"
      :message="progressStore.error"
      @retry="reload"
    />
    <p v-else-if="progressStore.error" class="inline-error" role="alert">
      {{ progressStore.error }}
    </p>

    <div v-if="progressStore.loading && !progressStore.progress" class="progress-loading" aria-busy="true">
      <Skeleton width="34%" height="1.5rem" />
      <Skeleton :lines="5" height="0.75rem" />
    </div>

    <template v-else-if="progressStore.progress">
      <dl class="primary-stats" aria-label="Ringkasan progres">
        <div>
          <dt>Sesi</dt>
          <dd>{{ progressStore.progress.totals.workouts_completed }}</dd>
        </div>
        <div>
          <dt>Volume</dt>
          <dd>{{ formatKg(progressStore.progress.totals.total_volume_kg) }}</dd>
        </div>
        <div>
          <dt>Streak</dt>
          <dd>{{ progressStore.streakDays }} hari</dd>
        </div>
        <div>
          <dt>Personal record</dt>
          <dd>{{ progressStore.personalRecords.length }}</dd>
        </div>
      </dl>

      <p class="range-note">
        {{ rangeLabel }} · {{ progressStore.progress.from_date }} sampai
        {{ progressStore.progress.to_date }}
        <span v-if="progressStore.loading"> · memperbarui…</span>
      </p>

      <div class="progress-layout">
        <div class="progress-main">
          <section class="progress-section" aria-labelledby="volume-title">
            <div class="section-head">
              <h2 id="volume-title">Volume harian</h2>
              <span class="type-data">{{ formatKg(progressStore.progress.totals.total_volume_kg) }}</span>
            </div>
            <VolumeChart :days="progressStore.progress.days" />
            <dl class="secondary-ledger">
              <div><dt>Set</dt><dd>{{ progressStore.progress.totals.total_sets }}</dd></div>
              <div><dt>Reps</dt><dd>{{ progressStore.progress.totals.total_reps }}</dd></div>
              <div><dt>Durasi</dt><dd>{{ formatDuration(progressStore.progress.totals.duration_seconds) }}</dd></div>
            </dl>
          </section>

          <section class="progress-section" aria-labelledby="balance-title">
            <div class="section-head">
              <h2 id="balance-title">Balance otot</h2>
              <span class="type-data">{{ bodyPartRows.length }} area</span>
            </div>
            <div v-if="bodyPartRows.length" class="balance-list">
              <div v-for="item in bodyPartRows" :key="item.part" class="balance-row">
                <div class="balance-row__label">
                  <span>{{ bodyPartLabel(item.part) }}</span>
                  <span class="type-data">{{ item.value }}</span>
                </div>
                <div class="balance-row__track" aria-hidden="true">
                  <span :style="{ width: barPercent(item.value, maxBodyPart) }" />
                </div>
              </div>
            </div>
            <p v-else class="empty-copy">Belum ada data body part pada rentang ini.</p>
          </section>

          <section class="progress-section" aria-labelledby="recent-title">
            <div class="section-head">
              <h2 id="recent-title">Sesi terakhir</h2>
              <RouterLink to="/app/workouts" class="text-link">Semua sesi</RouterLink>
            </div>
            <div v-if="progressStore.history.length" class="recent-list">
              <RouterLink
                v-for="workout in progressStore.history.slice(0, 5)"
                :key="workout.id"
                :to="`/app/workouts/${workout.id}`"
                class="recent-row"
              >
                <span class="recent-row__date">{{ formatDate(workout.started_at) }}</span>
                <span class="recent-row__title">{{ workout.title }}</span>
                <span class="type-data">{{ workout.total_sets }} set</span>
                <span class="type-data">{{ formatKg(workout.total_volume_kg) }}</span>
              </RouterLink>
            </div>
            <p v-else class="empty-copy">Belum ada sesi selesai.</p>
          </section>
        </div>

        <aside class="progress-rail">
          <section class="rail-block" aria-labelledby="week-title">
            <div class="section-head">
              <h2 id="week-title">Minggu ini</h2>
              <span class="type-data">{{ weekRangeLabel }}</span>
            </div>
            <dl v-if="progressStore.currentWeek" class="rail-list">
              <div><dt>Sesi</dt><dd>{{ progressStore.currentWeek.workouts_completed }}</dd></div>
              <div><dt>Set</dt><dd>{{ progressStore.currentWeek.total_sets }}</dd></div>
              <div><dt>Volume</dt><dd>{{ formatKg(progressStore.currentWeek.total_volume_kg) }}</dd></div>
              <div><dt>Durasi</dt><dd>{{ formatDuration(progressStore.currentWeek.duration_seconds) }}</dd></div>
            </dl>
            <p v-else class="empty-copy">Belum ada weekly review.</p>
            <p v-if="progressStore.currentWeek?.summary" class="rail-summary">
              {{ progressStore.currentWeek.summary }}
            </p>
          </section>

          <section class="rail-block" aria-labelledby="pr-title">
            <div class="section-head">
              <h2 id="pr-title">Personal records</h2>
              <span class="type-data">{{ progressStore.personalRecords.length }}</span>
            </div>
            <div v-if="progressStore.personalRecords.length" class="pr-list">
              <div
                v-for="record in progressStore.personalRecords.slice(0, 6)"
                :key="`${record.exercise_id}-${record.record_type}`"
                class="pr-row"
              >
                <div>
                  <strong>{{ record.exercise_name }}</strong>
                  <span>{{ recordLabel(record.record_type) }}</span>
                </div>
                <strong class="type-data">{{ formatRecordValue(record) }}</strong>
              </div>
            </div>
            <p v-else class="empty-copy">PR muncul setelah ada set dengan beban/reps.</p>
          </section>

          <section class="rail-block" aria-labelledby="insights-title">
            <div class="section-head">
              <h2 id="insights-title">Insight</h2>
              <span class="type-data">28 hari</span>
            </div>
            <p class="rail-summary">{{ progressStore.summary || 'Belum ada insight.' }}</p>
            <dl class="rail-list">
              <div><dt>Sesi 28 hari</dt><dd>{{ progressStore.insights?.workouts_last_28_days ?? 0 }}</dd></div>
              <div><dt>Streak</dt><dd>{{ progressStore.streakDays }} hari</dd></div>
              <div><dt>PR tercatat</dt><dd>{{ progressStore.personalRecords.length }}</dd></div>
            </dl>
          </section>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import ErrorState from '../../components/ui-v2/ErrorState.vue'
import SegmentedControl from '../../components/ui-v2/SegmentedControl.vue'
import Skeleton from '../../components/ui-v2/Skeleton.vue'
import VolumeChart from '../../components/progress/VolumeChart.vue'
import { bodyPartLabel } from '../../lib/planOptions'
import { browserTimezone } from '../../lib/profileOptions'
import { useProfileStore } from '../../stores/profileStore'
import { useProgressStore } from '../../stores/progressStore'
import type { UiOption } from '../../components/ui-v2'
import type { PersonalRecord } from '../../types/progress'

const progressStore = useProgressStore()
const profileStore = useProfileStore()

const rangeOptions = computed<UiOption[]>(() =>
  [7, 30, 90].map((days) => ({
    value: String(days),
    label: `${days} hari`,
    disabled: progressStore.loading,
  })),
)

const rangeModel = computed({
  get: () => String(progressStore.rangeDays),
  set: (value: string) => {
    const days = Number(value)
    if (days !== progressStore.rangeDays) void loadRange(days)
  },
})

const rangeLabel = computed(() => `${progressStore.rangeDays} hari terakhir`)

const bodyPartRows = computed(() =>
  Object.entries(progressStore.bodyPartBalance)
    .map(([part, value]) => ({ part, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value),
)
const maxBodyPart = computed(() =>
  bodyPartRows.value.length ? Math.max(...bodyPartRows.value.map((item) => item.value)) : 1,
)

const weekRangeLabel = computed(() => {
  const start = progressStore.currentWeek?.week_start
  if (!start) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${start}T00:00:00`))
})

function barPercent(value: number, max: number): string {
  return `${Math.max(2, (value / max) * 100)}%`
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

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(value))
}

function recordLabel(type: string): string {
  if (type === 'max_weight') return 'Beban maks'
  if (type === 'max_reps') return 'Reps maks'
  if (type === 'max_volume') return 'Volume maks'
  return type
}

function formatRecordValue(record: PersonalRecord): string {
  if (record.record_type === 'max_reps') return `${record.value} reps`
  if (record.record_type === 'max_weight' || record.record_type === 'max_volume') {
    return `${record.value} kg`
  }
  return String(record.value)
}

async function loadRange(days: number) {
  await profileStore.load()
  await progressStore.load(profileStore.profile?.timezone ?? browserTimezone(), days)
}

async function reload() {
  await loadRange(progressStore.rangeDays)
}

onMounted(async () => {
  await loadRange(30)
})
</script>

<style scoped>
.progress-page {
  display: grid;
  gap: var(--space-5);
}

.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
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
  align-items: center;
  gap: 12px;
}

.action-link,
.text-link {
  display: inline-flex;
  align-items: center;
  min-height: var(--touch-target);
  color: var(--color-signal-strong);
  font-size: 0.8125rem;
  font-weight: 650;
  text-decoration: underline;
  text-underline-offset: 0.18em;
}

.primary-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
  border-top: 1px solid var(--color-ink);
  border-bottom: 1px solid var(--color-line);
}

.primary-stats div {
  display: grid;
  gap: 4px;
  padding: 12px 16px;
  border-right: 1px solid var(--color-line);
}

.primary-stats div:last-child {
  border-right: 0;
}

.primary-stats dt {
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.625rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.primary-stats dd {
  margin: 0;
  font-family: var(--font-data);
  font-size: clamp(1.25rem, 2.4vw, 1.75rem);
  font-variant-numeric: tabular-nums;
}

.range-note {
  margin: 0;
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
}

.progress-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(260px, 0.5fr);
  gap: 40px;
  align-items: start;
}

.progress-main {
  display: grid;
  gap: 32px;
  min-width: 0;
}

.progress-section,
.rail-block {
  padding-top: 12px;
  border-top: 1px solid var(--color-ink);
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.section-head h2 {
  margin: 0;
  font-size: var(--text-h3);
}

.section-head span {
  color: var(--color-muted);
}

.secondary-ledger {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 16px 0 0;
  border-top: 1px solid var(--color-line);
}

.secondary-ledger div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px 8px 0;
  border-bottom: 1px solid var(--color-line);
}

.secondary-ledger dt {
  color: var(--color-muted);
  font-size: 0.75rem;
}

.secondary-ledger dd {
  margin: 0;
  font-family: var(--font-data);
  font-size: 0.75rem;
}

.balance-list {
  display: grid;
  gap: 10px;
}

.balance-row__label {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
  font-size: 0.8125rem;
}

.balance-row__track {
  height: 8px;
  overflow: hidden;
  border-radius: var(--radius-pill);
  background: var(--color-surface);
}

.balance-row__track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--color-data);
}

.recent-list {
  border-top: 1px solid var(--color-line);
}

.recent-row {
  display: grid;
  grid-template-columns: 70px minmax(0, 1fr) 60px 80px;
  gap: 12px;
  align-items: baseline;
  min-height: var(--touch-target);
  padding: 8px 0;
  border-bottom: 1px solid var(--color-line);
  color: var(--color-ink);
  text-decoration: none;
}

.recent-row:hover {
  background: var(--color-surface);
}

.recent-row__date {
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
}

.recent-row__title {
  overflow: hidden;
  font-size: 0.875rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-row .type-data {
  color: var(--color-muted);
  font-size: 0.6875rem;
  text-align: right;
}

.progress-rail {
  display: grid;
  gap: 24px;
}

.rail-list {
  margin: 0;
}

.rail-list div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 7px 0;
  border-bottom: 1px solid var(--color-line);
}

.rail-list dt {
  color: var(--color-muted);
  font-size: 0.75rem;
}

.rail-list dd {
  margin: 0;
  font-family: var(--font-data);
  font-size: 0.75rem;
  text-align: right;
}

.rail-summary {
  margin: 10px 0 0;
  color: var(--color-muted);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.pr-list {
  border-top: 1px solid var(--color-line);
}

.pr-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid var(--color-line);
}

.pr-row div {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.pr-row div strong {
  overflow: hidden;
  font-size: 0.8125rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pr-row div span {
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.625rem;
  text-transform: uppercase;
}

.pr-row > strong {
  white-space: nowrap;
  font-size: 0.75rem;
}

.empty-copy {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.8125rem;
  line-height: 1.45;
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

.progress-loading {
  display: grid;
  gap: 12px;
}

@media (max-width: 1023px) {
  .page-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .progress-layout {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}

@media (max-width: 620px) {
  .primary-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .primary-stats div:nth-child(2) {
    border-right: 0;
  }

  .secondary-ledger {
    grid-template-columns: 1fr;
  }

  .recent-row {
    grid-template-columns: 58px minmax(0, 1fr);
  }

  .recent-row .type-data {
    display: none;
  }
}
</style>
