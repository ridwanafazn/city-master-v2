<template>
  <AuthShell title="Sign In" subtitle="Access the JYMZ app console">
    <form class="space-y-4" @submit.prevent="submit">
      <div
        v-if="route.query.deleted === '1'"
        class="border-3 border-orange-700 bg-orange-50 p-3 font-mono text-xs text-orange-900"
      >
        Permintaan penghapusan akun diterima. Akun tidak dapat dipakai lagi setelah
        masa tenggang berakhir.
      </div>

      <div>
        <label class="pixel-label" for="signin-email">Email</label>
        <input
          id="signin-email"
          v-model.trim="email"
          type="email"
          class="pixel-input"
          autocomplete="email"
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label class="pixel-label" for="signin-password">Password</label>
        <input
          id="signin-password"
          v-model="password"
          type="password"
          class="pixel-input"
          autocomplete="current-password"
          placeholder="••••••••"
          required
        />
      </div>

      <div
        v-if="localError || auth.error"
        class="border-3 border-red-700 bg-red-50 p-3 font-mono text-xs text-red-800"
      >
        {{ localError || auth.error }}
      </div>

      <div
        v-if="!isAuthConfigured"
        class="border-3 border-yellow-700 bg-yellow-50 p-3 font-mono text-xs text-yellow-900"
      >
        VITE_NEON_AUTH_URL belum diisi. Salin URL Neon Auth branch ke
        <code>.env.local</code>.
      </div>

      <PixelButton type="submit" class="w-full" :disabled="submitting">
        {{ submitting ? 'Signing in…' : 'Sign In >' }}
      </PixelButton>
    </form>

    <div class="mt-5 border-t-2 border-slate-200 pt-4 font-mono text-xs text-slate-600">
      Belum punya akun?
      <RouterLink
        :to="{ name: 'sign-up', query: { redirectTo } }"
        class="font-black uppercase text-blue-700 hover:underline"
      >
        Buat akun
      </RouterLink>
    </div>
  </AuthShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthShell from '../../components/auth/AuthShell.vue'
import PixelButton from '../../components/ui/PixelButton.vue'
import { isAuthConfigured } from '../../lib/auth'
import { safeRedirect } from '../../lib/navigation'
import { useAuthStore } from '../../stores/authStore'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const submitting = ref(false)
const localError = ref<string | null>(null)
const redirectTo = computed(() => safeRedirect(route.query.redirectTo))

onMounted(() => {
  auth.error = null
})

async function submit() {
  localError.value = null
  if (!email.value || !password.value) {
    localError.value = 'Email dan password wajib diisi.'
    return
  }
  submitting.value = true
  try {
    const ok = await auth.signIn(email.value, password.value)
    if (ok) {
      await router.replace(auth.profileComplete ? redirectTo.value : '/app/onboarding')
    }
  } finally {
    submitting.value = false
  }
}
</script>
