<template>
  <div class="space-y-8">
    <header class="border-b-4 border-slate-900 pb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-blue-500 text-white border-2 border-slate-900 px-2 py-1 font-mono text-[10px] font-black uppercase">
            M3 · Plan Detail
          </span>
          <span class="font-mono text-[10px] text-slate-500 uppercase">
            {{ plan?.status }} · v{{ plan?.current_version }} · rev {{ plan?.revision }}
          </span>
        </div>
        <h1 class="text-4xl md:text-5xl font-black uppercase tracking-tighter">
          {{ plan?.title || 'Plan' }}
        </h1>
        <p v-if="plan" class="text-slate-600 mt-2 font-mono text-sm">
          {{ splitLabel(plan.split_type) }} · {{ plan.days.length }} days · BMI
          {{ plan.bmi?.toFixed(1) ?? '—' }} ({{ plan.bmi_category || '—' }})
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <RouterLink to="/app/plans" class="pixel-button text-xs font-black uppercase inline-flex items-center">
          < Plans
        </RouterLink>
        <PixelButton variant="secondary" :disabled="planStore.exporting" @click="exportPdf">
          PDF
        </PixelButton>
        <PixelButton variant="secondary" :disabled="planStore.exporting" @click="exportIcs">
          ICS
        </PixelButton>
      </div>
    </header>

    <div
      v-if="planStore.error"
      class="border-3 border-red-700 bg-red-50 p-3 font-mono text-xs text-red-800"
    >
      <p class="font-black uppercase">{{ planStore.errorCode || 'error' }}</p>
      <p>{{ planStore.error }}</p>
    </div>

    <div
      v-if="planStore.notice"
      class="border-3 border-green-700 bg-green-50 p-3 font-mono text-xs text-green-900"
    >
      {{ planStore.notice }}
    </div>

    <div v-if="planStore.loadingPlan" class="font-mono text-sm text-slate-500">
      Loading plan…
    </div>

    <template v-else-if="plan">
      <div
        v-if="plan.warnings.length"
        class="border-3 border-yellow-700 bg-yellow-50 p-3 font-mono text-xs text-yellow-900"
      >
        <p class="font-black uppercase mb-1">Plan warnings</p>
        <ul class="list-disc list-inside space-y-1">
          <li v-for="warning in plan.warnings" :key="warning">{{ warning }}</li>
        </ul>
      </div>

      <section class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div class="xl:col-span-2 space-y-4">
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

          <div v-if="activeDay" class="border-3 border-slate-900 bg-white">
            <div class="border-b-3 border-slate-900 bg-slate-100 px-4 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span class="font-black uppercase text-sm">
                {{ activeDay.day_focus }} · {{ activeDay.exercises.length }} exercises
              </span>
              <PixelButton
                variant="secondary"
                :disabled="planStore.saving"
                class="text-[10px]"
                @click="regenerateDay"
              >
                Regenerate Day
              </PixelButton>
            </div>

            <div class="divide-y-2 divide-slate-200">
              <div
                v-for="exercise in activeDay.exercises"
                :key="exercise.id"
                class="p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <img
                  v-if="exercise.exercise_image"
                  :src="exercise.exercise_image"
                  :alt="exercise.exercise_name"
                  class="w-16 h-16 object-cover border-2 border-slate-900 bg-white shrink-0"
                  loading="lazy"
                />
                <div class="flex-grow min-w-0">
                  <div class="font-black uppercase leading-tight">{{ exercise.exercise_name }}</div>
                  <div class="mt-1 font-mono text-[10px] text-slate-500 uppercase">
                    {{ bodyPartLabel(exercise.body_part) }} · {{ exercise.equipment.join(', ') }}
                  </div>
                </div>
                <div class="flex gap-2 shrink-0">
                  <PixelButton
                    variant="secondary"
                    class="text-[10px]"
                    :disabled="planStore.saving"
                    @click="toggleLock(exercise)"
                  >
                    {{ exercise.locked ? 'Unlock' : 'Lock' }}
                  </PixelButton>
                  <PixelButton
                    variant="secondary"
                    class="text-[10px]"
                    :disabled="planStore.saving || exercise.locked"
                    @click="swapExercise(exercise)"
                  >
                    Swap
                  </PixelButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside class="space-y-6">
          <PixelCard title="Metadata">
            <div class="space-y-2 font-mono text-sm">
              <StatusRow label="Seed" :value="String(plan.seed)" />
              <StatusRow label="Dataset" :value="plan.dataset_version" />
              <StatusRow label="Algorithm" :value="plan.algorithm_version" />
              <StatusRow label="Created" :value="formatDate(plan.created_at)" />
              <StatusRow label="Updated" :value="formatDate(plan.updated_at)" />
            </div>
          </PixelCard>

          <PixelCard title="Share">
            <p class="font-mono text-xs text-slate-600">
              Share link read-only. Token hanya ditampilkan sekali.
            </p>
            <div class="mt-3 flex items-center gap-2">
              <select v-model.number="shareDays" class="pixel-input text-xs">
                <option v-for="days in SHARE_EXPIRY_OPTIONS" :key="days" :value="days">
                  {{ days }} days
                </option>
              </select>
              <PixelButton :disabled="planStore.saving" class="text-[10px]" @click="createShare">
                Create
              </PixelButton>
            </div>
            <div v-if="planStore.share" class="mt-3 space-y-2">
              <input :value="frontendShareUrl" readonly class="pixel-input text-[10px]" />
              <div class="flex gap-2">
                <PixelButton variant="secondary" class="text-[10px]" @click="copyShare">
                  Copy Link
                </PixelButton>
                <PixelButton variant="danger" class="text-[10px]" @click="revokeShare">
                  Revoke
                </PixelButton>
              </div>
              <p class="font-mono text-[10px] text-slate-500">
                Expires {{ formatDate(planStore.share.expires_at) }}
              </p>
            </div>
          </PixelCard>

          <PixelCard title="Versions">
            <div v-if="!planStore.versions.length" class="font-mono text-xs text-slate-500">
              Belum ada riwayat.
            </div>
            <ul v-else class="space-y-2 font-mono text-xs">
              <li
                v-for="version in planStore.versions"
                :key="version.version"
                class="flex justify-between gap-3 border-b border-slate-200 pb-2 last:border-b-0"
              >
                <span class="font-black">v{{ version.version }} · {{ splitLabel(version.split_type) }}</span>
                <span class="text-slate-500">{{ formatDate(version.created_at) }}</span>
              </li>
            </ul>
          </PixelCard>

          <PixelCard title="Danger Zone">
            <div v-if="!confirmingDelete">
              <PixelButton variant="danger" class="text-[10px]" @click="confirmingDelete = true">
                Delete Plan
              </PixelButton>
            </div>
            <div v-else class="flex flex-wrap gap-2">
              <PixelButton variant="danger" class="text-[10px]" :disabled="planStore.saving" @click="deletePlan">
                Confirm Delete
              </PixelButton>
              <PixelButton variant="secondary" class="text-[10px]" @click="confirmingDelete = false">
                Cancel
              </PixelButton>
            </div>
          </PixelCard>
        </aside>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PixelButton from '../../components/ui/PixelButton.vue'
import PixelCard from '../../components/ui/PixelCard.vue'
import StatusRow from '../../components/ui/StatusRow.vue'
import { bodyPartLabel, formatDate, SHARE_EXPIRY_OPTIONS, splitLabel } from '../../lib/planOptions'
import { usePlanStore } from '../../stores/planStore'
import type { PlanExercise } from '../../types/plans'

const route = useRoute()
const router = useRouter()
const planStore = usePlanStore()

const planId = computed(() => String(route.params.planId))
const plan = computed(() => planStore.plan)
const activeDayNumber = ref(1)
const shareDays = ref(7)
const confirmingDelete = ref(false)

const activeDay = computed(() => {
  if (!plan.value) return null
  return plan.value.days.find((day) => day.day === activeDayNumber.value) ?? plan.value.days[0] ?? null
})

const frontendShareUrl = computed(() => {
  if (!planStore.share) return ''
  return `${window.location.origin}/shared/${planStore.share.token}`
})

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
  if (ok) await router.replace({ name: 'app-plans' })
}

onMounted(async () => {
  await planStore.load(planId.value)
  if (plan.value) {
    activeDayNumber.value = plan.value.days[0]?.day ?? 1
  }
  await reloadVersions()
})
</script>
