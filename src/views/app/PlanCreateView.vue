<template>
  <div class="create-page">
    <header class="page-head">
      <div class="page-head__copy">
        <RouterLink to="/app/plans" class="back-link">
          <ArrowLeft :size="15" aria-hidden="true" />
          Daftar plan
        </RouterLink>
        <h1>Buat plan</h1>
        <p>
          Plan dibuat dari profil dan preferensi latihan. Cedera di profil dipakai
          sebagai batasan oleh rule engine dan GA di server.
        </p>
      </div>
    </header>

    <div v-if="planStore.error" class="inline-error" role="alert">
      <strong>{{ planStore.errorCode || 'plan_error' }}</strong>
      <p>{{ planStore.error }}</p>
      <p v-if="planStore.errorCode === 'plan_invalid'">
        Kombinasi cedera, equipment, dan fokus terlalu ketat untuk diisi dengan aman.
        Kurangi batasan atau ubah jumlah hari.
      </p>
    </div>

    <div v-if="profileStore.loading" class="create-loading" aria-busy="true">
      <Skeleton width="42%" height="1.5rem" />
      <Skeleton :lines="3" height="0.75rem" />
    </div>

    <EmptyState
      v-else-if="!profileStore.profile"
      title="Profil belum lengkap"
      description="JYMZ membutuhkan tinggi, berat, tujuan, dan level latihan sebelum membuat plan."
    >
      <template #icon><UserRound :size="24" /></template>
      <template #action>
        <AppButton @click="router.push('/app/onboarding')">
          Lengkapi profil
        </AppButton>
      </template>
    </EmptyState>

    <div v-else class="create-layout">
      <div class="create-form">
        <AppInput
          v-model="draft.title"
          label="Nama plan"
          maxlength="120"
          hint="Nama ini muncul di library dan riwayat sesi."
        />

        <section class="form-section" aria-labelledby="days-title">
          <div class="form-section__head">
            <h2 id="days-title">Hari tersedia</h2>
            <span class="type-data">{{ draft.available_days }} hari / minggu</span>
          </div>
          <SegmentedControl v-model="daysModel" label="Hari tersedia" :options="dayOptions" />
        </section>

        <section class="form-section" aria-labelledby="body-title">
          <div class="form-section__head">
            <h2 id="body-title">Fokus tubuh</h2>
            <span class="type-data">{{ draft.preferred_body_part.length }} / 5</span>
          </div>
          <p class="form-hint">Kosong berarti split mengikuti aturan otomatis.</p>
          <div class="chip-grid">
            <Chip
              v-for="part in BODY_PART_OPTIONS"
              :key="part"
              :selected="draft.preferred_body_part.includes(part)"
              :disabled="!draft.preferred_body_part.includes(part) && draft.preferred_body_part.length >= 5"
              @toggle="toggleBodyPart(part)"
            >
              {{ bodyPartLabel(part) }}
            </Chip>
          </div>
        </section>

        <section class="form-section" aria-labelledby="equipment-title">
          <div class="form-section__head">
            <h2 id="equipment-title">Equipment</h2>
            <div class="form-section__actions">
              <span class="type-data">{{ draft.preferred_equipment.length }} / 10</span>
              <AppButton
                v-if="draft.preferred_equipment.length"
                variant="ghost"
                size="sm"
                @click="draft.preferred_equipment = []"
              >
                Gunakan semua
              </AppButton>
            </div>
          </div>
          <p class="form-hint">
            Kosong berarti semua equipment dianggap tersedia. Pilih maksimal 10.
          </p>
          <div class="chip-grid">
            <Chip
              v-for="item in EQUIPMENT_OPTIONS"
              :key="item"
              :selected="draft.preferred_equipment.includes(item)"
              :disabled="!draft.preferred_equipment.includes(item) && draft.preferred_equipment.length >= 10"
              @toggle="toggleEquipment(item)"
            >
              {{ equipmentLabel(item) }}
            </Chip>
          </div>
        </section>

        <section class="form-section" aria-labelledby="seed-title">
          <div class="form-section__head">
            <h2 id="seed-title">Seed</h2>
            <span class="type-data">opsional</span>
          </div>
          <AppInput
            v-model="seedInput"
            label="Seed number"
            type="number"
            min="0"
            max="4294967295"
            hint="Isi seed untuk hasil yang reproducible."
          />
        </section>
      </div>

      <aside class="create-summary">
        <h2>Ringkasan</h2>
        <dl class="summary-list">
          <div><dt>Profil</dt><dd>{{ profileStore.profile.height_cm }} cm · {{ profileStore.profile.weight_kg }} kg</dd></div>
          <div><dt>Tujuan</dt><dd>{{ goalLabel(profileStore.profile.goal) }}</dd></div>
          <div><dt>Level</dt><dd>{{ experienceLabel(profileStore.profile.experience) }}</dd></div>
          <div><dt>Hari</dt><dd>{{ draft.available_days }}</dd></div>
          <div><dt>Cedera</dt><dd>{{ injuryTerms.length ? injuryTerms.map(injuryLabel).join(', ') : 'Tidak ada' }}</dd></div>
        </dl>

        <p class="summary-note">
          Split dan exercise dipilih oleh rule engine + GA di server. Hasil bisa
          di-lock, di-swap, atau di-regenerate per hari setelah plan dibuat.
        </p>

        <AppButton block :loading="planStore.saving" @click="generate">
          {{ planStore.saving ? 'Membuat plan…' : 'Generate plan' }}
        </AppButton>

        <RouterLink to="/app/plans" class="summary-back">Kembali ke library</RouterLink>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, UserRound } from '@lucide/vue'
