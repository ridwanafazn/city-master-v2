<template>
  <div class="space-y-8">
    <header class="border-b-4 border-slate-900 pb-4">
      <div class="flex items-center gap-2 mb-2">
        <span class="bg-blue-500 text-white border-2 border-slate-900 px-2 py-1 font-mono text-[10px] font-black uppercase">
          M2 · Onboarding
        </span>
        <span class="font-mono text-[10px] text-slate-500 uppercase">
          Step {{ step + 1 }} / {{ steps.length }}
        </span>
      </div>
      <h1 class="text-4xl md:text-5xl font-black uppercase tracking-tighter">
        Profile <span class="text-blue-600">Setup</span>
      </h1>
      <p class="text-slate-600 mt-2 font-mono text-sm max-w-2xl">
        Lengkapi profil, equipment, cedera, dan consent. Data ini dipakai untuk
        membuat plan yang aman dan relevan.
      </p>
    </header>

    <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
      <button
        v-for="(item, index) in steps"
        :key="item.key"
        type="button"
        class="border-2 border-slate-900 px-2 py-2 font-mono text-[10px] font-black uppercase text-left"
        :class="index === step ? 'bg-slate-900 text-white' : index < step ? 'bg-green-200' : 'bg-white text-slate-500'"
        @click="goToStep(index)"
      >
        {{ index + 1 }}. {{ item.label }}
      </button>
    </div>

    <div
      v-if="localError"
      class="border-3 border-red-700 bg-red-50 p-3 font-mono text-xs text-red-800"
    >
      {{ localError }}
    </div>

    <div
      v-if="profileStore.error"
      class="border-3 border-red-700 bg-red-50 p-3 font-mono text-xs text-red-800"
    >
      <p class="font-black uppercase">{{ profileStore.errorCode || 'error' }}</p>
      <p>{{ profileStore.error }}</p>
      <pre
        v-if="profileStore.errorDetails"
        class="mt-2 max-h-32 overflow-auto whitespace-pre-wrap text-[10px]"
      >{{ JSON.stringify(profileStore.errorDetails, null, 2) }}</pre>
    </div>

    <div v-if="profileStore.loading" class="font-mono text-sm text-slate-500">
      Loading profile…
    </div>

    <template v-else>
      <PixelCard v-if="step === 0" title="1. Profile">
        <ProfileFields
          v-model:profile="draft.profile"
          v-model:display-name="draft.displayName"
        />
      </PixelCard>

      <PixelCard v-else-if="step === 1" title="2. Equipment">
        <p class="mb-4 font-mono text-xs text-slate-600">
          Pilih equipment yang tersedia. Kosong berarti semua equipment dianggap
          tersedia.
        </p>
        <EquipmentPicker v-model="draft.equipment" />
      </PixelCard>

      <PixelCard v-else-if="step === 2" title="3. Injuries">
        <p class="mb-4 font-mono text-xs text-slate-600">
          Pilih area yang cedera atau harus dihindari. Ini bukan diagnosis medis.
        </p>
        <InjuryPicker
          v-model="draft.injuries"
          :health-consent="Boolean(draft.consents.health_data_processing)"
        />
      </PixelCard>

      <PixelCard v-else-if="step === 3" title="4. Consent">
        <ConsentPanel
          v-model="draft.consents"
          :policy-version="profileStore.policyVersion"
        />
        <p
          v-if="draft.injuries.length && !draft.consents.health_data_processing"
          class="mt-4 border-3 border-red-700 bg-red-50 p-3 font-mono text-xs text-red-800"
        >
          Kamu memilih cedera. Consent health data processing wajib aktif sebelum
          melanjutkan.
        </p>
      </PixelCard>

      <PixelCard v-else title="5. Review">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-sm">
          <div class="space-y-2">
            <h3 class="font-black uppercase text-xs text-slate-500">Profile</h3>
            <StatusRow label="Display name" :value="draft.displayName || '—'" />
            <StatusRow label="Gender" :value="draft.profile.gender" />
            <StatusRow label="Height / Weight" :value="`${draft.profile.height_cm} cm / ${draft.profile.weight_kg} kg`" />
            <StatusRow label="Goal" :value="draft.profile.goal" />
            <StatusRow label="Experience" :value="draft.profile.experience" />
            <StatusRow label="Session" :value="`${draft.profile.session_minutes} minutes`" />
            <StatusRow label="Timezone / Locale" :value="`${draft.profile.timezone} / ${draft.profile.locale}`" />
            <StatusRow label="Unit" :value="draft.profile.unit_system" />
          </div>

          <div class="space-y-2">
            <h3 class="font-black uppercase text-xs text-slate-500">Constraints</h3>
            <StatusRow label="Equipment" :value="draft.equipment.length ? draft.equipment.map(equipmentLabel).join(', ') : 'all equipment'" />
            <StatusRow label="Injuries" :value="draft.injuries.length ? draft.injuries.map(injuryLabel).join(', ') : 'none'" />
            <StatusRow
              label="Health consent"
              :value="draft.consents.health_data_processing ? 'granted' : 'not granted'"
            />
            <StatusRow
              label="Research"
              :value="draft.consents.research_analytics ? 'granted' : 'not granted'"
            />
            <StatusRow
              label="Trainer sharing"
              :value="draft.consents.trainer_sharing ? 'granted' : 'not granted'"
            />
            <StatusRow
              label="Marketing"
              :value="draft.consents.marketing ? 'granted' : 'not granted'"
            />
          </div>
        </div>
      </PixelCard>

      <div class="flex flex-col sm:flex-row gap-2 justify-between border-t-4 border-slate-900 pt-4">
        <PixelButton
          variant="secondary"
          :disabled="step === 0 || profileStore.saving"
          @click="previous"
        >
          < Back
        </PixelButton>
        <PixelButton
          v-if="step < steps.length - 1"
          :disabled="profileStore.saving"
          @click="next"
        >
          Continue >
        </PixelButton>
        <PixelButton
          v-else
          :disabled="profileStore.saving || !canSubmit"
          @click="submit"
        >
          {{ profileStore.saving ? 'Saving…' : 'Save Profile >' }}
        </PixelButton>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import ConsentPanel from '../../components/profile/ConsentPanel.vue'
