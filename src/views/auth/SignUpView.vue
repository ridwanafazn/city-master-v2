<template>
  <AuthShell title="Buat akun" description="Mulai dengan profil latihan yang bisa Anda ubah kapan saja.">
    <form class="auth-form" novalidate @submit.prevent="submit">
      <AppInput
        v-model="name"
        label="Nama tampilan"
        autocomplete="name"
        placeholder="Nama Anda"
        required
        :error="nameError"
      />
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
        autocomplete="new-password"
        placeholder="Minimal 8 karakter"
        hint="Minimal 8 karakter. Gunakan kombinasi yang tidak dipakai di layanan lain."
        required
        :error="passwordError"
      />

      <p v-if="formError" class="auth-alert" role="alert">{{ formError }}</p>
      <p v-if="!isAuthConfigured" class="auth-alert auth-alert--muted" role="status">
        Pendaftaran belum aktif di lingkungan ini.
      </p>

      <AppButton type="submit" block :loading="submitting">
        {{ submitting ? 'Membuat akun…' : 'Buat akun' }}
      </AppButton>
    </form>

    <p class="auth-switch">
      Sudah punya akun?
      <RouterLink :to="{ name: 'sign-in', query: { redirectTo } }">Masuk</RouterLink>
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

const name = ref('')
const email = ref('')
const password = ref('')
const nameError = ref('')
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
  nameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  formError.value = ''
  if (!name.value.trim()) nameError.value = 'Nama wajib diisi.'
  if (!email.value.trim()) emailError.value = 'Email wajib diisi.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    emailError.value = 'Format email belum benar.'
  }
  if (!password.value) passwordError.value = 'Password wajib diisi.'
  else if (password.value.length < 8) passwordError.value = 'Password minimal 8 karakter.'
  return !nameError.value && !emailError.value && !passwordError.value
}

async function submit() {
  if (!validate()) return
  submitting.value = true
  try {
    const ok = await auth.signUp(name.value.trim(), email.value.trim(), password.value)
    if (ok) {
      await router.replace(auth.profileComplete ? redirectTo.value : '/app/onboarding')
    } else {
      formError.value = auth.error || 'Gagal membuat akun. Coba lagi.'
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
