import { defineStore } from 'pinia'
import { ApiError } from '../api/client'
import { progressService } from '../api/progressService'
import { browserTimezone } from '../lib/profileOptions'
import type {
  InsightsResponse,
  ProgressHistoryResponse,
  ProgressResponse,
  WeeklyReview,
} from '../types/progress'
import type { WorkoutSummary } from '../types/workouts'

interface ProgressState {
  progress: ProgressResponse | null
  insights: InsightsResponse | null
  history: WorkoutSummary[]
  historyCursor: string | null
  loading: boolean
  loadingHistory: boolean
  error: string | null
  errorCode: string | null
  rangeDays: number
}

function isoDateInZone(date: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date)
  } catch {
    return date.toISOString().slice(0, 10)
  }
}

function messageFor(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return fallback
}

export const useProgressStore = defineStore('progress', {
  state: (): ProgressState => ({
    progress: null,
    insights: null,
    history: [],
    historyCursor: null,
    loading: false,
    loadingHistory: false,
    error: null,
    errorCode: null,
    rangeDays: 30,
  }),

  getters: {
    currentWeek: (state): WeeklyReview | null => state.insights?.current_week ?? null,
    streakDays: (state) => state.insights?.streak_days ?? state.progress?.streak_days ?? 0,
    personalRecords: (state) => state.insights?.personal_records ?? [],
    bodyPartBalance: (state) =>
      state.insights?.body_part_balance ?? state.progress?.sets_by_body_part ?? {},
    summary: (state) => state.insights?.summary ?? '',
  },

  actions: {
    async loadInsights(timeZone?: string): Promise<boolean> {
      try {
        this.insights = await progressService.getInsights(
          timeZone || browserTimezone(),
        )
        return true
      } catch {
        // Home can keep the cached/previous insights; ProgressView still loads
        // the full progress deck and reports its own errors.
        return false
      }
    },

    async load(timeZone?: string, rangeDays?: number): Promise<boolean> {
      if (this.loading) return false
      const zone = timeZone || browserTimezone()
      const days = rangeDays ?? this.rangeDays
      this.rangeDays = days
      this.loading = true
      this.error = null
      this.errorCode = null
      const toDate = new Date()
      const fromDate = new Date(toDate.getTime() - (days - 1) * 86_400_000)
      try {
        // Progress endpoints rebuild aggregates on read. Calling them in
        // parallel can race the delete/insert on daily_metrics, so keep the
        // calls sequential.
        const progress = await progressService.getProgress({
          from_date: isoDateInZone(fromDate, zone),
          to_date: isoDateInZone(toDate, zone),
          timezone: zone,
        })
        this.progress = progress

        try {
          this.insights = await progressService.getInsights(zone)
        } catch {
          // Insights are optional; the dashboard still works without them.
          this.insights = null
        }

        const history = await progressService.getHistory(undefined, 10)
        this.history = history.items
        this.historyCursor = history.next_cursor ?? null
        return true
      } catch (error) {
        this.error = messageFor(error, 'Gagal memuat progress.')
        this.errorCode = error instanceof ApiError ? error.code : null
        return false
      } finally {
        this.loading = false
      }
    },

    async loadMoreHistory(): Promise<boolean> {
      if (!this.historyCursor || this.loadingHistory) return false
      this.loadingHistory = true
      try {
        const response: ProgressHistoryResponse = await progressService.getHistory(
          this.historyCursor,
          10,
        )
        this.history = [...this.history, ...response.items]
        this.historyCursor = response.next_cursor ?? null
        return true
      } catch (error) {
        this.error = messageFor(error, 'Gagal memuat riwayat.')
        this.errorCode = error instanceof ApiError ? error.code : null
        return false
      } finally {
        this.loadingHistory = false
      }
    },
  },
})
