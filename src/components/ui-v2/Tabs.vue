<script setup lang="ts">
import { nextTick, useId, type ComponentPublicInstance } from 'vue'
import type { TabItem } from './types'

const props = defineProps<{
  modelValue: string
  tabs: TabItem[]
  label: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const uid = useId()
const tabRefs = new Map<string, HTMLButtonElement>()

function setTabRef(id: string, element: Element | ComponentPublicInstance | null) {
  if (element instanceof HTMLButtonElement) tabRefs.set(id, element)
  else tabRefs.delete(id)
}

async function onKeydown(event: KeyboardEvent, index: number) {
  const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End']
  if (!keys.includes(event.key)) return
  event.preventDefault()

  let nextIndex = index
  if (event.key === 'Home') nextIndex = 0
  else if (event.key === 'End') nextIndex = props.tabs.length - 1
  else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    nextIndex = (index + 1) % props.tabs.length
  } else {
    nextIndex = (index - 1 + props.tabs.length) % props.tabs.length
  }

  const next = props.tabs[nextIndex]
  if (!next) return
  emit('update:modelValue', next.id)
  await nextTick()
  tabRefs.get(next.id)?.focus()
}
</script>

<template>
  <div class="ui-tabs">
    <div class="ui-tabs__list" role="tablist" :aria-label="label">
      <button
        v-for="(tab, index) in tabs"
        :id="`${uid}-tab-${tab.id}`"
        :key="tab.id"
        :ref="(element) => setTabRef(tab.id, element)"
        type="button"
        role="tab"
        class="ui-tabs__tab"
        :class="{ 'ui-tabs__tab--active': modelValue === tab.id }"
        :aria-selected="modelValue === tab.id"
        :aria-controls="`${uid}-panel`"
        :tabindex="modelValue === tab.id ? 0 : -1"
        @click="emit('update:modelValue', tab.id)"
        @keydown="onKeydown($event, index)"
      >
        {{ tab.label }}
        <span v-if="typeof tab.count === 'number'" class="ui-tabs__count">{{ tab.count }}</span>
      </button>
    </div>
    <div
      :id="`${uid}-panel`"
      class="ui-tabs__panel"
      role="tabpanel"
      :aria-labelledby="`${uid}-tab-${modelValue}`"
      tabindex="0"
    >
      <slot :active="modelValue" />
    </div>
  </div>
</template>

<style scoped>
.ui-tabs {
  display: grid;
  gap: var(--space-4);
}

.ui-tabs__list {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  border-bottom: 1px solid var(--color-line);
  scrollbar-width: thin;
}

.ui-tabs__tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: var(--touch-target);
  padding: 0 12px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--color-muted);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.9375rem;
  font-weight: 600;
  white-space: nowrap;
  transition:
    color var(--motion-fast) var(--ease-exit),
    border-color var(--motion-fast) var(--ease-exit);
}

.ui-tabs__tab:hover {
  color: var(--color-ink);
}

.ui-tabs__tab--active {
  border-bottom-color: var(--color-signal-strong);
  color: var(--color-ink);
}

.ui-tabs__tab:focus-visible {
  outline: 2px solid var(--color-signal-strong);
  outline-offset: -2px;
}

.ui-tabs__count {
  display: inline-flex;
  min-width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
  font-weight: 600;
}

.ui-tabs__tab--active .ui-tabs__count {
  background: var(--color-signal-strong);
  color: var(--color-signal-ink);
}

.ui-tabs__panel:focus-visible {
  outline: 2px solid var(--color-signal-strong);
  outline-offset: 2px;
}
</style>
