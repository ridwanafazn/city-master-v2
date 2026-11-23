<script setup lang="ts">
type BadgeVariant = 'neutral' | 'signal' | 'data' | 'success' | 'warning' | 'danger' | 'outline'
type BadgeSize = 'sm' | 'md'

withDefaults(
  defineProps<{
    variant?: BadgeVariant
    size?: BadgeSize
    dot?: boolean
  }>(),
  {
    variant: 'neutral',
    size: 'sm',
    dot: false,
  },
)
</script>

<template>
  <span class="ui-badge" :class="[`ui-badge--${variant}`, `ui-badge--${size}`]">
    <span v-if="dot" class="ui-badge__dot" aria-hidden="true" />
    <slot />
  </span>
</template>

<style scoped>
.ui-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 650;
  letter-spacing: 0.01em;
  line-height: 1;
  white-space: nowrap;
}

.ui-badge--sm {
  min-height: 24px;
  padding: 5px 9px;
}

.ui-badge--md {
  min-height: 30px;
  padding: 7px 12px;
}

.ui-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.ui-badge--neutral {
  background: var(--color-surface);
  border-color: var(--color-line);
  color: var(--color-ink);
}

.ui-badge--signal {
  background: var(--color-signal-strong);
  border-color: var(--color-signal-strong);
  color: var(--color-signal-ink);
}

.ui-badge--data {
  background: var(--color-data);
  border-color: var(--color-data);
  color: #ffffff;
}

.ui-badge--success {
  background: var(--color-success-bg);
  border-color: #cfe6bf;
  color: var(--color-success-ink);
}

.ui-badge--warning {
  background: var(--color-warning-bg);
  border-color: #f2d9b2;
  color: var(--color-warning);
}

.ui-badge--danger {
  background: var(--color-danger-bg);
  border-color: #f7d1cd;
  color: var(--color-danger);
}

.ui-badge--outline {
  background: transparent;
  border-color: var(--color-ink);
  color: var(--color-ink);
}
</style>
