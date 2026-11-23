<template>
  <div class="flex justify-between gap-4 border-b border-slate-200 py-1.5 last:border-b-0">
    <span class="font-bold uppercase text-slate-500">{{ label }}</span>
    <span class="text-right break-all text-slate-900">
      {{ value }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    default: '—',
  },
})
</script>
