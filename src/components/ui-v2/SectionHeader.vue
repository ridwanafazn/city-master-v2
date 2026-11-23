<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    level?: 1 | 2 | 3
    align?: 'left' | 'between'
  }>(),
  {
    description: '',
    level: 2,
    align: 'between',
  },
)

const headingTag = computed(() => `h${props.level}`)
</script>

<template>
  <div class="ui-section-header" :class="`ui-section-header--${align}`">
    <div class="ui-section-header__copy">
      <component :is="headingTag" class="ui-section-header__title">{{ title }}</component>
      <p v-if="description" class="ui-section-header__description">{{ description }}</p>
    </div>
    <div v-if="$slots.action" class="ui-section-header__action">
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped>
.ui-section-header {
  display: flex;
  gap: var(--space-4);
  align-items: flex-end;
}

.ui-section-header--between {
  justify-content: space-between;
}

.ui-section-header--left {
  flex-direction: column;
  align-items: flex-start;
}

.ui-section-header__copy {
  min-width: 0;
}

.ui-section-header__title {
  margin: 0;
  font-size: var(--text-h2);
  color: var(--color-ink);
}

.ui-section-header__description {
  max-width: 65ch;
  margin-top: 8px;
  color: var(--color-muted);
  font-size: var(--text-body);
  line-height: var(--leading-relaxed);
}

.ui-section-header__action {
  flex: 0 0 auto;
}

@media (max-width: 640px) {
  .ui-section-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
