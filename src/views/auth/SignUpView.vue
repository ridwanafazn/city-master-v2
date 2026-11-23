<template>
  <AuthShell title="Create Account" subtitle="Start with a JYMZ identity">
    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="pixel-label" for="signup-name">Display name</label>
        <input
          id="signup-name"
          v-model.trim="name"
          type="text"
          class="pixel-input"
          autocomplete="name"
          placeholder="Ridwan"
          required
        />
      </div>

      <div>
        <label class="pixel-label" for="signup-email">Email</label>
        <input
          id="signup-email"
          v-model.trim="email"
          type="email"
          class="pixel-input"
          autocomplete="email"
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label class="pixel-label" for="signup-password">Password</label>
        <input
          id="signup-password"
          v-model="password"
          type="password"
          class="pixel-input"
          autocomplete="new-password"
          minlength="8"
          placeholder="Minimal 8 karakter"
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
        {{ submitting ? 'Creating…' : 'Create Account >' }}
      </PixelButton>
    </form>

    <div class="mt-5 border-t-2 border-slate-200 pt-4 font-mono text-xs text-slate-600">
      Sudah punya akun?
      <RouterLink
        :to="{ name: 'sign-in', query: { redirectTo } }"
        class="font-black uppercase text-blue-700 hover:underline"
      >
        Masuk
      </RouterLink>
    </div>
  </AuthShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthShell from '../../components/auth/AuthShell.vue'
import PixelButton from '../../components/ui/PixelButton.vue'
import { isAuthConfigured } from '../../lib/auth'
import { safeRedirect } from '../../lib/navigation'
import { useAuthStore } from '../../stores/authStore'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const submitting = ref(false)
const localError = ref<string | null>(null)
const redirectTo = computed(() => safeRedirect(route.query.redirectTo))

async function submit() {
  localError.value = null
  if (!name.value || !email.value || !password.value) {
    localError.value = 'Nama, email, dan password wajib diisi.'
    return
  }
  if (password.value.length < 8) {
    localError.value = 'Password minimal 8 karakter.'
    return
  }
  submitting.value = true
  try {
    const ok = await auth.signUp(name.value, email.value, password.value)
    if (ok) {
      await router.replace(redirectTo.value)
    }
  } finally {
    submitting.value = false
  }
}
</script>
