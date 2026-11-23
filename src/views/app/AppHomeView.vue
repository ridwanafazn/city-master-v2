<template>
  <div class="space-y-8">
    <header class="border-b-4 border-slate-900 pb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-blue-500 text-white border-2 border-slate-900 px-2 py-1 font-mono text-[10px] font-black uppercase">
            M3 · Plan Lifecycle
          </span>
          <span class="font-mono text-[10px] text-slate-500 uppercase">
            {{ planCountLabel }}
          </span>
        </div>
        <h1 class="text-4xl md:text-5xl font-black uppercase tracking-tighter">
          Control <span class="text-blue-600">Room</span>
        </h1>
        <p class="text-slate-600 mt-2 font-mono text-sm max-w-2xl">
          [SYS_MSG]: Profile and consent are ready. Generate, version, share, and
          export saved plans.
        </p>
      </div>
      <div class="flex gap-2">
        <RouterLink to="/app/plans" class="pixel-button font-black uppercase inline-flex items-center">
          Plan Library
        </RouterLink>
        <PixelButton
          variant="secondary"
          :disabled="appStore.backendStatus === 'checking'"
          @click="refresh"
        >
          {{ appStore.backendStatus === 'checking' ? 'Checking…' : 'Refresh Status' }}
        </PixelButton>
      </div>
    </header>

    <div
      v-if="!auth.profileComplete"
      class="border-3 border-yellow-700 bg-yellow-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
    >
      <div class="font-mono text-xs text-yellow-900">
        <strong class="uppercase">Profile incomplete.</strong>
        Lengkapi profil, equipment, cedera, dan consent sebelum membuat plan.
      </div>
      <RouterLink to="/app/onboarding" class="pixel-button text-xs font-black uppercase bg-yellow-200 inline-flex items-center">
        Start Onboarding >
      </RouterLink>
    </div>

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

      <PixelCard title="Session">
        <template #action>
          <RouterLink to="/app/account" class="font-mono text-[10px] font-black uppercase underline">
            Account
          </RouterLink>
        </template>
        <div class="space-y-2 font-mono text-sm">
          <StatusRow label="Operator" :value="auth.displayName" />
          <StatusRow label="Email" :value="auth.email || '—'" />
          <StatusRow label="Roles" :value="auth.roles.length ? auth.roles.join(', ') : 'user'" />
          <StatusRow label="Profile Complete" :value="auth.profileComplete ? 'yes' : 'no'" />
          <StatusRow label="Consent" :value="consentSummary" />
          <StatusRow label="User ID" :value="auth.me?.user.id ?? '—'" />
        </div>
        <RouterLink
          :to="auth.profileComplete ? '/app/profile' : '/app/onboarding'"
          class="pixel-button mt-4 w-full text-center text-[10px] font-black uppercase inline-block"
        >
          {{ auth.profileComplete ? 'Open Profile' : 'Complete Profile' }}
        </RouterLink>
      </PixelCard>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <PixelCard title="M3 Checklist">
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

      <PixelCard title="Next: M4 Workout Execution">
        <ol class="space-y-2 font-mono text-sm list-decimal list-inside">
          <li>Start workout from a plan day</li>
          <li>Set logger + substitution</li>
          <li>Complete workout summary</li>
          <li>Offline queue + sync batch</li>
          <li>Workout history</li>
        </ol>
        <p class="mt-4 text-xs text-slate-500 font-mono">
          Plans with locked exercises and revision history are ready for the workout loop.
        </p>
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
import { useAuthStore } from '../../stores/authStore'
import { usePlanStore } from '../../stores/planStore'

const appStore = useAppStore()
const auth = useAuthStore()
const planStore = usePlanStore()

const checklist = [
  { label: 'Plan create with idempotency key', done: true },
  { label: 'Plan library + cursor pagination', done: true },
  { label: 'Day detail + lock/swap/regenerate', done: true },
  { label: 'Revision conflict handling', done: true },
  { label: 'Version history', done: true },
  { label: 'Share link + public read-only view', done: true },
  { label: 'PDF / ICS export', done: true },
]

const planCountLabel = computed(() =>
  planStore.plans.length ? `${planStore.plans.length} saved plans` : 'No plans yet',
)

const consentSummary = computed(() => {
  const entries = Object.entries(auth.consents)
  if (!entries.length) return 'none'
  const granted = entries.filter(([, value]) => value).map(([key]) => key)
  return granted.length ? granted.join(', ') : 'none granted'
})

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
  if (!planStore.plans.length) {
    void planStore.list(true)
  }
})
</script>
