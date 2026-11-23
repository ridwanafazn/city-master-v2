<template>
  <div class="space-y-3">
    <label
      v-for="option in CONSENT_OPTIONS"
      :key="option.value"
      class="flex gap-3 border-2 border-slate-900 bg-white p-3 cursor-pointer hover:bg-slate-50"
    >
      <input
        type="checkbox"
        class="mt-1 h-4 w-4 accent-slate-900"
        :checked="Boolean(active[option.value])"
        @change="toggle(option.value, ($event.target as HTMLInputElement).checked)"
      />
      <span class="space-y-1">
        <span class="block font-black uppercase text-xs">
          {{ option.label }}
          <span v-if="option.requiredForInjuries" class="text-red-700">*</span>
        </span>
        <span class="block font-mono text-[11px] text-slate-600">
          {{ option.description }}
        </span>
      </span>
    </label>

    <p class="font-mono text-[10px] text-slate-500">
      Policy version: {{ policyVersion }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { ConsentKind } from '../../types/profile'
import { CONSENT_OPTIONS } from '../../lib/profileOptions'

defineProps({
  policyVersion: {
    type: String,
    default: '2026-01',
  },
})

const active = defineModel<Record<string, boolean>>({ required: true })

function toggle(kind: ConsentKind, granted: boolean) {
  active.value[kind] = granted
}
</script>