import AppButton from '../../components/ui-v2/AppButton.vue'
import AppInput from '../../components/ui-v2/AppInput.vue'
import Chip from '../../components/ui-v2/Chip.vue'
import EmptyState from '../../components/ui-v2/EmptyState.vue'
import SegmentedControl from '../../components/ui-v2/SegmentedControl.vue'
import Skeleton from '../../components/ui-v2/Skeleton.vue'
import { AVAILABLE_DAYS_OPTIONS, BODY_PART_OPTIONS, bodyPartLabel } from '../../lib/planOptions'
import {
  EQUIPMENT_OPTIONS,
  equipmentLabel,
  EXPERIENCE_OPTIONS,
  GOAL_OPTIONS,
  injuryLabel,
} from '../../lib/profileOptions'
import { usePlanStore } from '../../stores/planStore'
import { useProfileStore } from '../../stores/profileStore'
import type { UiOption } from '../../components/ui-v2'

const router = useRouter()
const planStore = usePlanStore()
const profileStore = useProfileStore()

const draft = reactive({
  title: 'My JYMZ Plan',
  available_days: 3,
  preferred_body_part: [] as string[],
  preferred_equipment: [] as string[],
})
const seedInput = ref('')
const idempotencyKey = ref(crypto.randomUUID())
const injuryTerms = ref<string[]>([])

const dayOptions: UiOption[] = AVAILABLE_DAYS_OPTIONS.map((days) => ({
  value: String(days),
  label: `${days} hari`,
}))

const daysModel = computed({
  get: () => String(draft.available_days),
  set: (value: string) => {
    draft.available_days = Number(value)
  },
})

function goalLabel(value: string): string {
  return GOAL_OPTIONS.find((option) => option.value === value)?.label ?? value
}

function experienceLabel(value: string): string {
  return EXPERIENCE_OPTIONS.find((option) => option.value === value)?.label ?? value
}

function toggleBodyPart(part: string) {
  const index = draft.preferred_body_part.indexOf(part)
  if (index >= 0) {
    draft.preferred_body_part.splice(index, 1)
    return
  }
  if (draft.preferred_body_part.length < 5) {
    draft.preferred_body_part.push(part)
  }
}

function toggleEquipment(item: string) {
  const index = draft.preferred_equipment.indexOf(item)
  if (index >= 0) {
    draft.preferred_equipment.splice(index, 1)
    return
  }
  if (draft.preferred_equipment.length < 10) {
    draft.preferred_equipment.push(item)
  }
}

function resetKey() {
  idempotencyKey.value = crypto.randomUUID()
}

watch(
  draft,
  () => {
    resetKey()
  },
  { deep: true },
)

watch(seedInput, resetKey)

async function generate() {
  if (!profileStore.profile) {
    planStore.error = 'Profil belum lengkap.'
    return
  }
  const seedValue = seedInput.value.trim()
  const seed = seedValue ? Number(seedValue) : undefined
  const plan = await planStore.create(
    {
      title: draft.title || undefined,
      recommendation: {
        gender: profileStore.profile.gender,
        height_cm: profileStore.profile.height_cm,
        weight_kg: profileStore.profile.weight_kg,
        injuries: injuryTerms.value,
        available_days: draft.available_days,
        preferred_body_part: [...draft.preferred_body_part],
        preferred_equipment: [...draft.preferred_equipment],
        seed,
      },
    },
    idempotencyKey.value,
  )
  if (plan) {
    await router.push({ name: 'app-plan-detail', params: { planId: plan.id } })
  }
}

onMounted(async () => {
  await profileStore.load()
  injuryTerms.value = [...profileStore.injuryTerms]
  draft.preferred_equipment = [...profileStore.equipment].slice(0, 10)
  resetKey()
})
</script>

<style scoped>
.create-page {
  display: grid;
  gap: var(--space-5);
}

.page-head {
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--color-ink);
}

.page-head__copy h1 {
  margin: 8px 0 0;
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

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: var(--touch-target);
  color: var(--color-muted);
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
}

.back-link:hover {
  color: var(--color-ink);
}

.create-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(260px, 0.65fr);
  gap: 48px;
  align-items: start;
}

.create-form {
  display: grid;
  gap: var(--space-5);
}

.form-section {
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-line);
}

.form-section__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.form-section__head h2 {
  margin: 0;
  font-size: var(--text-h3);
}

.form-section__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-hint {
  margin: 0 0 12px;
  color: var(--color-muted);
  font-size: 0.8125rem;
  line-height: 1.45;
}

.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.create-summary {
  position: sticky;
  top: 24px;
  display: grid;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--color-ink);
  border-radius: var(--radius-card);
  background: var(--color-surface-raised);
}

.create-summary h2 {
  margin: 0;
  font-size: var(--text-h3);
}

.summary-list {
  margin: 0;
  border-top: 1px solid var(--color-line);
}

.summary-list div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-line);
}

.summary-list dt {
  color: var(--color-muted);
  font-size: 0.75rem;
}

.summary-list dd {
  margin: 0;
  font-family: var(--font-data);
  font-size: 0.75rem;
  text-align: right;
}

.summary-note {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.summary-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--touch-target);
  color: var(--color-muted);
  font-size: 0.8125rem;
  text-decoration: underline;
  text-underline-offset: 0.18em;
}

.inline-error {
  margin: 0;
  padding: 12px 14px;
  border: 1px solid #f7d1cd;
  border-radius: var(--radius-control);
  background: var(--color-danger-bg);
  color: var(--color-ink);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.inline-error strong {
  color: var(--color-danger);
  font-family: var(--font-data);
  font-size: 0.75rem;
}

.inline-error p {
  margin: 4px 0 0;
}

.create-loading {
  display: grid;
  gap: 12px;
}

@media (max-width: 900px) {
  .create-layout {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .create-summary {
    position: static;
    order: -1;
  }
}
</style>
