import type { SyncMutation, Workout } from '../types/workouts'

const QUEUE_KEY = 'jymz.workout.pending.v1'
const CACHE_PREFIX = 'jymz.workout.cache.v1:'

export interface PendingWorkoutMutation {
  id: string
  type: SyncMutation['type']
  workoutId: string
  payload: Record<string, unknown>
  occurredAt: string
}

function storage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function readQueue(): PendingWorkoutMutation[] {
  const store = storage()
  if (!store) return []
  const value = safeParse<PendingWorkoutMutation[]>(store.getItem(QUEUE_KEY), [])
  return Array.isArray(value) ? value : []
}

function writeQueue(items: PendingWorkoutMutation[]): void {
  storage()?.setItem(QUEUE_KEY, JSON.stringify(items))
}

export function enqueueMutation(mutation: PendingWorkoutMutation): void {
  const items = readQueue()
  if (items.some((item) => item.id === mutation.id)) return
  items.push(mutation)
  writeQueue(items)
}

export function updateQueuedPayload(
  id: string,
  payload: Record<string, unknown>,
): void {
  const items = readQueue()
  const item = items.find((entry) => entry.id === id)
  if (!item) return
  item.payload = payload
  writeQueue(items)
}

export function removeQueuedMutation(id: string): void {
  writeQueue(readQueue().filter((item) => item.id !== id))
}

export function removeQueuedMutations(ids: string[]): void {
  const remove = new Set(ids)
  writeQueue(readQueue().filter((item) => !remove.has(item.id)))
}

export function queuedForWorkout(workoutId: string): PendingWorkoutMutation[] {
  return readQueue().filter((item) => item.workoutId === workoutId)
}

export function queueCount(workoutId?: string): number {
  const items = readQueue()
  return workoutId
    ? items.filter((item) => item.workoutId === workoutId).length
    : items.length
}

export function toSyncMutation(item: PendingWorkoutMutation): SyncMutation {
  return {
    client_mutation_id: item.id,
    type: item.type,
    occurred_at: item.occurredAt,
    payload: item.payload,
  }
}

export function cacheWorkout(workout: Workout): void {
  storage()?.setItem(`${CACHE_PREFIX}${workout.id}`, JSON.stringify(workout))
}

export function getCachedWorkout(workoutId: string): Workout | null {
  const store = storage()
  if (!store) return null
  return safeParse<Workout | null>(store.getItem(`${CACHE_PREFIX}${workoutId}`), null)
}
