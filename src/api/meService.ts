import apiClient from './client'
import type { AccountDeletionResponse, MeResponse } from '../types/auth'

export const meService = {
  async getMe(): Promise<MeResponse> {
    const response = await apiClient.get<MeResponse>('/me')
    return response.data
  },

  async requestDeletion(): Promise<AccountDeletionResponse> {
    const response = await apiClient.delete<AccountDeletionResponse>('/me')
    return response.data
  },
}
