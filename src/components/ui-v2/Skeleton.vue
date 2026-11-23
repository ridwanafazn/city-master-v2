<script setup lang="ts">
import { computed } from 'vue'

type SkeletonRadius = 'sm' | 'control' | 'card' | 'pill' | 'full'

const props = withDefaults(
  defineProps<{
    width?: string
    height?: string
    radius?: SkeletonRadius
    lines?: number
  }>(),
  {
    width: '100%',
    height: '1rem',
    radius: 'sm',
    lines: 1,
  },
)

const lineCount = computed(() => Math.max(1, props.lines))
</script>

<template>
  <div class="ui-skeleton" :class="`ui-skeleton--${radius}`" aria-hidden="true">
    <span
      v-for="line in lineCount"
      :key="line"
      class="ui-skeleton__line"
      :style="{
        width: line === lineCount && lineCount > 1 ? '78%' : width,
        height,
      }"
    />
  </div>
</template>

<style scoped>
.ui-skeleton {
  display: grid;
  gap: 8px;
  width: 100%;
}

.ui-skeleton__line {
  display: block;
  max-width: 100%;
  background: var(--color-surface);
  animation: ui-skeleton-pulse 1.6s var(--ease-entrance) infinite;
}

.ui-skeleton--sm {
  border-radius: 4px;
}

.ui-skeleton--control {
  border-radius: var(--radius-control);
}

.ui-skeleton--card {
  border-radius: var(--radius-card);
}

.ui-skeleton--pill {
  border-radius: var(--radius-pill);
}

.ui-skeleton--full {
  border-radius: var(--radius-pill);
}

@keyframes ui-skeleton-pulse {
  0%,
  100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
}
</style>
