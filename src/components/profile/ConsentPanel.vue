<template>
  <div class="consent-panel">
    <AppCheckbox
      v-for="option in CONSENT_OPTIONS"
      :key="option.value"
      :model-value="Boolean(active[option.value])"
      :label="option.requiredForInjuries ? `${option.label} (wajib untuk cedera)` : option.label"
      :description="option.description"
      @update:model-value="toggle(option.value, $event)"
    />
    <p class="consent-panel__version">Policy version: {{ policyVersion }}</p>
  </div>
</template>

<script setup lang="ts">
import AppCheckbox from '../ui-v2/AppCheckbox.vue'
import type { ConsentKind } from '../../types/profile'
import { CONSENT_OPTIONS } from '../../lib/profileOptions'

withDefaults(
  defineProps<{
    policyVersion?: string
  }>(),
  {
    policyVersion: '2026-01',
  },
)

const active = defineModel<Record<string, boolean>>({ required: true })

function toggle(kind: ConsentKind, granted: boolean) {
  active.value[kind] = granted
}
</script>

<style scoped>
.consent-panel {
  display: grid;
  gap: 2px;
}

.consent-panel__version {
  margin: 8px 0 0;
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
}
</style>
