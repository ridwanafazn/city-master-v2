/** Authenticated `/me` contract from the FastAPI backend. */

export interface MeUser {
  id: string
  email?: string | null
  display_name?: string | null
  roles: string[]
  created_at: string
}

export interface MeResponse {
  user: MeUser
  profile_complete: boolean
  consents: Record<string, boolean>
}

export interface AccountDeletionResponse {
  request_id: string
  status: 'pending'
  requested_at: string
  scheduled_for: string
}
