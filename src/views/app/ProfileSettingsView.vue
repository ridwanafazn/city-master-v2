<template>
  <div class="profile-page">
    <header class="page-head">
      <div class="page-head__copy">
        <h1>Profil latihan</h1>
        <p>
          Data ini dipakai untuk menyusun plan: tujuan, level, waktu sesi,
          equipment, cedera, dan consent.
        </p>
      </div>
      <div class="page-head__actions">
        <AppButton variant="secondary" @click="router.push('/app/account')">
          Akun
        </AppButton>
        <AppButton variant="ghost" @click="router.push('/app/onboarding')">
          Onboarding
        </AppButton>
      </div>
    </header>

    <p v-if="notice" class="inline-notice" role="status">{{ notice }}</p>
    <p v-if="localError || profileStore.error" class="inline-error" role="alert">
      {{ localError || profileStore.error }}
    </p>

    <div v-if="profileStore.loading" class="profile-loading" aria-busy="true">
      <Skeleton width="42%" height="1.5rem" />
      <Skeleton :lines="4" height="0.75rem" />
    </div>

    <div v-else class="profile-layout">
      <div class="profile-main">
        <section class="profile-section" aria-labelledby="profile-identity-title">
          <div class="section-head">
            <h2 id="profile-identity-title">Identitas & profil</h2>
            <span class="type-data">{{ auth.profileComplete ? 'Lengkap' : 'Belum lengkap' }}</span>
          </div>
          <ProfileFields v-model:profile="draftProfile" :show-display-name="false" />
          <div class="section-actions">
            <AppButton :loading="profileStore.saving" @click="saveProfile">Simpan profil</AppButton>
          </div>
        </section>

        <section class="profile-section" aria-labelledby="profile-equipment-title">
          <div class="section-head">
            <h2 id="profile-equipment-title">Equipment</h2>
            <span class="type-data">{{ draftEquipment.length }} dipilih</span>
          </div>
          <EquipmentPicker v-model="draftEquipment" />
          <div class="section-actions">
            <AppButton :loading="profileStore.saving" @click="saveEquipment">Simpan equipment</AppButton>
          </div>
        </section>

        <section class="profile-section" aria-labelledby="profile-injuries-title">
          <div class="section-head">
            <h2 id="profile-injuries-title">Cedera</h2>
            <span class="type-data">{{ draftInjuries.length }} area</span>
          </div>
          <InjuryPicker
            v-model="draftInjuries"
            :health-consent="Boolean(consentDraft.health_data_processing)"
          />
          <p
            v-if="!consentDraft.health_data_processing && draftInjuries.length"
            class="inline-warning"
            role="status"
          >
            Simpan consent health data processing terlebih dahulu.
          </p>
          <div class="section-actions">
            <AppButton
              :loading="profileStore.saving"
              :disabled="!consentDraft.health_data_processing && draftInjuries.length > 0"
              @click="saveInjuries"
            >
              Simpan cedera
            </AppButton>
          </div>
        </section>

        <section class="profile-section" aria-labelledby="profile-consent-title">
          <div class="section-head">
            <h2 id="profile-consent-title">Consent</h2>
            <span class="type-data">{{ profileStore.policyVersion }}</span>
          </div>
          <ConsentPanel v-model="consentDraft" :policy-version="profileStore.policyVersion" />
          <p v-if="revokingHealthWithInjuries" class="inline-warning" role="status">
            Mencabut health consent akan menghapus cedera yang tersimpan.
          </p>
          <div class="section-actions">
            <AppButton
              :loading="profileStore.saving"
              :disabled="!consentChanged"
              @click="saveConsents"
            >
              Simpan consent
            </AppButton>
          </div>
        </section>
      </div>

      <aside class="profile-rail">
        <section class="rail-block" aria-labelledby="profile-status-title">
          <h2 id="profile-status-title">Status akun</h2>
          <dl class="rail-list">
            <div><dt>Profil</dt><dd>{{ auth.profileComplete ? 'Lengkap' : 'Belum lengkap' }}</dd></div>
            <div><dt>Email</dt><dd>{{ auth.email || '—' }}</dd></div>
            <div><dt>Consent aktif</dt><dd>{{ activeConsentCount }} / 4</dd></div>
          </dl>
        </section>

        <section class="rail-block" aria-labelledby="profile-export-title">
          <h2 id="profile-export-title">Data</h2>
          <p class="rail-copy">
            Unduh profil, equipment, cedera, consent, dan data fitur sebagai JSON.
          </p>
          <AppButton variant="secondary" :loading="profileStore.saving" @click="exportData">
            Unduh data
          </AppButton>
        </section>

        <section class="rail-block" aria-labelledby="profile-advanced-title">
          <h2 id="profile-advanced-title">Advanced</h2>
          <p class="rail-copy">
            Diagnostik backend dan readiness tersedia di route internal.
          </p>
          <RouterLink to="/app/debug" class="rail-link">Buka diagnostics</RouterLink>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '../../components/ui-v2/AppButton.vue'
