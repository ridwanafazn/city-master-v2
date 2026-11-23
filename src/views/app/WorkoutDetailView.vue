<template>
  <div class="space-y-8">
    <header class="border-b-4 border-slate-900 pb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-blue-500 text-white border-2 border-slate-900 px-2 py-1 font-mono text-[10px] font-black uppercase">
            M4 · Workout
          </span>
          <span class="font-mono text-[10px] text-slate-500 uppercase">
            {{ workout?.status || 'loading' }} · {{ elapsedLabel }}
          </span>
        </div>
        <h1 class="text-4xl md:text-5xl font-black uppercase tracking-tighter">
          {{ workout?.title || 'Workout' }}
        </h1>
        <p v-if="workout" class="text-slate-600 mt-2 font-mono text-sm">
          {{ workout.focus }} · {{ workout.exercises.length }} exercises · {{ workout.timezone }}
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <RouterLink to="/app/workouts" class="pixel-button text-xs font-black uppercase inline-flex items-center">
          < History
        </RouterLink>
        <PixelButton
          v-if="workoutStore.pendingCount"
          variant="secondary"
          :disabled="workoutStore.syncing"
          @click="syncNow"
        >
          {{ workoutStore.syncing ? 'Syncing…' : `Sync ${workoutStore.pendingCount}` }}
        </PixelButton>
        <PixelButton
          v-if="workout?.status === 'in_progress'"
          :disabled="workoutStore.saving"
          @click="completeWorkout"
        >
          {{ workoutStore.saving ? 'Saving…' : 'Complete Workout' }}
        </PixelButton>
      </div>
    </header>

    <div
      v-if="workoutStore.offline || workoutStore.pendingCount"
      class="border-3 border-yellow-700 bg-yellow-50 p-3 font-mono text-xs text-yellow-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
    >
      <span>
        {{ workoutStore.offline ? 'Offline mode.' : 'Pending sync.' }}
        {{ workoutStore.pendingCount }} mutation menunggu.
      </span>
      <PixelButton variant="secondary" class="text-[10px]" :disabled="workoutStore.syncing" @click="syncNow">
        Sync Now
      </PixelButton>
    </div>

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

    <div v-if="workoutStore.loadingWorkout" class="font-mono text-sm text-slate-500">
      Loading workout…
    </div>

    <template v-else-if="workout">
      <section v-if="workout.status === 'completed'" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="border-3 border-slate-900 bg-white p-4 text-center">
          <div class="text-3xl font-black">{{ workout.total_sets }}</div>
          <div class="font-mono text-[10px] uppercase text-slate-500">Sets</div>
        </div>
        <div class="border-3 border-slate-900 bg-white p-4 text-center">
          <div class="text-3xl font-black">{{ workout.total_reps }}</div>
          <div class="font-mono text-[10px] uppercase text-slate-500">Reps</div>
        </div>
        <div class="border-3 border-slate-900 bg-white p-4 text-center">
          <div class="text-3xl font-black">{{ workout.total_volume_kg }}</div>
          <div class="font-mono text-[10px] uppercase text-slate-500">Volume kg</div>
        </div>
        <div class="border-3 border-slate-900 bg-white p-4 text-center">
          <div class="text-3xl font-black">{{ formatDuration(workout.duration_seconds) }}</div>
          <div class="font-mono text-[10px] uppercase text-slate-500">Duration</div>
        </div>
      </section>

      <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <PixelCard
            v-for="exercise in workout.exercises"
            :key="exercise.id"
            :title="exercise.exercise_name"
          >
            <template #action>
              <div class="flex gap-2">
                <span class="font-mono text-[10px] uppercase text-slate-500">
                  {{ exercise.body_part }} · {{ exercise.equipment.join(', ') }}
                </span>
                <button
                  v-if="workout.status === 'in_progress'"
                  type="button"
                  class="font-mono text-[10px] font-black uppercase underline"
                  @click="openSubstitute(exercise)"
                >
                  Substitute
                </button>
              </div>
            </template>

            <div v-if="exercise.substituted_from_exercise_id" class="mb-3 font-mono text-[10px] text-orange-700 uppercase">
              Substituted from {{ exercise.substituted_from_exercise_id }}
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr class="bg-slate-900 text-white">
                    <th class="p-2 border-2 border-slate-900">Set</th>
                    <th class="p-2 border-2 border-slate-900">Reps</th>
                    <th class="p-2 border-2 border-slate-900">Kg</th>
                    <th class="p-2 border-2 border-slate-900">RPE</th>
                    <th class="p-2 border-2 border-slate-900">Notes</th>
                    <th class="p-2 border-2 border-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="set in exercise.sets" :key="set.id">
                    <td class="p-2 border-2 border-slate-900 font-black">{{ set.set_number }}</td>
                    <template v-if="editingSetId === set.id">
                      <td class="p-2 border-2 border-slate-900"><input v-model.number="editDraft.reps" type="number" class="pixel-input p-1 text-xs" min="0" /></td>
                      <td class="p-2 border-2 border-slate-900"><input v-model.number="editDraft.weight_kg" type="number" class="pixel-input p-1 text-xs" min="0" step="0.5" /></td>
                      <td class="p-2 border-2 border-slate-900"><input v-model.number="editDraft.rpe" type="number" class="pixel-input p-1 text-xs" min="1" max="10" step="0.5" /></td>
                      <td class="p-2 border-2 border-slate-900"><input v-model.trim="editDraft.notes" type="text" class="pixel-input p-1 text-xs" /></td>
                      <td class="p-2 border-2 border-slate-900">
                        <div class="flex gap-1">
                          <button type="button" class="underline font-black" @click="saveEdit(set)">Save</button>
                          <button type="button" class="underline" @click="editingSetId = null">Cancel</button>
                        </div>
                      </td>
                    </template>
                    <template v-else>
                      <td class="p-2 border-2 border-slate-900">{{ set.reps ?? '—' }}</td>
                      <td class="p-2 border-2 border-slate-900">{{ set.weight_kg ?? '—' }}</td>
                      <td class="p-2 border-2 border-slate-900">{{ set.rpe ?? '—' }}</td>
                      <td class="p-2 border-2 border-slate-900 max-w-[12rem] truncate">{{ set.notes || '—' }}</td>
                      <td class="p-2 border-2 border-slate-900">
                        <div v-if="workout.status === 'in_progress'" class="flex gap-2">
                          <button type="button" class="underline" @click="startEdit(set)">Edit</button>
                          <button
                            v-if="confirmingSetId !== set.id"
                            type="button"
                            class="underline text-red-700"
                            @click="confirmingSetId = set.id"
                          >
                            Delete
                          </button>
                          <template v-else>
                            <button type="button" class="underline font-black text-red-700" @click="deleteSet(set)">Confirm</button>
                            <button type="button" class="underline" @click="confirmingSetId = null">Cancel</button>
                          </template>
                        </div>
                        <span v-else class="text-slate-400">—</span>
                      </td>
                    </template>
                  </tr>
                  <tr v-if="!exercise.sets.length">
                    <td colspan="6" class="p-3 border-2 border-slate-900 text-slate-500 text-center">
                      Belum ada set.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <form
              v-if="workout.status === 'in_progress'"
              class="mt-4 grid grid-cols-2 md:grid-cols-6 gap-2 items-end"
              @submit.prevent="addSet(exercise)"
            >
              <div>
                <label class="pixel-label text-[10px]">Reps</label>
                <input v-model.number="draftFor(exercise.id).reps" type="number" min="0" class="pixel-input p-1 text-xs" />
              </div>
              <div>
                <label class="pixel-label text-[10px]">Kg</label>
                <input v-model.number="draftFor(exercise.id).weight_kg" type="number" min="0" step="0.5" class="pixel-input p-1 text-xs" />
              </div>
              <div>
                <label class="pixel-label text-[10px]">RPE</label>
                <input v-model.number="draftFor(exercise.id).rpe" type="number" min="1" max="10" step="0.5" class="pixel-input p-1 text-xs" />
              </div>
              <div class="col-span-2">
                <label class="pixel-label text-[10px]">Notes</label>
                <input v-model.trim="draftFor(exercise.id).notes" type="text" class="pixel-input p-1 text-xs" />
              </div>
              <PixelButton type="submit" class="text-[10px]" :disabled="workoutStore.saving">Add Set</PixelButton>
            </form>
          </PixelCard>
        </div>

        <aside class="space-y-6">
          <PixelCard title="Workout Notes">
            <textarea v-model="notes" class="pixel-input min-h-[100px] text-xs" placeholder="Session notes" />
            <PixelButton
              v-if="workout.status === 'in_progress'"
              variant="secondary"
              class="mt-3 w-full text-[10px]"
              :disabled="workoutStore.saving"
              @click="saveNotes"
            >
              Save Notes
            </PixelButton>
          </PixelCard>

          <PixelCard title="Session">
            <div class="space-y-2 font-mono text-sm">
              <StatusRow label="Started" :value="formatDate(workout.started_at)" />
              <StatusRow label="Status" :value="workout.status" />
              <StatusRow label="Duration" :value="elapsedLabel" />
              <StatusRow label="Sets" :value="String(workout.total_sets)" />
              <StatusRow label="Volume" :value="`${workout.total_volume_kg} kg`" />
            </div>
          </PixelCard>

          <PixelCard v-if="substituteFor" title="Substitute Exercise">
            <p class="font-mono text-xs text-slate-600">
              Pilih pengganti untuk <strong>{{ substituteFor.exercise_name }}</strong>.
              Kandidat berasal dari fokus {{ workout.focus }} dan menghormati cedera.
            </p>
            <div v-if="loadingCandidates" class="mt-3 font-mono text-xs text-slate-500">Loading candidates…</div>
            <div v-else-if="!candidates.length" class="mt-3 font-mono text-xs text-red-700">
              Tidak ada kandidat aman. Coba equipment/fokus lain.
            </div>
            <ul v-else class="mt-3 space-y-2">
              <li v-for="candidate in candidates" :key="String(candidate.exercise_id)">
                <button
                  type="button"
                  class="w-full text-left border-2 border-slate-900 bg-white px-2 py-1.5 font-mono text-[11px] hover:bg-slate-100"
                  @click="chooseSubstitute(String(candidate.exercise_id))"
                >
                  <span class="font-black uppercase">{{ candidate.exercise_name }}</span>
                  <span class="block text-slate-500">{{ candidate.body_part }} · {{ candidate.equipment.join(', ') }}</span>
                </button>
              </li>
            </ul>
            <PixelButton variant="secondary" class="mt-3 w-full text-[10px]" @click="substituteFor = null">
              Cancel
            </PixelButton>
          </PixelCard>
        </aside>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { fitnessService } from '../../api/fitnessService'
