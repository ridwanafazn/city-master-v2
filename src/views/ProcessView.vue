<template>
  <div class="max-w-4xl mx-auto p-4 md:p-8 min-h-screen flex flex-col justify-center">
    
    <header class="mb-6">
      <h1 class="text-3xl font-black uppercase tracking-tighter text-center">
        Engine <span class="text-blue-600">Execution</span>
      </h1>
    </header>

    <div class="border-4 border-slate-900 bg-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-[50vh] min-h-[400px]">
      
      <div class="bg-slate-100 border-b-4 border-slate-900 px-4 py-2 flex justify-between items-center">
        <span class="font-black font-mono text-slate-900 uppercase tracking-widest text-sm">
          SYS_CONSOLE // OPTIMIZING
        </span>
        <div class="flex gap-2">
          <div class="w-3 h-3 border-2 border-slate-900 bg-slate-300"></div>
          <div class="w-3 h-3 border-2 border-slate-900 bg-slate-300"></div>
          <div class="w-3 h-3 border-2 border-slate-900 bg-slate-900"></div>
        </div>
      </div>
      
      <div 
        ref="terminalRef" 
        class="p-6 overflow-y-auto flex-grow text-green-400 font-mono text-sm sm:text-base space-y-2"
      >
        <div v-for="(log, idx) in store.engineLogs" :key="idx" class="break-words">
          <span class="text-slate-500">></span> {{ log }}
        </div>
        
        <div v-if="store.isProcessing" class="animate-pulse">
          <span class="text-slate-500">></span> <span class="bg-green-400 text-green-400">_</span>
        </div>

        <div v-if="store.error" class="text-red-500 font-bold mt-4">
          <span class="text-red-700">></span> [CRITICAL_FAILURE]: {{ store.error }}
        </div>

        <div v-if="!store.isProcessing && store.recommendationResult" class="text-blue-400 font-bold mt-4">
          <span class="text-blue-600">></span> Redirecting to Dashboard...
        </div>
      </div>
    </div>

    <div class="mt-8 flex justify-center min-h-[50px]">
      <PixelButton 
        v-if="store.error" 
        @click="returnToConfig" 
        variant="danger"
        class="px-8"
      >
        < RETURN TO PARAMETERS
      </PixelButton>

      <PixelButton 
        v-else-if="!store.isProcessing && store.recommendationResult" 
        @click="goToDashboard"
        class="px-8 animate-bounce"
      >
        MANUAL OVERRIDE: ENTER DASHBOARD
      </PixelButton>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useFitnessStore } from '../stores/fitnessStore'
import PixelButton from '../components/ui/PixelButton.vue'

const router = useRouter()
const store = useFitnessStore()
const terminalRef = ref<HTMLElement | null>(null)

/**
 * Auto-scroll ke bawah setiap kali ada log baru yang ditambahkan.
 * Memberikan kesan terminal sungguhan.
 */
watch(() => store.engineLogs.length, async () => {
  await nextTick()
  if (terminalRef.value) {
    terminalRef.value.scrollTop = terminalRef.value.scrollHeight
  }
})

/**
 * Watcher: Jika proses selesai, tidak ada error, dan hasil tersedia,
 * tunggu 1.5 detik (agar user bisa membaca pesan sukses), lalu redirect otomatis.
 */
watch(() => store.isProcessing, (isProcessing) => {
  if (!isProcessing && !store.error && store.recommendationResult) {
    setTimeout(() => {
      goToDashboard()
    }, 1500)
  }
})

const returnToConfig = () => {
  router.push('/')
}

const goToDashboard = () => {
  router.push('/dashboard')
}

/**
 * Keamanan Rute (Route Guard):
 * Jika user me-refresh halaman ini secara manual (tanpa melalui ConfigView),
 * kembalikan mereka ke halaman awal karena tidak ada proses yang berjalan.
 */
onMounted(() => {
  if (!store.isProcessing && !store.recommendationResult && !store.error) {
    returnToConfig()
  }
})
</script>

<style scoped>
/* Modifikasi scrollbar khusus untuk terminal agar menyatu dengan tema */
div::-webkit-scrollbar {
  width: 10px;
  background-color: #0f172a; /* slate-900 */
}
div::-webkit-scrollbar-thumb {
  background-color: #4ade80; /* green-400 */
  border: 2px solid #0f172a;
}
</style>