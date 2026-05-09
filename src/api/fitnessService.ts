// src/api/fitnessService.ts

/**
 * Service Layer: Abstraksi endpoint API FastAPI.
 * File ini bertindak sebagai jembatan tunggal (Single Source of Truth)
 * untuk semua komunikasi keluar menuju backend.
 */

import apiClient from './client'
import type { 
  RecommendationRequest, 
  RecommendationResponse, 
  ByFocusRequest, 
  ByFocusResponse 
} from '../types'
import type { AxiosResponse } from 'axios'

export const fitnessService = {
  /**
   * Mengirim parameter fisik dan batasan ke Rule Engine + Genetic Optimizer
   * untuk menghasilkan jadwal mingguan.
   * * @param payload RecommendationRequest (Data tervalidasi dari UI)
   * @returns AxiosResponse yang berisi RecommendationResponse dan Headers (X-Process-Time)
   */
  async getWeeklyRecommendation(
    payload: RecommendationRequest
  ): Promise<AxiosResponse<RecommendationResponse>> {
    return apiClient.post<RecommendationResponse>('/recommendation/', payload)
  },

  /**
   * Menghasilkan rekomendasi latihan tunggal berdasarkan satu fokus area otot.
   * * @param payload ByFocusRequest
   * @returns AxiosResponse yang berisi ByFocusResponse
   */
  async getDailyFocus(
    payload: ByFocusRequest
  ): Promise<AxiosResponse<ByFocusResponse>> {
    return apiClient.post<ByFocusResponse>('/recommendation/by-focus', payload)
  }
}