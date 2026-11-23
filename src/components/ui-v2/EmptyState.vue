<script setup lang="ts">
import { Inbox } from '@lucide/vue'

withDefaults(
  defineProps<{
    title: string
    description?: string
  }>(),
  {
    description: '',
  },
)
</script>

<template>
  <section class="ui-empty">
    <div class="ui-empty__icon" aria-hidden="true">
      <slot name="icon">
        <Inbox :size="24" />
      </slot>
    </div>
    <h3 class="ui-empty__title">{{ title }}</h3>
    <p v-if="description" class="ui-empty__description">{{ description }}</p>
    <div v-if="$slots.action" class="ui-empty__action">
      <slot name="action" />
    </div>
  </section>
</template>

<style scoped>
.ui-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: var(--space-6) var(--space-5);
  border: 1px dashed var(--color-line);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  text-align: center;
}

.ui-empty__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-bottom: 4px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  background: var(--color-surface-raised);
  color: var(--color-signal-strong);
}

.ui-empty__title {
  margin: 0;
  font-size: var(--text-h3);
  line-height: var(--leading-snug);
}

.ui-empty__description {
  max-width: 52ch;
  margin: 0;
  color: var(--color-muted);
  font-size: var(--text-small);
  line-height: var(--leading-relaxed);
}

.ui-empty__action {
  margin-top: var(--space-3);
}
</style>
