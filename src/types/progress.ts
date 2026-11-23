/** P1.1 progress, history, insights, and personal records. */

import type { WorkoutSummary } from './workouts'

export interface DailyMetric {
  date: string
  workouts_completed: number
  total_sets: number
  total_reps: number
  total_volume_kg: number
  duration_seconds: number
  sets_by_body_part: Record<string, number>
  volume_by_body_part: Record<string, number>
}

export interface ProgressTotals {
  workouts_completed: number
  total_sets: number
  total_reps: number
  total_volume_kg: number
  duration_seconds: number
}

export interface ProgressResponse {
  timezone: string
  from_date: string
  to_date: string
  totals: ProgressTotals
  days: DailyMetric[]
  sets_by_body_part: Record<string, number>
  volume_by_body_part: Record<string, number>
  streak_days: number
}

export interface PersonalRecord {
  exercise_id: string
  exercise_name: string
  record_type: string
  value: number
  reps?: number | null
  weight_kg?: number | null
  achieved_at: string
}

export interface WeeklyReview {
  week_start: string
  timezone: string
  workouts_completed: number
  total_sets: number
  total_reps: number
  total_volume_kg: number
  duration_seconds: number
  sets_by_body_part: Record<string, number>
  volume_by_body_part: Record<string, number>
  summary?: string | null
}

export interface InsightsResponse {
  timezone: string
  streak_days: number
  workouts_last_28_days: number
  current_week?: WeeklyReview | null
  body_part_balance: Record<string, number>
  personal_records: PersonalRecord[]
  summary: string
}

export interface ProgressHistoryResponse {
  items: WorkoutSummary[]
  next_cursor?: string | null
}
