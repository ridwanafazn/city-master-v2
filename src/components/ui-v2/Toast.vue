<script setup lang="ts">
import { computed } from 'vue'
import { CircleAlert, CircleCheck, Info, WifiOff, X } from '@lucide/vue'
import IconButton from './IconButton.vue'

type ToastVariant = 'success' | 'error' | 'info' | 'offline'

const props = withDefaults(
  defineProps<{
    title: string
    message?: string
    variant?: ToastVariant
    dismissible?: boolean
  }>(),
  {
    message: '',
    variant: 'info',
    dismissible: true,
  },
)

const emit = defineEmits<{
  dismiss: []
}>()

const icon = computed(() => {
  if (props.variant === 'success') return CircleCheck
  if (props.variant === 'error') return CircleAlert
  if (props.variant === 'offline') return WifiOff
  return Info
})

const role = computed(() => (props.variant === 'error' || props.variant === 'offline' ? 'alert' : 'status'))
</script>

<template>
  <div
    class="ui-toast"
    :class="`ui-toast--${variant}`"
    :role="role"
    :aria-live="role === 'alert' ? 'assertive' : 'polite'"
    aria-atomic="true"
  >
    <component :is="icon" class="ui-toast__icon" :size="20" aria-hidden="true" />
    <div class="ui-toast__copy">
      <p class="ui-toast__title">{{ title }}</p>
      <p v-if="message" class="ui-toast__message">{{ message }}</p>
    </div>
    <div v-if="$slots.action" class="ui-toast__action">
      <slot name="action" />
    </div>
    <IconButton v-if="dismissible" label="Tutup notifikasi" variant="ghost" @click="emit('dismiss')">
      <X :size="18" />
    </IconButton>
  </div>
</template>

<style scoped>
.ui-toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 12px 12px 12px 14px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  background: var(--color-surface-raised);
  box-shadow: var(--shadow-raised);
}

.ui-toast__icon {
  flex: 0 0 auto;
  margin-top: 1px;
}

.ui-toast__copy {
  flex: 1 1 auto;
  min-width: 0;
}

.ui-toast__title {
  margin: 0;
  color: var(--color-ink);
  font-size: var(--text-small);
  font-weight: 650;
  line-height: 1.4;
}

.ui-toast__message {
  margin: 2px 0 0;
  color: var(--color-muted);
  font-size: 0.8125rem;
  line-height: 1.45;
}

.ui-toast__action {
  flex: 0 0 auto;
  align-self: center;
}

.ui-toast--success {
  border-color: #cfe6bf;
}

.ui-toast--success .ui-toast__icon {
  color: var(--color-success-ink);
}

.ui-toast--error {
  border-color: #f7d1cd;
}

.ui-toast--error .ui-toast__icon {
  color: var(--color-danger);
}

.ui-toast--info {
  border-color: #c7d8fb;
}

.ui-toast--info .ui-toast__icon {
  color: var(--color-data);
}

.ui-toast--offline {
  border-color: #f2d9b2;
}

.ui-toast--offline .ui-toast__icon {
  color: var(--color-warning);
}
</style>
