<template>
  <div class="min-h-screen flex flex-col bg-slate-50">
    <header class="border-b-4 border-slate-900 bg-white sticky top-0 z-20">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <RouterLink to="/app" class="flex items-center gap-3 shrink-0">
          <span class="bg-slate-900 text-green-400 font-black px-2 py-1 border-3 border-slate-900">
            JYMZ
          </span>
          <span class="hidden sm:block font-black uppercase tracking-tight">
            App Console
          </span>
        </RouterLink>

        <nav class="hidden lg:flex items-center gap-1 font-mono text-xs font-bold uppercase">
          <RouterLink
            to="/app"
            class="px-3 py-2 border-2 border-transparent hover:border-slate-900"
            exact-active-class="bg-slate-900 text-white border-slate-900"
          >
            Control Room
          </RouterLink>
          <RouterLink
            to="/app/profile"
            class="px-3 py-2 border-2 border-transparent hover:border-slate-900"
            active-class="bg-slate-900 text-white border-slate-900"
          >
            Profile
          </RouterLink>
          <RouterLink
            to="/app/plans"
            class="px-3 py-2 border-2 border-transparent hover:border-slate-900"
            active-class="bg-slate-900 text-white border-slate-900"
          >
            Plans
          </RouterLink>
          <RouterLink
            to="/app/workouts"
            class="px-3 py-2 border-2 border-transparent hover:border-slate-900"
            active-class="bg-slate-900 text-white border-slate-900"
          >
            Workouts
          </RouterLink>
          <span class="px-3 py-2 text-slate-400 border-2 border-transparent">
            Progress <small class="text-[10px]">M5</small>
          </span>
          <RouterLink
            to="/app/account"
            class="px-3 py-2 border-2 border-transparent hover:border-slate-900"
            active-class="bg-slate-900 text-white border-slate-900"
          >
            Account
          </RouterLink>
        </nav>

        <div class="flex items-center gap-2">
          <RouterLink
            to="/app/account"
            class="hidden md:inline-flex flex-col items-end border-2 border-slate-900 px-2 py-1 hover:bg-slate-100"
          >
            <span class="font-mono text-[10px] font-black uppercase leading-tight">
              {{ auth.displayName }}
            </span>
            <span class="font-mono text-[9px] text-slate-500 leading-tight">
              {{ auth.email }}
            </span>
          </RouterLink>
          <span
            class="hidden sm:inline-flex items-center gap-2 border-2 border-slate-900 px-2 py-1 font-mono text-[10px] font-black uppercase"
            :class="statusClass"
            :title="appStore.error || 'Backend status'"
          >
            <span class="w-2 h-2 border border-slate-900" :class="statusDotClass"></span>
            {{ statusLabel }}
          </span>
          <RouterLink
            to="/"
            class="pixel-button text-[10px] font-black uppercase"
          >
            Public Engine
          </RouterLink>
        </div>
      </div>

      <nav class="lg:hidden flex gap-2 overflow-x-auto px-4 pb-3 font-mono text-[10px] font-bold uppercase">
        <RouterLink
          to="/app"
          class="px-3 py-1 border-2 border-slate-900 bg-white shrink-0"
          exact-active-class="bg-slate-900 text-white"
        >
          Control Room
        </RouterLink>
        <RouterLink
          to="/app/profile"
          class="px-3 py-1 border-2 border-slate-900 bg-white shrink-0"
          active-class="bg-slate-900 text-white"
        >
          Profile
        </RouterLink>
        <RouterLink
          to="/app/plans"
          class="px-3 py-1 border-2 border-slate-900 bg-white shrink-0"
          active-class="bg-slate-900 text-white"
        >
          Plans
        </RouterLink>
        <RouterLink
          to="/app/workouts"
          class="px-3 py-1 border-2 border-slate-900 bg-white shrink-0"
          active-class="bg-slate-900 text-white"
        >
          Workouts
        </RouterLink>
        <span class="px-3 py-1 border-2 border-slate-300 text-slate-400 shrink-0">Progress · M5</span>
        <RouterLink
          to="/app/account"
          class="px-3 py-1 border-2 border-slate-900 bg-white shrink-0"
          active-class="bg-slate-900 text-white"
        >
          Account
        </RouterLink>
      </nav>
    </header>

    <main class="max-w-7xl mx-auto w-full p-4 md:p-8 flex-grow">
      <RouterView />
    </main>

    <footer class="border-t-4 border-slate-900 bg-white">
      <div class="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row gap-2 justify-between font-mono text-[10px] text-slate-500 uppercase">
        <span>{{ appStore.appName }} · Frontend M4</span>
        <span class="truncate">API: {{ appStore.apiBaseUrl }}</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAppStore } from '../../stores/appStore'
import { useAuthStore } from '../../stores/authStore'

const appStore = useAppStore()
const auth = useAuthStore()

onMounted(() => {
  if (appStore.backendStatus === 'unknown') {
    void appStore.checkBackend()
  }
})

const statusLabel = computed(() => {
  switch (appStore.backendStatus) {
    case 'online':
      return 'Backend Online'
    case 'degraded':
      return 'Backend Degraded'
    case 'offline':
      return 'Backend Offline'
    case 'checking':
      return 'Checking…'
    default:
      return 'Backend Unknown'
  }
})

const statusClass = computed(() => {
  switch (appStore.backendStatus) {
    case 'online':
      return 'bg-green-300 text-green-950'
    case 'degraded':
      return 'bg-yellow-200 text-yellow-950'
    case 'offline':
      return 'bg-red-400 text-white'
    case 'checking':
      return 'bg-blue-200 text-blue-950'
    default:
      return 'bg-slate-100 text-slate-700'
  }
})

const statusDotClass = computed(() => {
  switch (appStore.backendStatus) {
    case 'online':
      return 'bg-green-700'
    case 'degraded':
      return 'bg-yellow-700'
    case 'offline':
      return 'bg-red-800'
    case 'checking':
      return 'bg-blue-700 animate-pulse'
    default:
      return 'bg-slate-500'
  }
})
</script>
