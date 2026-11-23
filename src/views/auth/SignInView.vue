<template>
  <AuthShell title="Masuk" description="Lanjutkan catatan latihan dan plan Anda.">
    <form class="auth-form" novalidate @submit.prevent="submit">
      <div v-if="route.query.deleted === '1'" class="auth-notice" role="status">
        Permintaan penghapusan akun diterima. Akun tidak dapat dipakai lagi setelah
        masa tenggang berakhir.
      </div>

      <AppInput
        v-model="email"
        label="Email"
        type="email"
        autocomplete="email"
        placeholder="nama@email.com"
        required
        :error="emailError"
      />
      <AppInput
        v-model="password"
        label="Password"
        type="password"
        autocomplete="current-password"
        placeholder="Password Anda"
        required
        :error="passwordError"
      />

      <p v-if="formError" class="auth-alert" role="alert">{{ formError }}</p>
      <p v-if="!isAuthConfigured" class="auth-alert auth-alert--muted" role="status">
        Login belum aktif di lingkungan ini.
      </p>

      <AppButton type="submit" block :loading="submitting">
        {{ submitting ? 'Memeriksa…' : 'Masuk' }}
      </AppButton>
    </form>

    <p class="auth-switch">
      Belum punya akun?
      <RouterLink :to="{ name: 'sign-up', query: { redirectTo } }">Buat akun</RouterLink>
    </p>
  </AuthShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthShell from '../../components/auth/AuthShell.vue'
import AppButton from '../../components/ui-v2/AppButton.vue'
import AppInput from '../../components/ui-v2/AppInput.vue'
import { isAuthConfigured } from '../../lib/auth'
import { safeRedirect } from '../../lib/navigation'
import { useAuthStore } from '../../stores/authStore'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const emailError = ref('')
const passwordError = ref('')
const formError = ref('')
const submitting = ref(false)
const redirectTo = computed(() => safeRedirect(route.query.redirectTo))

onMounted(() => {
  auth.error = null
  void auth.initialize().then(() => {
    if (auth.isAuthenticated) {
      void router.replace(auth.profileComplete ? redirectTo.value : '/app/onboarding')
    }
  })
})

function validate(): boolean {
  emailError.value = ''
  passwordError.value = ''
  formError.value = ''
  if (!email.value.trim()) emailError.value = 'Email wajib diisi.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    emailError.value = 'Format email belum benar.'
  }
  if (!password.value) passwordError.value = 'Password wajib diisi.'
  return !emailError.value && !passwordError.value
}

async function submit() {
  if (!validate()) return
  submitting.value = true
  try {
    const ok = await auth.signIn(email.value.trim(), password.value)
    if (ok) {
      await router.replace(auth.profileComplete ? redirectTo.value : '/app/onboarding')
    } else {
      formError.value = auth.error || 'Gagal masuk. Periksa email dan password.'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.auth-form {
  display: grid;
  gap: var(--space-4);
}

.auth-notice {
  padding: 12px 14px;
  border: 1px solid #f2d9b2;
  border-radius: var(--radius-control);
  background: var(--color-warning-bg);
  color: var(--color-ink);
  font-size: var(--text-small);
  line-height: 1.5;
}

.auth-alert {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid #f7d1cd;
  border-radius: var(--radius-control);
  background: var(--color-danger-bg);
  color: var(--color-danger);
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.45;
}

.auth-alert--muted {
  border-color: var(--color-line);
  background: var(--color-surface);
  color: var(--color-muted);
  font-weight: 500;
}

.auth-switch {
  margin: var(--space-4) 0 0;
  color: var(--color-muted);
  font-size: var(--text-small);
}

.auth-switch a {
  display: inline-flex;
  align-items: center;
  min-height: var(--touch-target);
  padding: 0 4px;
  margin: -12px -4px;
  color: var(--color-signal-strong);
  font-weight: 650;
  text-decoration: underline;
  text-underline-offset: 0.18em;
}
</style>
