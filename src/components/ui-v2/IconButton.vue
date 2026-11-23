<script setup lang="ts">
import { computed } from 'vue'

type IconButtonVariant = 'ghost' | 'secondary' | 'danger'
type IconButtonSize = 'sm' | 'md'

const props = withDefaults(
  defineProps<{
    label: string
    variant?: IconButtonVariant
    size?: IconButtonSize
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  {
    variant: 'ghost',
    size: 'md',
    type: 'button',
    disabled: false,
  },
)

const classes = computed(() => [
  'ui-icon-btn',
  `ui-icon-btn--${props.variant}`,
  `ui-icon-btn--${props.size}`,
])
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :aria-label="label"
    :title="label"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style scoped>
.ui-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--touch-target);
  height: var(--touch-target);
  flex: 0 0 auto;
  border: 1px solid transparent;
  border-radius: var(--radius-control);
  cursor: pointer;
  transition:
    background-color var(--motion-fast) var(--ease-exit),
    border-color var(--motion-fast) var(--ease-exit),
    color var(--motion-fast) var(--ease-exit);
}

.ui-icon-btn:focus-visible {
  outline: 2px solid var(--color-signal-strong);
  outline-offset: 2px;
}

.ui-icon-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.ui-icon-btn--ghost {
  background: transparent;
  color: var(--color-ink);
}

.ui-icon-btn--ghost:hover:not(:disabled) {
  background: var(--color-surface);
}

.ui-icon-btn--secondary {
  background: var(--color-surface-raised);
  border-color: var(--color-line);
  color: var(--color-ink);
  box-shadow: var(--shadow-card);
}

.ui-icon-btn--secondary:hover:not(:disabled) {
  background: var(--color-surface);
}

.ui-icon-btn--danger {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.ui-icon-btn--danger:hover:not(:disabled) {
  background: #fde5e2;
}

.ui-icon-btn--sm {
  width: var(--touch-target);
  height: var(--touch-target);
}
</style>
