<template>
  <div class="profile-fields">
    <AppInput
      v-if="showDisplayName"
      v-model="displayName"
      label="Nama tampilan"
      autocomplete="name"
      maxlength="100"
      placeholder="Nama yang tampil di akun"
    />

    <div class="profile-fields__grid">
      <AppSelect v-model="profile.gender" label="Gender" :options="genderOptions" />
      <AppSelect v-model="profile.goal" label="Tujuan" :options="goalOptions" />
      <AppInput
        v-model="heightModel"
        label="Tinggi (cm)"
        type="number"
        min="51"
        max="300"
        step="0.5"
        required
        inputmode="decimal"
      />
      <AppInput
        v-model="weightModel"
        label="Berat (kg)"
        type="number"
        min="11"
        max="400"
        step="0.5"
        required
        inputmode="decimal"
      />
      <AppSelect v-model="profile.experience" label="Level" :options="experienceOptions" />
      <AppSelect v-model="sessionModel" label="Durasi sesi" :options="sessionOptions" />
      <AppInput
        v-model="profile.timezone"
        label="Timezone"
        placeholder="Asia/Jakarta"
        hint="Nama IANA, contoh Asia/Jakarta."
        required
      />
      <AppSelect v-model="profile.locale" label="Locale" :options="localeOptions" />
      <AppSelect v-model="profile.unit_system" label="Unit" :options="unitOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppInput from '../ui-v2/AppInput.vue'
import AppSelect from '../ui-v2/AppSelect.vue'
import type { UiOption } from '../ui-v2'
import type { ProfileInput } from '../../types/profile'
import {
  EXPERIENCE_OPTIONS,
  GENDER_OPTIONS,
  GOAL_OPTIONS,
  SESSION_MINUTES_OPTIONS,
  UNIT_SYSTEM_OPTIONS,
} from '../../lib/profileOptions'

const profile = defineModel<ProfileInput>('profile', { required: true })
const displayName = defineModel<string>('displayName', { default: '' })

withDefaults(
  defineProps<{
    showDisplayName?: boolean
  }>(),
  {
    showDisplayName: true,
  },
)

const genderOptions: UiOption[] = GENDER_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}))
const goalOptions: UiOption[] = GOAL_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
  description: option.hint,
}))
const experienceOptions: UiOption[] = EXPERIENCE_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}))
const sessionOptions: UiOption[] = SESSION_MINUTES_OPTIONS.map((minutes) => ({
  value: String(minutes),
  label: `${minutes} menit`,
}))
const localeOptions: UiOption[] = [
  { value: 'id-ID', label: 'id-ID' },
  { value: 'en-US', label: 'en-US' },
]
const unitOptions: UiOption[] = UNIT_SYSTEM_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}))

const heightModel = computed({
  get: () => String(profile.value.height_cm),
  set: (value: string) => {
    profile.value.height_cm = Number(value)
  },
})
const weightModel = computed({
  get: () => String(profile.value.weight_kg),
  set: (value: string) => {
    profile.value.weight_kg = Number(value)
  },
})
const sessionModel = computed({
  get: () => String(profile.value.session_minutes),
  set: (value: string) => {
    profile.value.session_minutes = Number(value) as ProfileInput['session_minutes']
  },
})
</script>

<style scoped>
.profile-fields {
  display: grid;
  gap: var(--space-5);
}

.profile-fields__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

@media (max-width: 640px) {
  .profile-fields__grid {
    grid-template-columns: 1fr;
  }
}
</style>
