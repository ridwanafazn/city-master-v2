/** P0.1 profile, equipment, injury, consent, and export contracts. */

import type { MeUser } from './auth'

export type Gender = 'male' | 'female'
export type Goal = 'muscle_gain' | 'fat_loss' | 'general_health'
export type Experience = 'beginner' | 'intermediate' | 'advanced'
export type UnitSystem = 'metric' | 'imperial'
export type ConsentKind =
  | 'health_data_processing'
  | 'research_analytics'
  | 'trainer_sharing'
  | 'marketing'

export interface ProfileInput {
  gender: Gender
  height_cm: number
  weight_kg: number
  goal: Goal
  experience: Experience
  session_minutes: 30 | 45 | 60 | 90
  timezone: string
  locale: 'id-ID' | 'en-US'
  unit_system: UnitSystem
}

export interface ProfileData extends ProfileInput {
  user_id: string
  created_at: string
  updated_at: string
}

export interface Injury {
  id: string
  term: string
  body_parts: string[]
  created_at: string
}

export interface ProfileResponse {
  profile: ProfileData | null
  equipment: string[]
  injuries: Injury[]
}

export interface EquipmentResponse {
  equipment: string[]
}

export interface InjuryResponse {
  injuries: Injury[]
}

export interface ConsentRecord {
  id: string
  kind: string
  version: string
  granted_at: string
  revoked_at?: string | null
}

export interface ConsentStateResponse {
  policy_version: string
  active: Record<string, boolean>
  records: ConsentRecord[]
}

export interface OnboardingPayload {
  display_name?: string
  profile: ProfileInput
  equipment?: string[]
  injuries?: string[]
  consents?: Partial<Record<ConsentKind, boolean>>
}

export interface ExportResponse {
  schema_version: string
  exported_at: string
  user: MeUser
  profile: ProfileData | null
  equipment: string[]
  injuries: Injury[]
  consents: ConsentRecord[]
  roles: string[]
  account: Record<string, unknown>
}
