<script setup lang="ts">
import { computed } from 'vue'
import { useFieldIds } from './useFieldIds'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    label: string
    hint?: string
    error?: string
    placeholder?: string
    name?: string
    id?: string
    rows?: number
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
    rows: 4,
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
    <textarea
      :id="inputId"
      class="ui-v2-control ui-textarea"
      :value="modelValue"
      :name="name"
      :rows="rows"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="describedBy"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <p v-if="hint" :id="ids.hintId" class="ui-v2-hint">{{ hint }}</p>
    <p v-if="error" :id="ids.errorId" class="ui-v2-error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.ui-field {
  width: 100%;
}

.ui-textarea {
  min-height: 104px;
  resize: vertical;
}
</style>
