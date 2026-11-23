import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useAppStore } from '../stores/appStore'

const WAKE_THRESHOLD_SECONDS = 2
const SLOW_THRESHOLD_SECONDS = 8

/**
 * Non-blocking Railway readiness probe for the app shell.
 *
 * The shell renders immediately; the banner only appears after the probe has
 * been pending for a moment, and switches to the explicit "server waking"
 * state after eight seconds.
 */
export function useServerWake() {
  const appStore = useAppStore()
  const elapsed = ref(0)
  let timer: ReturnType<typeof setInterval> | null = null

  function startTimer() {
    stopTimer()
    elapsed.value = 0
    timer = setInterval(() => {
      if (appStore.backendStatus === 'checking') elapsed.value += 1
    }, 1000)
  }

  function stopTimer() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  async function probe(force = false) {
    startTimer()
    await appStore.probeReadiness(force)
    if (appStore.backendStatus !== 'checking') stopTimer()
  }

  function retry() {
    void probe(true)
  }

  onMounted(() => {
    void probe()
  })

  onBeforeUnmount(stopTimer)

  const visible = computed(
    () =>
      appStore.backendStatus === 'offline' ||
      (appStore.backendStatus === 'checking' && elapsed.value >= WAKE_THRESHOLD_SECONDS),
  )

  const state = computed<'connecting' | 'waking' | 'offline'>(() => {
    if (appStore.backendStatus === 'offline') return 'offline'
    if (elapsed.value >= SLOW_THRESHOLD_SECONDS) return 'waking'
    return 'connecting'
  })

  const canRetry = computed(() => state.value !== 'connecting')

  return { visible, state, elapsed, canRetry, retry }
}
