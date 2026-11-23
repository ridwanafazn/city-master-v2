<template>
  <div class="workout-page">
    <header class="page-head">
      <div class="page-head__copy">
        <RouterLink to="/app/workouts" class="back-link">
          <ArrowLeft :size="15" aria-hidden="true" />
          Riwayat sesi
        </RouterLink>
        <div class="title-row">
          <h1>{{ workout?.title || 'Sesi' }}</h1>
          <Badge
            v-if="workout"
            :variant="workout.status === 'in_progress' ? 'signal' : 'success'"
            :dot="workout.status === 'in_progress'"
          >
            {{ statusLabel }}
          </Badge>
        </div>
        <p v-if="workout" class="page-meta">
          {{ workout.focus }} · {{ workout.exercises.length }} latihan ·
          {{ workout.timezone }}
        </p>
      </div>

      <div class="page-actions">
        <AppButton
          v-if="workoutStore.pendingCount"
          variant="secondary"
          :loading="workoutStore.syncing"
          @click="syncNow"
        >
          Sync {{ workoutStore.pendingCount }}
        </AppButton>
        <AppButton
          v-if="workout?.status === 'in_progress'"
          :disabled="workoutStore.saving"
          @click="completeSheetOpen = true"
        >
          <Check :size="16" aria-hidden="true" />
          Selesaikan sesi
        </AppButton>
      </div>
    </header>

    <div v-if="workoutStore.offline || workoutStore.pendingCount" class="offline-banner" role="status">
      <div>
        <strong>{{ workoutStore.offline ? 'Mode offline' : 'Sinkronisasi tertunda' }}</strong>
        <p>{{ workoutStore.pendingCount }} perubahan tersimpan di perangkat ini.</p>
      </div>
      <AppButton variant="secondary" size="sm" :loading="workoutStore.syncing" @click="syncNow">
        Sync sekarang
      </AppButton>
    </div>

    <p v-if="workoutStore.error" class="inline-error" role="alert">{{ workoutStore.error }}</p>
    <p v-if="workoutStore.notice" class="inline-notice" role="status">{{ workoutStore.notice }}</p>

    <div v-if="workoutStore.loadingWorkout && !workout" class="detail-loading" aria-busy="true">
      <Skeleton width="36%" height="1.5rem" />
      <Skeleton :lines="4" height="0.75rem" />
    </div>

    <template v-else-if="workout">
      <div v-if="restRunning" class="rest-bar" role="status" aria-live="polite">
        <div class="rest-bar__copy">
          <TimerReset :size="18" aria-hidden="true" />
          <div>
            <span class="type-data">Istirahat</span>
            <strong>{{ restLabel }}</strong>
          </div>
        </div>
        <div class="rest-bar__track" aria-hidden="true">
          <span :style="{ width: `${restPercent}%` }" />
        </div>
        <div class="rest-bar__actions">
          <AppButton variant="ghost" size="sm" @click="addRest(30)">+30 s</AppButton>
          <AppButton variant="secondary" size="sm" @click="stopRest">Lewati</AppButton>
        </div>
      </div>

      <dl v-if="workout.status === 'completed'" class="completion-ledger">
        <div><dt>Set</dt><dd>{{ workout.total_sets }}</dd></div>
        <div><dt>Reps</dt><dd>{{ workout.total_reps }}</dd></div>
        <div><dt>Volume</dt><dd>{{ formatKg(workout.total_volume_kg) }}</dd></div>
        <div><dt>Durasi</dt><dd>{{ elapsedLabel }}</dd></div>
      </dl>

      <div class="workout-layout">
        <div class="workout-main">
          <section class="exercise-stack" aria-label="Latihan dalam sesi">
            <article
              v-for="(exercise, index) in workout.exercises"
              :key="exercise.id"
              class="exercise-block"
            >
              <button
                type="button"
                class="exercise-head"
                :aria-expanded="activeExerciseId === exercise.id"
                :aria-controls="`exercise-body-${exercise.id}`"
                @click="toggleExercise(exercise.id)"
              >
                <span class="exercise-index type-data">{{ index + 1 }}</span>
                <span class="exercise-head__copy">
                  <strong>{{ exercise.exercise_name }}</strong>
                  <small>
                    {{ exercise.body_part }} · {{ exercise.equipment.join(', ') }} ·
                    {{ exercise.sets.length }} set
                  </small>
                </span>
                <ChevronUp v-if="activeExerciseId === exercise.id" :size="18" aria-hidden="true" />
                <ChevronDown v-else :size="18" aria-hidden="true" />
              </button>

              <div
                v-if="activeExerciseId === exercise.id"
                :id="`exercise-body-${exercise.id}`"
                class="exercise-body"
              >
                <div class="exercise-tools">
                  <span class="type-data">
                    {{ exercise.sets.length }} set tercatat
                  </span>
                  <AppButton
                    v-if="workout.status === 'in_progress'"
                    variant="ghost"
                    size="sm"
                    @click="openSubstitute(exercise)"
                  >
                    <RefreshCw :size="15" aria-hidden="true" />
                    Ganti exercise
                  </AppButton>
                </div>

                <div class="set-table-scroll">
                  <table class="set-table">
                    <caption class="sr-only">
                      Set untuk {{ exercise.exercise_name }}
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Set</th>
                        <th scope="col">Reps</th>
                        <th scope="col">Beban</th>
                        <th scope="col">RPE</th>
                        <th scope="col">Catatan</th>
                        <th scope="col">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="set in exercise.sets" :key="set.id">
                        <td>{{ set.set_number }}</td>
                        <template v-if="editingSetId === set.id">
                          <td>
                            <input
                              v-model.number="editDraft.reps"
                              type="number"
                              min="0"
                              class="set-cell-input"
                              :aria-label="`Reps set ${set.set_number}`"
                            />
                          </td>
                          <td>
                            <input
                              v-model.number="editDraft.weight_kg"
                              type="number"
                              min="0"
                              step="0.5"
                              class="set-cell-input"
                              :aria-label="`Beban set ${set.set_number}`"
                            />
                          </td>
                          <td>
                            <input
                              v-model.number="editDraft.rpe"
                              type="number"
                              min="1"
                              max="10"
                              step="0.5"
                              class="set-cell-input"
                              :aria-label="`RPE set ${set.set_number}`"
                            />
                          </td>
                          <td>
                            <input
                              v-model.trim="editDraft.notes"
                              type="text"
                              class="set-cell-input"
                              :aria-label="`Catatan set ${set.set_number}`"
                            />
                          </td>
                          <td>
                            <div class="row-actions">
                              <AppButton size="sm" @click="saveEdit(set)">Simpan</AppButton>
                              <AppButton size="sm" variant="ghost" @click="editingSetId = null">
                                Batal
                              </AppButton>
                            </div>
                          </td>
                        </template>
                        <template v-else>
                          <td>{{ set.reps ?? '—' }}</td>
                          <td>{{ set.weight_kg != null ? `${set.weight_kg} kg` : '—' }}</td>
                          <td>{{ set.rpe ?? '—' }}</td>
                          <td class="set-notes">{{ set.notes || '—' }}</td>
                          <td>
                            <div v-if="workout.status === 'in_progress'" class="row-actions">
                              <template v-if="confirmingSetId === set.id">
                                <AppButton size="sm" variant="danger" @click="deleteSet(set)">
                                  Hapus?
                                </AppButton>
                                <AppButton size="sm" variant="ghost" @click="confirmingSetId = null">
                                  Batal
                                </AppButton>
                              </template>
                              <template v-else>
                                <IconButton label="Edit set" variant="secondary" size="sm" @click="startEdit(set)">
                                  <Pencil :size="15" />
                                </IconButton>
                                <IconButton
                                  label="Hapus set"
                                  variant="danger"
                                  size="sm"
                                  @click="confirmingSetId = set.id"
                                >
                                  <Trash2 :size="15" />
                                </IconButton>
                              </template>
                            </div>
                            <span v-else class="type-data muted">—</span>
                          </td>
                        </template>
                      </tr>
                      <tr v-if="!exercise.sets.length">
                        <td colspan="6" class="empty-sets">Belum ada set.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <form
                  v-if="workout.status === 'in_progress'"
                  class="set-editor"
                  @submit.prevent="addSet(exercise)"
                >
                  <div class="stepper-field">
                    <label :for="`reps-${exercise.id}`">Reps</label>
                    <div class="stepper">
                      <IconButton label="Kurangi reps" variant="secondary" size="sm" @click="adjustDraft('reps', -1)">
                        <Minus :size="15" />
                      </IconButton>
                      <input
                        :id="`reps-${exercise.id}`"
                        v-model.number="draftFor(exercise.id).reps"
                        type="number"
                        min="0"
                        inputmode="numeric"
                      />
                      <IconButton label="Tambah reps" variant="secondary" size="sm" @click="adjustDraft('reps', 1)">
                        <Plus :size="15" />
                      </IconButton>
                    </div>
                  </div>

                  <div class="stepper-field">
                    <label :for="`weight-${exercise.id}`">Beban (kg)</label>
                    <div class="stepper">
                      <IconButton label="Kurangi beban" variant="secondary" size="sm" @click="adjustDraft('weight_kg', -2.5, 0)">
                        <Minus :size="15" />
                      </IconButton>
                      <input
                        :id="`weight-${exercise.id}`"
                        v-model.number="draftFor(exercise.id).weight_kg"
                        type="number"
                        min="0"
                        step="0.5"
                        inputmode="decimal"
                      />
                      <IconButton label="Tambah beban" variant="secondary" size="sm" @click="adjustDraft('weight_kg', 2.5, 0)">
                        <Plus :size="15" />
                      </IconButton>
                    </div>
                  </div>

                  <div class="rpe-field">
                    <span>RPE</span>
                    <div class="rpe-options">
                      <Chip
                        v-for="value in [6, 7, 8, 9, 10]"
                        :key="value"
                        :selected="draftFor(exercise.id).rpe === value"
                        @toggle="toggleRpe(exercise.id, value)"
                      >
                        {{ value }}
                      </Chip>
                    </div>
                  </div>

                  <div class="set-editor__actions">
                    <button
                      type="button"
                      class="notes-toggle"
                      @click="notesVisible = !notesVisible"
                    >
                      {{ notesVisible ? 'Sembunyikan catatan' : 'Tambah catatan' }}
                    </button>
                    <AppButton type="submit" :loading="workoutStore.saving">
                      Catat set
                      <Plus :size="16" aria-hidden="true" />
                    </AppButton>
                  </div>

                  <textarea
                    v-if="notesVisible"
                    v-model.trim="draftFor(exercise.id).notes"
                    class="ui-v2-control set-notes-input"
                    rows="2"
                    :aria-label="`Catatan set untuk ${exercise.exercise_name}`"
                    placeholder="Contoh: tempo 3-1-1, rep terakhir grind."
                  />
                </form>
              </div>
            </article>
          </section>

          <section v-if="workout.status === 'completed'" class="feedback-section" aria-labelledby="feedback-title">
            <h2 id="feedback-title">Feedback & safety</h2>
            <div class="feedback-grid">
              <FeedbackForm
                :plan-id="workout.plan_id"
                :workout-id="workout.id"
                title="Feedback sesi"
              />
              <SafetyReportForm
                v-if="safetyExercises.length"
                :plan-id="workout.plan_id"
                :workout-id="workout.id"
                :exercises="safetyExercises"
              />
            </div>
          </section>
        </div>

        <aside class="workout-rail">
          <section class="rail-block" aria-labelledby="session-summary-title">
            <h2 id="session-summary-title">Sesi</h2>
            <dl class="rail-list">
              <div><dt>Status</dt><dd>{{ statusLabel }}</dd></div>
              <div><dt>Durasi</dt><dd>{{ elapsedLabel }}</dd></div>
              <div><dt>Set</dt><dd>{{ workout.total_sets }}</dd></div>
              <div><dt>Volume</dt><dd>{{ formatKg(workout.total_volume_kg) }}</dd></div>
            </dl>
          </section>

          <details class="rail-block" open>
            <summary>Catatan sesi</summary>
            <AppTextarea
              v-model="notes"
              label="Catatan sesi"
              :rows="4"
              placeholder="Fokus, kondisi tubuh, atau catatan untuk sesi berikutnya."
            />
            <AppButton
              v-if="workout.status === 'in_progress'"
              variant="secondary"
              size="sm"
              class="notes-save"
              :disabled="workoutStore.saving"
              @click="saveNotes"
            >
              Simpan catatan
            </AppButton>
          </details>
        </aside>
      </div>
    </template>

    <Sheet
      v-model:open="completeSheetOpen"
      title="Selesaikan sesi"
      description="Ringkasan sebelum disimpan."
    >
      <template v-if="workout">
        <dl class="sheet-summary">
          <div><dt>Set</dt><dd>{{ workout.total_sets }}</dd></div>
          <div><dt>Reps</dt><dd>{{ workout.total_reps }}</dd></div>
          <div><dt>Volume</dt><dd>{{ formatKg(workout.total_volume_kg) }}</dd></div>
          <div><dt>Durasi</dt><dd>{{ elapsedLabel }}</dd></div>
        </dl>
        <AppTextarea
          v-model="notes"
          label="Catatan sesi"
          :rows="3"
          placeholder="Catatan akhir sebelum sesi ditutup."
        />
      </template>
      <template #footer>
        <AppButton block :loading="workoutStore.saving" @click="confirmComplete">
          Simpan sesi
        </AppButton>
        <AppButton variant="ghost" block @click="completeSheetOpen = false">
          Kembali
        </AppButton>
      </template>
    </Sheet>

    <Sheet
      v-model:open="substituteSheetOpen"
      title="Ganti exercise"
      description="Kandidat berasal dari fokus sesi dan menghormati cedera di profil."
    >
      <div v-if="loadingCandidates" class="candidate-loading" aria-busy="true">
        <Skeleton :lines="3" height="0.75rem" />
      </div>
      <p v-else-if="!candidates.length" class="rail-copy">
        Tidak ada kandidat aman. Coba ubah equipment atau fokus sesi.
      </p>
      <ul v-else class="candidate-list">
        <li v-for="candidate in candidates" :key="String(candidate.exercise_id)">
          <button type="button" class="candidate-row" @click="chooseSubstitute(String(candidate.exercise_id))">
            <span>{{ candidate.exercise_name }}</span>
            <small>{{ candidate.body_part }} · {{ candidate.equipment.join(', ') }}</small>
          </button>
        </li>
      </ul>
    </Sheet>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Minus,
  Pencil,
  Plus,
  RefreshCw,
  TimerReset,
  Trash2,
} from '@lucide/vue'
import AppButton from '../../components/ui-v2/AppButton.vue'
import AppTextarea from '../../components/ui-v2/AppTextarea.vue'
import Badge from '../../components/ui-v2/Badge.vue'
import Chip from '../../components/ui-v2/Chip.vue'
import IconButton from '../../components/ui-v2/IconButton.vue'
import Sheet from '../../components/ui-v2/Sheet.vue'
import Skeleton from '../../components/ui-v2/Skeleton.vue'
import FeedbackForm from '../../components/feedback/FeedbackForm.vue'
import SafetyReportForm from '../../components/feedback/SafetyReportForm.vue'
import { fitnessService } from '../../api/fitnessService'
import { useProfileStore } from '../../stores/profileStore'
import { useWorkoutStore } from '../../stores/workoutStore'
import type { Exercise } from '../../types'
import type { SafetyExercise } from '../../types/feedback'
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
const activeExerciseId = ref<string | null>(null)
const editingSetId = ref<string | null>(null)
const editDraft = reactive<SetUpdateInput>({})
const confirmingSetId = ref<string | null>(null)
const notesVisible = ref(false)
const completeSheetOpen = ref(false)
const substituteSheetOpen = ref(false)
const substituteFor = ref<WorkoutExercise | null>(null)
const candidates = ref<Exercise[]>([])
const loadingCandidates = ref(false)
const restSeconds = ref(0)
const restTotal = ref(90)
const restRunning = ref(false)
let timer: ReturnType<typeof setInterval> | undefined
let restTimer: ReturnType<typeof setInterval> | undefined

