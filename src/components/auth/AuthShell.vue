<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <header class="border-b-4 border-slate-900 bg-white">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <RouterLink to="/" class="flex items-center gap-3">
          <span class="bg-slate-900 text-green-400 font-black px-2 py-1 border-3 border-slate-900">
            JYMZ
          </span>
          <span class="font-black uppercase tracking-tight hidden sm:block">Auth Console</span>
        </RouterLink>
        <RouterLink to="/" class="pixel-button text-[10px] font-black uppercase">
          Public Engine
        </RouterLink>
      </div>
    </header>

    <main class="flex-grow flex items-center justify-center p-4 md:p-8">
      <div class="w-full max-w-md">
        <div class="border-4 border-slate-900 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div class="border-b-4 border-slate-900 bg-slate-900 text-white px-4 py-3">
            <h1 class="font-black uppercase tracking-tight text-lg">{{ title }}</h1>
            <p class="font-mono text-[10px] text-slate-300 mt-1">{{ subtitle }}</p>
          </div>
          <div class="p-5 md:p-6">
            <slot />
          </div>
        </div>
        <p class="mt-4 text-center font-mono text-[10px] text-slate-500 uppercase">
          Managed auth by Neon · JWT verified by FastAPI
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>
