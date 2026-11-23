/** Allow only same-origin absolute paths from a redirect query parameter. */
export function safeRedirect(value: unknown, fallback = '/app'): string {
  if (typeof value !== 'string') return fallback
  if (!value.startsWith('/')) return fallback
  if (value.startsWith('//')) return fallback
  return value
}
