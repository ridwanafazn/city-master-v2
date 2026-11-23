<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-2">
      <button
        v-for="item in EQUIPMENT_OPTIONS"
        :key="item"
        type="button"
        class="border-2 border-slate-900 px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase transition-all"
        :class="
          selected.includes(item)
            ? 'bg-slate-900 text-white shadow-none translate-x-[1px] translate-y-[1px]'
            : 'bg-white text-slate-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-100'
        "
        @click="toggle(item)"
      >
        {{ equipmentLabel(item) }}
      </button>
    </div>
    <p class="font-mono text-[10px] text-slate-500">
      {{ selected.length }} selected. Kosong berarti semua equipment dianggap tersedia.
    </p>
  </div>
</template>

<script setup lang="ts">
import { EQUIPMENT_OPTIONS, equipmentLabel } from '../../lib/profileOptions'

const selected = defineModel<string[]>({ required: true })

function toggle(value: string) {
  const index = selected.value.indexOf(value)
  if (index >= 0) {
    selected.value.splice(index, 1)
  } else {
    selected.value.push(value)
  }
}
</script>
