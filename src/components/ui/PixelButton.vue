<template>
  <button 
    :type="type"
    :disabled="disabled"
    :class="[
      'font-mono uppercase font-black tracking-wide border-3 border-slate-900 transition-all duration-75',
      'active:translate-x-1 active:translate-y-1 active:shadow-none',
      disabled ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : shadowClass,
      variantClasses
    ]"
    @click="$emit('click')"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String as () => 'button' | 'submit' | 'reset',
    default: 'button'
  },
  variant: {
    type: String as () => 'primary' | 'secondary' | 'danger',
    default: 'primary'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

// Hard shadow khas Pixel UI / Neo-Brutalism
const shadowClass = 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-blue-500 text-white hover:bg-blue-400'
    case 'secondary':
      return 'bg-white text-slate-900 hover:bg-slate-100'
    case 'danger':
      return 'bg-red-500 text-white hover:bg-red-400'
    default:
      return 'bg-white text-slate-900'
  }
})
</script>