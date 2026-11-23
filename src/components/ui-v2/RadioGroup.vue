<script setup lang="ts">
import { computed, useId } from 'vue'
import type { UiOption } from './types'
import { useFieldIds } from './useFieldIds'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    label: string
    options: UiOption[]
    hint?: string
    error?: string
    name?: string
    orientation?: 'vertical' | 'horizontal'
  }>(),
  {
    modelValue: '',
    hint: '',
    error: '',
    name: undefined,
    orientation: 'vertical',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const groupName = useId()
const ids = useFieldIds()
const describedBy = computed(
  () =>
    [props.hint ? ids.hintId : '', props.error ? ids.errorId : ''].filter(Boolean).join(' ') ||
    undefined,
)
</script>

<template>
  <fieldset class="ui-radio-group" :aria-describedby="describedBy">
    <legend class="ui-v2-label">{{ label }}</legend>
    <div class="ui-radio-group__options" :class="`ui-radio-group__options--${orientation}`">
      <label v-for="option in options" :key="option.value" class="ui-radio">
        <input
          class="ui-radio__input"
          type="radio"
          :name="name || groupName"
          :value="option.value"
          :checked="modelValue === option.value"
          :disabled="option.disabled"
          @change="emit('update:modelValue', option.value)"
        />
        <span class="ui-radio__circle" aria-hidden="true" />
        <span class="ui-radio__copy">
          <span class="ui-radio__label">{{ option.label }}</span>
          <span v-if="option.description" class="ui-radio__description">
            {{ option.description }}
          </span>
        </span>
      </label>
    </div>
    <p v-if="hint" :id="ids.hintId" class="ui-v2-hint">{{ hint }}</p>
    <p v-if="error" :id="ids.errorId" class="ui-v2-error" role="alert">{{ error }}</p>
  </fieldset>
</template>

<style scoped>
.ui-radio-group {
  margin: 0;
  padding: 0;
  border: 0;
}

.ui-radio-group__options {
  display: flex;
  gap: 4px;
}

.ui-radio-group__options--vertical {
  flex-direction: column;
}

.ui-radio-group__options--horizontal {
  flex-wrap: wrap;
  gap: 8px 24px;
}

.ui-radio {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-height: var(--touch-target);
  padding: 9px 0;
  cursor: pointer;
}

.ui-radio__input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.ui-radio__circle {
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
  margin-top: 2px;
  border: 1px solid var(--color-line);
  border-radius: 50%;
  background: var(--color-surface-raised);
  transition:
    border-color var(--motion-fast) var(--ease-exit),
    box-shadow var(--motion-fast) var(--ease-exit);
}

.ui-radio__input:checked + .ui-radio__circle {
  border: 6px solid var(--color-signal-strong);
}

.ui-radio__input:focus-visible + .ui-radio__circle {
  outline: 2px solid var(--color-signal-strong);
  outline-offset: 2px;
}

.ui-radio__input:disabled + .ui-radio__circle {
  background: var(--color-surface);
  opacity: 0.6;
}

.ui-radio__input:disabled ~ .ui-radio__copy {
  opacity: 0.6;
}

.ui-radio__copy {
  display: grid;
  gap: 2px;
}

.ui-radio__label {
  color: var(--color-ink);
  font-size: var(--text-body);
  font-weight: 600;
  line-height: 1.4;
}

.ui-radio__description {
  color: var(--color-muted);
  font-size: var(--text-small);
  line-height: 1.45;
}
</style>
