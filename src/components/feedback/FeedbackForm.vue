<template>
  <section class="feedback-form" :aria-labelledby="titleId">
    <h3 :id="titleId">{{ title }}</h3>

    <div class="feedback-grid">
      <AppSelect v-model="ratingModel" label="Rating" :options="ratingOptions" />
      <AppSelect v-model="difficultyModel" label="Kesulitan" :options="difficultyOptions" />
    </div>

    <AppCheckbox
      v-model="pain"
      label="Ada nyeri atau ketidaknyamanan"
      description="Tandai jika gerakan terasa tidak aman atau menimbulkan nyeri."
    />

    <AppInput
      v-if="pain"
      v-model="painArea"
      label="Area nyeri"
      maxlength="60"
      placeholder="Contoh: lutut kanan"
    />

    <AppTextarea
      v-model="comment"
      label="Komentar"
      :rows="3"
      maxlength="2000"
      placeholder="Apa yang berhasil atau tidak berhasil?"
      hint="Maksimal 2.000 karakter."
    />

    <p v-if="feedbackStore.error" class="feedback-alert" role="alert">
      {{ feedbackStore.error }}
    </p>
    <p v-else-if="sent" class="feedback-notice" role="status">Feedback terkirim.</p>

    <div class="feedback-actions">
      <AppButton :disabled="!hasValue" :loading="feedbackStore.submitting" @click="submit">
        Kirim feedback
      </AppButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import AppButton from '../ui-v2/AppButton.vue'
import AppCheckbox from '../ui-v2/AppCheckbox.vue'
import AppInput from '../ui-v2/AppInput.vue'
import AppSelect from '../ui-v2/AppSelect.vue'
import AppTextarea from '../ui-v2/AppTextarea.vue'
import { useFeedbackStore } from '../../stores/feedbackStore'
import type { UiOption } from '../ui-v2'
import type { Difficulty } from '../../types/feedback'

const props = withDefaults(
  defineProps<{
    planId?: string | null
    workoutId?: string | null
    title?: string
  }>(),
  { planId: null, workoutId: null, title: 'Feedback plan' },
)

const feedbackStore = useFeedbackStore()
const titleId = `feedback-${useId()}`
const rating = ref(0)
const difficulty = ref<Difficulty | ''>('')
const pain = ref(false)
const painArea = ref('')
const comment = ref('')
const sent = ref(false)

const ratingOptions: UiOption[] = [
  { value: '0', label: 'Tanpa rating' },
  ...[1, 2, 3, 4, 5].map((value) => ({ value: String(value), label: `${value} / 5` })),
]
const difficultyOptions: UiOption[] = [
  { value: '', label: 'Tanpa pilihan' },
  { value: 'too_easy', label: 'Terlalu mudah' },
  { value: 'just_right', label: 'Pas' },
  { value: 'too_hard', label: 'Terlalu berat' },
]

const ratingModel = computed({
  get: () => String(rating.value),
  set: (value: string) => {
    rating.value = Number(value)
  },
})
const difficultyModel = computed({
  get: () => difficulty.value,
  set: (value: string) => {
    difficulty.value = value as Difficulty | ''
  },
})

const hasValue = computed(
  () => rating.value > 0 || Boolean(difficulty.value) || pain.value || Boolean(comment.value),
)

async function submit() {
  sent.value = false
  const ok = await feedbackStore.submitFeedback({
    plan_id: props.planId ?? undefined,
    workout_session_id: props.workoutId ?? undefined,
    rating: rating.value > 0 ? rating.value : null,
    difficulty: difficulty.value || null,
    pain: pain.value,
    pain_area: pain.value ? painArea.value || null : null,
    comment: comment.value || null,
  })
  if (ok) {
    sent.value = true
    rating.value = 0
    difficulty.value = ''
    pain.value = false
    painArea.value = ''
    comment.value = ''
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

.feedback-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
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

@media (max-width: 640px) {
  .feedback-grid {
    grid-template-columns: 1fr;
  }
}
</style>
