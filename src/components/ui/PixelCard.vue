<template>
  <div class="border-3 border-slate-900 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full">
    <div 
      v-if="title" 
      class="border-b-3 border-slate-900 bg-slate-100 px-4 py-2 flex justify-between items-center"
    >
      <h3 class="font-mono font-black uppercase text-slate-900 tracking-tight">{{ title }}</h3>
      
      <slot name="action"></slot>
    </div>
    
    <div class="p-4 flex-grow">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script>