<script setup lang="ts">
import { computed } from 'vue'
import { Clock, LoaderCircle, ServerCog, WifiOff, X } from '@lucide/vue'
import AppButton from './AppButton.vue'
import IconButton from './IconButton.vue'

type WakeState = 'connecting' | 'waking' | 'offline'

const props = withDefaults(
  defineProps<{
    state?: WakeState
    elapsedSeconds?: number
    canRetry?: boolean
    retryLabel?: string
    dismissible?: boolean
  }>(),
  {
    state: 'connecting',
    elapsedSeconds: undefined,
    canRetry: false,
    retryLabel: 'Coba lagi',
    dismissible: false,
  },
)

const emit = defineEmits<{
  retry: []
  dismiss: []
}>()

const content = computed(() => {
  if (props.state === 'offline') {
    return {
      icon: WifiOff,
      title: 'Server belum merespons',
      description: 'Periksa koneksi Anda, lalu coba lagi. Data yang tersimpan tetap bisa dibuka.',
      role: 'alert',
    }
  }
  if (props.state === 'waking') {
    return {
      icon: ServerCog,
      title: 'Server sedang bangun',
      description:
        'Railway Free bisa membutuhkan 10–30 detik untuk bangun. Anda tidak perlu menutup halaman ini.',
      role: 'status',
    }
  }
  return {
    icon: LoaderCircle,
    title: 'Menghubungkan ke server…',
    description: 'Menyiapkan sesi dan data terakhir Anda.',
    role: 'status',
  }
})

const elapsedLabel = computed(() =>
  typeof props.elapsedSeconds === 'number' ? `Sudah menunggu ${props.elapsedSeconds} detik` : '',
)
</script>

<template>
  <div
    class="ui-wake"
    :class="`ui-wake--${state}`"
    :role="content.role"
    :aria-live="content.role === 'alert' ? 'assertive' : 'polite'"
    aria-atomic="true"
  >
    <component
      :is="content.icon"
      class="ui-wake__icon"
      :class="{ 'ui-wake__icon--spin': state === 'connecting' }"
      :size="20"
      aria-hidden="true"
    />
    <div class="ui-wake__copy">
      <p class="ui-wake__title">{{ content.title }}</p>
      <p class="ui-wake__description">{{ content.description }}</p>
      <p v-if="elapsedLabel" class="ui-wake__elapsed">
        <Clock :size="12" aria-hidden="true" />
        {{ elapsedLabel }}
      </p>
    </div>
    <div class="ui-wake__actions">
      <AppButton v-if="canRetry" variant="secondary" size="sm" @click="emit('retry')">
        {{ retryLabel }}
      </AppButton>
      <IconButton
        v-if="dismissible"
        label="Tutup pemberitahuan server"
        variant="ghost"
        @click="emit('dismiss')"
      >
        <X :size="18" />
      </IconButton>
    </div>
  </div>
</template>

<style scoped>
.ui-wake {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 12px 12px 14px;
  border: 1px solid #c7d8fb;
  border-radius: var(--radius-control);
  background: var(--color-surface-raised);
}

.ui-wake--waking {
  border-color: #f2d9b2;
  background: var(--color-warning-bg);
}

.ui-wake--offline {
  border-color: #f7d1cd;
  background: var(--color-danger-bg);
}

.ui-wake__icon {
  flex: 0 0 auto;
  margin-top: 1px;
  color: var(--color-data);
}

.ui-wake--waking .ui-wake__icon {
  color: var(--color-warning);
}

.ui-wake--offline .ui-wake__icon {
  color: var(--color-danger);
}

.ui-wake__icon--spin {
  animation: ui-wake-spin 1s linear infinite;
}

.ui-wake__copy {
  flex: 1 1 auto;
  min-width: 0;
}

.ui-wake__title {
  margin: 0;
  color: var(--color-ink);
  font-size: var(--text-small);
  font-weight: 650;
  line-height: 1.4;
}

.ui-wake__description {
  margin: 2px 0 0;
  color: var(--color-muted);
  font-size: 0.8125rem;
  line-height: 1.45;
}

.ui-wake__elapsed {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 6px 0 0;
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.75rem;
}

.ui-wake__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 0 0 auto;
}

@keyframes ui-wake-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 560px) {
  .ui-wake {
    flex-wrap: wrap;
  }

  .ui-wake__actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
