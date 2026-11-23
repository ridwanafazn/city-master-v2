import apiClient from './client'
import type {
  Plan,
  PlanCreatePayload,
  PlanListResponse,
  PlanShare,
  PlanUpdatePayload,
  PlanVersionListResponse,
  PublicPlan,
} from '../types/plans'

function downloadBlob(data: Blob, filename: string) {
  const url = URL.createObjectURL(data)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export const plansService = {
  async list(cursor?: string, limit = 20): Promise<PlanListResponse> {
    const response = await apiClient.get<PlanListResponse>('/plans', {
      params: { limit, cursor },
    })
    return response.data
  },

  async get(planId: string): Promise<Plan> {
    const response = await apiClient.get<Plan>(`/plans/${planId}`)
    return response.data
  },

  async create(payload: PlanCreatePayload, idempotencyKey: string): Promise<Plan> {
    const response = await apiClient.post<Plan>('/plans', payload, {
      headers: { 'Idempotency-Key': idempotencyKey },
    })
    return response.data
  },

  async importPlan(
    payload: PlanCreatePayload,
    idempotencyKey: string,
  ): Promise<Plan> {
    const response = await apiClient.post<Plan>('/plans/import', payload, {
      headers: { 'Idempotency-Key': idempotencyKey },
    })
    return response.data
  },

  async update(planId: string, payload: PlanUpdatePayload): Promise<Plan> {
    const response = await apiClient.patch<Plan>(`/plans/${planId}`, payload)
    return response.data
  },

  async remove(planId: string): Promise<void> {
    await apiClient.delete(`/plans/${planId}`)
  },

  async versions(planId: string): Promise<PlanVersionListResponse> {
    const response = await apiClient.get<PlanVersionListResponse>(
      `/plans/${planId}/versions`,
      { params: { _: Date.now() } },
    )
    return response.data
  },

  async createShare(planId: string, expiresInDays = 7): Promise<PlanShare> {
    const response = await apiClient.post<PlanShare>(`/plans/${planId}/share`, {
      expires_in_days: expiresInDays,
    })
    return response.data
  },

  async revokeShare(planId: string): Promise<void> {
    await apiClient.delete(`/plans/${planId}/share`)
  },

  async downloadPdf(planId: string, filename = 'jymz-plan.pdf'): Promise<void> {
    const response = await apiClient.get<Blob>(`/plans/${planId}/export.pdf`, {
      responseType: 'blob',
    })
    downloadBlob(response.data, filename)
  },

  async downloadIcs(
    planId: string,
    filename = 'jymz-plan.ics',
  ): Promise<void> {
    const response = await apiClient.get<Blob>(`/plans/${planId}/export.ics`, {
      responseType: 'blob',
    })
    downloadBlob(response.data, filename)
  },

  async getShared(token: string): Promise<PublicPlan> {
    const response = await apiClient.get<PublicPlan>(`/shared/${token}`)
    return response.data
  },
}
