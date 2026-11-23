<script setup lang="ts">
import { computed } from 'vue'
import { useFieldIds } from './useFieldIds'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    label: string
    hint?: string
    error?: string
    type?: string
    placeholder?: string
    autocomplete?: string
    inputmode?: 'text' | 'numeric' | 'decimal' | 'email' | 'tel' | 'url' | 'search' | 'none'
    name?: string
    id?: string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    min?: string | number
    max?: string | number
    step?: string | number
  }>(),
  {
    modelValue: '',
    hint: '',
    error: '',
    type: 'text',
    placeholder: '',
    autocomplete: undefined,
    inputmode: undefined,
    name: undefined,
    id: undefined,
    required: false,
    disabled: false,
    readonly: false,
    min: undefined,
    max: undefined,
    step: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
}>()

const ids = useFieldIds()
const inputId = computed(() => props.id || ids.inputId)
const describedBy = computed(() =>
  [props.hint ? ids.hintId : '', props.error ? ids.errorId : ''].filter(Boolean).join(' ') ||
  undefined,
)

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="ui-field">
    <label class="ui-v2-label" :for="inputId">
      {{ label }}<span v-if="required" class="ui-v2-required" aria-hidden="true">*</span>
    </label>
    <input
      :id="inputId"
      class="ui-v2-control"
      :class="{ 'ui-input--numeric': type === 'number' }"
      :type="type"
      :value="modelValue"
      :name="name"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :inputmode="inputmode"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :min="min"
      :max="max"
      :step="step"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="describedBy"
      @input="onInput"
      @blur="emit('blur', $event)"
    />
    <p v-if="hint" :id="ids.hintId" class="ui-v2-hint">{{ hint }}</p>
    <p v-if="error" :id="ids.errorId" class="ui-v2-error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.ui-field {
  width: 100%;
}

.ui-input--numeric {
  font-family: var(--font-data);
  font-variant-numeric: tabular-nums;
}
</style>
