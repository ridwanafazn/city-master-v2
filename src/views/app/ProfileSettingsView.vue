<template>
  <div class="space-y-8">
    <header class="border-b-4 border-slate-900 pb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-blue-500 text-white border-2 border-slate-900 px-2 py-1 font-mono text-[10px] font-black uppercase">
            M2 · Profile
          </span>
          <span class="font-mono text-[10px] text-slate-500 uppercase">
            {{ auth.profileComplete ? 'Complete' : 'Incomplete' }}
          </span>
        </div>
        <h1 class="text-4xl md:text-5xl font-black uppercase tracking-tighter">
          Profile <span class="text-blue-600">Settings</span>
        </h1>
        <p class="text-slate-600 mt-2 font-mono text-sm max-w-2xl">
          Perbarui profil, equipment, cedera, consent, dan ekspor data akun.
        </p>
      </div>
      <div class="flex gap-2">
        <RouterLink to="/app/account" class="pixel-button text-xs font-black uppercase">
          Account
        </RouterLink>
        <RouterLink to="/app/onboarding" class="pixel-button text-xs font-black uppercase">
          Onboarding
        </RouterLink>
      </div>
    </header>

    <div
      v-if="notice"
      class="border-3 border-green-700 bg-green-50 p-3 font-mono text-xs text-green-900"
    >
      {{ notice }}
    </div>

    <div
      v-if="localError || profileStore.error"
      class="border-3 border-red-700 bg-red-50 p-3 font-mono text-xs text-red-800"
    >
      <p class="font-black uppercase">{{ profileStore.errorCode || 'error' }}</p>
      <p>{{ localError || profileStore.error }}</p>
    </div>

    <div v-if="profileStore.loading" class="font-mono text-sm text-slate-500">
      Loading profile…
    </div>

    <template v-else>
      <PixelCard title="Profile">
        <ProfileFields
          v-model:profile="draftProfile"
          :show-display-name="false"
        />
        <div class="mt-4 flex justify-end">
          <PixelButton :disabled="profileStore.saving" @click="saveProfile">
            {{ profileStore.saving ? 'Saving…' : 'Save Profile' }}
          </PixelButton>
        </div>
      </PixelCard>

      <PixelCard title="Equipment">
        <EquipmentPicker v-model="draftEquipment" />
        <div class="mt-4 flex justify-end">
          <PixelButton :disabled="profileStore.saving" @click="saveEquipment">
            Save Equipment
          </PixelButton>
        </div>
      </PixelCard>

      <PixelCard title="Injuries">
        <InjuryPicker
          v-model="draftInjuries"
          :health-consent="Boolean(consentDraft.health_data_processing)"
        />
        <div
          v-if="!consentDraft.health_data_processing && draftInjuries.length"
          class="mt-4 border-3 border-yellow-700 bg-yellow-50 p-3 font-mono text-xs text-yellow-900"
        >
          Simpan consent health data processing terlebih dahulu.
        </div>
        <div class="mt-4 flex justify-end">
          <PixelButton
            :disabled="profileStore.saving || (!consentDraft.health_data_processing && draftInjuries.length > 0)"
            @click="saveInjuries"
          >
            Save Injuries
          </PixelButton>
        </div>
      </PixelCard>

      <PixelCard title="Consent">
        <ConsentPanel
          v-model="consentDraft"
          :policy-version="profileStore.policyVersion"
        />
        <p
          v-if="revokingHealthWithInjuries"
          class="mt-4 border-3 border-red-700 bg-red-50 p-3 font-mono text-xs text-red-800"
        >
          Mencabut health consent akan menghapus cedera yang tersimpan.
        </p>
        <div class="mt-4 flex justify-end">
          <PixelButton :disabled="profileStore.saving || !consentChanged" @click="saveConsents">
            Apply Consent Changes
          </PixelButton>
        </div>
      </PixelCard>

      <PixelCard title="Data Export">
        <p class="font-mono text-sm text-slate-600">
          Unduh seluruh data akun Anda sebagai JSON: profil, equipment, cedera,
          consent, role, dan data fitur yang tersedia.
        </p>
        <div class="mt-4 flex justify-end">
          <PixelButton variant="secondary" :disabled="profileStore.saving" @click="exportData">
            Download Data Export
          </PixelButton>
        </div>
      </PixelCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ConsentPanel from '../../components/profile/ConsentPanel.vue'
import EquipmentPicker from '../../components/profile/EquipmentPicker.vue'
import InjuryPicker from '../../components/profile/InjuryPicker.vue'
import ProfileFields from '../../components/profile/ProfileFields.vue'
import PixelButton from '../../components/ui/PixelButton.vue'
import PixelCard from '../../components/ui/PixelCard.vue'
import { defaultProfileInput } from '../../lib/profileOptions'
import { useAuthStore } from '../../stores/authStore'
import { useProfileStore } from '../../stores/profileStore'
import type { ConsentKind, ProfileInput } from '../../types/profile'

const auth = useAuthStore()
const profileStore = useProfileStore()

const draftProfile = ref<ProfileInput>(defaultProfileInput())
const draftEquipment = ref<string[]>([])
const draftInjuries = ref<string[]>([])
const consentDraft = ref<Record<string, boolean>>({
  health_data_processing: false,
  research_analytics: false,
  trainer_sharing: false,
  marketing: false,
})
const localError = ref<string | null>(null)
const notice = ref<string | null>(null)

const consentChanged = computed(() =>
  Object.keys(consentDraft.value).some(
    (kind) => Boolean(consentDraft.value[kind]) !== Boolean(profileStore.activeConsents[kind]),
  ),
)

const revokingHealthWithInjuries = computed(
  () =>
    Boolean(profileStore.activeConsents.health_data_processing) &&
    !consentDraft.value.health_data_processing &&
    draftInjuries.value.length > 0,
)

function hydrate() {
  draftProfile.value = profileStore.profile
    ? {
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
    : defaultProfileInput()
  draftEquipment.value = [...profileStore.equipment]
  draftInjuries.value = [...profileStore.injuryTerms]
  consentDraft.value = {
    ...consentDraft.value,
    ...profileStore.activeConsents,
  }
}

async function saveProfile() {
  localError.value = null
  notice.value = null
  const ok = await profileStore.saveProfile({ ...draftProfile.value })
  if (ok) notice.value = 'Profil tersimpan.'
}

async function saveEquipment() {
  localError.value = null
  notice.value = null
  const ok = await profileStore.saveEquipment([...draftEquipment.value])
  if (ok) notice.value = 'Equipment tersimpan.'
}

async function saveInjuries() {
  localError.value = null
  notice.value = null
  const ok = await profileStore.saveInjuries([...draftInjuries.value])
  if (ok) {
    notice.value = 'Cedera tersimpan.'
    draftInjuries.value = [...profileStore.injuryTerms]
  }
}

async function saveConsents() {
  localError.value = null
  notice.value = null
  const changes = Object.entries(consentDraft.value).filter(
    ([kind, granted]) =>
      Boolean(granted) !== Boolean(profileStore.activeConsents[kind]),
  )
  if (!changes.length) {
    notice.value = 'Tidak ada perubahan consent.'
    return
  }
  for (const [kind, granted] of changes) {
    const ok = await profileStore.updateConsent(kind as ConsentKind, Boolean(granted))
    if (!ok) return
  }
  hydrate()
  notice.value = 'Consent diperbarui.'
}

async function exportData() {
  localError.value = null
  notice.value = null
  const ok = await profileStore.exportData()
  if (ok) notice.value = 'Export diunduh.'
}

onMounted(async () => {
  await profileStore.load()
  hydrate()
})
</script>
