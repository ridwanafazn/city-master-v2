<template>
  <div class="min-h-screen bg-slate-50">
    <header class="border-b-4 border-slate-900 bg-white">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <RouterLink to="/" class="flex items-center gap-3">
          <span class="bg-slate-900 text-green-400 font-black px-2 py-1 border-3 border-slate-900">JYMZ</span>
          <span class="font-black uppercase tracking-tight hidden sm:block">Shared Plan</span>
        </RouterLink>
        <span class="font-mono text-[10px] uppercase text-slate-500">Read-only · no login</span>
      </div>
    </header>

    <main class="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <div v-if="loading" class="font-mono text-sm text-slate-500">Loading shared plan…</div>

      <div
        v-else-if="error"
        class="border-3 border-red-700 bg-red-50 p-6 text-center"
      >
        <h1 class="font-black uppercase text-xl">Share link tidak tersedia</h1>
        <p class="mt-2 font-mono text-sm text-red-800">{{ error }}</p>
        <RouterLink to="/" class="pixel-button inline-flex mt-4 text-xs font-black uppercase">
          Open Public Engine
        </RouterLink>
      </div>

      <template v-else-if="plan">
        <header class="border-b-4 border-slate-900 pb-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="bg-blue-500 text-white border-2 border-slate-900 px-2 py-1 font-mono text-[10px] font-black uppercase">
              Shared Plan
            </span>
            <span class="font-mono text-[10px] text-slate-500 uppercase">
              Expires {{ formatDate(plan.expires_at) }}
            </span>
          </div>
          <h1 class="text-4xl md:text-5xl font-black uppercase tracking-tighter">{{ plan.title }}</h1>
          <p class="text-slate-600 mt-2 font-mono text-sm">
            {{ splitLabel(plan.split_type) }} · {{ plan.days.length }} days · seed {{ plan.seed }}
          </p>
        </header>

        <div
          v-if="plan.warnings.length"
          class="border-3 border-yellow-700 bg-yellow-50 p-3 font-mono text-xs text-yellow-900"
        >
          <p class="font-black uppercase mb-1">Plan warnings</p>
          <ul class="list-disc list-inside space-y-1">
            <li v-for="warning in plan.warnings" :key="warning">{{ warning }}</li>
          </ul>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="day in plan.days"
            :key="day.day"
            type="button"
            class="border-3 border-slate-900 px-3 py-2 font-mono text-xs font-black uppercase"
            :class="activeDayNumber === day.day ? 'bg-slate-900 text-white' : 'bg-white'"
            @click="activeDayNumber = day.day"
          >
            Day {{ day.day }} · {{ day.day_focus }}
          </button>
        </div>

        <PixelCard v-if="activeDay" :title="`${activeDay.day_focus} · ${activeDay.exercises.length} exercises`">
          <div class="overflow-x-auto">
            <table class="w-full text-left font-mono text-sm border-collapse">
              <thead>
                <tr class="bg-slate-900 text-white">
                  <th class="p-3 border-3 border-slate-900">Exercise</th>
                  <th class="p-3 border-3 border-slate-900">Target</th>
                  <th class="p-3 border-3 border-slate-900">Equipment</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="exercise in activeDay.exercises" :key="exercise.id">
                  <td class="p-3 border-3 border-slate-900 font-bold uppercase">{{ exercise.exercise_name }}</td>
                  <td class="p-3 border-3 border-slate-900">{{ bodyPartLabel(exercise.body_part) }}</td>
                  <td class="p-3 border-3 border-slate-900">
                    <span v-for="item in exercise.equipment" :key="item" class="inline-block border-2 border-slate-900 px-2 py-0.5 mr-1 mb-1 text-[10px] uppercase">
                      {{ item }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </PixelCard>

        <p class="font-mono text-[10px] text-slate-500 text-center">
          Shared by a JYMZ user · not medical advice · no owner identity included
        </p>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { plansService } from '../../api/plansService'
import PixelCard from '../../components/ui/PixelCard.vue'
import { bodyPartLabel, formatDate, splitLabel } from '../../lib/planOptions'
import type { PublicPlan } from '../../types/plans'

const route = useRoute()
const plan = ref<PublicPlan | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const activeDayNumber = ref(1)

const activeDay = computed(() => {
  if (!plan.value) return null
  return plan.value.days.find((day) => day.day === activeDayNumber.value) ?? plan.value.days[0] ?? null
})

onMounted(async () => {
  try {
    plan.value = await plansService.getShared(String(route.params.token))
    activeDayNumber.value = plan.value.days[0]?.day ?? 1
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Share link tidak ditemukan atau sudah kedaluwarsa.'
  } finally {
    loading.value = false
  }
})
</script>
