import apiClient from './client'
import type {
  FeedbackCreate,
  FeedbackOut,
  SafetyReportCreate,
  SafetyReportOut,
} from '../types/feedback'

export const feedbackService = {
  async submitFeedback(payload: FeedbackCreate): Promise<FeedbackOut> {
    const response = await apiClient.post<FeedbackOut>('/feedback', payload)
    return response.data
  },

  async submitSafetyReport(
    payload: SafetyReportCreate,
  ): Promise<SafetyReportOut> {
    const response = await apiClient.post<SafetyReportOut>(
      '/safety-reports',
      payload,
    )
    return response.data
  },
}