import PixelButton from '../../components/ui/PixelButton.vue'
import PixelCard from '../../components/ui/PixelCard.vue'
import StatusRow from '../../components/ui/StatusRow.vue'
import { formatDate } from '../../lib/planOptions'
import { useProfileStore } from '../../stores/profileStore'
import { useWorkoutStore } from '../../stores/workoutStore'
import type { Exercise } from '../../types'
import type { SetLog, SetUpdateInput, WorkoutExercise } from '../../types/workouts'

interface SetDraft {
  reps: number | null
  weight_kg: number | null
  rpe: number | null
  notes: string
}

const route = useRoute()
const workoutStore = useWorkoutStore()
const profileStore = useProfileStore()

const workoutId = computed(() => String(route.params.workoutId))
const workout = computed(() => workoutStore.workout)
const notes = ref('')
const now = ref(Date.now())
const drafts = reactive<Record<string, SetDraft>>({})
const editingSetId = ref<string | null>(null)
const editDraft = reactive<SetUpdateInput>({})
const confirmingSetId = ref<string | null>(null)
const substituteFor = ref<WorkoutExercise | null>(null)
const candidates = ref<Exercise[]>([])
const loadingCandidates = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

const elapsedLabel = computed(() => {
  if (!workout.value) return '—'
  if (workout.value.status === 'completed') {
    return formatDuration(workout.value.duration_seconds)
  }
  const seconds = Math.max(
    0,
    Math.round((now.value - new Date(workout.value.started_at).getTime()) / 1000),
  )
  return formatDuration(seconds)
})

