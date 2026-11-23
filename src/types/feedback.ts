/** P0.4 feedback and safety contracts. */

export type Difficulty = 'too_easy' | 'just_right' | 'too_hard'
export type SafetySeverity = 'low' | 'medium' | 'high' | 'critical'

export interface FeedbackCreate {
  plan_id?: string | null
  workout_session_id?: string | null
  rating?: number | null
  difficulty?: Difficulty | null
  pain?: boolean | null
  pain_area?: string | null
  comment?: string | null
}

export interface FeedbackOut {
  id: string
  plan_id?: string | null
  plan_version_id?: string | null
  workout_session_id?: string | null
  rating?: number | null
  difficulty?: string | null
  pain: boolean
  pain_area?: string | null
  comment?: string | null
  created_at: string
}

export interface SafetyReportCreate {
  plan_id?: string | null
  plan_exercise_id?: string | null
  workout_session_id?: string | null
  exercise_id?: string | null
  reason: string
  severity: SafetySeverity
}

export interface SafetyExercise {
  id: string
  label: string
  exerciseId: string
  planExerciseId?: string
}

export interface SafetyReportOut {
  id: string
  reporter_user_id?: string | null
  plan_id?: string | null
  plan_exercise_id?: string | null
  workout_session_id?: string | null
  exercise_id: string
  exercise_name?: string | null
  reason: string
  severity: string
  status: string
  resolution_note?: string | null
  triaged_at?: string | null
  resolved_at?: string | null
  created_at: string
  updated_at: string
}
