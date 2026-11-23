import apiClient, { API_ORIGIN } from './client'
import type { HealthResponse, ReadyResponse } from '../types/api'

export const healthService = {
  async getHealth(): Promise<HealthResponse> {
    const response = await apiClient.get<HealthResponse>(`${API_ORIGIN}/health`)
    return response.data
  },

  async getReady(): Promise<ReadyResponse> {
    const response = await apiClient.get<ReadyResponse>(`${API_ORIGIN}/ready`)
    return response.data
  },
}
