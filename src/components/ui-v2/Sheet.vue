<script setup lang="ts">
import { useId } from 'vue'
import { X } from '@lucide/vue'
import IconButton from './IconButton.vue'
import { useNativeDialog } from './useNativeDialog'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    description?: string
  }>(),
  {
    description: '',
  },
)

const emit = defineEmits<{
  'update:open': [value: boolean]
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
      class="ui-sheet"
      :aria-labelledby="titleId"
      :aria-describedby="description ? descriptionId : undefined"
      @cancel="handleCancel"
      @click="handleBackdropClick"
      @close="emit('update:open', false)"
    >
      <div class="ui-sheet__panel">
        <div class="ui-sheet__handle" aria-hidden="true" />
        <header class="ui-sheet__header">
          <div>
            <h2 :id="titleId" class="ui-sheet__title">{{ title }}</h2>
            <p v-if="description" :id="descriptionId" class="ui-sheet__description">
              {{ description }}
            </p>
          </div>
          <IconButton label="Tutup" variant="ghost" @click="close">
            <X :size="18" />
          </IconButton>
        </header>

        <div v-if="$slots.default" class="ui-sheet__body">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="ui-sheet__footer">
          <slot name="footer" />
        </footer>
      </div>
    </dialog>
  </Teleport>
</template>

<style scoped>
.ui-sheet {
  display: none;
  width: 100vw;
  max-width: none;
  height: 100dvh;
  max-height: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-ink);
}

.ui-sheet[open] {
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.ui-sheet::backdrop {
  background: rgba(20, 22, 15, 0.5);
}

.ui-sheet__panel {
  width: 100%;
  max-width: 560px;
  max-height: 90dvh;
  padding: var(--space-3) var(--space-5)
    calc(var(--space-5) + env(safe-area-inset-bottom, 0px));
  border: 1px solid var(--color-line);
  border-bottom: 0;
  border-radius: 16px 16px 0 0;
  background: var(--color-paper);
  box-shadow: var(--shadow-raised);
  overflow-y: auto;
}

.ui-sheet[open] .ui-sheet__panel {
  animation: ui-sheet-in var(--motion-base) var(--ease-entrance);
}

.ui-sheet__handle {
  width: 40px;
  height: 4px;
  margin: 4px auto var(--space-3);
  border-radius: var(--radius-pill);
  background: var(--color-line);
}

.ui-sheet__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.ui-sheet__title {
  margin: 0;
  font-size: var(--text-h3);
  line-height: var(--leading-snug);
}

.ui-sheet__description {
  margin: 6px 0 0;
  color: var(--color-muted);
  font-size: var(--text-small);
  line-height: var(--leading-relaxed);
}

.ui-sheet__body {
  min-width: 0;
  padding-top: var(--space-4);
}

.ui-sheet__footer {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-top: var(--space-4);
}

@media (min-width: 641px) {
  .ui-sheet__panel {
    margin-bottom: 24px;
    border-bottom: 1px solid var(--color-line);
    border-radius: var(--radius-card);
  }
}

@keyframes ui-sheet-in {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
