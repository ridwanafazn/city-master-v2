/** P0.2 plan lifecycle contracts. */

import type { Gender } from './profile'

export interface PlanRecommendationInput {
  gender: Gender
  height_cm: number
  weight_kg: number
  injuries: string[]
  available_days: number
  preferred_body_part: string[]
  preferred_equipment: string[]
  seed?: number | null
}

export interface PlanCreatePayload {
  recommendation: PlanRecommendationInput
  title?: string
  result?: unknown
}

export interface PlanExercise {
  id: string
  exercise_id: string
  exercise_name: string
  body_part: string
  equipment: string[]
  primary_muscle: string[]
  secondary_muscle: string[]
  exercise_image?: string | null
  locked: boolean
}

export interface PlanDay {
  day: number
  day_focus: string
  exercises: PlanExercise[]
}

export interface Plan {
  id: string
  title: string
  status: string
  current_version: number
  revision: number
  input: Record<string, unknown>
  bmi?: number | null
  bmi_category?: string | null
  split_type: string
  schedule: Record<string, string>
  days: PlanDay[]
  seed: number
  dataset_version: string
  algorithm_version: string
  warnings: string[]
  created_at: string
  updated_at: string
}

export interface PlanSummary {
  id: string
  title: string
  status: string
  current_version: number
  revision: number
  split_type: string
  day_count: number
  seed: number
  dataset_version: string
  algorithm_version: string
  created_at: string
  updated_at: string
}

export interface PlanListResponse {
  items: PlanSummary[]
  next_cursor?: string | null
}

export interface PlanVersion {
  version: number
  split_type: string
  schedule: Record<string, string>
  warnings: string[]
  day_count: number
  created_at: string
}

export interface PlanVersionListResponse {
  items: PlanVersion[]
}

export interface PlanShare {
  token: string
  expires_at: string
  share_url: string
}

export interface PublicPlan {
  title: string
  split_type: string
  schedule: Record<string, string>
  days: PlanDay[]
  seed: number
  dataset_version: string
  algorithm_version: string
  warnings: string[]
  expires_at: string
}

export interface PlanUpdatePayload {
  action: 'lock' | 'swap' | 'regenerate_day'
  expected_revision: number
  plan_exercise_id?: string
  locked?: boolean
  replacement_exercise_id?: string
  day?: number
}
