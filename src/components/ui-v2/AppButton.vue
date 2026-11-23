<script setup lang="ts">
import { computed } from 'vue'
import { LoaderCircle } from '@lucide/vue'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: ButtonSize
    type?: 'button' | 'submit' | 'reset'
    loading?: boolean
    disabled?: boolean
    block?: boolean
    hero?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    loading: false,
    disabled: false,
    block: false,
    hero: false,
  },
)

const classes = computed(() => [
  'ui-btn',
  `ui-btn--${props.variant}`,
  `ui-btn--${props.size}`,
  {
    'ui-btn--block': props.block,
    'ui-btn--hero': props.hero,
    'ui-btn--loading': props.loading,
  },
])
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
    :aria-busy="loading ? 'true' : undefined"
  >
    <LoaderCircle v-if="loading" class="ui-btn__spinner" :size="18" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.ui-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: var(--touch-target);
  border: 1px solid transparent;
  border-radius: var(--radius-control);
  font-family: var(--font-body);
  font-weight: 650;
  line-height: 1.2;
  text-align: center;
  cursor: pointer;
  transition:
    background-color var(--motion-fast) var(--ease-exit),
    border-color var(--motion-fast) var(--ease-exit),
    color var(--motion-fast) var(--ease-exit),
    transform var(--motion-fast) var(--ease-exit);
}

.ui-btn:focus-visible {
  outline: 2px solid var(--color-signal-strong);
  outline-offset: 2px;
}

.ui-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.ui-btn:active:not(:disabled) {
  transform: translateY(0);
}

.ui-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
  box-shadow: none;
}

.ui-btn--sm {
  padding: 0 12px;
  font-size: 0.8125rem;
}

.ui-btn--md {
  padding: 0 18px;
  font-size: 0.9375rem;
}

.ui-btn--lg {
  padding: 0 24px;
  font-size: 1rem;
}

.ui-btn--block {
  width: 100%;
}

.ui-btn--primary {
  background: var(--color-signal-strong);
  border-color: var(--color-signal-strong);
  color: var(--color-signal-ink);
  box-shadow: var(--shadow-card);
}

.ui-btn--primary:hover:not(:disabled) {
  background: var(--color-signal-hover);
  border-color: var(--color-signal-hover);
}

.ui-btn--secondary {
  background: var(--color-surface-raised);
  border-color: var(--color-line);
  color: var(--color-ink);
  box-shadow: var(--shadow-card);
}

.ui-btn--secondary:hover:not(:disabled) {
  background: var(--color-surface);
  border-color: #b9c0ae;
}

.ui-btn--ghost {
  background: transparent;
  color: var(--color-ink);
}

.ui-btn--ghost:hover:not(:disabled) {
  background: var(--color-surface);
}

.ui-btn--danger {
  background: var(--color-danger);
  border-color: var(--color-danger);
  color: #ffffff;
  box-shadow: var(--shadow-card);
}

.ui-btn--danger:hover:not(:disabled) {
  background: #8f1c13;
  border-color: #8f1c13;
}

.ui-btn--hero {
  border-radius: var(--radius-control);
  box-shadow: var(--shadow-cta);
}

.ui-btn--hero:hover:not(:disabled) {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-cta);
}

.ui-btn--hero:active:not(:disabled) {
  transform: translate(0, 0);
  box-shadow: none;
}

.ui-btn__spinner {
  animation: ui-btn-spin 0.8s linear infinite;
  flex: 0 0 auto;
}

@keyframes ui-btn-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
