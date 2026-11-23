import type { InsightsResponse } from '../types/progress'
import type { Plan } from '../types/plans'
import type { WorkoutSummary } from '../types/workouts'

const CACHE_KEY = 'jymz.home.v1'

export interface HomeSnapshot {
  savedAt: string
  activeWorkout: WorkoutSummary | null
  lastCompletedDay: number | null
  plan: Plan | null
  insights: InsightsResponse | null
  recentWorkouts?: WorkoutSummary[]
}

function storage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function readHomeCache(): HomeSnapshot | null {
  const store = storage()
  if (!store) return null
  try {
    const raw = store.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as HomeSnapshot
    if (!parsed?.savedAt) return null
    return parsed
  } catch {
    return null
  }
}

export function writeHomeCache(snapshot: Omit<HomeSnapshot, 'savedAt'>): void {
  const store = storage()
  if (!store) return
  try {
    const payload: HomeSnapshot = {
      ...snapshot,
      savedAt: new Date().toISOString(),
    }
    store.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    // Best-effort cache; quota/privacy mode must not block the dashboard.
  }
}

export function clearHomeCache(): void {
  const store = storage()
  if (!store) return
  try {
    store.removeItem(CACHE_KEY)
  } catch {
    // ignore
  }
}
