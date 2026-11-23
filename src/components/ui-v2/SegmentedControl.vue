<script setup lang="ts">
import { useId } from 'vue'
import type { UiOption } from './types'

defineProps<{
  modelValue: string
  label: string
  options: UiOption[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const groupName = useId()
</script>

<template>
  <fieldset class="ui-segmented">
    <legend class="ui-segmented__legend">{{ label }}</legend>
    <div class="ui-segmented__track">
      <label v-for="option in options" :key="option.value" class="ui-segmented__item">
        <input
          class="ui-segmented__input"
          type="radio"
          :name="groupName"
          :value="option.value"
          :checked="modelValue === option.value"
          :disabled="option.disabled"
          @change="emit('update:modelValue', option.value)"
        />
        <span class="ui-segmented__label">{{ option.label }}</span>
      </label>
    </div>
  </fieldset>
</template>

<style scoped>
.ui-segmented {
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
}

.ui-segmented__legend {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.ui-segmented__track {
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
}

.ui-segmented__item {
  position: relative;
  display: inline-flex;
  min-height: var(--touch-target);
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: var(--radius-pill);
  color: var(--color-muted);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  transition:
    background-color var(--motion-fast) var(--ease-exit),
    color var(--motion-fast) var(--ease-exit);
}

.ui-segmented__item:hover {
  color: var(--color-ink);
}

.ui-segmented__input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.ui-segmented__input:checked + .ui-segmented__label {
  background: var(--color-ink);
  color: var(--color-paper);
}

.ui-segmented__label {
  display: inline-flex;
  min-height: var(--touch-target);
  align-items: center;
  padding: 0 14px;
  margin: 0;
  border-radius: var(--radius-pill);
  transition:
    background-color var(--motion-fast) var(--ease-exit),
    color var(--motion-fast) var(--ease-exit);
}

.ui-segmented__input:focus-visible + .ui-segmented__label {
  outline: 2px solid var(--color-signal-strong);
  outline-offset: 2px;
}

.ui-segmented__input:disabled + .ui-segmented__label {
  cursor: not-allowed;
  opacity: 0.5;
}

@media (max-width: 420px) {
  .ui-segmented__item {
    font-size: 0.8125rem;
  }

  .ui-segmented__label {
    padding: 0 10px;
  }
}
</style>
