import { defineStore } from 'pinia'
import { ApiError } from '../api/client'
import { workoutsService } from '../api/workoutsService'
import {
  cacheWorkout,
  enqueueMutation,
  getCachedWorkout,
  queueCount,
  queuedForWorkout,
  readQueue,
  removeQueuedMutation,
  removeQueuedMutations,
  toSyncMutation,
  updateQueuedPayload,
  type PendingWorkoutMutation,
} from '../lib/workoutCache'
import type {
  SetCreateInput,
  SetLog,
  SetUpdateInput,
  Workout,
  WorkoutStartRequest,
  WorkoutSummary,
} from '../types/workouts'

interface WorkoutState {
  workouts: WorkoutSummary[]
  nextCursor: string | null
  workout: Workout | null
  loadingList: boolean
  loadingWorkout: boolean
  saving: boolean
  syncing: boolean
  offline: boolean
  pendingCount: number
  error: string | null
  errorCode: string | null
  notice: string | null
}

function isNetworkError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 0 || [502, 503, 504].includes(error.status))
  )
}

function messageFor(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return fallback
}

function recalcTotals(workout: Workout): void {
  const activeSets = workout.exercises.flatMap((exercise) =>
    exercise.sets.filter((set) => !set.deleted_at && set.completed),
  )
  workout.total_sets = activeSets.length
  workout.total_reps = activeSets.reduce((sum, set) => sum + (set.reps ?? 0), 0)
  workout.total_volume_kg = activeSets.reduce(
    (sum, set) => sum + (set.reps ?? 0) * (set.weight_kg ?? 0),
    0,
  )
  workout.exercise_count = workout.exercises.length
}

function localSet(
  input: SetCreateInput,
  clientSetId: string,
): SetLog {
  const now = new Date().toISOString()
  return {
    id: `local-${clientSetId}`,
    workout_exercise_id: input.workout_exercise_id,
    set_number: input.set_number,
    reps: input.reps ?? null,
    weight_kg: input.weight_kg ?? null,
    rpe: input.rpe ?? null,
    completed: input.completed ?? true,
    notes: input.notes ?? null,
    client_set_id: clientSetId,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  }
}

