<template>
  <div class="space-y-8">
    <header class="border-b-4 border-slate-900 pb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-blue-500 text-white border-2 border-slate-900 px-2 py-1 font-mono text-[10px] font-black uppercase">
            M0 · Foundation
          </span>
          <span class="font-mono text-[10px] text-slate-500 uppercase">App shell online</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-black uppercase tracking-tighter">
          Control <span class="text-blue-600">Room</span>
        </h1>
        <p class="text-slate-600 mt-2 font-mono text-sm max-w-2xl">
          [SYS_MSG]: Frontend foundation is wired to the local FastAPI backend.
          Auth, plans, workouts, and progress arrive in the next milestones.
        </p>
      </div>
      <div class="flex gap-2">
        <PixelButton
          variant="secondary"
          :disabled="appStore.backendStatus === 'checking'"
          @click="refresh"
        >
          {{ appStore.backendStatus === 'checking' ? 'Checking…' : 'Refresh Status' }}
        </PixelButton>
        <RouterLink to="/" class="pixel-button font-black uppercase inline-flex items-center">
          Public Engine
        </RouterLink>
      </div>
    </header>

    <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <PixelCard title="Backend Link" class="lg:col-span-2">
        <template #action>
          <span class="font-mono text-[10px] font-black uppercase px-2 py-0.5 border-2 border-slate-900" :class="statusBadgeClass">
            {{ statusLabel }}
          </span>
        </template>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 font-mono text-sm">
          <StatusRow label="API Base URL" :value="appStore.apiBaseUrl" />
          <StatusRow label="Health" :value="appStore.health?.status ?? '—'" />
          <StatusRow label="Ready" :value="appStore.ready?.status ?? '—'" />
          <StatusRow label="Database" :value="appStore.databaseLabel" />
          <StatusRow label="Redis" :value="appStore.redisLabel" />
          <StatusRow label="Rate Limit" :value="appStore.rateLimitLabel" />
          <StatusRow label="Dataset" :value="appStore.datasetLabel" />
          <StatusRow label="Environment" :value="appStore.health?.environment ?? '—'" />
          <StatusRow label="Last Check" :value="lastCheckedLabel" />
        </div>

        <div
          v-if="appStore.error"
          class="mt-4 border-3 border-red-700 bg-red-50 p-3 font-mono text-xs text-red-800"
        >
          <div class="font-black uppercase mb-1">
            Backend error{{ appStore.errorCode ? ` · ${appStore.errorCode}` : '' }}
          </div>
          <p>{{ appStore.error }}</p>
          <p class="mt-2 text-red-700">
            Pastikan backend lokal berjalan di port 8080 dan
            <code class="bg-white px-1 border border-red-300">CORS_ORIGINS</code>
            mengizinkan Vite.
          </p>
        </div>
      </PixelCard>

      <PixelCard title="M0 Checklist">
        <ul class="space-y-2 font-mono text-xs">
          <li v-for="item in checklist" :key="item.label" class="flex gap-2">
            <span
              class="mt-0.5 w-4 h-4 border-2 border-slate-900 flex items-center justify-center text-[10px] font-black shrink-0"
              :class="item.done ? 'bg-green-400' : 'bg-white text-slate-400'"
            >
              {{ item.done ? '✓' : '·' }}
            </span>
            <span :class="item.done ? 'text-slate-900' : 'text-slate-500'">{{ item.label }}</span>
          </li>
        </ul>
      </PixelCard>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <PixelCard title="Next: M1 Auth & Account">
        <ol class="space-y-2 font-mono text-sm list-decimal list-inside">
          <li>Neon Auth client + callback</li>
          <li>Pinia session store</li>
          <li>Axios bearer token provider</li>
          <li>Protected <code class="bg-slate-100 px-1">/app</code> routes</li>
          <li><code class="bg-slate-100 px-1">GET /me</code> bootstrap + account page</li>
        </ol>
        <p class="mt-4 text-xs text-slate-500 font-mono">
          Token provider hook is already exposed by <code>src/api/client.ts</code>.
        </p>
      </PixelCard>

      <PixelCard title="Guardrails">
        <ul class="space-y-2 font-mono text-sm">
          <li>Public recommendation flow stays available at <code class="bg-slate-100 px-1">/</code>.</li>
          <li>No token is persisted by M0 code.</li>
          <li>Backend feature flags stay off until their milestone.</li>
          <li>All API errors normalize to <code class="bg-slate-100 px-1">ApiError</code>.</li>
          <li>Local backend: <code class="bg-slate-100 px-1">127.0.0.1:8080</code>.</li>
        </ul>
      </PixelCard>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import PixelButton from '../../components/ui/PixelButton.vue'
import PixelCard from '../../components/ui/PixelCard.vue'
import StatusRow from '../../components/ui/StatusRow.vue'
import { useAppStore } from '../../stores/appStore'

const appStore = useAppStore()

const checklist = [
  { label: 'App shell and routes', done: true },
  { label: 'Typed API client and error normalization', done: true },
  { label: 'Local env and CORS setup', done: true },
  { label: 'Backend health + readiness view', done: true },
  { label: 'Public recommendation regression checked', done: true },
]

const statusLabel = computed(() => {
  switch (appStore.backendStatus) {
    case 'online':
      return 'Online'
    case 'degraded':
      return 'Degraded'
    case 'offline':
      return 'Offline'
    case 'checking':
      return 'Checking'
    default:
      return 'Unknown'
  }
})

const statusBadgeClass = computed(() => {
  switch (appStore.backendStatus) {
    case 'online':
      return 'bg-green-300'
    case 'degraded':
      return 'bg-yellow-200'
    case 'offline':
      return 'bg-red-400 text-white'
    default:
      return 'bg-slate-100'
  }
})

const lastCheckedLabel = computed(() => {
  if (!appStore.lastCheckedAt) return '—'
  return new Date(appStore.lastCheckedAt).toLocaleTimeString('en-GB', { hour12: false })
})

function refresh() {
  void appStore.checkBackend()
}

onMounted(() => {
  void appStore.checkBackend()
})
</script>