function formatDuration(seconds?: number | null): string {
  if (seconds == null) return '—'
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}m ${String(remainder).padStart(2, '0')}s`
}

function ensureDrafts() {
  for (const exercise of workout.value?.exercises ?? []) {
    draftFor(exercise.id)
  }
}

function draftFor(exerciseId: string): SetDraft {
  if (!drafts[exerciseId]) {
    drafts[exerciseId] = {
      reps: null,
      weight_kg: null,
      rpe: null,
      notes: '',
    }
  }
  return drafts[exerciseId]
}

function nextSetNumber(exercise: WorkoutExercise): number {
  const numbers = exercise.sets
    .filter((set) => !set.deleted_at)
    .map((set) => set.set_number)
  return numbers.length ? Math.max(...numbers) + 1 : 1
}

async function addSet(exercise: WorkoutExercise) {
  const draft = drafts[exercise.id]
  if (!draft || !workout.value) return
  const ok = await workoutStore.addSet(workout.value.id, {
    workout_exercise_id: exercise.id,
    set_number: nextSetNumber(exercise),
    reps: draft.reps,
    weight_kg: draft.weight_kg,
    rpe: draft.rpe,
    notes: draft.notes || null,
    completed: true,
  })
  if (ok) {
    draft.notes = ''
    ensureDrafts()
  }
}

function startEdit(set: SetLog) {
  editingSetId.value = set.id
  editDraft.reps = set.reps ?? null
  editDraft.weight_kg = set.weight_kg ?? null
  editDraft.rpe = set.rpe ?? null
  editDraft.notes = set.notes ?? ''
}

async function saveEdit(set: SetLog) {
  if (!workout.value) return
  const ok = await workoutStore.updateSet(workout.value.id, set, {
    reps: editDraft.reps,
    weight_kg: editDraft.weight_kg,
    rpe: editDraft.rpe,
    notes: editDraft.notes || null,
  })
  if (ok) editingSetId.value = null
}

async function deleteSet(set: SetLog) {
  if (!workout.value) return
  const ok = await workoutStore.deleteSet(workout.value.id, set)
  if (ok) confirmingSetId.value = null
}

async function saveNotes() {
  if (!workout.value) return
  await workoutStore.updateNotes(workout.value.id, notes.value || null)
}

async function completeWorkout() {
  if (!workout.value) return
  const ok = await workoutStore.complete(workout.value.id, notes.value || null)
  if (ok) {
    notes.value = workoutStore.workout?.notes ?? notes.value
  }
}

async function syncNow() {
  await workoutStore.syncPending(workoutId.value)
  if (workout.value) await workoutStore.load(workout.value.id)
  ensureDrafts()
}

async function openSubstitute(exercise: WorkoutExercise) {
  if (!workout.value) return
  substituteFor.value = exercise
  candidates.value = []
  loadingCandidates.value = true
  try {
    await profileStore.load()
    const response = await fitnessService.getDailyFocus({
      day_focus: workout.value.focus,
      injuries: profileStore.injuryTerms,
      preferred_equipment: profileStore.equipment,
      preferred_body_part: [],
    })
    const used = new Set(workout.value.exercises.map((item) => item.exercise_id))
    candidates.value = response.data.exercises.filter(
      (item) => String(item.exercise_id) !== exercise.exercise_id && !used.has(String(item.exercise_id)),
    )
  } catch {
    candidates.value = []
  } finally {
    loadingCandidates.value = false
  }
}

async function chooseSubstitute(replacementId: string) {
  if (!workout.value || !substituteFor.value) return
  const ok = await workoutStore.substitute(
    workout.value.id,
    substituteFor.value.id,
    replacementId,
  )
  if (ok) {
    substituteFor.value = null
    candidates.value = []
    ensureDrafts()
  }
}

function handleOnline() {
  if (workoutStore.pendingCount) void syncNow()
}

onMounted(async () => {
  await workoutStore.load(workoutId.value)
  notes.value = workoutStore.workout?.notes ?? ''
  ensureDrafts()
  workoutStore.refreshPending(workoutId.value)
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
  window.addEventListener('online', handleOnline)
  if (workoutStore.pendingCount) {
    await syncNow()
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  window.removeEventListener('online', handleOnline)
})
</script>
