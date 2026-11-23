import { defineStore } from 'pinia'
import { ApiError } from '../api/client'
import { feedbackService } from '../api/feedbackService'
import type {
  FeedbackCreate,
  FeedbackOut,
  SafetyReportCreate,
  SafetyReportOut,
} from '../types/feedback'

interface FeedbackState {
  submitting: boolean
  feedback: FeedbackOut | null
  safetyReport: SafetyReportOut | null
  error: string | null
  errorCode: string | null
  notice: string | null
}

function messageFor(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return fallback
}

export const useFeedbackStore = defineStore('feedback', {
  state: (): FeedbackState => ({
    submitting: false,
    feedback: null,
    safetyReport: null,
    error: null,
    errorCode: null,
    notice: null,
  }),

  actions: {
    clear() {
      this.error = null
      this.errorCode = null
      this.notice = null
    },

    async submitFeedback(payload: FeedbackCreate): Promise<boolean> {
      this.submitting = true
      this.clear()
      try {
        this.feedback = await feedbackService.submitFeedback(payload)
        this.notice = 'Feedback terkirim.'
        return true
      } catch (error) {
        this.error = messageFor(error, 'Gagal mengirim feedback.')
        this.errorCode = error instanceof ApiError ? error.code : null
        return false
      } finally {
        this.submitting = false
      }
    },

    async submitSafetyReport(payload: SafetyReportCreate): Promise<boolean> {
      this.submitting = true
      this.clear()
      try {
        this.safetyReport = await feedbackService.submitSafetyReport(payload)
        this.notice = 'Safety report terkirim. Tim akan meninjau.'
        return true
      } catch (error) {
        this.error = messageFor(error, 'Gagal mengirim safety report.')
        this.errorCode = error instanceof ApiError ? error.code : null
        return false
      } finally {
        this.submitting = false
      }
    },
  },
})