export const useWorkoutStore = defineStore('workout', {
  state: (): WorkoutState => ({
    workouts: [],
    nextCursor: null,
    workout: null,
    loadingList: false,
    loadingWorkout: false,
    saving: false,
    syncing: false,
    offline: false,
    pendingCount: 0,
    error: null,
    errorCode: null,
    notice: null,
  }),

  getters: {
    isInProgress: (state) => state.workout?.status === 'in_progress',
  },

  actions: {
    clearError() {
      this.error = null
      this.errorCode = null
    },

    clearNotice() {
      this.notice = null
    },

    refreshPending(workoutId?: string) {
      this.pendingCount = queueCount(workoutId)
    },

    async start(payload: WorkoutStartRequest): Promise<Workout | null> {
      this.saving = true
      this.clearError()
      try {
        const workout = await workoutsService.start(payload)
        this.workout = workout
        cacheWorkout(workout)
        this.offline = false
        this.refreshPending(workout.id)
        return workout
      } catch (error) {
        this.error = messageFor(error, 'Gagal memulai workout.')
        this.errorCode = error instanceof ApiError ? error.code : null
        return null
      } finally {
        this.saving = false
      }
    },

    async list(reset = false): Promise<boolean> {
      if (this.loadingList) return false
      this.loadingList = true
      this.clearError()
      if (reset) {
        this.workouts = []
        this.nextCursor = null
      }
      try {
        const response = await workoutsService.list(this.nextCursor ?? undefined)
        this.workouts = reset ? response.items : [...this.workouts, ...response.items]
        this.nextCursor = response.next_cursor ?? null
        return true
      } catch (error) {
        this.error = messageFor(error, 'Gagal memuat riwayat workout.')
        this.errorCode = error instanceof ApiError ? error.code : null
        return false
      } finally {
        this.loadingList = false
      }
    },

    async load(workoutId: string): Promise<boolean> {
      this.loadingWorkout = true
      this.clearError()
      try {
        const workout = await workoutsService.get(workoutId)
        this.workout = workout
        cacheWorkout(workout)
        this.offline = false
        this.refreshPending(workoutId)
        return true
      } catch (error) {
        const cached = getCachedWorkout(workoutId)
        if (cached && isNetworkError(error)) {
          this.workout = cached
          this.offline = true
          this.error = null
          this.errorCode = null
          this.refreshPending(workoutId)
          return true
        }
        this.error = messageFor(error, 'Gagal memuat workout.')
        this.errorCode = error instanceof ApiError ? error.code : null
        return false
      } finally {
        this.loadingWorkout = false
      }
    },

    async addSet(workoutId: string, input: SetCreateInput): Promise<boolean> {
      const clientSetId = input.client_set_id ?? crypto.randomUUID()
      const payload: SetCreateInput = { ...input, client_set_id: clientSetId }
      this.saving = true
      this.clearError()
      try {
        const set = await workoutsService.addSet(workoutId, payload)
        if (this.workout) {
          const exercise = this.workout.exercises.find(
            (item) => item.id === input.workout_exercise_id,
          )
          exercise?.sets.push(set)
          this.workout.exercises.sort((a, b) => a.position - b.position)
          recalcTotals(this.workout)
          cacheWorkout(this.workout)
        }
        return true
      } catch (error) {
        if (isNetworkError(error) && this.workout) {
          const mutation: PendingWorkoutMutation = {
            id: crypto.randomUUID(),
            type: 'set.create',
            workoutId,
            payload: {
              workout_id: workoutId,
              ...payload,
            },
            occurredAt: new Date().toISOString(),
          }
          enqueueMutation(mutation)
          const exercise = this.workout.exercises.find(
            (item) => item.id === input.workout_exercise_id,
          )
          if (exercise) {
            exercise.sets.push(localSet(payload, clientSetId))
            exercise.sets.sort((a, b) => a.set_number - b.set_number)
          }
          recalcTotals(this.workout)
          cacheWorkout(this.workout)
          this.offline = true
          this.refreshPending(workoutId)
          this.notice = 'Set disimpan offline. Akan disinkronkan saat online.'
          return true
        }
        this.error = messageFor(error, 'Gagal menyimpan set.')
        this.errorCode = error instanceof ApiError ? error.code : null
        return false
      } finally {
        this.saving = false
      }
    },

    async updateSet(
      workoutId: string,
      set: SetLog,
      input: SetUpdateInput,
    ): Promise<boolean> {
      this.saving = true
      this.clearError()
      try {
        if (set.id.startsWith('local-') && set.client_set_id) {
          const queued = queuedForWorkout(workoutId).find(
            (item) =>
              item.type === 'set.create' &&
              item.payload.client_set_id === set.client_set_id,
          )
          if (queued) {
            updateQueuedPayload(queued.id, {
              ...queued.payload,
              ...input,
            })
          }
          Object.assign(set, input, { updated_at: new Date().toISOString() })
          if (this.workout) {
            recalcTotals(this.workout)
            cacheWorkout(this.workout)
          }
          this.notice = 'Set offline diperbarui.'
          return true
        }

        try {
          await workoutsService.updateSet(set.id, input)
          if (this.workout) {
            Object.assign(set, input, { updated_at: new Date().toISOString() })
            recalcTotals(this.workout)
            cacheWorkout(this.workout)
          }
          return true
        } catch (error) {
          if (!isNetworkError(error)) throw error
          enqueueMutation({
            id: crypto.randomUUID(),
            type: 'set.update',
            workoutId,
            payload: { set_id: set.id, ...input },
            occurredAt: new Date().toISOString(),
          })
          Object.assign(set, input, { updated_at: new Date().toISOString() })
          if (this.workout) {
            recalcTotals(this.workout)
            cacheWorkout(this.workout)
          }
          this.offline = true
          this.refreshPending(workoutId)
          this.notice = 'Perubahan set disimpan offline.'
          return true
        }
      } catch (error) {
        this.error = messageFor(error, 'Gagal memperbarui set.')
        this.errorCode = error instanceof ApiError ? error.code : null
        return false
      } finally {
        this.saving = false
      }
    },

    async deleteSet(workoutId: string, set: SetLog): Promise<boolean> {
      this.saving = true
      this.clearError()
      try {
        if (set.id.startsWith('local-') && set.client_set_id) {
          const queued = queuedForWorkout(workoutId).find(
            (item) =>
              item.type === 'set.create' &&
              item.payload.client_set_id === set.client_set_id,
          )
          if (queued) removeQueuedMutation(queued.id)
          if (this.workout) {
            for (const exercise of this.workout.exercises) {
              exercise.sets = exercise.sets.filter((item) => item.id !== set.id)
            }
            recalcTotals(this.workout)
            cacheWorkout(this.workout)
          }
          this.refreshPending(workoutId)
          return true
        }

        try {
          await workoutsService.deleteSet(set.id)
          if (this.workout) {
            for (const exercise of this.workout.exercises) {
              exercise.sets = exercise.sets.filter((item) => item.id !== set.id)
            }
            recalcTotals(this.workout)
            cacheWorkout(this.workout)
          }
          return true
        } catch (error) {
          if (!isNetworkError(error)) throw error
          enqueueMutation({
            id: crypto.randomUUID(),
            type: 'set.delete',
            workoutId,
            payload: { set_id: set.id },
            occurredAt: new Date().toISOString(),
          })
          if (this.workout) {
            for (const exercise of this.workout.exercises) {
              exercise.sets = exercise.sets.filter((item) => item.id !== set.id)
            }
            recalcTotals(this.workout)
            cacheWorkout(this.workout)
          }
          this.offline = true
          this.refreshPending(workoutId)
          this.notice = 'Hapus set disimpan offline.'
          return true
        }
      } catch (error) {
        this.error = messageFor(error, 'Gagal menghapus set.')
        this.errorCode = error instanceof ApiError ? error.code : null
        return false
      } finally {
        this.saving = false
      }
    },

    async complete(workoutId: string, notes?: string | null): Promise<boolean> {
      this.saving = true
      this.clearError()
      try {
        const workout = await workoutsService.complete(workoutId, notes)
        this.workout = workout
        cacheWorkout(workout)
        this.refreshPending(workoutId)
        this.notice = 'Workout selesai.'
        return true
      } catch (error) {
        if (isNetworkError(error) && this.workout) {
          enqueueMutation({
            id: crypto.randomUUID(),
            type: 'workout.complete',
            workoutId,
            payload: { workout_id: workoutId, notes },
            occurredAt: new Date().toISOString(),
          })
          this.workout.status = 'completed'
          this.workout.completed_at = new Date().toISOString()
          this.workout.notes = notes ?? this.workout.notes
          this.workout.duration_seconds = Math.max(
            0,
            Math.round(
              (Date.now() - new Date(this.workout.started_at).getTime()) / 1000,
            ),
          )
          cacheWorkout(this.workout)
          this.offline = true
          this.refreshPending(workoutId)
          this.notice = 'Workout selesai offline. Menunggu sinkronisasi.'
          return true
        }
        this.error = messageFor(error, 'Gagal menyelesaikan workout.')
        this.errorCode = error instanceof ApiError ? error.code : null
        return false
      } finally {
        this.saving = false
      }
    },

    async updateNotes(workoutId: string, notes: string | null): Promise<boolean> {
      this.saving = true
      this.clearError()
      try {
        this.workout = await workoutsService.updateNotes(workoutId, notes)
        cacheWorkout(this.workout)
        this.notice = 'Catatan workout tersimpan.'
        return true
      } catch (error) {
        this.error = messageFor(error, 'Gagal menyimpan catatan workout.')
        this.errorCode = error instanceof ApiError ? error.code : null
        return false
      } finally {
        this.saving = false
      }
    },

    async substitute(
      workoutId: string,
      workoutExerciseId: string,
      replacementExerciseId: string,
    ): Promise<boolean> {
      this.saving = true
      this.clearError()
      try {
        this.workout = await workoutsService.substitute(
          workoutId,
          workoutExerciseId,
          replacementExerciseId,
        )
        cacheWorkout(this.workout)
        this.notice = 'Exercise diganti.'
        return true
      } catch (error) {
        if (isNetworkError(error)) {
          enqueueMutation({
            id: crypto.randomUUID(),
            type: 'exercise.substitute',
            workoutId,
            payload: {
              workout_id: workoutId,
              workout_exercise_id: workoutExerciseId,
              replacement_exercise_id: replacementExerciseId,
            },
            occurredAt: new Date().toISOString(),
          })
          this.offline = true
          this.refreshPending(workoutId)
          this.notice = 'Substitusi disimpan offline.'
          return true
        }
        this.error = messageFor(error, 'Gagal mengganti exercise.')
        this.errorCode = error instanceof ApiError ? error.code : null
        return false
      } finally {
        this.saving = false
      }
    },

    async syncPending(workoutId?: string): Promise<boolean> {
      const items = workoutId ? queuedForWorkout(workoutId) : readQueue()
      if (!items.length) {
        this.refreshPending(workoutId)
        return true
      }
      this.syncing = true
      this.clearError()
      try {
        const response = await workoutsService.syncBatch(
          items.map(toSyncMutation),
        )
        const remove: string[] = []
        const failed: string[] = []
        for (const result of response.results) {
          if (result.status === 'applied' || result.status === 'duplicate') {
            remove.push(result.client_mutation_id)
          } else {
            failed.push(result.error?.message || result.client_mutation_id)
          }
        }
        removeQueuedMutations(remove)
        this.refreshPending(workoutId)
        this.offline = false
        if (failed.length) {
          this.error = `Sebagian mutation gagal: ${failed.join('; ')}`
          this.errorCode = 'sync_partial_failure'
        } else {
          this.notice = `${remove.length} mutation tersinkron.`
        }
        if (this.workout) {
          await this.load(this.workout.id)
        }
        return failed.length === 0
      } catch (error) {
        if (isNetworkError(error)) {
          this.offline = true
          this.error = 'Masih offline. Mutation tetap disimpan.'
          this.errorCode = 'offline'
        } else {
          this.error = messageFor(error, 'Gagal sinkronisasi.')
          this.errorCode = error instanceof ApiError ? error.code : null
        }
        return false
      } finally {
        this.syncing = false
      }
    },

    reset() {
      this.workout = null
      this.error = null
      this.errorCode = null
      this.notice = null
      this.offline = false
    },
  },
})
