/** P0.3 workout execution and offline sync contracts. */

export interface SetLog {
  id: string
  workout_exercise_id: string
  set_number: number
  reps?: number | null
  weight_kg?: number | null
  rpe?: number | null
  completed: boolean
  notes?: string | null
  client_set_id?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface WorkoutExercise {
  id: string
  source_plan_exercise_id?: string | null
  exercise_id: string
  exercise_name: string
  body_part: string
  equipment: string[]
  primary_muscle: string[]
  secondary_muscle: string[]
  exercise_image?: string | null
  position: number
  notes?: string | null
  substituted_from_exercise_id?: string | null
  sets: SetLog[]
}

export interface Workout {
  id: string
  plan_id?: string | null
  plan_version_id?: string | null
  plan_day_id?: string | null
  day_number?: number | null
  title: string
  focus: string
  status: 'in_progress' | 'completed' | 'abandoned' | string
  timezone: string
  started_at: string
  completed_at?: string | null
  notes?: string | null
  client_session_id?: string | null
  total_sets: number
  total_reps: number
  total_volume_kg: number
  exercise_count: number
  duration_seconds?: number | null
  exercises: WorkoutExercise[]
  created_at: string
  updated_at: string
}

export interface WorkoutSummary {
  id: string
  plan_id?: string | null
  day_number?: number | null
  title: string
  focus: string
  status: string
  timezone: string
  started_at: string
  completed_at?: string | null
  total_sets: number
  total_reps: number
  total_volume_kg: number
  exercise_count: number
  duration_seconds?: number | null
}

export interface WorkoutListResponse {
  items: WorkoutSummary[]
  next_cursor?: string | null
}

export interface WorkoutStartRequest {
  plan_id: string
  day?: number
  plan_version?: number
  timezone?: string
  client_session_id?: string
}

export interface SetCreateInput {
  workout_exercise_id: string
  set_number: number
  reps?: number | null
  weight_kg?: number | null
  rpe?: number | null
  completed?: boolean
  notes?: string | null
  client_set_id?: string
}

export interface SetUpdateInput {
  reps?: number | null
  weight_kg?: number | null
  rpe?: number | null
  completed?: boolean
  notes?: string | null
}

export type SyncMutationType =
  | 'set.create'
  | 'set.update'
  | 'set.delete'
  | 'workout.complete'
  | 'exercise.substitute'

export interface SyncMutation {
  client_mutation_id: string
  type: SyncMutationType
  occurred_at?: string
  payload: Record<string, unknown>
}

export interface SyncMutationResult {
  client_mutation_id: string
  status: 'applied' | 'duplicate' | 'error'
  result?: Record<string, unknown> | null
  error?: { code: string; message: string; details?: unknown } | null
}

export interface SyncBatchResponse {
  results: SyncMutationResult[]
}
