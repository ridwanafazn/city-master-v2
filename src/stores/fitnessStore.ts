// src/stores/fitnessStore.ts
import { defineStore } from 'pinia'
import type { 
  RecommendationRequest, 
  RecommendationResponse, 
  ByFocusRequest,
  ByFocusResponse 
} from '../types'
import apiClient from '../api/client'

/**
 * Fitness Store: Jantung manajemen state untuk Fitness-RS Engine.
 * Mengelola data input, status loading mesin, dan hasil akhir optimasi.
 */

export const useFitnessStore = defineStore('fitness', {
  state: () => ({
    // Data input pengguna (Engine Parameters)
    userProfile: {
      gender: 'male',
      height_cm: 170,
      weight_kg: 65,
      injuries: [],
      available_days: 3,
      preferred_body_part: [],
      preferred_equipment: []
    } as RecommendationRequest,

    // Status Mesin (Processing State)
    isProcessing: false,
    engineLogs: [] as string[],
    processTime: '0.0000',

    // Hasil Optimasi (Output Data)
    recommendationResult: null as RecommendationResponse | null,
    singleFocusResult: null as ByFocusResponse | null,
    
    // Error Handling
    error: null as string | null
  }),

  actions: {
    /**
     * Menambahkan log ke Processing Console untuk efek visual "Informatics Engineering".
     */
    addLog(message: string) {
      const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false })
      this.engineLogs.push(`[${timestamp}] ${message}`)
    },

    /**
     * Membersihkan state sebelum memulai proses optimasi baru.
     */
    resetEngine() {
      this.engineLogs = []
      this.recommendationResult = null
      this.error = null
      this.processTime = '0.0000'
    },

    /**
     * Memanggil Endpoint Utama: POST /recommendation/
     */
    async generateWeeklySchedule() {
      this.resetEngine()
      this.isProcessing = true
      
      this.addLog('Initializing Engine Parameters...')
      this.addLog(`BMI Detected: ${(this.userProfile.weight_kg / Math.pow(this.userProfile.height_cm / 100, 2)).toFixed(1)}`)

      try {
        this.addLog('Contacting Rule Engine (Experta)...')
        const response = await apiClient.post<RecommendationResponse>('/recommendation/', this.userProfile)
        
        this.addLog('Activating Genetic Optimizer (PyGAD)...')
        this.addLog('Evolutionary process converged.')
        
        this.recommendationResult = response.data
        this.processTime = response.headers['x-process-time'] || '0.0000'
        
        this.addLog('Optimization complete. Data ready for Dashboard.')
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Engine Failure: Terjadi kesalahan pada proses optimasi.'
        this.addLog(`[ERROR] ${this.error}`)
      } finally {
        this.isProcessing = false
      }
    },

    /**
     * Memanggil Endpoint: POST /recommendation/by-focus
     */
    async generateDailyFocus(payload: ByFocusRequest) {
      this.isProcessing = true
      try {
        const response = await apiClient.post<ByFocusResponse>('/recommendation/by-focus', payload)
        this.singleFocusResult = response.data
      } catch (err: any) {
        this.error = 'Gagal mengambil rekomendasi fokus harian.'
      } finally {
        this.isProcessing = false
      }
    }
  },

  getters: {
    /**
     * Menghitung BMI secara reaktif untuk ditampilkan di UI.
     */
    currentBmi: (state) => {
      const hm = state.userProfile.height_cm / 100
      return state.userProfile.weight_kg / (hm * hm)
    }
  }
})