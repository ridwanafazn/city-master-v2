<script setup lang="ts">
import { Check } from '@lucide/vue'

withDefaults(
  defineProps<{
    selected?: boolean
    disabled?: boolean
  }>(),
  {
    selected: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <button
    type="button"
    class="ui-chip"
    :class="{ 'ui-chip--selected': selected }"
    :disabled="disabled"
    :aria-pressed="selected"
    @click="emit('toggle')"
  >
    <Check v-if="selected" :size="14" :stroke-width="3" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.ui-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: var(--touch-target);
  padding: 8px 14px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  background: var(--color-surface-raised);
  color: var(--color-ink);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.2;
  transition:
    background-color var(--motion-fast) var(--ease-exit),
    border-color var(--motion-fast) var(--ease-exit),
    color var(--motion-fast) var(--ease-exit);
}

.ui-chip:hover:not(:disabled) {
  border-color: #b9c0ae;
  background: var(--color-surface);
}

.ui-chip--selected {
  border-color: var(--color-signal-strong);
  background: var(--color-signal-strong);
  color: var(--color-signal-ink);
}

.ui-chip--selected:hover:not(:disabled) {
  background: var(--color-signal-hover);
  border-color: var(--color-signal-hover);
}

.ui-chip:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.ui-chip:focus-visible {
  outline: 2px solid var(--color-signal-strong);
  outline-offset: 2px;
}
</style>
