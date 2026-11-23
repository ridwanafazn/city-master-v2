<template>
  <div class="ui-v2-scope public-page">
    <header class="public-top">
      <RouterLink to="/" class="public-brand">JYMZ</RouterLink>
      <div class="public-top__actions">
        <span class="type-data">Engine publik</span>
        <RouterLink to="/auth/sign-in" class="text-link">Masuk</RouterLink>
      </div>
    </header>

    <main class="process-main">
      <header class="process-head">
        <div class="process-head__copy">
          <h1>{{ statusTitle }}</h1>
          <p>{{ statusCopy }}</p>
        </div>
        <div class="process-status" :class="`is-${statusTone}`" role="status">
          <span class="process-status__dot" aria-hidden="true" />
          <span>{{ statusLabel }}</span>
        </div>
      </header>

      <section class="run-ledger" aria-label="Parameter optimasi">
        <div>
          <span class="run-ledger__label">BMI</span>
          <span class="type-data">{{ store.currentBmi.toFixed(1) }}</span>
        </div>
        <div>
          <span class="run-ledger__label">Hari</span>
          <span class="type-data">{{ store.userProfile.available_days }}</span>
        </div>
        <div>
          <span class="run-ledger__label">Cedera</span>
          <span class="type-data">{{ store.userProfile.injuries.length }}</span>
        </div>
        <div>
          <span class="run-ledger__label">Target</span>
          <span class="type-data">{{ store.userProfile.preferred_body_part.length || 'Auto' }}</span>
        </div>
        <div>
          <span class="run-ledger__label">Equipment</span>
          <span class="type-data">{{ store.userProfile.preferred_equipment.length || 'Semua' }}</span>
        </div>
        <div>
          <span class="run-ledger__label">Waktu</span>
          <span class="type-data">{{ elapsedLabel }}</span>
        </div>
      </section>

      <section
        class="console"
        aria-labelledby="console-title"
        :aria-busy="store.isProcessing ? 'true' : undefined"
      >
        <div class="console__bar">
          <h2 id="console-title">Log eksekusi</h2>
          <span class="type-data">{{ store.isProcessing ? 'running' : statusCode }}</span>
        </div>

        <div ref="terminalRef" class="console__body" role="log" aria-live="polite">
          <p v-for="(log, idx) in store.engineLogs" :key="idx" class="console__line">
            <span class="console__prompt" aria-hidden="true">›</span>
            {{ log }}
          </p>
          <p v-if="store.isProcessing" class="console__line console__line--active">
            <span class="console__prompt" aria-hidden="true">›</span>
            Menunggu respons engine
            <span class="console__caret" aria-hidden="true" />
          </p>
          <p v-if="store.error" class="console__line console__line--error">
            <span class="console__prompt" aria-hidden="true">!</span>
            {{ store.error }}
          </p>
          <p
            v-if="!store.isProcessing && store.recommendationResult"
            class="console__line console__line--ok"
          >
            <span class="console__prompt" aria-hidden="true">✓</span>
            Optimasi selesai. Hasil siap dibuka.
          </p>
        </div>
      </section>

      <div class="process-actions">
        <template v-if="store.error">
          <AppButton variant="secondary" @click="returnToConfig">Ubah parameter</AppButton>
          <AppButton @click="retry">Coba lagi</AppButton>
        </template>
        <template v-else-if="!store.isProcessing && store.recommendationResult">
          <AppButton variant="secondary" @click="returnToConfig">Ubah parameter</AppButton>
          <AppButton @click="goToDashboard">
            Buka hasil
            <ArrowRight :size="16" aria-hidden="true" />
          </AppButton>
        </template>
        <p v-else class="process-note">
          Proses berjalan di server. Jangan tutup tab ini sampai hasil tersedia.
        </p>
      </div>

      <p v-if="store.error" class="error-note">
        Engine tidak mengembalikan hasil. Parameter tetap tersimpan, jadi Anda bisa
        mencoba lagi tanpa mengisi ulang form.
      </p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@lucide/vue'
import AppButton from '../components/ui-v2/AppButton.vue'
import { preloadUiFonts } from '../lib/preloadFonts'
import { useFitnessStore } from '../stores/fitnessStore'