import Skeleton from '../../components/ui-v2/Skeleton.vue'
import ConsentPanel from '../../components/profile/ConsentPanel.vue'
import EquipmentPicker from '../../components/profile/EquipmentPicker.vue'
import InjuryPicker from '../../components/profile/InjuryPicker.vue'
import ProfileFields from '../../components/profile/ProfileFields.vue'
import { defaultProfileInput } from '../../lib/profileOptions'
import { useAuthStore } from '../../stores/authStore'
import { useProfileStore } from '../../stores/profileStore'
import type { ConsentKind, ProfileInput } from '../../types/profile'

const auth = useAuthStore()
const profileStore = useProfileStore()
const router = useRouter()

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
const activeConsentCount = computed(
  () => Object.values(profileStore.activeConsents).filter(Boolean).length,
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

<style scoped>
.profile-page {
  display: grid;
  gap: var(--space-5);
}

.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-5);
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

.page-head__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.profile-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(250px, 0.6fr);
  gap: 40px;
  align-items: start;
}

.profile-main {
  display: grid;
  gap: 28px;
}

.profile-section {
  padding-top: 16px;
  border-top: 1px solid var(--color-ink);
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.section-head h2 {
  margin: 0;
  font-size: var(--text-h3);
}

.section-head span {
  color: var(--color-muted);
}

.section-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}

.profile-rail {
  display: grid;
  gap: 24px;
}

.rail-block {
  padding-top: 10px;
  border-top: 1px solid var(--color-ink);
}

.rail-block h2 {
  margin: 0 0 8px;
  font-size: var(--text-h3);
}

.rail-copy {
  margin: 0 0 10px;
  color: var(--color-muted);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.rail-list {
  margin: 0;
}

.rail-list div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 7px 0;
  border-bottom: 1px solid var(--color-line);
}

.rail-list dt {
  color: var(--color-muted);
  font-size: 0.75rem;
}

.rail-list dd {
  margin: 0;
  overflow-wrap: anywhere;
  font-family: var(--font-data);
  font-size: 0.6875rem;
  text-align: right;
}

.rail-link {
  display: inline-flex;
  align-items: center;
  min-height: var(--touch-target);
  color: var(--color-signal-strong);
  font-size: 0.8125rem;
  font-weight: 650;
  text-decoration: underline;
  text-underline-offset: 0.18em;
}

.inline-notice,
.inline-error,
.inline-warning {
  margin: 0;
  padding: 10px 12px;
  border-radius: var(--radius-control);
  font-size: 0.8125rem;
  line-height: 1.45;
}

.inline-notice {
  border: 1px solid #cfe6bf;
  background: var(--color-success-bg);
  color: var(--color-success-ink);
}

.inline-error {
  border: 1px solid #f7d1cd;
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.inline-warning {
  margin-top: 10px;
  border: 1px solid #f2d9b2;
  background: var(--color-warning-bg);
  color: var(--color-ink);
}

.profile-loading {
  display: grid;
  gap: 12px;
}

@media (max-width: 960px) {
  .page-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .profile-layout {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
</style>
