<template>
  <section class="feedback-form" aria-labelledby="safety-title">
    <h3 id="safety-title">Laporkan exercise tidak aman</h3>

    <AppSelect v-model="selectedId" label="Exercise" :options="exerciseOptions" />
    <AppSelect v-model="severity" label="Severity" :options="severityOptions" />
    <AppTextarea
      v-model="reason"
      label="Alasan"
      :rows="3"
      maxlength="2000"
      placeholder="Jelaskan gerakan atau nyeri yang tidak aman."
      hint="Minimal 5 karakter, maksimal 2.000."
    />

    <p v-if="feedbackStore.error" class="feedback-alert" role="alert">
      {{ feedbackStore.error }}
    </p>
    <p v-else-if="sent" class="feedback-notice" role="status">
      Safety report terkirim. Tim akan meninjau.
    </p>

    <div class="feedback-actions">
      <AppButton
        variant="danger"
        :disabled="reason.length < 5 || !selected"
        :loading="feedbackStore.submitting"
        @click="submit"
      >
        Kirim safety report
      </AppButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppButton from '../ui-v2/AppButton.vue'
import AppSelect from '../ui-v2/AppSelect.vue'
import AppTextarea from '../ui-v2/AppTextarea.vue'
import { useFeedbackStore } from '../../stores/feedbackStore'
import type { UiOption } from '../ui-v2'
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

const exerciseOptions = computed<UiOption[]>(() =>
  props.exercises.map((exercise) => ({ value: exercise.id, label: exercise.label })),
)
const severityOptions: UiOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]
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

<style scoped>
.feedback-form {
  display: grid;
  gap: 14px;
  padding: 20px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  background: var(--color-surface-raised);
}

.feedback-form h3 {
  margin: 0;
  font-size: var(--text-h3);
}

.feedback-alert,
.feedback-notice {
  margin: 0;
  padding: 10px 12px;
  border-radius: var(--radius-control);
  font-size: 0.8125rem;
  line-height: 1.45;
}

.feedback-alert {
  border: 1px solid #f7d1cd;
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.feedback-notice {
  border: 1px solid #cfe6bf;
  background: var(--color-success-bg);
  color: var(--color-success-ink);
}

.feedback-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
