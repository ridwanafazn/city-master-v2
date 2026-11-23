<script setup lang="ts">
import { useId } from 'vue'
import { X } from '@lucide/vue'
import AppButton from './AppButton.vue'
import IconButton from './IconButton.vue'
import { useNativeDialog } from './useNativeDialog'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    tone?: 'default' | 'danger'
    loading?: boolean
    hideCancel?: boolean
  }>(),
  {
    description: '',
    confirmLabel: 'Konfirmasi',
    cancelLabel: 'Batal',
    tone: 'default',
    loading: false,
    hideCancel: false,
  },
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
}>()

const uid = useId()
const titleId = `${uid}-title`
const descriptionId = `${uid}-description`

function close() {
  emit('update:open', false)
}

const { dialogRef, handleCancel, handleBackdropClick } = useNativeDialog(
  () => props.open,
  close,
)
</script>

<template>
  <Teleport to="body">
    <dialog
      ref="dialogRef"
      class="ui-dialog"
      :aria-labelledby="titleId"
      :aria-describedby="description ? descriptionId : undefined"
      @cancel="handleCancel"
      @click="handleBackdropClick"
      @close="emit('update:open', false)"
    >
      <div class="ui-dialog__panel">
        <header class="ui-dialog__header">
          <h2 :id="titleId" class="ui-dialog__title">{{ title }}</h2>
          <IconButton label="Tutup" variant="ghost" @click="close">
            <X :size="18" />
          </IconButton>
        </header>

        <p v-if="description" :id="descriptionId" class="ui-dialog__description">
          {{ description }}
        </p>

        <div v-if="$slots.default" class="ui-dialog__body">
          <slot />
        </div>

        <footer class="ui-dialog__footer">
          <AppButton v-if="!hideCancel" variant="ghost" @click="close">
            {{ cancelLabel }}
          </AppButton>
          <AppButton
            :variant="tone === 'danger' ? 'danger' : 'primary'"
            :loading="loading"
            @click="emit('confirm')"
          >
            {{ confirmLabel }}
          </AppButton>
        </footer>
      </div>
    </dialog>
  </Teleport>
</template>

<style scoped>
.ui-dialog {
  width: min(480px, calc(100vw - 32px));
  max-width: none;
  max-height: calc(100dvh - 32px);
  margin: auto;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-ink);
  overflow: visible;
}

.ui-dialog::backdrop {
  background: rgba(20, 22, 15, 0.5);
}

.ui-dialog__panel {
  display: grid;
  gap: var(--space-4);
  max-height: calc(100dvh - 32px);
  padding: var(--space-5);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  background: var(--color-paper);
  box-shadow: var(--shadow-raised);
  overflow-y: auto;
}

.ui-dialog[open] .ui-dialog__panel {
  animation: ui-dialog-in var(--motion-base) var(--ease-entrance);
}

.ui-dialog__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.ui-dialog__title {
  margin: 0;
  font-size: var(--text-h3);
  line-height: var(--leading-snug);
}

.ui-dialog__description {
  margin: 0;
  color: var(--color-muted);
  font-size: var(--text-small);
  line-height: var(--leading-relaxed);
}

.ui-dialog__body {
  min-width: 0;
}

.ui-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding-top: var(--space-2);
}

@keyframes ui-dialog-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
