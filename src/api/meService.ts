import apiClient from './client'
import type { AccountDeletionResponse, MeResponse } from '../types/auth'
import type {
  ConsentKind,
  ConsentStateResponse,
  EquipmentResponse,
  ExportResponse,
  InjuryResponse,
  OnboardingPayload,
  ProfileInput,
  ProfileResponse,
} from '../types/profile'

export const meService = {
  async getMe(): Promise<MeResponse> {
    const response = await apiClient.get<MeResponse>('/me')
    return response.data
  },

  async requestDeletion(): Promise<AccountDeletionResponse> {
    const response = await apiClient.delete<AccountDeletionResponse>('/me')
    return response.data
  },

  async onboard(payload: OnboardingPayload): Promise<MeResponse> {
    const response = await apiClient.post<MeResponse>('/me/onboarding', payload)
    return response.data
  },

  async getProfile(): Promise<ProfileResponse> {
    const response = await apiClient.get<ProfileResponse>('/me/profile')
    return response.data
  },

  async patchProfile(payload: Partial<ProfileInput>): Promise<ProfileResponse> {
    const response = await apiClient.patch<ProfileResponse>('/me/profile', payload)
    return response.data
  },

  async putEquipment(equipment: string[]): Promise<EquipmentResponse> {
    const response = await apiClient.put<EquipmentResponse>('/me/equipment', {
      equipment,
    })
    return response.data
  },

  async putInjuries(injuries: string[]): Promise<InjuryResponse> {
    const response = await apiClient.put<InjuryResponse>('/me/injuries', {
      injuries,
    })
    return response.data
  },

  async getConsents(): Promise<ConsentStateResponse> {
    const response = await apiClient.get<ConsentStateResponse>('/me/consents')
    return response.data
  },

  async updateConsent(
    kind: ConsentKind,
    granted: boolean,
    version?: string,
  ): Promise<ConsentStateResponse> {
    const response = await apiClient.post<ConsentStateResponse>('/me/consents', {
      kind,
      granted,
      version,
    })
    return response.data
  },

  async getExport(): Promise<ExportResponse> {
    const response = await apiClient.get<ExportResponse>('/me/export')
    return response.data
  },
}