const router = useRouter()
const store = useFitnessStore()
const terminalRef = ref<HTMLElement | null>(null)
const elapsedSeconds = ref(0)
let elapsedTimer: ReturnType<typeof setInterval> | null = null
let redirectTimer: ReturnType<typeof setTimeout> | null = null

preloadUiFonts()

const statusTone = computed(() => {
  if (store.error) return 'danger'
  if (store.isProcessing) return 'live'
  if (store.recommendationResult) return 'success'
  return 'idle'
})

const statusLabel = computed(() => {
  if (store.error) return 'Gagal'
  if (store.isProcessing) return 'Berjalan'
  if (store.recommendationResult) return 'Selesai'
  return 'Menunggu'
})

const statusCode = computed(() => {
  if (store.error) return 'gagal'
  if (store.recommendationResult) return 'selesai'
  return 'idle'
})

const statusTitle = computed(() => {
  if (store.error) return 'Optimasi berhenti'
  if (store.isProcessing) return 'Menyusun plan'
  if (store.recommendationResult) return 'Plan siap'
  return 'Engine idle'
})

const statusCopy = computed(() => {
  if (store.error) {
    return 'Rule engine atau optimizer gagal menyelesaikan proses. Parameter Anda tidak hilang.'
  }
  if (store.isProcessing) {
    return 'Rule engine memilih split, lalu genetic optimizer memilih exercise yang aman untuk cedera dan equipment Anda.'
  }
  if (store.recommendationResult) {
    return 'Split dan exercise sudah dipilih. Hasil akan terbuka otomatis; Anda juga bisa membukanya sekarang.'
  }
  return 'Tidak ada proses aktif. Kembali ke parameter untuk menjalankan optimasi.'
})

const elapsedLabel = computed(() => {
  const total = elapsedSeconds.value
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

function startTimer() {
  stopTimer()
  elapsedSeconds.value = 0
  elapsedTimer = setInterval(() => {
    elapsedSeconds.value += 1
  }, 1000)
}

function stopTimer() {
  if (elapsedTimer) {
    clearInterval(elapsedTimer)
    elapsedTimer = null
  }
}

watch(
  () => store.engineLogs.length,
  async () => {
    await nextTick()
    if (terminalRef.value) {
      terminalRef.value.scrollTop = terminalRef.value.scrollHeight
    }
  },
)

watch(
  () => store.isProcessing,
  (isProcessing) => {
    if (isProcessing) {
      startTimer()
      return
    }
    stopTimer()
    if (!store.error && store.recommendationResult) {
      redirectTimer = setTimeout(() => {
        goToDashboard()
      }, 1500)
    }
  },
)

function returnToConfig() {
  void router.push('/')
}

function goToDashboard() {
  void router.push('/dashboard')
}

function retry() {
  void router.push('/')
}

onMounted(() => {
  if (!store.isProcessing && !store.recommendationResult && !store.error) {
    returnToConfig()
    return
  }
  if (store.isProcessing) {
    startTimer()
    return
  }
  if (!store.error && store.recommendationResult) {
    redirectTimer = setTimeout(() => {
      goToDashboard()
    }, 1500)
  }
})

onBeforeUnmount(() => {
  stopTimer()
  if (redirectTimer) clearTimeout(redirectTimer)
})
</script>

<style scoped>
.public-page {
  min-height: 100vh;
  background: var(--color-paper);
  color: var(--color-ink);
}

.public-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: var(--content-max);
  margin: 0 auto;
  padding: 20px var(--gutter-mobile);
  border-bottom: 1px solid var(--color-ink);
}

.public-brand {
  display: inline-flex;
  align-items: center;
  min-height: var(--touch-target);
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  text-decoration: none;
}

.public-top__actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.public-top__actions .type-data {
  color: var(--color-muted);
  font-size: 0.625rem;
  text-transform: uppercase;
}

.text-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--touch-target);
  min-height: var(--touch-target);
  color: var(--color-signal-strong);
  font-size: 0.8125rem;
  font-weight: 650;
  text-decoration: underline;
  text-underline-offset: 0.18em;
}

