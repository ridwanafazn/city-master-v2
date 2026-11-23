<template>
  <div class="onboarding-page">
    <header class="page-head">
      <div class="page-head__copy">
        <h1>Siapkan profil</h1>
        <p>
          Lengkapi profil, equipment, cedera, dan consent. Data ini dipakai untuk
          membuat plan yang aman dan relevan.
        </p>
      </div>
      <span class="step-count type-data">Langkah {{ step + 1 }} / {{ steps.length }}</span>
    </header>

    <nav class="step-nav" aria-label="Langkah onboarding">
      <ol>
        <li
          v-for="(item, index) in steps"
          :key="item.key"
          :class="{
            'is-active': index === step,
            'is-done': index < step,
          }"
        >
          <button
            type="button"
            :aria-current="index === step ? 'step' : undefined"
            :disabled="index > step"
            @click="goToStep(index)"
          >
            <span class="step-nav__index">{{ index + 1 }}</span>
            <span>{{ item.label }}</span>
          </button>
        </li>
      </ol>
    </nav>

    <p v-if="localError" class="inline-error" role="alert">{{ localError }}</p>
    <p v-if="profileStore.error" class="inline-error" role="alert">
      {{ profileStore.error }}
    </p>

    <div v-if="profileStore.loading" class="onboarding-loading" aria-busy="true">
      <Skeleton width="38%" height="1.5rem" />
      <Skeleton :lines="4" height="0.75rem" />
    </div>

    <template v-else>
      <section v-if="step === 0" class="step-panel" aria-labelledby="step-profile-title">
        <h2 id="step-profile-title">Profil</h2>
        <p class="step-lede">
          Data dasar untuk menghitung volume dan menyusun split. Semua bisa diubah
          lagi nanti.
        </p>
        <ProfileFields
          v-model:profile="draft.profile"
          v-model:display-name="draft.displayName"
        />
      </section>

      <section v-else-if="step === 1" class="step-panel" aria-labelledby="step-equipment-title">
        <h2 id="step-equipment-title">Equipment</h2>
        <p class="step-lede">
          Pilih alat yang benar-benar tersedia. Kosong berarti semua equipment
          dianggap tersedia.
        </p>
        <EquipmentPicker v-model="draft.equipment" />
      </section>

      <section v-else-if="step === 2" class="step-panel" aria-labelledby="step-injuries-title">
        <h2 id="step-injuries-title">Cedera</h2>
        <p class="step-lede">
          Pilih area yang cedera atau harus dihindari. Ini bukan diagnosis medis.
        </p>
        <InjuryPicker
          v-model="draft.injuries"
          :health-consent="Boolean(draft.consents.health_data_processing)"
        />
      </section>

      <section v-else-if="step === 3" class="step-panel" aria-labelledby="step-consent-title">
        <h2 id="step-consent-title">Consent</h2>
        <p class="step-lede">
          Consent menentukan data mana yang boleh diproses. Health data wajib
          aktif jika Anda mencatat cedera.
        </p>
        <ConsentPanel
          v-model="draft.consents"
          :policy-version="profileStore.policyVersion"
        />
        <p
          v-if="draft.injuries.length && !draft.consents.health_data_processing"
          class="inline-warning"
          role="status"
        >
          Kamu memilih cedera. Consent health data processing wajib aktif sebelum
          melanjutkan.
        </p>
      </section>

      <section v-else class="step-panel" aria-labelledby="step-review-title">
        <h2 id="step-review-title">Review</h2>
        <p class="step-lede">
          Periksa sekali lagi. Setelah disimpan, data ini dipakai untuk plan dan
          workout.
        </p>
        <div class="review-grid">
          <section>
            <h3>Profil</h3>
            <dl class="review-list">
              <div><dt>Nama</dt><dd>{{ draft.displayName || '—' }}</dd></div>
              <div><dt>Gender</dt><dd>{{ genderLabel(draft.profile.gender) }}</dd></div>
              <div><dt>Tinggi / berat</dt><dd>{{ draft.profile.height_cm }} cm / {{ draft.profile.weight_kg }} kg</dd></div>
              <div><dt>Tujuan</dt><dd>{{ goalLabel(draft.profile.goal) }}</dd></div>
              <div><dt>Level</dt><dd>{{ experienceLabel(draft.profile.experience) }}</dd></div>
              <div><dt>Durasi sesi</dt><dd>{{ draft.profile.session_minutes }} menit</dd></div>
              <div><dt>Timezone</dt><dd>{{ draft.profile.timezone }}</dd></div>
              <div><dt>Locale / unit</dt><dd>{{ draft.profile.locale }} / {{ draft.profile.unit_system }}</dd></div>
            </dl>
          </section>
          <section>
            <h3>Constraint</h3>
            <dl class="review-list">
              <div><dt>Equipment</dt><dd>{{ draft.equipment.length ? draft.equipment.map(equipmentLabel).join(', ') : 'Semua' }}</dd></div>
              <div><dt>Cedera</dt><dd>{{ draft.injuries.length ? draft.injuries.map(injuryLabel).join(', ') : 'Tidak ada' }}</dd></div>
              <div><dt>Health consent</dt><dd>{{ draft.consents.health_data_processing ? 'Aktif' : 'Tidak aktif' }}</dd></div>
              <div><dt>Research</dt><dd>{{ draft.consents.research_analytics ? 'Aktif' : 'Tidak aktif' }}</dd></div>
              <div><dt>Trainer sharing</dt><dd>{{ draft.consents.trainer_sharing ? 'Aktif' : 'Tidak aktif' }}</dd></div>
              <div><dt>Marketing</dt><dd>{{ draft.consents.marketing ? 'Aktif' : 'Tidak aktif' }}</dd></div>
            </dl>
          </section>
        </div>
      </section>

      <div class="step-actions">
        <AppButton
          variant="secondary"
          :disabled="step === 0 || profileStore.saving"
          @click="previous"
        >
          Kembali
        </AppButton>
        <AppButton
          v-if="step < steps.length - 1"
          :disabled="profileStore.saving"
          @click="next"
        >
          Lanjut
          <ArrowRight :size="16" aria-hidden="true" />
        </AppButton>
        <AppButton
          v-else
          :disabled="profileStore.saving || !canSubmit"
          :loading="profileStore.saving"
          @click="submit"
        >
          Simpan profil
        </AppButton>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@lucide/vue'