import EquipmentPicker from '../../components/profile/EquipmentPicker.vue'
import InjuryPicker from '../../components/profile/InjuryPicker.vue'
import ProfileFields from '../../components/profile/ProfileFields.vue'
import PixelButton from '../../components/ui/PixelButton.vue'
import PixelCard from '../../components/ui/PixelCard.vue'
import StatusRow from '../../components/ui/StatusRow.vue'
import { defaultProfileInput, equipmentLabel, injuryLabel } from '../../lib/profileOptions'
import { useAuthStore } from '../../stores/authStore'
import { useProfileStore } from '../../stores/profileStore'
import type { ProfileInput } from '../../types/profile'

const auth = useAuthStore()
const profileStore = useProfileStore()
const router = useRouter()

const steps = [
  { key: 'profile', label: 'Profile' },
  { key: 'equipment', label: 'Equipment' },
  { key: 'injuries', label: 'Injuries' },
  { key: 'consent', label: 'Consent' },
  { key: 'review', label: 'Review' },
]

const step = ref(0)
const localError = ref<string | null>(null)
const draft = reactive({
  displayName: '',
  profile: defaultProfileInput() as ProfileInput,
  equipment: [] as string[],
  injuries: [] as string[],
  consents: {
    health_data_processing: false,
    research_analytics: false,
    trainer_sharing: false,
    marketing: false,
  } as Record<string, boolean>,
})

const canSubmit = computed(
  () =>
    draft.profile.height_cm > 0 &&
    draft.profile.weight_kg > 0 &&
    Boolean(draft.profile.timezone) &&
    (!draft.injuries.length || Boolean(draft.consents.health_data_processing)),
)

function goToStep(index: number) {
  if (index <= step.value) {
    step.value = index
    localError.value = null
  }
}

function previous() {
  if (step.value > 0) {
    step.value -= 1
    localError.value = null
  }
}

function next() {
  localError.value = null
  if (step.value === 0) {
    if (!draft.profile.height_cm || !draft.profile.weight_kg) {
      localError.value = 'Height dan weight wajib diisi.'
      return
    }
    if (!draft.profile.timezone) {
      localError.value = 'Timezone wajib diisi (contoh: Asia/Jakarta).'
      return
    }
  }
  if (step.value === 2 && draft.injuries.length && !draft.consents.health_data_processing) {
    localError.value =
      'Aktifkan health data consent sebelum menyimpan cedera. Lanjut ke step Consent.'
    step.value = 3
    return
  }
  step.value = Math.min(steps.length - 1, step.value + 1)
}

async function submit() {
  localError.value = null
  if (!canSubmit.value) {
    localError.value = 'Lengkapi profile dan consent yang diperlukan.'
    return
  }
  const ok = await profileStore.saveOnboarding({
    display_name: draft.displayName || undefined,
    profile: { ...draft.profile },
    equipment: [...draft.equipment],
    injuries: [...draft.injuries],
    consents: {
      health_data_processing: Boolean(draft.consents.health_data_processing),
      research_analytics: Boolean(draft.consents.research_analytics),
      trainer_sharing: Boolean(draft.consents.trainer_sharing),
      marketing: Boolean(draft.consents.marketing),
    },
  })
  if (ok) {
    await router.replace({ name: 'app-account', query: { onboarding: 'done' } })
  }
}

onMounted(async () => {
  await profileStore.load()
  if (profileStore.profile) {
    draft.profile = {
      gender: profileStore.profile.gender,
      height_cm: profileStore.profile.height_cm,
      weight_kg: profileStore.profile.weight_kg,
      goal: profileStore.profile.goal,
      experience: profileStore.profile.experience,
      session_minutes: profileStore.profile.session_minutes,
      timezone: profileStore.profile.timezone,
      locale: profileStore.profile.locale,
      unit_system: profileStore.profile.unit_system,
    }
  }
  draft.displayName =
    auth.me?.user.display_name || auth.user?.name || draft.displayName
  draft.equipment = [...profileStore.equipment]
  draft.injuries = [...profileStore.injuryTerms]
  draft.consents = {
    ...draft.consents,
    ...profileStore.activeConsents,
  }
})
</script>
