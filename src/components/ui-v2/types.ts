export interface UiOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface StatTrend {
  direction: 'up' | 'down' | 'flat'
  label: string
  tone?: 'positive' | 'negative' | 'neutral'
}

export interface TabItem {
  id: string
  label: string
  count?: number
}
