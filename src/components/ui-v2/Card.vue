<script setup lang="ts">
import { computed } from 'vue'

type CardVariant = 'default' | 'interactive' | 'elevated'
type CardPadding = 'none' | 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    variant?: CardVariant
    padding?: CardPadding
    tag?: string
  }>(),
  {
    variant: 'default',
    padding: 'md',
    tag: 'div',
  },
)

const classes = computed(() => [
  'ui-card',
  `ui-card--${props.variant}`,
  `ui-card--pad-${props.padding}`,
])
</script>

<template>
  <component :is="tag" :class="classes">
    <header v-if="$slots.header" class="ui-card__header">
      <slot name="header" />
    </header>
    <div class="ui-card__body">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="ui-card__footer">
      <slot name="footer" />
    </footer>
  </component>
</template>

<style scoped>
.ui-card {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  color: var(--color-ink);
  overflow: hidden;
}

.ui-card--interactive {
  transition:
    border-color var(--motion-fast) var(--ease-exit),
    transform var(--motion-fast) var(--ease-exit);
}

.ui-card--interactive:hover {
  border-color: #b9c0ae;
  transform: translateY(-2px);
}

.ui-card--elevated {
  border-color: var(--color-line);
  box-shadow: var(--shadow-raised);
}

.ui-card--pad-none .ui-card__body {
  padding: 0;
}

.ui-card--pad-sm .ui-card__body {
  padding: var(--space-3);
}

.ui-card--pad-md .ui-card__body {
  padding: var(--space-5);
}

.ui-card--pad-lg .ui-card__body {
  padding: var(--space-6);
}

.ui-card__header {
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-line);
  background: var(--color-surface);
}

.ui-card__footer {
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--color-line);
  background: var(--color-surface);
}

@media (max-width: 640px) {
  .ui-card--pad-lg .ui-card__body {
    padding: var(--space-5);
  }
}
</style>
