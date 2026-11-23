<script setup lang="ts">
import { RefreshCw, TriangleAlert } from '@lucide/vue'
import AppButton from './AppButton.vue'

withDefaults(
  defineProps<{
    title?: string
    message: string
    requestId?: string
    retryLabel?: string
    compact?: boolean
  }>(),
  {
    title: 'Terjadi kesalahan',
    requestId: '',
    retryLabel: 'Coba lagi',
    compact: false,
  },
)

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <section class="ui-error" :class="{ 'ui-error--compact': compact }" role="alert">
    <div class="ui-error__icon" aria-hidden="true">
      <TriangleAlert :size="22" />
    </div>
    <div class="ui-error__copy">
      <h3 class="ui-error__title">{{ title }}</h3>
      <p class="ui-error__message">{{ message }}</p>
      <p v-if="requestId" class="ui-error__request">
        Request ID: <code>{{ requestId }}</code>
      </p>
    </div>
    <div class="ui-error__action">
      <AppButton variant="secondary" @click="emit('retry')">
        <RefreshCw :size="16" aria-hidden="true" />
        {{ retryLabel }}
      </AppButton>
    </div>
  </section>
</template>

<style scoped>
.ui-error {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-5);
  border: 1px solid #f0c9c4;
  border-radius: var(--radius-card);
  background: var(--color-danger-bg);
}

.ui-error--compact {
  padding: var(--space-4);
}

.ui-error__icon {
  display: inline-flex;
  flex: 0 0 auto;
  color: var(--color-danger);
}

.ui-error__copy {
  flex: 1 1 auto;
  min-width: 0;
}

.ui-error__title {
  margin: 0;
  color: var(--color-ink);
  font-size: var(--text-h3);
  line-height: var(--leading-snug);
}

.ui-error__message {
  margin: 4px 0 0;
  color: var(--color-ink);
  font-size: var(--text-small);
  line-height: var(--leading-relaxed);
}

.ui-error__request {
  margin: 8px 0 0;
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.75rem;
  overflow-wrap: anywhere;
}

.ui-error__request code {
  color: var(--color-ink);
}

.ui-error__action {
  flex: 0 0 auto;
  align-self: center;
}

@media (max-width: 640px) {
  .ui-error {
    flex-wrap: wrap;
  }

  .ui-error__action {
    width: 100%;
    padding-left: 38px;
  }
}
</style>
