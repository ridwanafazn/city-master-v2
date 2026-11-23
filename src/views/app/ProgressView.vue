<template>
  <div class="space-y-8">
    <header class="border-b-4 border-slate-900 pb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-blue-500 text-white border-2 border-slate-900 px-2 py-1 font-mono text-[10px] font-black uppercase">
            M5 · Progress
          </span>
          <span class="font-mono text-[10px] text-slate-500 uppercase">
            {{ progressStore.streakDays }}-day streak
          </span>
        </div>
        <h1 class="text-4xl md:text-5xl font-black uppercase tracking-tighter">
          Progress <span class="text-blue-600">Deck</span>
        </h1>
        <p class="text-slate-600 mt-2 font-mono text-sm max-w-2xl">
          Konsistensi, volume, balance otot, personal records, dan weekly review.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <RouterLink to="/app/workouts" class="pixel-button text-xs font-black uppercase inline-flex items-center">
          Workout History
        </RouterLink>
        <button
          v-for="range in [7, 30, 90]"
          :key="range"
          type="button"
          class="border-2 border-slate-900 px-3 py-2 font-mono text-[10px] font-black uppercase disabled:opacity-50"
          :class="progressStore.rangeDays === range ? 'bg-slate-900 text-white' : 'bg-white'"
          :disabled="progressStore.loading"
          @click="loadRange(range)"
        >
          {{ range }}d
        </button>
      </div>
    </header>

    <div
      v-if="progressStore.error"
      class="border-3 border-red-700 bg-red-50 p-3 font-mono text-xs text-red-800"
    >
      <p class="font-black uppercase">{{ progressStore.errorCode || 'error' }}</p>
      <p>{{ progressStore.error }}</p>
    </div>

    <div v-if="progressStore.loading && !progressStore.progress" class="font-mono text-sm text-slate-500">
      Rebuilding progress…
    </div>

    <template v-else-if="progressStore.progress">
      <section class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <div class="border-3 border-slate-900 bg-white p-4 text-center">
          <div class="text-3xl font-black">{{ progressStore.progress.totals.workouts_completed }}</div>
          <div class="font-mono text-[10px] uppercase text-slate-500">Workouts</div>
        </div>
        <div class="border-3 border-slate-900 bg-white p-4 text-center">
          <div class="text-3xl font-black">{{ progressStore.progress.totals.total_sets }}</div>
          <div class="font-mono text-[10px] uppercase text-slate-500">Sets</div>
        </div>
        <div class="border-3 border-slate-900 bg-white p-4 text-center">
          <div class="text-3xl font-black">{{ progressStore.progress.totals.total_reps }}</div>
          <div class="font-mono text-[10px] uppercase text-slate-500">Reps</div>
        </div>
        <div class="border-3 border-slate-900 bg-white p-4 text-center">
          <div class="text-3xl font-black">{{ progressStore.progress.totals.total_volume_kg }}</div>
          <div class="font-mono text-[10px] uppercase text-slate-500">Volume kg</div>
        </div>
        <div class="border-3 border-slate-900 bg-white p-4 text-center">
          <div class="text-3xl font-black">{{ formatDuration(progressStore.progress.totals.duration_seconds) }}</div>
          <div class="font-mono text-[10px] uppercase text-slate-500">Duration</div>
        </div>
        <div class="border-3 border-slate-900 bg-green-200 p-4 text-center">
          <div class="text-3xl font-black">{{ progressStore.streakDays }}</div>
          <div class="font-mono text-[10px] uppercase text-slate-700">Streak days</div>
        </div>
      </section>

      <section class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <PixelCard title="Daily Volume" class="xl:col-span-2">
          <div class="flex items-end gap-1 h-40 overflow-x-auto">
            <div
              v-for="day in progressStore.progress.days"
              :key="day.date"
              class="flex-1 min-w-[8px] flex flex-col justify-end group relative"
              :title="`${day.date}: ${day.total_volume_kg} kg`"
            >
              <div
                class="bg-blue-500 border border-slate-900 w-full"
                :style="{ height: barHeight(day.total_volume_kg) }"
              ></div>
            </div>
          </div>
          <div class="mt-2 flex justify-between font-mono text-[10px] text-slate-500 uppercase">
            <span>{{ progressStore.progress.from_date }}</span>
            <span>{{ progressStore.progress.to_date }}</span>
          </div>
        </PixelCard>

        <PixelCard title="Current Week">
          <div v-if="progressStore.currentWeek" class="space-y-2 font-mono text-sm">
            <StatusRow label="Week" :value="progressStore.currentWeek.week_start" />
            <StatusRow label="Workouts" :value="String(progressStore.currentWeek.workouts_completed)" />
            <StatusRow label="Sets" :value="String(progressStore.currentWeek.total_sets)" />
            <StatusRow label="Volume" :value="`${progressStore.currentWeek.total_volume_kg} kg`" />
            <StatusRow label="Duration" :value="formatDuration(progressStore.currentWeek.duration_seconds)" />
            <p v-if="progressStore.currentWeek.summary" class="pt-2 text-xs text-slate-600">
              {{ progressStore.currentWeek.summary }}
            </p>
          </div>
          <p v-else class="font-mono text-xs text-slate-500">Belum ada weekly review.</p>
        </PixelCard>
      </section>

      <section class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PixelCard title="Body-part Balance">
          <div v-if="bodyPartRows.length" class="space-y-2">
            <div v-for="item in bodyPartRows" :key="item.part" class="font-mono text-xs">
              <div class="flex justify-between uppercase">
                <span>{{ item.part }}</span>
                <span>{{ item.value }}</span>
              </div>
              <div class="h-2 border border-slate-900 bg-slate-100 mt-1">
                <div class="h-full bg-blue-500" :style="{ width: barPercent(item.value, maxBodyPart) }"></div>
              </div>
            </div>
          </div>
          <p v-else class="font-mono text-xs text-slate-500">Belum ada data body part.</p>
        </PixelCard>

        <PixelCard title="Personal Records">
          <div v-if="progressStore.personalRecords.length" class="space-y-2 font-mono text-xs">
            <div
              v-for="record in progressStore.personalRecords"
              :key="`${record.exercise_id}-${record.record_type}`"
              class="border-b border-slate-200 pb-2 last:border-b-0"
            >
              <div class="font-black uppercase">{{ record.exercise_name }}</div>
              <div class="flex justify-between text-slate-600">
                <span>{{ record.record_type }}</span>
                <span>{{ formatRecordValue(record) }}</span>
              </div>
            </div>
          </div>
          <p v-else class="font-mono text-xs text-slate-500">
            PR muncul setelah ada set dengan weight/reps.
          </p>
        </PixelCard>
      </section>

      <PixelCard title="Insights">
        <p class="font-mono text-sm text-slate-700">
          {{ progressStore.summary || 'Belum ada insight.' }}
        </p>
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div class="border-2 border-slate-900 p-3">
            <div class="text-slate-500 uppercase">Last 28 days</div>
            <div class="text-2xl font-black">{{ progressStore.insights?.workouts_last_28_days ?? 0 }}</div>
            <div class="text-slate-500">workouts</div>
          </div>
          <div class="border-2 border-slate-900 p-3">
            <div class="text-slate-500 uppercase">Current streak</div>
            <div class="text-2xl font-black">{{ progressStore.streakDays }}</div>
            <div class="text-slate-500">days</div>
          </div>
          <div class="border-2 border-slate-900 p-3">
            <div class="text-slate-500 uppercase">Personal records</div>
            <div class="text-2xl font-black">{{ progressStore.personalRecords.length }}</div>
            <div class="text-slate-500">tracked</div>
          </div>
        </div>
      </PixelCard>

      <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PixelCard title="Recent Completed Workouts">
          <div v-if="progressStore.history.length" class="space-y-2">
            <RouterLink
              v-for="workout in progressStore.history.slice(0, 5)"
              :key="workout.id"
              :to="`/app/workouts/${workout.id}`"
              class="block border-2 border-slate-900 p-3 font-mono text-xs hover:bg-slate-50"
            >
              <div class="font-black uppercase">{{ workout.title }}</div>
              <div class="flex justify-between text-slate-600 mt-1">
                <span>{{ workout.focus }} · {{ workout.total_sets }} sets</span>
                <span>{{ formatDate(workout.started_at) }}</span>
              </div>
            </RouterLink>
          </div>
          <p v-else class="font-mono text-xs text-slate-500">Belum ada workout selesai.</p>
        </PixelCard>

        <PixelCard title="Next: M6 Collaboration">
          <p class="font-mono text-sm text-slate-600">
            Progress dan feedback sudah tersedia. Berikutnya trainer workspace,
            notifications, dan organizations.
          </p>
          <RouterLink to="/app/workouts" class="pixel-button inline-flex mt-4 text-xs font-black uppercase">
            Review Workouts
          </RouterLink>
        </PixelCard>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import PixelCard from '../../components/ui/PixelCard.vue'