import AppButton from '../../components/ui-v2/AppButton.vue'
import Skeleton from '../../components/ui-v2/Skeleton.vue'
import ConsentPanel from '../../components/profile/ConsentPanel.vue'
import EquipmentPicker from '../../components/profile/EquipmentPicker.vue'
import InjuryPicker from '../../components/profile/InjuryPicker.vue'
import ProfileFields from '../../components/profile/ProfileFields.vue'
import {
  defaultProfileInput,
  equipmentLabel,
  EXPERIENCE_OPTIONS,
  GENDER_OPTIONS,
  GOAL_OPTIONS,
  injuryLabel,
} from '../../lib/profileOptions'
import { useAuthStore } from '../../stores/authStore'
import { useProfileStore } from '../../stores/profileStore'
import type { ProfileInput } from '../../types/profile'

const auth = useAuthStore()
const profileStore = useProfileStore()
const router = useRouter()

const steps = [
  { key: 'profile', label: 'Profil' },
  { key: 'equipment', label: 'Equipment' },
  { key: 'injuries', label: 'Cedera' },
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

function genderLabel(value: string): string {
  return GENDER_OPTIONS.find((option) => option.value === value)?.label ?? value
}
function goalLabel(value: string): string {
  return GOAL_OPTIONS.find((option) => option.value === value)?.label ?? value
}
function experienceLabel(value: string): string {
  return EXPERIENCE_OPTIONS.find((option) => option.value === value)?.label ?? value
}

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
      localError.value = 'Tinggi dan berat wajib diisi.'
      return
    }
    if (!draft.profile.timezone) {
      localError.value = 'Timezone wajib diisi (contoh: Asia/Jakarta).'
      return
    }
  }
  if (step.value === 2 && draft.injuries.length && !draft.consents.health_data_processing) {
    localError.value =
      'Aktifkan health data consent sebelum menyimpan cedera. Lanjutkan ke langkah Consent.'
    step.value = 3
    return
  }
  step.value = Math.min(steps.length - 1, step.value + 1)
}

