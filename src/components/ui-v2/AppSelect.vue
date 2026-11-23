<script setup lang="ts">
import { computed } from 'vue'
import { ChevronDown } from '@lucide/vue'
import { useFieldIds } from './useFieldIds'
import type { UiOption } from './types'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    label: string
    options: UiOption[]
    hint?: string
    error?: string
    placeholder?: string
    name?: string
    id?: string
    required?: boolean
    disabled?: boolean
  }>(),
  {
    modelValue: '',
    hint: '',
    error: '',
    placeholder: '',
    name: undefined,
    id: undefined,
    required: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const ids = useFieldIds()
const inputId = computed(() => props.id || ids.inputId)
const describedBy = computed(() =>
  [props.hint ? ids.hintId : '', props.error ? ids.errorId : ''].filter(Boolean).join(' ') ||
  undefined,
)
</script>

<template>
  <div class="ui-field">
    <label class="ui-v2-label" :for="inputId">
      {{ label }}<span v-if="required" class="ui-v2-required" aria-hidden="true">*</span>
    </label>
    <div class="ui-select">
      <select
        :id="inputId"
        class="ui-v2-control ui-select__control"
        :value="modelValue"
        :name="name"
        :required="required"
        :disabled="disabled"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>
      <ChevronDown class="ui-select__icon" :size="18" aria-hidden="true" />
    </div>
    <p v-if="hint" :id="ids.hintId" class="ui-v2-hint">{{ hint }}</p>
    <p v-if="error" :id="ids.errorId" class="ui-v2-error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.ui-field {
  width: 100%;
}

.ui-select {
  position: relative;
}

.ui-select__control {
  appearance: none;
  padding-right: 40px;
  cursor: pointer;
}

.ui-select__icon {
  position: absolute;
  top: 50%;
  right: 12px;
  color: var(--color-muted);
  pointer-events: none;
  transform: translateY(-50%);
}
</style>
