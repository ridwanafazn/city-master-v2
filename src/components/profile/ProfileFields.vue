<template>
  <div class="space-y-5">
    <div v-if="showDisplayName">
      <label class="pixel-label" for="profile-display-name">Display name</label>
      <input
        id="profile-display-name"
        v-model.trim="displayName"
        class="pixel-input"
        type="text"
        maxlength="100"
        autocomplete="name"
        placeholder="Nama yang tampil di akun"
      />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="pixel-label" for="profile-gender">Gender</label>
        <select id="profile-gender" v-model="profile.gender" class="pixel-input">
          <option v-for="option in GENDER_OPTIONS" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div>
        <label class="pixel-label">Goal</label>
        <select v-model="profile.goal" class="pixel-input">
          <option v-for="option in GOAL_OPTIONS" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div>
        <label class="pixel-label" for="profile-height">Height (cm)</label>
        <input
          id="profile-height"
          v-model.number="profile.height_cm"
          class="pixel-input"
          type="number"
          min="51"
          max="300"
          step="0.5"
          required
        />
      </div>

      <div>
        <label class="pixel-label" for="profile-weight">Weight (kg)</label>
        <input
          id="profile-weight"
          v-model.number="profile.weight_kg"
          class="pixel-input"
          type="number"
          min="11"
          max="400"
          step="0.5"
          required
        />
      </div>

      <div>
        <label class="pixel-label">Experience</label>
        <select v-model="profile.experience" class="pixel-input">
          <option v-for="option in EXPERIENCE_OPTIONS" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div>
        <label class="pixel-label">Session length</label>
        <select v-model.number="profile.session_minutes" class="pixel-input">
          <option v-for="minutes in SESSION_MINUTES_OPTIONS" :key="minutes" :value="minutes">
            {{ minutes }} minutes
          </option>
        </select>
      </div>

      <div>
        <label class="pixel-label" for="profile-timezone">Timezone</label>
        <input
          id="profile-timezone"
          v-model.trim="profile.timezone"
          class="pixel-input"
          type="text"
          placeholder="Asia/Jakarta"
          required
        />
        <p class="mt-1 font-mono text-[10px] text-slate-500">
          IANA name, e.g. Asia/Jakarta.
        </p>
      </div>

      <div>
        <label class="pixel-label">Locale</label>
        <select v-model="profile.locale" class="pixel-input">
          <option value="id-ID">id-ID</option>
          <option value="en-US">en-US</option>
        </select>
      </div>

      <div>
        <label class="pixel-label">Unit preference</label>
        <select v-model="profile.unit_system" class="pixel-input">
          <option v-for="option in UNIT_SYSTEM_OPTIONS" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

defineProps({
  showDisplayName: {
    type: Boolean,
    default: true,
  },
})
</script>
