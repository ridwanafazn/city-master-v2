import { useId } from 'vue'

/**
 * Stable ids for label / hint / error wiring in form primitives.
 */
export function useFieldIds() {
  const uid = useId()
  return {
    inputId: `${uid}-input`,
    hintId: `${uid}-hint`,
    errorId: `${uid}-error`,
  }
}
