import type { ConsentKind, Goal, Experience, Gender, ProfileInput, UnitSystem } from '../types/profile'

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
]

export const GOAL_OPTIONS: { value: Goal; label: string; hint: string }[] = [
  { value: 'muscle_gain', label: 'Muscle gain', hint: 'Hypertrophy and strength' },
  { value: 'fat_loss', label: 'Fat loss', hint: 'Higher density, controlled volume' },
  { value: 'general_health', label: 'General health', hint: 'Balanced weekly movement' },
]

export const EXPERIENCE_OPTIONS: { value: Experience; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export const SESSION_MINUTES_OPTIONS = [30, 45, 60, 90] as const

export const UNIT_SYSTEM_OPTIONS: { value: UnitSystem; label: string }[] = [
  { value: 'metric', label: 'Metric (cm / kg)' },
  { value: 'imperial', label: 'Imperial preference' },
]

export const EQUIPMENT_OPTIONS = [
  'barbell',
  'body weight',
  'cable',
  'chest press machine',
  'dumbbell',
  'elliptical machine',
  'exercise bike',
  'ez barbell',
  'kettlebell',
  'leverage machine',
  'rope',
  'sled machine',
  'smith machine',
  'trap bar',
  'treadmill',
  'weighted',
  'wheel roller',
] as const

export const INJURY_OPTIONS: { value: string; label: string }[] = [
  { value: 'knee', label: 'Knee' },
  { value: 'lower back', label: 'Lower back' },
  { value: 'shoulder', label: 'Shoulder' },
  { value: 'elbow', label: 'Elbow' },
  { value: 'wrist', label: 'Wrist' },
  { value: 'ankle', label: 'Ankle' },
  { value: 'hip', label: 'Hip' },
  { value: 'neck', label: 'Neck' },
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'abs', label: 'Abs' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'forearms', label: 'Forearms' },
  { value: 'glutes', label: 'Glutes' },
  { value: 'quadriceps', label: 'Quadriceps' },
  { value: 'hamstrings', label: 'Hamstrings' },
  { value: 'calves', label: 'Calves' },
  { value: 'acl', label: 'ACL' },
  { value: 'meniscus', label: 'Meniscus' },
  { value: 'rotator cuff', label: 'Rotator cuff' },
  { value: 'sciatica', label: 'Sciatica' },
  { value: 'tennis elbow', label: 'Tennis elbow' },
]

export const CONSENT_OPTIONS: {
  value: ConsentKind
  label: string
  description: string
  requiredForInjuries?: boolean
}[] = [
  {
    value: 'health_data_processing',
    label: 'Health data processing',
    description:
      'Wajib untuk menyimpan cedera dan menghasilkan plan yang aman. Cabut consent akan menghapus cedera tersimpan.',
    requiredForInjuries: true,
  },
  {
    value: 'research_analytics',
    label: 'Research analytics',
    description:
      'Event dan eksperimen anonim untuk riset produk. Tidak memengaruhi fitur inti.',
  },
  {
    value: 'trainer_sharing',
    label: 'Trainer sharing',
    description:
      'Izinkan trainer yang Anda undang melihat plan, workout, feedback, dan progress sesuai scope.',
  },
  {
    value: 'marketing',
    label: 'Marketing',
    description: 'Email/pesan produk. Bisa dicabut kapan saja.',
  },
]

export function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta'
  } catch {
    return 'Asia/Jakarta'
  }
}

export function defaultProfileInput(): ProfileInput {
  return {
    gender: 'male',
    height_cm: 170,
    weight_kg: 65,
    goal: 'general_health',
    experience: 'beginner',
    session_minutes: 60,
    timezone: browserTimezone(),
    locale: 'id-ID',
    unit_system: 'metric',
  }
}

export function equipmentLabel(value: string): string {
  return value
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function injuryLabel(value: string): string {
  const found = INJURY_OPTIONS.find((item) => item.value === value)
  return found?.label || value
}