const isInProgress = computed(() => workout.value?.status === 'in_progress')
const activeExercise = computed(() =>
  workout.value?.exercises.find((exercise) => exercise.id === activeExerciseId.value) ?? null,
)
const statusLabel = computed(() => {
  if (workout.value?.status === 'completed') return 'Selesai'
  if (workout.value?.status === 'abandoned') return 'Dihentikan'
  return 'Live'
})

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

const restLabel = computed(() => {
  const minutes = Math.floor(restSeconds.value / 60)
  const seconds = restSeconds.value % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
})

const restPercent = computed(() =>
  restTotal.value ? Math.max(0, Math.min(100, (restSeconds.value / restTotal.value) * 100)) : 0,
)

const safetyExercises = computed<SafetyExercise[]>(() =>
  (workout.value?.exercises ?? []).map((exercise) => ({
    id: exercise.id,
    label: exercise.exercise_name,
    exerciseId: exercise.exercise_id,
  })),
)

function formatDuration(seconds?: number | null): string {
  if (seconds == null) return '—'
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}m ${String(remainder).padStart(2, '0')}s`
}

function formatKg(value: number): string {
  return `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(value)} kg`
}

function ensureDrafts() {
  for (const exercise of workout.value?.exercises ?? []) {
    draftFor(exercise.id)
  }
}

function draftFor(exerciseId: string): SetDraft {
  if (!drafts[exerciseId]) {
    const exercise = workout.value?.exercises.find((item) => item.id === exerciseId)
    const last = exercise?.sets.filter((set) => !set.deleted_at).at(-1)
    drafts[exerciseId] = {
      reps: last?.reps ?? 8,
      weight_kg: last?.weight_kg ?? 20,
      rpe: last?.rpe ?? 8,
      notes: '',
    }
  }
  return drafts[exerciseId] as SetDraft
}

function adjustDraft(field: 'reps' | 'weight_kg', delta: number, min = 0) {
  if (!activeExercise.value) return
  const draft = draftFor(activeExercise.value.id)
  const current = Number(draft[field] ?? 0)
  draft[field] = Math.max(min, Math.round((current + delta) * 2) / 2)
}

function toggleRpe(exerciseId: string, value: number) {
  const draft = draftFor(exerciseId)
  draft.rpe = draft.rpe === value ? null : value
}

function toggleExercise(exerciseId: string) {
  activeExerciseId.value = activeExerciseId.value === exerciseId ? null : exerciseId
}

function nextSetNumber(exercise: WorkoutExercise): number {
  const numbers = exercise.sets
    .filter((set) => !set.deleted_at)
    .map((set) => set.set_number)
  return numbers.length ? Math.max(...numbers) + 1 : 1
}

function startRest(seconds = 90) {
  stopRest()
  restTotal.value = seconds
  restSeconds.value = seconds
  restRunning.value = true
  restTimer = setInterval(() => {
    if (restSeconds.value <= 1) {
      restSeconds.value = 0
      stopRest()
      return
    }
    restSeconds.value -= 1
  }, 1000)
}

function addRest(seconds: number) {
  restSeconds.value += seconds
  restTotal.value = Math.max(restTotal.value, restSeconds.value)
  if (!restRunning.value) {
    restRunning.value = true
    restTimer = setInterval(() => {
      if (restSeconds.value <= 1) {
        restSeconds.value = 0
        stopRest()
        return
      }
      restSeconds.value -= 1
    }, 1000)
  }
}

function stopRest() {
  restRunning.value = false
  if (restTimer) {
    clearInterval(restTimer)
    restTimer = undefined
  }
}

async function addSet(exercise: WorkoutExercise) {
  if (!workout.value) return
  const draft = draftFor(exercise.id)
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
    notesVisible.value = false
    startRest(90)
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

async function confirmComplete() {
  if (!workout.value) return
  const ok = await workoutStore.complete(workout.value.id, notes.value || null)
  if (ok) {
    notes.value = workoutStore.workout?.notes ?? notes.value
    completeSheetOpen.value = false
    stopRest()
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
  substituteSheetOpen.value = true
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
    substituteSheetOpen.value = false
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
  activeExerciseId.value =
    workoutStore.workout?.exercises.find((exercise) => !exercise.sets.length)?.id ??
    workoutStore.workout?.exercises[0]?.id ??
    null
  workoutStore.refreshPending(workoutId.value)
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
  window.addEventListener('online', handleOnline)
  if (workoutStore.pendingCount) await syncNow()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  stopRest()
  window.removeEventListener('online', handleOnline)
})
</script>

<style scoped>
.workout-page {
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

.offline-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid #f2d9b2;
  border-radius: var(--radius-card);
  background: var(--color-warning-bg);
}

.offline-banner strong {
  font-size: var(--text-small);
}

.offline-banner p {
  margin: 3px 0 0;
  color: var(--color-muted);
  font-size: 0.8125rem;
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

.rest-bar {
  position: sticky;
  top: 12px;
  z-index: 15;
  display: grid;
  grid-template-columns: auto minmax(80px, 1fr) auto;
  align-items: center;
  gap: 14px;
  padding: 10px 12px;
  border: 1px solid var(--color-ink);
  border-radius: var(--radius-control);
  background: var(--color-paper);
  box-shadow: var(--shadow-card);
}

.rest-bar__copy {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rest-bar__copy div {
  display: grid;
  gap: 1px;
}

.rest-bar__copy span {
  color: var(--color-muted);
  font-size: 0.625rem;
}

.rest-bar__copy strong {
  font-family: var(--font-data);
  font-size: 1.125rem;
  font-variant-numeric: tabular-nums;
}

.rest-bar__track {
  height: 6px;
  overflow: hidden;
  border-radius: var(--radius-pill);
  background: var(--color-surface);
}

.rest-bar__track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--color-signal-strong);
  transition: width 1s linear;
}

.rest-bar__actions {
  display: flex;
  gap: 6px;
}

.completion-ledger {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
  border-top: 1px solid var(--color-ink);
  border-bottom: 1px solid var(--color-line);
}

.completion-ledger div {
  display: grid;
  gap: 3px;
  padding: 12px 16px;
  border-right: 1px solid var(--color-line);
}

.completion-ledger div:last-child {
  border-right: 0;
}

.completion-ledger dt {
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.625rem;
  text-transform: uppercase;
}

.completion-ledger dd {
  margin: 0;
  font-family: var(--font-data);
  font-size: 1.125rem;
  font-variant-numeric: tabular-nums;
}

.workout-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(240px, 0.55fr);
  gap: 40px;
  align-items: start;
}

.workout-main {
  min-width: 0;
}

.exercise-stack {
  border-top: 1px solid var(--color-ink);
}

.exercise-block {
  border-bottom: 1px solid var(--color-line);
}

.exercise-head {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 0;
  border: 0;
  background: transparent;
  color: var(--color-ink);
  cursor: pointer;
  text-align: left;
}

.exercise-head:focus-visible {
  outline: 2px solid var(--color-signal-strong);
  outline-offset: 2px;
}

.exercise-index {
  display: inline-grid;
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--color-line);
  border-radius: 50%;
  color: var(--color-muted);
  font-size: 0.6875rem;
}

.exercise-head__copy {
  display: grid;
  min-width: 0;
  flex: 1 1 auto;
  gap: 3px;
}

.exercise-head__copy strong {
  font-size: 1.0625rem;
}

.exercise-head__copy small {
  overflow: hidden;
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.exercise-body {
  padding: 0 0 18px 40px;
}

.exercise-tools {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 0 6px;
}

.set-table-scroll {
  overflow-x: auto;
}

.set-table {
  width: 100%;
  border-collapse: collapse;
}

.set-table th {
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

.set-table td {
  padding: 10px 10px 10px 0;
  border-bottom: 1px solid var(--color-line);
  font-family: var(--font-data);
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
}

.set-table td:last-child,
.set-table th:last-child {
  padding-right: 0;
  text-align: right;
}

.set-notes {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.set-cell-input {
  width: 100%;
  min-width: 56px;
  min-height: var(--touch-target);
  padding: 6px 8px;
  border: 1px solid var(--color-line);
  border-radius: 8px;
  background: var(--color-surface-raised);
  color: var(--color-ink);
  font-family: var(--font-data);
  font-size: 0.8125rem;
}

.row-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.empty-sets {
  color: var(--color-muted);
  text-align: center;
}

.set-editor {
  display: grid;
  grid-template-columns: 160px 160px minmax(240px, 1fr) auto;
  gap: 14px;
  align-items: end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-line);
}

.stepper-field {
  display: grid;
  gap: 5px;
}

.stepper-field label,
.rpe-field > span {
  color: var(--color-muted);
  font-size: 0.75rem;
}

.stepper {
  display: grid;
  grid-template-columns: 44px minmax(48px, 1fr) 44px;
  gap: 4px;
  align-items: center;
}

.stepper input {
  width: 100%;
  min-height: 44px;
  padding: 0 4px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-control);
  background: var(--color-surface-raised);
  color: var(--color-ink);
  font-family: var(--font-data);
  font-size: 1rem;
  text-align: center;
}

.rpe-field {
  display: grid;
  gap: 5px;
}

.rpe-options {
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
}

.rpe-options :deep(.ui-chip) {
  min-width: 44px;
  padding: 0 8px;
}

.set-editor__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notes-toggle {
  min-height: var(--touch-target);
  border: 0;
  background: transparent;
  color: var(--color-muted);
  cursor: pointer;
  font-size: 0.75rem;
  text-decoration: underline;
  text-underline-offset: 0.18em;
}

.set-notes-input {
  grid-column: 1 / -1;
  min-height: 80px;
}

.workout-rail {
  display: grid;
  gap: 24px;
}

.rail-block {
  border-top: 1px solid var(--color-ink);
  padding-top: 10px;
}

.rail-block h2,
.rail-block summary {
  margin: 0 0 8px;
  font-size: var(--text-h3);
  font-weight: 700;
}

.rail-block summary {
  cursor: pointer;
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
  font-family: var(--font-data);
  font-size: 0.75rem;
  text-align: right;
}

.rail-copy {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.notes-save {
  margin-top: 8px;
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

.candidate-loading {
  display: grid;
  gap: 12px;
}

.candidate-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.candidate-row {
  display: grid;
  gap: 3px;
  width: 100%;
  min-height: var(--touch-target);
  padding: 10px 0;
  border: 0;
  border-bottom: 1px solid var(--color-line);
  background: transparent;
  color: var(--color-ink);
  cursor: pointer;
  text-align: left;
}

.candidate-row:hover {
  background: var(--color-surface);
}

.candidate-row span {
  font-weight: 600;
}

.candidate-row small {
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
  text-transform: uppercase;
}

.sheet-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin: 0 0 16px;
}

.sheet-summary div {
  display: grid;
  gap: 2px;
  padding: 8px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-control);
  background: var(--color-surface);
}

.sheet-summary dt {
  color: var(--color-muted);
  font-size: 0.625rem;
}

.sheet-summary dd {
  margin: 0;
  font-family: var(--font-data);
  font-size: 0.8125rem;
}

.muted {
  color: var(--color-muted);
}

@media (max-width: 1023px) {
  .rest-bar {
    top: 68px;
  }

  .workout-layout {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .feedback-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .page-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .exercise-body {
    padding-left: 0;
  }

  .set-editor {
    grid-template-columns: 1fr 1fr;
  }

  .rpe-field,
  .set-editor__actions {
    grid-column: 1 / -1;
  }

  .rpe-options {
    flex-wrap: wrap;
  }

  .completion-ledger {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .completion-ledger div:nth-child(2) {
    border-right: 0;
  }

  .rest-bar {
    grid-template-columns: 1fr auto;
  }

  .rest-bar__track {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .sheet-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
