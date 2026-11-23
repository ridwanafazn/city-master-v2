<template>
  <div class="space-y-8">
    <header class="border-b-4 border-slate-900 pb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-blue-500 text-white border-2 border-slate-900 px-2 py-1 font-mono text-[10px] font-black uppercase">
            M4 · Workouts
          </span>
          <span class="font-mono text-[10px] text-slate-500 uppercase">
            {{ workoutStore.workouts.length }} sessions
          </span>
        </div>
        <h1 class="text-4xl md:text-5xl font-black uppercase tracking-tighter">
          Workout <span class="text-blue-600">History</span>
        </h1>
        <p class="text-slate-600 mt-2 font-mono text-sm max-w-2xl">
          Sesi latihan, set logs, dan status sinkronisasi offline.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <PixelButton
          v-if="workoutStore.pendingCount"
          variant="secondary"
          :disabled="workoutStore.syncing"
          @click="sync"
        >
          {{ workoutStore.syncing ? 'Syncing…' : `Sync ${workoutStore.pendingCount} Pending` }}
        </PixelButton>
        <RouterLink to="/app/plans" class="pixel-button text-xs font-black uppercase inline-flex items-center">
          Start From Plan
        </RouterLink>
      </div>
    </header>

    <div
      v-if="workoutStore.error"
      class="border-3 border-red-700 bg-red-50 p-3 font-mono text-xs text-red-800"
    >
      <p class="font-black uppercase">{{ workoutStore.errorCode || 'error' }}</p>
      <p>{{ workoutStore.error }}</p>
    </div>

    <div
      v-if="workoutStore.notice"
      class="border-3 border-green-700 bg-green-50 p-3 font-mono text-xs text-green-900"
    >
      {{ workoutStore.notice }}
    </div>

    <div v-if="workoutStore.loadingList && !workoutStore.workouts.length" class="font-mono text-sm text-slate-500">
      Loading workouts…
    </div>

    <div v-else-if="!workoutStore.workouts.length" class="border-3 border-slate-900 bg-white p-8 text-center">
      <p class="font-black uppercase">Belum ada workout.</p>
      <p class="mt-2 font-mono text-sm text-slate-600">
        Buka plan dan mulai workout dari salah satu hari.
      </p>
      <RouterLink to="/app/plans" class="pixel-button inline-flex mt-4 text-xs font-black uppercase">
        Open Plans
      </RouterLink>
    </div>

    <section v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <RouterLink
        v-for="workout in workoutStore.workouts"
        :key="workout.id"
        :to="`/app/workouts/${workout.id}`"
        class="border-3 border-slate-900 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
      >
        <div class="border-b-3 border-slate-900 bg-slate-100 px-4 py-2 flex justify-between items-center">
          <span class="font-mono text-[10px] font-black uppercase">{{ workout.status }}</span>
          <span class="font-mono text-[10px] text-slate-500">{{ formatDate(workout.started_at) }}</span>
        </div>
        <div class="p-4">
          <h2 class="font-black uppercase text-xl leading-tight">{{ workout.title }}</h2>
          <div class="mt-3 grid grid-cols-2 gap-2 font-mono text-xs text-slate-600">
            <div><span class="text-slate-400 uppercase">Focus</span><div class="font-bold text-slate-900">{{ workout.focus }}</div></div>
            <div><span class="text-slate-400 uppercase">Sets</span><div class="font-bold text-slate-900">{{ workout.total_sets }}</div></div>
            <div><span class="text-slate-400 uppercase">Reps</span><div class="font-bold text-slate-900">{{ workout.total_reps }}</div></div>
            <div><span class="text-slate-400 uppercase">Volume</span><div class="font-bold text-slate-900">{{ workout.total_volume_kg }} kg</div></div>
          </div>
        </div>
        <div class="border-t-3 border-slate-900 px-4 py-2 font-mono text-[10px] text-blue-700 font-black uppercase">
          Open Workout >
        </div>
      </RouterLink>
    </section>

    <div v-if="workoutStore.nextCursor" class="flex justify-center">
      <PixelButton variant="secondary" :disabled="workoutStore.loadingList" @click="loadMore">
        {{ workoutStore.loadingList ? 'Loading…' : 'Load More' }}
      </PixelButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import PixelButton from '../../components/ui/PixelButton.vue'
import { formatDate } from '../../lib/planOptions'
import { useWorkoutStore } from '../../stores/workoutStore'

const workoutStore = useWorkoutStore()

async function sync() {
  await workoutStore.syncPending()
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
