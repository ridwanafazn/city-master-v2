import apiClient from './client'
import type {
  SetCreateInput,
  SetLog,
  SetUpdateInput,
  SyncBatchResponse,
  SyncMutation,
  Workout,
  WorkoutListResponse,
  WorkoutStartRequest,
} from '../types/workouts'

export const workoutsService = {
  async start(payload: WorkoutStartRequest): Promise<Workout> {
    const response = await apiClient.post<Workout>('/workouts/start', payload)
    return response.data
  },

  async list(cursor?: string, limit = 20, status?: string): Promise<WorkoutListResponse> {
    const response = await apiClient.get<WorkoutListResponse>('/workouts', {
      params: { limit, cursor, status },
    })
    return response.data
  },

  async get(workoutId: string): Promise<Workout> {
    const response = await apiClient.get<Workout>(`/workouts/${workoutId}`)
    return response.data
  },

  async updateNotes(workoutId: string, notes: string | null): Promise<Workout> {
    const response = await apiClient.patch<Workout>(`/workouts/${workoutId}`, {
      notes,
    })
    return response.data
  },

  async complete(workoutId: string, notes?: string | null): Promise<Workout> {
    const response = await apiClient.post<Workout>(`/workouts/${workoutId}/complete`, {
      notes,
    })
    return response.data
  },

  async addSet(workoutId: string, payload: SetCreateInput): Promise<SetLog> {
    const response = await apiClient.post<SetLog>(
      `/workouts/${workoutId}/sets`,
      payload,
    )
    return response.data
  },

  async updateSet(setId: string, payload: SetUpdateInput): Promise<SetLog> {
    const response = await apiClient.patch<SetLog>(`/sets/${setId}`, payload)
    return response.data
  },

  async deleteSet(setId: string): Promise<void> {
    await apiClient.delete(`/sets/${setId}`)
  },

  async substitute(
    workoutId: string,
    workoutExerciseId: string,
    replacementExerciseId: string,
  ): Promise<Workout> {
    const response = await apiClient.post<Workout>(
      `/workouts/${workoutId}/exercises/${workoutExerciseId}/substitute`,
      { replacement_exercise_id: replacementExerciseId },
    )
    return response.data
  },

  async syncBatch(mutations: SyncMutation[]): Promise<SyncBatchResponse> {
    const response = await apiClient.post<SyncBatchResponse>('/sync/batch', {
      mutations,
    })
    return response.data
  },
}