async function submit() {
  localError.value = null
  if (!canSubmit.value) {
    localError.value = 'Lengkapi profil dan consent yang diperlukan.'
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
  draft.displayName = auth.me?.user.display_name || auth.user?.name || ''
  draft.equipment = [...profileStore.equipment]
  draft.injuries = [...profileStore.injuryTerms]
  draft.consents = {
    ...draft.consents,
    ...profileStore.activeConsents,
  }
})
</script>

<style scoped>
.onboarding-page {
  display: grid;
  gap: var(--space-5);
  max-width: 980px;
}

.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--color-ink);
}

.page-head__copy h1 {
  margin: 0;
  font-size: var(--text-h1);
  line-height: var(--leading-tight);
}

.page-head__copy p {
  max-width: 62ch;
  margin: 10px 0 0;
  color: var(--color-muted);
  font-size: var(--text-body);
  line-height: var(--leading-relaxed);
}

.step-count {
  flex: 0 0 auto;
  color: var(--color-muted);
}

.step-nav {
  min-width: 0;
  max-width: 100%;
}

.step-nav ol {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-wrap: wrap;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.step-nav li {
  flex: 1 1 auto;
}

.step-nav button {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-height: var(--touch-target);
  padding: 0 10px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  background: var(--color-surface-raised);
  color: var(--color-muted);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.step-nav button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.step-nav li.is-done button {
  border-color: #cfe6bf;
  background: var(--color-success-bg);
  color: var(--color-success-ink);
}

.step-nav li.is-active button {
  border-color: var(--color-ink);
  background: var(--color-ink);
  color: var(--color-paper);
}

.step-nav__index {
  font-family: var(--font-data);
  font-size: 0.6875rem;
}

.step-panel {
  display: grid;
  gap: 16px;
  padding-top: 18px;
  border-top: 1px solid var(--color-ink);
}

.step-panel h2 {
  margin: 0;
  font-size: var(--text-h2);
}

.step-lede {
  max-width: 62ch;
  margin: 0;
  color: var(--color-muted);
  font-size: var(--text-small);
  line-height: var(--leading-relaxed);
}

.review-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 32px;
}

.review-grid h3 {
  margin: 0 0 8px;
  font-size: var(--text-h3);
}

.review-list {
  margin: 0;
}

.review-list div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 7px 0;
  border-bottom: 1px solid var(--color-line);
}

.review-list dt {
  color: var(--color-muted);
  font-size: 0.75rem;
}

.review-list dd {
  margin: 0;
  overflow-wrap: anywhere;
  font-family: var(--font-data);
  font-size: 0.6875rem;
  text-align: right;
}

.step-actions {
  position: sticky;
  bottom: calc(64px + env(safe-area-inset-bottom, 0px));
  z-index: 10;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid var(--color-ink);
  background: var(--color-paper);
}

.inline-error,
.inline-warning {
  margin: 0;
  padding: 10px 12px;
  border-radius: var(--radius-control);
  font-size: 0.8125rem;
  line-height: 1.45;
}

.inline-error {
  border: 1px solid #f7d1cd;
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.inline-warning {
  border: 1px solid #f2d9b2;
  background: var(--color-warning-bg);
  color: var(--color-ink);
}

.onboarding-loading {
  display: grid;
  gap: 12px;
}

@media (min-width: 1024px) {
  .step-actions {
    position: static;
  }
}

@media (max-width: 760px) {
  .page-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .review-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
