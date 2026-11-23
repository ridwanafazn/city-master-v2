<script setup lang="ts">
import { computed } from 'vue'
import type { DailyMetric } from '../../types/progress'

const props = withDefaults(
  defineProps<{
    days: DailyMetric[]
  }>(),
  {
    days: () => [],
  },
)

const WIDTH = 720
const HEIGHT = 220
const PAD = { top: 18, right: 10, bottom: 28, left: 44 }

const maxVolume = computed(() =>
  Math.max(1, ...props.days.map((day) => day.total_volume_kg)),
)

const plotWidth = WIDTH - PAD.left - PAD.right
const plotHeight = HEIGHT - PAD.top - PAD.bottom
const step = computed(() => (props.days.length > 1 ? plotWidth / (props.days.length - 1) : plotWidth))
const barWidth = computed(() =>
  Math.max(1.5, Math.min(18, (plotWidth / Math.max(1, props.days.length)) * 0.62)),
)

function barX(index: number): number {
  if (props.days.length <= 1) return PAD.left + plotWidth / 2 - barWidth.value / 2
  return PAD.left + index * step.value - barWidth.value / 2
}

function barY(value: number): number {
  return PAD.top + plotHeight - (value / maxVolume.value) * plotHeight
}

function barHeight(value: number): number {
  return Math.max(value > 0 ? 2 : 0, (value / maxVolume.value) * plotHeight)
}

function shortDate(value: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${value}T00:00:00`))
}

const firstDate = computed(() => props.days[0]?.date ?? '')
const lastDate = computed(() => props.days.at(-1)?.date ?? '')
const summary = computed(() => {
  if (!props.days.length) return 'Belum ada data volume.'
  return `Volume harian ${shortDate(firstDate.value)} sampai ${shortDate(lastDate.value)}. Puncak ${new Intl.NumberFormat('id-ID').format(maxVolume.value)} kilogram.`
})
</script>

<template>
  <div v-if="days.length" class="volume-chart">
    <svg
      :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
      role="img"
      :aria-label="summary"
      preserveAspectRatio="none"
    >
      <title>{{ summary }}</title>
      <line
        :x1="PAD.left"
        :x2="WIDTH - PAD.right"
        :y1="PAD.top + plotHeight"
        :y2="PAD.top + plotHeight"
        stroke="var(--color-ink)"
        stroke-width="1"
      />
      <line
        :x1="PAD.left"
        :x2="WIDTH - PAD.right"
        :y1="PAD.top + plotHeight / 2"
        :y2="PAD.top + plotHeight / 2"
        stroke="var(--color-line)"
        stroke-width="1"
        stroke-dasharray="3 4"
      />
      <text
        :x="PAD.left - 8"
        :y="PAD.top + 4"
        text-anchor="end"
        class="volume-chart__axis"
      >
        {{ new Intl.NumberFormat('id-ID').format(maxVolume) }}
      </text>
      <text
        :x="PAD.left - 8"
        :y="PAD.top + plotHeight"
        text-anchor="end"
        class="volume-chart__axis"
      >
        0
      </text>

      <g v-for="(day, index) in days" :key="day.date">
        <rect
          :x="barX(index)"
          :y="barY(day.total_volume_kg)"
          :width="barWidth"
          :height="barHeight(day.total_volume_kg)"
          fill="var(--color-data)"
          rx="1"
        >
          <title>{{ shortDate(day.date) }}: {{ day.total_volume_kg }} kg</title>
        </rect>
      </g>

      <text :x="PAD.left" :y="HEIGHT - 6" text-anchor="start" class="volume-chart__axis">
        {{ shortDate(firstDate) }}
      </text>
      <text :x="WIDTH - PAD.right" :y="HEIGHT - 6" text-anchor="end" class="volume-chart__axis">
        {{ shortDate(lastDate) }}
      </text>
    </svg>
    <p class="volume-chart__summary">{{ summary }}</p>
  </div>
  <p v-else class="volume-chart__empty">Belum ada data volume pada rentang ini.</p>
</template>

<style scoped>
.volume-chart {
  width: 100%;
}

.volume-chart svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.volume-chart__axis {
  fill: var(--color-muted);
  font-family: var(--font-data);
  font-size: 10px;
}

.volume-chart__summary {
  margin: 8px 0 0;
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
  line-height: 1.45;
}

.volume-chart__empty {
  display: grid;
  min-height: 180px;
  margin: 0;
  place-items: center;
  border: 1px dashed var(--color-line);
  border-radius: var(--radius-control);
  color: var(--color-muted);
  font-size: 0.8125rem;
}
</style>
