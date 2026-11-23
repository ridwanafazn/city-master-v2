<template>
  <PixelCard title="Report Unsafe Exercise">
    <div class="space-y-3">
      <div>
        <label class="pixel-label">Exercise</label>
        <select v-model="selectedId" class="pixel-input text-xs">
          <option v-for="exercise in exercises" :key="exercise.id" :value="exercise.id">
            {{ exercise.label }}
          </option>
        </select>
      </div>

      <div>
        <label class="pixel-label">Severity</label>
        <select v-model="severity" class="pixel-input text-xs">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div>
        <label class="pixel-label">Reason</label>
        <textarea
          v-model.trim="reason"
          class="pixel-input min-h-[80px] text-xs"
          maxlength="2000"
          placeholder="Describe the unsafe movement or pain"
        />
      </div>

      <div
        v-if="feedbackStore.error"
        class="border-3 border-red-700 bg-red-50 p-2 font-mono text-xs text-red-800"
      >
        {{ feedbackStore.error }}
      </div>
      <div
        v-else-if="sent"
        class="border-3 border-green-700 bg-green-50 p-2 font-mono text-xs text-green-900"
      >
        Safety report terkirim. Tim akan meninjau.
      </div>

      <div class="flex justify-end">
        <PixelButton
          variant="danger"
          :disabled="feedbackStore.submitting || reason.length < 5 || !selected"
          @click="submit"
        >
          {{ feedbackStore.submitting ? 'Sending…' : 'Send Safety Report' }}
        </PixelButton>
      </div>
    </div>
  </PixelCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import PixelButton from '../ui/PixelButton.vue'
import PixelCard from '../ui/PixelCard.vue'
import { useFeedbackStore } from '../../stores/feedbackStore'
import type { SafetyExercise, SafetySeverity } from '../../types/feedback'

const props = defineProps<{
  planId?: string | null
  workoutId?: string | null
  exercises: SafetyExercise[]
}>()

const feedbackStore = useFeedbackStore()
const selectedId = ref(props.exercises[0]?.id ?? '')
const severity = ref<SafetySeverity>('medium')
const reason = ref('')
const sent = ref(false)

const selected = computed(
  () => props.exercises.find((item) => item.id === selectedId.value) ?? null,
)

watch(
  () => props.exercises,
  (items) => {
    if (!items.some((item) => item.id === selectedId.value)) {
      selectedId.value = items[0]?.id ?? ''
    }
  },
  { deep: true },
)

async function submit() {
  if (!selected.value) return
  sent.value = false
  const ok = await feedbackStore.submitSafetyReport({
    plan_id: props.planId ?? undefined,
    workout_session_id: props.workoutId ?? undefined,
    plan_exercise_id: selected.value.planExerciseId,
    exercise_id: selected.value.exerciseId,
    reason: reason.value,
    severity: severity.value,
  })
  if (ok) {
    sent.value = true
    reason.value = ''
  }
}
</script>
