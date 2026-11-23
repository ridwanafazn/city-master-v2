<script setup lang="ts">
import { computed } from 'vue'
import { Minus, TrendingDown, TrendingUp } from '@lucide/vue'
import Skeleton from './Skeleton.vue'
import type { StatTrend } from './types'

const props = withDefaults(
  defineProps<{
    label: string
    value: string | number
    unit?: string
    trend?: StatTrend
    loading?: boolean
  }>(),
  {
    unit: '',
    trend: undefined,
    loading: false,
  },
)

const displayValue = computed(() => {
  if (typeof props.value === 'number') {
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(props.value)
  }
  return props.value
})

const trendIcon = computed(() => {
  if (props.trend?.direction === 'up') return TrendingUp
  if (props.trend?.direction === 'down') return TrendingDown
  return Minus
})

const trendTone = computed(() => props.trend?.tone ?? 'neutral')
</script>

<template>
  <div class="ui-stat">
    <div class="ui-stat__head">
      <span class="type-label ui-stat__label">{{ label }}</span>
      <span v-if="$slots.icon" class="ui-stat__icon" aria-hidden="true">
        <slot name="icon" />
      </span>
    </div>

    <template v-if="loading">
      <Skeleton width="58%" height="2.25rem" radius="sm" />
      <Skeleton width="42%" height="0.75rem" radius="sm" />
    </template>
    <template v-else>
      <div class="ui-stat__value-row">
        <span class="type-data ui-stat__value">{{ displayValue }}</span>
        <span v-if="unit" class="type-data ui-stat__unit">{{ unit }}</span>
      </div>
      <p v-if="trend" class="ui-stat__trend" :class="`ui-stat__trend--${trendTone}`">
        <component :is="trendIcon" :size="14" aria-hidden="true" />
        {{ trend.label }}
      </p>
    </template>
  </div>
</template>

<style scoped>
.ui-stat {
  display: grid;
  gap: 8px;
  min-width: 0;
  padding: var(--space-5);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  background: var(--color-surface-raised);
}

.ui-stat__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.ui-stat__label {
  color: var(--color-muted);
}

.ui-stat__icon {
  display: inline-flex;
  color: var(--color-signal-strong);
}

.ui-stat__value-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
}

.ui-stat__value {
  color: var(--color-ink);
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.ui-stat__unit {
  color: var(--color-muted);
  font-size: 0.8125rem;
}

.ui-stat__trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
}

.ui-stat__trend--positive {
  color: var(--color-success-ink);
}

.ui-stat__trend--negative {
  color: var(--color-danger);
}

.ui-stat__trend--neutral {
  color: var(--color-muted);
}
</style>
