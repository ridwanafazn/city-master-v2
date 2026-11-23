import { defineStore } from 'pinia'
import { ApiError } from '../api/client'
import { plansService } from '../api/plansService'
import type {
  Plan,
  PlanCreatePayload,
  PlanShare,
  PlanSummary,
  PlanUpdatePayload,
  PlanVersion,
} from '../types/plans'

interface PlanState {
  plans: PlanSummary[]
  nextCursor: string | null
  plan: Plan | null
  versions: PlanVersion[]
  share: PlanShare | null
  loadingList: boolean
  loadingPlan: boolean
  saving: boolean
  exporting: boolean
  error: string | null
  errorCode: string | null
  notice: string | null
}

function messageFor(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return fallback
}

export const usePlanStore = defineStore('plan', {
  state: (): PlanState => ({
    plans: [],
    nextCursor: null,
    plan: null,
    versions: [],
    share: null,
    loadingList: false,
    loadingPlan: false,
    saving: false,
    exporting: false,
    error: null,
    errorCode: null,
    notice: null,
  }),

  actions: {
    clearError() {
      this.error = null
      this.errorCode = null
    },

    clearNotice() {
      this.notice = null
    },

    async list(reset = false): Promise<boolean> {
      if (this.loadingList) return false
      this.loadingList = true
      this.clearError()
      if (reset) {
        this.plans = []
        this.nextCursor = null
      }
      try {
        const response = await plansService.list(this.nextCursor ?? undefined)
        this.plans = reset ? response.items : [...this.plans, ...response.items]
        this.nextCursor = response.next_cursor ?? null
        return true
      } catch (error) {
        this.error = messageFor(error, 'Gagal memuat daftar plan.')
        this.errorCode = error instanceof ApiError ? error.code : null
        return false
      } finally {
        this.loadingList = false
      }
    },

    async load(planId: string): Promise<boolean> {
      this.loadingPlan = true
      this.clearError()
      try {
        this.plan = await plansService.get(planId)
        return true
      } catch (error) {
        this.plan = null
        this.error = messageFor(error, 'Gagal memuat plan.')
        this.errorCode = error instanceof ApiError ? error.code : null
        return false
      } finally {
        this.loadingPlan = false
      }
    },

    async create(
      payload: PlanCreatePayload,
      idempotencyKey: string,
    ): Promise<Plan | null> {
      this.saving = true
      this.clearError()
      try {
        const plan = await plansService.create(payload, idempotencyKey)
        this.plan = plan
        this.notice = 'Plan dibuat.'
        return plan
      } catch (error) {
        this.error = messageFor(error, 'Gagal membuat plan.')
        this.errorCode = error instanceof ApiError ? error.code : null
        return null
      } finally {
        this.saving = false
      }
    },

    async update(planId: string, payload: PlanUpdatePayload): Promise<boolean> {
      this.saving = true
      this.clearError()
      this.clearNotice()
      try {
        this.plan = await plansService.update(planId, payload)
        this.notice = 'Plan diperbarui.'
        return true
      } catch (error) {
        this.error = messageFor(error, 'Gagal memperbarui plan.')
        this.errorCode = error instanceof ApiError ? error.code : null
        if (this.errorCode === 'plan_revision_conflict') {
          await this.load(planId)
          this.error = 'Plan sudah berubah. Data terbaru dimuat; silakan ulangi aksi.'
          this.errorCode = 'plan_revision_conflict'
        }
        return false
      } finally {
        this.saving = false
      }
    },

    async remove(planId: string): Promise<boolean> {
      this.saving = true
      this.clearError()
      try {
        await plansService.remove(planId)
        this.plan = null
        this.plans = this.plans.filter((item) => item.id !== planId)
        return true
      } catch (error) {
        this.error = messageFor(error, 'Gagal menghapus plan.')
        this.errorCode = error instanceof ApiError ? error.code : null
        return false
      } finally {
        this.saving = false
      }
    },

    async loadVersions(planId: string): Promise<boolean> {
      this.clearError()
      try {
        const response = await plansService.versions(planId)
        this.versions = response.items
        return true
      } catch (error) {
        this.error = messageFor(error, 'Gagal memuat versi plan.')
        this.errorCode = error instanceof ApiError ? error.code : null
        return false
      }
    },

    async createShare(planId: string, expiresInDays = 7): Promise<boolean> {
      this.saving = true
      this.clearError()
      try {
        this.share = await plansService.createShare(planId, expiresInDays)
        this.notice = 'Share link dibuat. Token hanya ditampilkan sekali.'
        return true
      } catch (error) {
        this.error = messageFor(error, 'Gagal membuat share link.')
        this.errorCode = error instanceof ApiError ? error.code : null
        return false
      } finally {
        this.saving = false
      }
    },

    async revokeShare(planId: string): Promise<boolean> {
      this.saving = true
      this.clearError()
      try {
        await plansService.revokeShare(planId)
        this.share = null
        this.notice = 'Share link dicabut.'
        return true
      } catch (error) {
        this.error = messageFor(error, 'Gagal mencabut share link.')
        this.errorCode = error instanceof ApiError ? error.code : null
        return false
      } finally {
        this.saving = false
      }
    },

    async downloadPdf(planId: string): Promise<boolean> {
      this.exporting = true
      this.clearError()
      try {
        await plansService.downloadPdf(planId, `${this.plan?.title || 'jymz-plan'}.pdf`)
        return true
      } catch (error) {
        this.error = messageFor(error, 'Gagal mengekspor PDF.')
        this.errorCode = error instanceof ApiError ? error.code : null
        return false
      } finally {
        this.exporting = false
      }
    },

    async downloadIcs(planId: string): Promise<boolean> {
      this.exporting = true
      this.clearError()
      try {
        await plansService.downloadIcs(planId, `${this.plan?.title || 'jymz-plan'}.ics`)
        return true
      } catch (error) {
        this.error = messageFor(error, 'Gagal mengekspor ICS.')
        this.errorCode = error instanceof ApiError ? error.code : null
        return false
      } finally {
        this.exporting = false
      }
    },

    reset() {
      this.plan = null
      this.versions = []
      this.share = null
      this.error = null
      this.errorCode = null
      this.notice = null
    },
  },
})