import StatusRow from '../../components/ui/StatusRow.vue'
import { browserTimezone } from '../../lib/profileOptions'
import { formatDate } from '../../lib/planOptions'
import { useProfileStore } from '../../stores/profileStore'
import { useProgressStore } from '../../stores/progressStore'
import type { PersonalRecord } from '../../types/progress'

const progressStore = useProgressStore()
const profileStore = useProfileStore()

const bodyPartRows = computed(() =>
  Object.entries(progressStore.bodyPartBalance)
    .map(([part, value]) => ({ part, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value),
)

const maxBodyPart = computed(() =>
  bodyPartRows.value.length ? Math.max(...bodyPartRows.value.map((item) => item.value)) : 1,
)

const maxVolume = computed(() => {
  const days = progressStore.progress?.days ?? []
  return Math.max(1, ...days.map((day) => day.total_volume_kg))
})

function barHeight(value: number): string {
  return `${Math.max(2, (value / maxVolume.value) * 100)}%`
}

function barPercent(value: number, max: number): string {
  return `${Math.max(2, (value / max) * 100)}%`
}

function formatDuration(seconds?: number | null): string {
  if (!seconds) return '0m'
  return `${Math.floor(seconds / 60)}m`
}

function formatRecordValue(record: PersonalRecord): string {
  if (record.record_type === 'max_reps') {
    return `${record.value} reps`
  }
  if (record.record_type === 'max_weight' || record.record_type === 'max_volume') {
    return `${record.value} kg`
  }
  return String(record.value)
}

async function loadRange(days: number) {
  await profileStore.load()
  await progressStore.load(profileStore.profile?.timezone ?? browserTimezone(), days)
}

onMounted(async () => {
  await profileStore.load()
  await progressStore.load(profileStore.profile?.timezone ?? browserTimezone(), 30)
})
</script>
