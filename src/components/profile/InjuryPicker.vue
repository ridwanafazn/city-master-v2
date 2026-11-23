<template>
  <div class="injury-picker">
    <div class="chip-grid" role="group" aria-label="Cedera atau area yang dihindari">
      <Chip
        v-for="item in INJURY_OPTIONS"
        :key="item.value"
        :selected="selected.includes(item.value)"
        @toggle="toggle(item.value)"
      >
        {{ item.label }}
      </Chip>
    </div>

    <p class="picker-hint">
      {{ selected.length }} dipilih. Cedera akan dihindari saat plan dibuat.
    </p>

    <div v-if="selected.length && !healthConsent" class="consent-warning" role="status">
      Consent <strong>health data processing</strong> wajib aktif sebelum cedera
      bisa disimpan.
    </div>
  </div>
</template>

<script setup lang="ts">
import Chip from '../ui-v2/Chip.vue'
import { INJURY_OPTIONS } from '../../lib/profileOptions'

withDefaults(
  defineProps<{
    healthConsent?: boolean
  }>(),
  {
    healthConsent: false,
  },
)

const selected = defineModel<string[]>({ required: true })

function toggle(value: string) {
  const index = selected.value.indexOf(value)
  if (index >= 0) selected.value.splice(index, 1)
  else selected.value.push(value)
}
</script>

<style scoped>
.injury-picker {
  display: grid;
  gap: 10px;
}

.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.picker-hint {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.75rem;
  line-height: 1.45;
}

.consent-warning {
  padding: 10px 12px;
  border: 1px solid #f2d9b2;
  border-radius: var(--radius-control);
  background: var(--color-warning-bg);
  color: var(--color-ink);
  font-size: 0.8125rem;
  line-height: 1.45;
}
</style>
