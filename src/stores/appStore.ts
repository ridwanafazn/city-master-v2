import { defineStore } from 'pinia'
import { API_BASE_URL, toApiError } from '../api/client'
import { healthService } from '../api/healthService'
import type { BackendStatus, HealthResponse, ReadyResponse } from '../types/api'

interface AppState {
  backendStatus: BackendStatus
  health: HealthResponse | null
  ready: ReadyResponse | null
  error: string | null
  errorCode: string | null
  lastCheckedAt: string | null
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    backendStatus: 'unknown',
    health: null,
    ready: null,
    error: null,
    errorCode: null,
    lastCheckedAt: null,
  }),

  getters: {
    appName: () => import.meta.env.VITE_APP_NAME || 'JYMZ',
    apiBaseUrl: () => API_BASE_URL,
    isReady: (state) => state.ready?.status === 'ready',
    databaseLabel: (state) => state.ready?.database ?? 'unknown',
    redisLabel: (state) => state.ready?.redis ?? 'not_configured',
    rateLimitLabel: (state) => state.ready?.rate_limit ?? 'unknown',
    datasetLabel: (state) =>
      state.ready ? `${state.ready.dataset_size} exercises · ${state.ready.dataset_version}` : '—',
  },

  actions: {
    async probeReadiness(force = false) {
      if (!force && this.backendStatus === 'checking') return
      this.backendStatus = 'checking'
      this.error = null
      this.errorCode = null
      try {
        this.ready = await healthService.getReady()
        this.backendStatus = this.ready.degraded ? 'degraded' : 'online'
      } catch (error) {
        const apiError = toApiError(error)
        this.error = apiError.message
        this.errorCode = apiError.code
        this.backendStatus = 'offline'
      } finally {
        this.lastCheckedAt = new Date().toISOString()
      }
    },

    async checkBackend() {
      this.backendStatus = 'checking'
      this.error = null
      this.errorCode = null
      try {
        const [health, ready] = await Promise.all([
          healthService.getHealth(),
          healthService.getReady(),
        ])
        this.health = health
        this.ready = ready
        this.backendStatus = ready.degraded ? 'degraded' : 'online'
      } catch (error) {
        const apiError = toApiError(error)
        this.error = apiError.message
        this.errorCode = apiError.code
        this.backendStatus = 'offline'
      } finally {
        this.lastCheckedAt = new Date().toISOString()
      }
    },
  },
})
