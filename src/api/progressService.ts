import apiClient from './client'
import type {
  InsightsResponse,
  ProgressHistoryResponse,
  ProgressResponse,
} from '../types/progress'

export const progressService = {
  async getProgress(params: {
    from_date?: string
    to_date?: string
    timezone?: string
  }): Promise<ProgressResponse> {
    const response = await apiClient.get<ProgressResponse>('/me/progress', {
      params,
    })
    return response.data
  },

  async getHistory(cursor?: string, limit = 20): Promise<ProgressHistoryResponse> {
    const response = await apiClient.get<ProgressHistoryResponse>('/me/history', {
      params: { limit, cursor },
    })
    return response.data
  },

  async getInsights(timezone?: string): Promise<InsightsResponse> {
    const response = await apiClient.get<InsightsResponse>('/me/insights', {
      params: { timezone },
    })
    return response.data
  },
}
