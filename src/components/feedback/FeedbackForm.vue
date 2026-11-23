<template>
  <PixelCard :title="title">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label class="pixel-label">Rating</label>
        <select v-model.number="rating" class="pixel-input text-xs">
          <option :value="0">No rating</option>
          <option v-for="value in [1, 2, 3, 4, 5]" :key="value" :value="value">
            {{ value }} / 5
          </option>
        </select>
      </div>
      <div>
        <label class="pixel-label">Difficulty</label>
        <select v-model="difficulty" class="pixel-input text-xs">
          <option value="">No selection</option>
          <option value="too_easy">Too easy</option>
          <option value="just_right">Just right</option>
          <option value="too_hard">Too hard</option>
        </select>
      </div>
    </div>

    <label class="mt-3 flex items-center gap-2 font-mono text-xs font-bold uppercase">
      <input v-model="pain" type="checkbox" class="h-4 w-4 accent-slate-900" />
      Pain / discomfort
    </label>
    <input
      v-if="pain"
      v-model.trim="painArea"
      class="pixel-input mt-2 text-xs"
      type="text"
      maxlength="60"
      placeholder="Area, e.g. knee"
    />

    <textarea
      v-model.trim="comment"
      class="pixel-input mt-3 min-h-[80px] text-xs"
      maxlength="2000"
      placeholder="What worked or did not work?"
    />

    <div
      v-if="feedbackStore.error"
      class="mt-3 border-3 border-red-700 bg-red-50 p-2 font-mono text-xs text-red-800"
    >
      {{ feedbackStore.error }}
    </div>
    <div
      v-else-if="sent"
      class="mt-3 border-3 border-green-700 bg-green-50 p-2 font-mono text-xs text-green-900"
    >
      Feedback terkirim.
    </div>

    <div class="mt-3 flex justify-end">
      <PixelButton :disabled="feedbackStore.submitting || !hasValue" @click="submit">
        {{ feedbackStore.submitting ? 'Sending…' : 'Send Feedback' }}
      </PixelButton>
    </div>
  </PixelCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import PixelButton from '../ui/PixelButton.vue'
import PixelCard from '../ui/PixelCard.vue'
import { useFeedbackStore } from '../../stores/feedbackStore'
import type { Difficulty } from '../../types/feedback'

const props = withDefaults(
  defineProps<{
    planId?: string | null
    workoutId?: string | null
    title?: string
  }>(),
  { planId: null, workoutId: null, title: 'Give Feedback' },
)

const feedbackStore = useFeedbackStore()
const rating = ref(0)
const difficulty = ref<Difficulty | ''>('')
const pain = ref(false)
const painArea = ref('')
const comment = ref('')
const sent = ref(false)

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