.process-main {
  display: grid;
  gap: 28px;
  max-width: 980px;
  margin: 0 auto;
  padding: 40px var(--gutter-mobile) 64px;
}

.process-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-ink);
}

.process-head h1 {
  margin: 0;
  font-size: clamp(2.25rem, 4.6vw, 3.75rem);
  letter-spacing: -0.035em;
  line-height: 0.98;
}

.process-head p {
  max-width: 62ch;
  margin: 14px 0 0;
  color: var(--color-muted);
  font-size: var(--text-body);
  line-height: var(--leading-relaxed);
}

.process-status {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  background: var(--color-surface-raised);
  font-family: var(--font-data);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
}

.process-status__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-muted);
}

.process-status.is-live {
  border-color: #f2d9b2;
  background: var(--color-warning-bg);
}

.process-status.is-live .process-status__dot {
  background: var(--color-signal);
  animation: status-pulse 1.4s ease-in-out infinite;
}

.process-status.is-success {
  border-color: #cfe6bf;
  background: var(--color-success-bg);
  color: var(--color-success-ink);
}

.process-status.is-success .process-status__dot {
  background: var(--color-success);
}

.process-status.is-danger {
  border-color: #f7d1cd;
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.process-status.is-danger .process-status__dot {
  background: var(--color-danger);
}

@keyframes status-pulse {
  50% {
    opacity: 0.35;
    transform: scale(0.78);
  }
}

.run-ledger {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  margin: 0;
  border-top: 1px solid var(--color-line);
  border-bottom: 1px solid var(--color-line);
}

.run-ledger > div {
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  border-right: 1px solid var(--color-line);
}

.run-ledger > div:last-child {
  border-right: 0;
}

.run-ledger__label {
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.5625rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.run-ledger .type-data {
  font-size: 0.8125rem;
}

.console {
  overflow: hidden;
  border: 1px solid var(--color-ink);
  border-radius: var(--radius-card);
  background: var(--color-ink);
  color: #e8ecdf;
}

.console__bar {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 16px;
  border-bottom: 1px solid #33382a;
}

.console__bar h2 {
  margin: 0;
  color: #ffffff;
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 650;
  letter-spacing: 0;
}

.console__bar .type-data {
  color: #a9b09a;
  font-size: 0.625rem;
  text-transform: uppercase;
}

.console__body {
  display: grid;
  gap: 6px;
  min-height: 280px;
  max-height: 46vh;
  padding: 20px 16px;
  overflow-y: auto;
  font-family: var(--font-data);
  font-size: 0.75rem;
  line-height: 1.6;
}

.console__line {
  margin: 0;
  overflow-wrap: anywhere;
}

.console__prompt {
  color: #8f997c;
  margin-right: 4px;
}

.console__line--active {
  color: #f0b48f;
}

.console__line--error {
  color: #ff9b8f;
}

.console__line--ok {
  color: #b8e08a;
}

.console__caret {
  display: inline-block;
  width: 7px;
  height: 1em;
  margin-left: 6px;
  background: #f0b48f;
  vertical-align: text-bottom;
  animation: caret-blink 1s steps(2, start) infinite;
}

@keyframes caret-blink {
  50% {
    opacity: 0;
  }
}

.process-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.process-note {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.error-note {
  margin: 0;
  padding: 12px;
  border: 1px solid #f7d1cd;
  border-radius: var(--radius-control);
  background: var(--color-danger-bg);
  color: var(--color-danger);
  font-size: 0.8125rem;
  line-height: 1.5;
}

@media (min-width: 641px) {
  .public-top,
  .process-main {
    padding-left: var(--gutter-desktop);
    padding-right: var(--gutter-desktop);
  }
}

@media (max-width: 860px) {
  .run-ledger {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .run-ledger > div:nth-child(3n) {
    border-right: 0;
  }
}

@media (max-width: 640px) {
  .process-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .run-ledger {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .run-ledger > div:nth-child(3n) {
    border-right: 1px solid var(--color-line);
  }

  .run-ledger > div:nth-child(2n) {
    border-right: 0;
  }

  .console__body {
    min-height: 240px;
    font-size: 0.6875rem;
  }

  .process-actions :deep(.ui-btn) {
    flex: 1 1 auto;
  }
}
</style>
