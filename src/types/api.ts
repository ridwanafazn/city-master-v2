/**
 * Shared backend contract types.
 *
 * These mirror the FastAPI error envelope and infrastructure endpoints. Feature
 * schemas are added in the milestone that consumes them.
 */

export interface ApiErrorBody {
  code: string
  message: string
  details?: unknown
  request_id?: string
}

export interface ApiErrorEnvelope {
  error?: ApiErrorBody
  request_id?: string
  detail?: unknown
  message?: string
}

export interface HealthResponse {
  status: string
  version: string
  environment: string
}

export interface ReadyResponse {
  status: string
  dataset_version: string
  dataset_size: number
  database: string
  redis?: string
  redis_detail?: string | null
  rate_limit?: string
  degraded?: boolean
  reason?: string
}

export type BackendStatus = 'unknown' | 'checking' | 'online' | 'degraded' | 'offline'
