<script setup lang="ts">
import { computed } from 'vue'
import { Check } from '@lucide/vue'
import { useFieldIds } from './useFieldIds'

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    label: string
    description?: string
    error?: string
    name?: string
    id?: string
    disabled?: boolean
  }>(),
  {
    modelValue: false,
    description: '',
    error: '',
    name: undefined,
    id: undefined,
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const ids = useFieldIds()
const inputId = computed(() => props.id || ids.inputId)
const describedBy = computed(() =>
  [props.description ? ids.hintId : '', props.error ? ids.errorId : ''].filter(Boolean).join(' ') ||
  undefined,
)
</script>

<template>
  <div class="ui-checkbox-field">
    <label class="ui-checkbox" :for="inputId">
      <input
        :id="inputId"
        class="ui-checkbox__input"
        type="checkbox"
        :name="name"
        :checked="modelValue"
        :disabled="disabled"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      />
      <span class="ui-checkbox__box" aria-hidden="true">
        <Check v-if="modelValue" :size="14" :stroke-width="3" />
      </span>
      <span class="ui-checkbox__copy">
        <span class="ui-checkbox__label">{{ label }}</span>
        <span v-if="description" :id="ids.hintId" class="ui-checkbox__description">
          {{ description }}
        </span>
      </span>
    </label>
    <p v-if="error" :id="ids.errorId" class="ui-v2-error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.ui-checkbox-field {
  width: 100%;
}

.ui-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-height: var(--touch-target);
  padding: 10px 0;
  cursor: pointer;
}

.ui-checkbox__input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.ui-checkbox__box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  margin-top: 1px;
  border: 1px solid var(--color-line);
  border-radius: 6px;
  background: var(--color-surface-raised);
  color: #ffffff;
  transition:
    background-color var(--motion-fast) var(--ease-exit),
    border-color var(--motion-fast) var(--ease-exit);
}

.ui-checkbox__input:checked + .ui-checkbox__box {
  background: var(--color-signal-strong);
  border-color: var(--color-signal-strong);
}

.ui-checkbox__input:focus-visible + .ui-checkbox__box {
  outline: 2px solid var(--color-signal-strong);
  outline-offset: 2px;
}

.ui-checkbox__input:disabled + .ui-checkbox__box {
  background: var(--color-surface);
  border-color: var(--color-line);
}

.ui-checkbox__input:disabled ~ .ui-checkbox__copy {
  opacity: 0.6;
}

.ui-checkbox__copy {
  display: grid;
  gap: 2px;
}

.ui-checkbox__label {
  color: var(--color-ink);
  font-size: var(--text-body);
  font-weight: 600;
  line-height: 1.4;
}

.ui-checkbox__description {
  color: var(--color-muted);
  font-size: var(--text-small);
  line-height: 1.45;
}
</style>
