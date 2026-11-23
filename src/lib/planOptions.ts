export const BODY_PART_OPTIONS = [
  'neck',
  'shoulders',
  'chest',
  'back',
  'abs',
  'biceps',
  'triceps',
  'forearms',
  'glutes',
  'quadriceps',
  'hamstrings',
  'calves',
  'cardio',
] as const

export const AVAILABLE_DAYS_OPTIONS = [1, 2, 3, 4, 5] as const
export const SHARE_EXPIRY_OPTIONS = [1, 7, 30, 90] as const

export function bodyPartLabel(value: string): string {
  return value
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function splitLabel(value: string): string {
  return value.replace('+', ' + ').replaceAll('_', ' ').toUpperCase()
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleString()
}
