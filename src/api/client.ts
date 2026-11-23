import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import type { ApiErrorEnvelope } from '../types/api'

const DEV_API_BASE_URL = 'http://localhost:8080/api/v1'
const PROD_API_BASE_URL = '/api/v1'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? DEV_API_BASE_URL : PROD_API_BASE_URL)

function resolveApiOrigin(baseUrl: string): string {
  const fallback =
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080'
  try {
    return new URL(baseUrl, fallback).origin
  } catch {
    return fallback
  }
}

export const API_ORIGIN = resolveApiOrigin(API_BASE_URL)

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: unknown
  readonly requestId?: string

  constructor(params: {
    status: number
    code: string
    message: string
    details?: unknown
    requestId?: string
  }) {
    super(params.message)
    this.name = 'ApiError'
    this.status = params.status
    this.code = params.code
    this.details = params.details
    this.requestId = params.requestId
  }
}

type TokenProvider = () => string | null | undefined
let authTokenProvider: TokenProvider | null = null

/**
 * M1 connects this to the Neon Auth session store. Keeping the provider behind
 * a function avoids coupling the HTTP layer to Pinia and never stores a token
 * in source or localStorage from this module.
 */
export function setAuthTokenProvider(provider: TokenProvider | null): void {
  authTokenProvider = provider
}

function asEnvelope(data: unknown): ApiErrorEnvelope {
  if (data && typeof data === 'object') {
    return data as ApiErrorEnvelope
  }
  return {}
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<unknown>
    const response = axiosError.response
    const envelope = asEnvelope(response?.data)
    const body = envelope.error
    const status = response?.status ?? 0
    const requestId =
      body?.request_id ||
      envelope.request_id ||
      (response?.headers?.['x-request-id'] as string | undefined)

    return new ApiError({
      status,
      code: body?.code || (status === 0 ? 'network_error' : 'http_error'),
      message:
        body?.message ||
        envelope.message ||
        axiosError.message ||
        'Tidak dapat menghubungi backend.',
      details: body?.details ?? envelope.detail,
      requestId,
    })
  }
  return new ApiError({
    status: 0,
    code: 'unknown_error',
    message: error instanceof Error ? error.message : 'Terjadi kesalahan tidak dikenal.',
  })
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = authTokenProvider?.()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      const processTime = response.headers['x-process-time']
      if (processTime) {
        console.debug(`[api] X-Process-Time: ${processTime}`)
      }
    }
    return response
  },
  (error: unknown) => Promise.reject(toApiError(error)),
)

export type ApiRequestConfig = AxiosRequestConfig
export default apiClient
