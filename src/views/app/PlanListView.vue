<template>
  <div class="space-y-8">
    <header class="border-b-4 border-slate-900 pb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-blue-500 text-white border-2 border-slate-900 px-2 py-1 font-mono text-[10px] font-black uppercase">
            M3 · Plans
          </span>
          <span class="font-mono text-[10px] text-slate-500 uppercase">
            {{ planStore.plans.length }} saved
          </span>
        </div>
        <h1 class="text-4xl md:text-5xl font-black uppercase tracking-tighter">
          Plan <span class="text-blue-600">Library</span>
        </h1>
        <p class="text-slate-600 mt-2 font-mono text-sm max-w-2xl">
          Plan tersimpan, versi immutable, share link, dan export PDF/ICS.
        </p>
      </div>
      <RouterLink to="/app/plans/new" class="pixel-button text-xs font-black uppercase inline-flex items-center">
        + New Plan
      </RouterLink>
    </header>

    <div
      v-if="planStore.error"
      class="border-3 border-red-700 bg-red-50 p-3 font-mono text-xs text-red-800"
    >
      <p class="font-black uppercase">{{ planStore.errorCode || 'error' }}</p>
      <p>{{ planStore.error }}</p>
    </div>

    <div v-if="planStore.loadingList && !planStore.plans.length" class="font-mono text-sm text-slate-500">
      Loading plans…
    </div>

    <div v-else-if="!planStore.plans.length" class="border-3 border-slate-900 bg-white p-8 text-center">
      <p class="font-black uppercase">Belum ada plan.</p>
      <p class="mt-2 font-mono text-sm text-slate-600">
        Buat plan pertama dari profil dan preferensi latihan.
      </p>
      <RouterLink to="/app/plans/new" class="pixel-button inline-flex mt-4 text-xs font-black uppercase">
        Create First Plan
      </RouterLink>
    </div>

    <section v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <RouterLink
        v-for="plan in planStore.plans"
        :key="plan.id"
        :to="`/app/plans/${plan.id}`"
        class="border-3 border-slate-900 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col"
      >
        <div class="border-b-3 border-slate-900 bg-slate-100 px-4 py-2 flex justify-between items-center">
          <span class="font-mono text-[10px] font-black uppercase">
            {{ plan.status }} · v{{ plan.current_version }}
          </span>
          <span class="font-mono text-[10px] text-slate-500">rev {{ plan.revision }}</span>
        </div>
        <div class="p-4 flex-grow">
          <h2 class="font-black uppercase text-xl leading-tight">{{ plan.title }}</h2>
          <div class="mt-3 grid grid-cols-2 gap-2 font-mono text-xs text-slate-600">
            <div>
              <div class="text-slate-400 uppercase">Split</div>
              <div class="font-bold text-slate-900">{{ splitLabel(plan.split_type) }}</div>
            </div>
            <div>
              <div class="text-slate-400 uppercase">Days</div>
              <div class="font-bold text-slate-900">{{ plan.day_count }}</div>
            </div>
            <div>
              <div class="text-slate-400 uppercase">Updated</div>
              <div class="font-bold text-slate-900">{{ formatDate(plan.updated_at) }}</div>
            </div>
            <div>
              <div class="text-slate-400 uppercase">Seed</div>
              <div class="font-bold text-slate-900">{{ plan.seed }}</div>
            </div>
          </div>
        </div>
        <div class="border-t-3 border-slate-900 px-4 py-2 font-mono text-[10px] text-blue-700 font-black uppercase">
          Open Plan >
        </div>
      </RouterLink>
    </section>

    <div v-if="planStore.nextCursor" class="flex justify-center">
      <PixelButton variant="secondary" :disabled="planStore.loadingList" @click="loadMore">
        {{ planStore.loadingList ? 'Loading…' : 'Load More' }}
      </PixelButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import PixelButton from '../../components/ui/PixelButton.vue'
import { formatDate, splitLabel } from '../../lib/planOptions'
import { usePlanStore } from '../../stores/planStore'

const planStore = usePlanStore()

function loadMore() {
  void planStore.list(false)
}

onMounted(() => {
  void planStore.list(true)
})
</script>
