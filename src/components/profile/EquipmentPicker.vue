<template>
  <div class="equipment-picker">
    <div class="chip-grid" role="group" aria-label="Equipment tersedia">
      <Chip
        v-for="item in EQUIPMENT_OPTIONS"
        :key="item"
        :selected="selected.includes(item)"
        :disabled="Boolean(max) && !selected.includes(item) && selected.length >= max"
        @toggle="toggle(item)"
      >
        {{ equipmentLabel(item) }}
      </Chip>
    </div>
    <p class="picker-hint">
      {{ selected.length }}<span v-if="max"> / {{ max }}</span> dipilih.
      Kosong berarti semua equipment dianggap tersedia.
    </p>
  </div>
</template>

<script setup lang="ts">
import Chip from '../ui-v2/Chip.vue'
import { EQUIPMENT_OPTIONS, equipmentLabel } from '../../lib/profileOptions'

const props = withDefaults(
  defineProps<{
    max?: number
  }>(),
  {
    max: 0,
  },
)

const selected = defineModel<string[]>({ required: true })

function toggle(value: string) {
  const index = selected.value.indexOf(value)
  if (index >= 0) {
    selected.value.splice(index, 1)
    return
  }
  if (props.max > 0 && selected.value.length >= props.max) return
  selected.value.push(value)
}
</script>

<style scoped>
.equipment-picker {
  display: grid;
  gap: 10px;
}

.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.picker-hint {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.75rem;
  line-height: 1.45;
}
</style>
