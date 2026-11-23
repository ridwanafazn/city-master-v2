<template>
  <div class="space-y-8">
    <header class="border-b-4 border-slate-900 pb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-blue-500 text-white border-2 border-slate-900 px-2 py-1 font-mono text-[10px] font-black uppercase">
            M3 · New Plan
          </span>
          <span class="font-mono text-[10px] text-slate-500 uppercase">Server-generated</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-black uppercase tracking-tighter">
          Generate <span class="text-blue-600">Plan</span>
        </h1>
        <p class="text-slate-600 mt-2 font-mono text-sm max-w-2xl">
          Plan dibuat dari profil dan preferensi latihan. Cedera dari profil
          otomatis dipakai sebagai constraint.
        </p>
      </div>
      <RouterLink to="/app/plans" class="pixel-button text-xs font-black uppercase inline-flex items-center">
        < Plan Library
      </RouterLink>
    </header>

    <div
      v-if="planStore.error"
      class="border-3 border-red-700 bg-red-50 p-3 font-mono text-xs text-red-800"
    >
      <p class="font-black uppercase">{{ planStore.errorCode || 'error' }}</p>
      <p>{{ planStore.error }}</p>
      <p v-if="planStore.errorCode === 'plan_invalid'" class="mt-2">
        Kombinasi cedera, equipment, dan fokus terlalu ketat untuk diisi dengan
        aman. Kurangi cedera/constraint di profile atau ubah jumlah hari.
      </p>
    </div>

    <div v-if="profileStore.loading" class="font-mono text-sm text-slate-500">
      Loading profile…
    </div>

    <template v-else>
      <div
        v-if="injuryTerms.length"
        class="border-3 border-yellow-700 bg-yellow-50 p-3 font-mono text-xs text-yellow-900"
      >
        Constraint cedera aktif:
        <strong>{{ injuryTerms.map(injuryLabel).join(', ') }}</strong>.
        Plan tidak akan memakai area tersebut.
      </div>

      <PixelCard title="Plan Settings">
        <div class="space-y-5">
          <div>
            <label class="pixel-label" for="plan-title">Title</label>
            <input
              id="plan-title"
              v-model.trim="draft.title"
              class="pixel-input"
              type="text"
              maxlength="120"
              placeholder="My weekly plan"
            />
          </div>

          <div>
            <label class="pixel-label">Available days / week</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="days in AVAILABLE_DAYS_OPTIONS"
                :key="days"
                type="button"
                class="border-2 border-slate-900 px-3 py-1.5 font-mono text-xs font-black uppercase"
                :class="draft.available_days === days ? 'bg-slate-900 text-white' : 'bg-white'"
                @click="draft.available_days = days"
              >
                {{ days }} days
              </button>
            </div>
          </div>

          <div>
            <label class="pixel-label">Preferred body parts (max 5)</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="part in BODY_PART_OPTIONS"
                :key="part"
                type="button"
                class="border-2 border-slate-900 px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase"
                :class="draft.preferred_body_part.includes(part) ? 'bg-blue-500 text-white' : 'bg-white'"
                @click="toggleBodyPart(part)"
              >
                {{ bodyPartLabel(part) }}
              </button>
            </div>
            <p class="mt-2 font-mono text-[10px] text-slate-500">
              Kosong berarti split mengikuti aturan otomatis.
            </p>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="pixel-label mb-0">Preferred equipment (max 10)</label>
              <button
                type="button"
                class="font-mono text-[10px] font-black uppercase underline"
                @click="draft.preferred_equipment = []"
              >
                Use all
              </button>
            </div>
            <EquipmentPicker v-model="draft.preferred_equipment" :max="10" />
          </div>

          <div>
            <label class="pixel-label" for="plan-seed">Seed (optional)</label>
            <input
              id="plan-seed"
              v-model="seedInput"
              class="pixel-input"
              type="number"
              min="0"
              :max="4294967295"
              placeholder="Random"
            />
            <p class="mt-1 font-mono text-[10px] text-slate-500">
              Isi seed untuk hasil yang reproducible.
            </p>
          </div>
        </div>
      </PixelCard>

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t-4 border-slate-900 pt-4">
        <div class="font-mono text-xs text-slate-600">
          <p>Profile: {{ profileStore.profile?.height_cm }} cm / {{ profileStore.profile?.weight_kg }} kg</p>
          <p>Split dan exercise dipilih oleh rule engine + GA di server.</p>
        </div>
        <PixelButton :disabled="planStore.saving" @click="generate">
          {{ planStore.saving ? 'Generating…' : 'Generate Plan >' }}
        </PixelButton>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import EquipmentPicker from '../../components/profile/EquipmentPicker.vue'
import PixelButton from '../../components/ui/PixelButton.vue'
import PixelCard from '../../components/ui/PixelCard.vue'
import { AVAILABLE_DAYS_OPTIONS, BODY_PART_OPTIONS, bodyPartLabel } from '../../lib/planOptions'
import { injuryLabel } from '../../lib/profileOptions'
import { usePlanStore } from '../../stores/planStore'
import { useProfileStore } from '../../stores/profileStore'

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
