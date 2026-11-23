import { defineStore } from 'pinia'
import { ApiError } from '../api/client'
import { meService } from '../api/meService'
import { useAuthStore } from './authStore'
import type {
  ConsentKind,
  ConsentStateResponse,
  Injury,
  OnboardingPayload,
  ProfileData,
  ProfileInput,
} from '../types/profile'

interface ProfileState {
  profile: ProfileData | null
  equipment: string[]
  injuries: Injury[]
  consents: ConsentStateResponse | null
  loading: boolean
  saving: boolean
  loaded: boolean
  error: string | null
  errorCode: string | null
  errorDetails: unknown
}

function messageFor(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return fallback
}

export const useProfileStore = defineStore('profile', {
  state: (): ProfileState => ({
    profile: null,
    equipment: [],
    injuries: [],
    consents: null,
    loading: false,
    saving: false,
    loaded: false,
    error: null,
    errorCode: null,
    errorDetails: null,
  }),

  getters: {
    policyVersion: (state) => state.consents?.policy_version ?? '2026-01',
    activeConsents: (state) => state.consents?.active ?? {},
    hasHealthConsent: (state) => Boolean(state.consents?.active.health_data_processing),
    injuryTerms: (state) => state.injuries.map((item) => item.term),
  },

  actions: {
    clearError() {
      this.error = null
      this.errorCode = null
      this.errorDetails = null
    },

    async load(force = false): Promise<boolean> {
      if (this.loaded && !force) return true
      this.loading = true
      this.clearError()
      try {
        const [profile, consents] = await Promise.all([
          meService.getProfile(),
          meService.getConsents(),
        ])
        this.profile = profile.profile
        this.equipment = profile.equipment
        this.injuries = profile.injuries
        this.consents = consents
        this.loaded = true
        return true
      } catch (error) {
        this.error = messageFor(error, 'Gagal memuat profil.')
        this.errorCode = error instanceof ApiError ? error.code : null
        this.errorDetails = error instanceof ApiError ? error.details : null
        return false
      } finally {
        this.loading = false
      }
    },

    async saveOnboarding(payload: OnboardingPayload): Promise<boolean> {
      this.saving = true
      this.clearError()
      try {
        const me = await meService.onboard(payload)
        const auth = useAuthStore()
        auth.me = me
        auth.status = 'authenticated'
        await this.load(true)
        return true
      } catch (error) {
        this.error = messageFor(error, 'Gagal menyimpan onboarding.')
        this.errorCode = error instanceof ApiError ? error.code : null
        this.errorDetails = error instanceof ApiError ? error.details : null
        return false
      } finally {
        this.saving = false
      }
    },

    async saveProfile(patch: Partial<ProfileInput>): Promise<boolean> {
      this.saving = true
      this.clearError()
      try {
        const response = await meService.patchProfile(patch)
        this.profile = response.profile
        this.equipment = response.equipment
        this.injuries = response.injuries
        const auth = useAuthStore()
        await auth.loadMe()
        return true
      } catch (error) {
        this.error = messageFor(error, 'Gagal menyimpan profil.')
        this.errorCode = error instanceof ApiError ? error.code : null
        this.errorDetails = error instanceof ApiError ? error.details : null
        return false
      } finally {
        this.saving = false
      }
    },

    async saveEquipment(equipment: string[]): Promise<boolean> {
      this.saving = true
      this.clearError()
      try {
        const response = await meService.putEquipment(equipment)
        this.equipment = response.equipment
        return true
      } catch (error) {
        this.error = messageFor(error, 'Gagal menyimpan equipment.')
        this.errorCode = error instanceof ApiError ? error.code : null
        this.errorDetails = error instanceof ApiError ? error.details : null
        return false
      } finally {
        this.saving = false
      }
    },

    async saveInjuries(injuries: string[]): Promise<boolean> {
      this.clearError()
      if (injuries.length && !this.hasHealthConsent) {
        this.error =
          'Aktifkan consent health data processing sebelum menyimpan cedera.'
        this.errorCode = 'consent_required'
        return false
      }
      this.saving = true
      try {
        const response = await meService.putInjuries(injuries)
        this.injuries = response.injuries
        return true
      } catch (error) {
        this.error = messageFor(error, 'Gagal menyimpan cedera.')
        this.errorCode = error instanceof ApiError ? error.code : null
        this.errorDetails = error instanceof ApiError ? error.details : null
        return false
      } finally {
        this.saving = false
      }
    },

    async updateConsent(kind: ConsentKind, granted: boolean): Promise<boolean> {
      this.saving = true
      this.clearError()
      try {
        this.consents = await meService.updateConsent(
          kind,
          granted,
          this.policyVersion,
        )
        const auth = useAuthStore()
        await auth.loadMe()
        if (kind === 'health_data_processing' && !granted) {
          await this.load(true)
        }
        return true
      } catch (error) {
        this.error = messageFor(error, 'Gagal menyimpan consent.')
        this.errorCode = error instanceof ApiError ? error.code : null
        this.errorDetails = error instanceof ApiError ? error.details : null
        return false
      } finally {
        this.saving = false
      }
    },

    async exportData(): Promise<boolean> {
      this.clearError()
      try {
        const data = await meService.getExport()
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `jymz-export-${new Date().toISOString().slice(0, 10)}.json`
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
        URL.revokeObjectURL(url)
        return true
      } catch (error) {
        this.error = messageFor(error, 'Gagal mengekspor data.')
        this.errorCode = error instanceof ApiError ? error.code : null
        return false
      }
    },

    reset() {
      this.profile = null
      this.equipment = []
      this.injuries = []
      this.consents = null
      this.loaded = false
      this.clearError()
    },
  },
})
