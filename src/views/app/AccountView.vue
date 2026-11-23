<template>
  <div class="space-y-8">
    <header class="border-b-4 border-slate-900 pb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-blue-500 text-white border-2 border-slate-900 px-2 py-1 font-mono text-[10px] font-black uppercase">
            M2 · Profile & Consent
          </span>
          <span class="font-mono text-[10px] text-slate-500 uppercase">
            {{ auth.profileComplete ? 'Profile complete' : 'Profile incomplete' }}
          </span>
        </div>
        <h1 class="text-4xl md:text-5xl font-black uppercase tracking-tighter">
          Account <span class="text-blue-600">Console</span>
        </h1>
        <p class="text-slate-600 mt-2 font-mono text-sm">
          Neon Auth identity mapped to the FastAPI user record.
        </p>
      </div>
      <div class="flex gap-2">
        <RouterLink
          :to="auth.profileComplete ? '/app/profile' : '/app/onboarding'"
          class="pixel-button text-xs font-black uppercase inline-flex items-center"
        >
          {{ auth.profileComplete ? 'Edit Profile' : 'Complete Profile' }}
        </RouterLink>
        <PixelButton variant="secondary" :disabled="loading" @click="refresh">
          {{ loading ? 'Refreshing…' : 'Refresh /me' }}
        </PixelButton>
        <PixelButton variant="danger" @click="signOut">Sign Out</PixelButton>
      </div>
    </header>

    <div
      v-if="route.query.onboarding === 'done'"
      class="border-3 border-green-700 bg-green-50 p-3 font-mono text-xs text-green-900"
    >
      Profil berhasil disimpan. Data ini sekarang dipakai untuk plan dan workout.
    </div>

    <div
      v-if="auth.error"
      class="border-3 border-red-700 bg-red-50 p-3 font-mono text-xs text-red-800"
    >
      {{ auth.error }}
    </div>

    <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <PixelCard title="Identity" class="lg:col-span-2">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 font-mono text-sm">
          <StatusRow label="Display Name" :value="auth.displayName" />
          <StatusRow label="Email" :value="auth.email || '—'" />
          <StatusRow label="User ID" :value="auth.me?.user.id ?? '—'" />
          <StatusRow label="Auth Subject" :value="auth.user?.id ?? '—'" />
          <StatusRow label="Roles" :value="auth.roles.length ? auth.roles.join(', ') : 'user'" />
          <StatusRow label="Profile Complete" :value="auth.profileComplete ? 'yes' : 'no'" />
          <StatusRow label="Email Verified" :value="auth.user?.emailVerified ? 'yes' : 'no'" />
          <StatusRow label="Account Created" :value="createdAtLabel" />
        </div>
      </PixelCard>

      <PixelCard title="Consent State">
        <ul class="space-y-2 font-mono text-xs">
          <li
            v-for="(granted, kind) in auth.consents"
            :key="kind"
            class="flex items-center justify-between gap-3 border-b border-slate-200 pb-2 last:border-b-0"
          >
            <span class="uppercase text-slate-600">{{ kind }}</span>
            <span
              class="border-2 border-slate-900 px-2 py-0.5 font-black uppercase"
              :class="granted ? 'bg-green-300' : 'bg-slate-100 text-slate-500'"
            >
              {{ granted ? 'granted' : 'none' }}
            </span>
          </li>
          <li v-if="!Object.keys(auth.consents).length" class="text-slate-500">
            Belum ada data consent.
          </li>
        </ul>
        <p class="mt-4 text-[10px] font-mono text-slate-500 uppercase">
          Kelola consent di Profile Settings.
        </p>
      </PixelCard>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <PixelCard title="Profile & Consent">
        <p class="font-mono text-sm text-slate-600">
          Profil, equipment, cedera, consent, dan export data dikelola di halaman
          profile. Status lengkap:
          <strong>{{ auth.profileComplete ? 'COMPLETE' : 'INCOMPLETE' }}</strong>.
        </p>
        <div class="mt-4 flex flex-wrap gap-2">
          <RouterLink
            :to="auth.profileComplete ? '/app/profile' : '/app/onboarding'"
            class="pixel-button text-xs font-black uppercase inline-flex items-center"
          >
            {{ auth.profileComplete ? 'Open Profile Settings' : 'Start Onboarding' }}
          </RouterLink>
          <RouterLink to="/app" class="pixel-button text-xs font-black uppercase inline-flex items-center">
            < Back to Control Room
          </RouterLink>
        </div>
      </PixelCard>

      <PixelCard title="Danger Zone">
        <p class="font-mono text-xs text-slate-600">
          Ajukan penghapusan akun. Backend mencatat request dan menonaktifkan autentikasi;
          hard delete mengikuti retention job.
        </p>
        <div class="mt-4 flex flex-wrap gap-2">
          <PixelButton
            v-if="!confirmingDeletion"
            variant="danger"
            @click="confirmingDeletion = true"
          >
            Request Account Deletion
          </PixelButton>
          <template v-else>
            <PixelButton
              variant="danger"
              :disabled="deleting"
              @click="deleteAccount"
            >
              {{ deleting ? 'Submitting…' : 'Confirm Deletion' }}
            </PixelButton>
            <PixelButton variant="secondary" :disabled="deleting" @click="confirmingDeletion = false">
              Cancel
            </PixelButton>
          </template>
        </div>
        <p v-if="auth.deletion" class="mt-3 font-mono text-xs text-orange-700">
          Request {{ auth.deletion.status }} · scheduled
          {{ new Date(auth.deletion.scheduled_for).toLocaleString() }}
        </p>
      </PixelCard>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PixelButton from '../../components/ui/PixelButton.vue'
import PixelCard from '../../components/ui/PixelCard.vue'
import StatusRow from '../../components/ui/StatusRow.vue'
import { useAuthStore } from '../../stores/authStore'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const loading = ref(false)
const deleting = ref(false)
const confirmingDeletion = ref(false)

const createdAtLabel = computed(() => {
  const value = auth.me?.user.created_at
  return value ? new Date(value).toLocaleString() : '—'
})

async function refresh() {
  loading.value = true
  try {
    await auth.loadMe()
  } finally {
    loading.value = false
  }
}

async function signOut() {
  await auth.signOut()
  await router.replace({ name: 'sign-in' })
}

async function deleteAccount() {
  deleting.value = true
  try {
    const ok = await auth.requestDeletion()
    if (ok) {
      await router.replace({ name: 'sign-in', query: { deleted: '1' } })
    }
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  if (!auth.me) {
    void refresh()
  }
})
</script>
