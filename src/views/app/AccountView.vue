<template>
  <div class="account-page">
    <header class="page-head">
      <div class="page-head__copy">
        <h1>Akun</h1>
        <p>Identitas, consent, dan kontrol akses JYMZ. Data latihan tetap di profil.</p>
      </div>
      <div class="page-head__actions">
        <AppButton variant="secondary" :loading="loading" @click="refresh">Muat ulang</AppButton>
        <AppButton :disabled="!auth.profileComplete" @click="router.push('/app/profile')">
          Edit profil
        </AppButton>
        <AppButton variant="ghost" @click="signOut">Keluar</AppButton>
      </div>
    </header>

    <p v-if="route.query.onboarding === 'done'" class="inline-notice" role="status">
      Profil berhasil disimpan. Data ini sekarang dipakai untuk plan dan workout.
    </p>
    <p v-if="auth.error" class="inline-error" role="alert">{{ auth.error }}</p>

    <div class="account-layout">
      <div class="account-main">
        <section class="account-section" aria-labelledby="identity-title">
          <div class="section-head">
            <h2 id="identity-title">Identitas</h2>
            <Badge :variant="auth.profileComplete ? 'success' : 'warning'" dot>
              {{ auth.profileComplete ? 'Profil lengkap' : 'Profil belum lengkap' }}
            </Badge>
          </div>
          <dl class="identity-list">
            <div><dt>Nama</dt><dd>{{ auth.displayName }}</dd></div>
            <div><dt>Email</dt><dd>{{ auth.email || '—' }}</dd></div>
            <div><dt>Role</dt><dd>{{ auth.roles.length ? auth.roles.join(', ') : 'user' }}</dd></div>
            <div><dt>Email terverifikasi</dt><dd>{{ auth.user?.emailVerified ? 'Ya' : 'Belum' }}</dd></div>
            <div><dt>Bergabung</dt><dd>{{ createdAtLabel }}</dd></div>
          </dl>
        </section>

        <section class="account-section" aria-labelledby="consent-title">
          <div class="section-head">
            <h2 id="consent-title">Consent</h2>
            <span class="type-data">{{ activeConsentCount }} / 4 aktif</span>
          </div>
          <table class="consent-table">
            <caption class="sr-only">Status consent akun</caption>
            <tbody>
              <tr v-for="option in CONSENT_OPTIONS" :key="option.value">
                <th scope="row">{{ option.label }}</th>
                <td>
                  <Badge :variant="auth.consents[option.value] ? 'success' : 'neutral'">
                    {{ auth.consents[option.value] ? 'Aktif' : 'Tidak aktif' }}
                  </Badge>
                </td>
              </tr>
              <tr v-if="!Object.keys(auth.consents).length">
                <td colspan="2" class="muted">Belum ada data consent.</td>
              </tr>
            </tbody>
          </table>
          <p class="section-hint">Kelola consent di halaman profil.</p>
          <AppButton variant="secondary" size="sm" @click="router.push('/app/profile')">
            Kelola profil & consent
          </AppButton>
        </section>

        <section class="account-section" aria-labelledby="advanced-title">
          <details>
            <summary id="advanced-title">Advanced</summary>
            <p class="section-hint">
              Diagnostics backend dan detail identitas teknis.
            </p>
            <dl class="identity-list">
              <div><dt>User ID</dt><dd>{{ auth.me?.user.id ?? '—' }}</dd></div>
              <div><dt>Auth subject</dt><dd>{{ auth.user?.id ?? '—' }}</dd></div>
              <div><dt>Onboarding</dt><dd>{{ auth.profileComplete ? 'Selesai' : 'Belum selesai' }}</dd></div>
            </dl>
            <RouterLink to="/app/debug" class="text-link">Buka diagnostics</RouterLink>
          </details>
        </section>
      </div>

      <aside class="account-rail">
        <section class="rail-block" aria-labelledby="data-title">
          <h2 id="data-title">Data</h2>
          <p class="rail-copy">
            Unduh salinan data akun dari halaman profil.
          </p>
          <RouterLink to="/app/profile" class="text-link">Buka profil</RouterLink>
        </section>

        <section class="rail-block rail-danger" aria-labelledby="danger-title">
          <h2 id="danger-title">Hapus akun</h2>
          <p class="rail-copy">
            Ajukan penghapusan akun. Backend menonaktifkan autentikasi dan
            menjalankan retention job.
          </p>
          <p v-if="auth.deletion" class="deletion-note" role="status">
            Request {{ auth.deletion.status }} · dijadwalkan
            {{ new Date(auth.deletion.scheduled_for).toLocaleDateString('id-ID') }}
          </p>
          <AppButton variant="danger" size="sm" @click="deleteDialogOpen = true">
            Hapus akun
          </AppButton>
        </section>
      </aside>
    </div>

    <Dialog
      v-model:open="deleteDialogOpen"
      title="Hapus akun ini?"
      description="Akun akan dinonaktifkan dan data mengikuti masa tenggang penghapusan. Anda akan keluar dari sesi ini."
      tone="danger"
      confirm-label="Ajukan penghapusan"
      :loading="deleting"
      @confirm="deleteAccount"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppButton from '../../components/ui-v2/AppButton.vue'
import Badge from '../../components/ui-v2/Badge.vue'
import Dialog from '../../components/ui-v2/Dialog.vue'
import { CONSENT_OPTIONS } from '../../lib/profileOptions'
import { useAuthStore } from '../../stores/authStore'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const loading = ref(false)
const deleting = ref(false)
const deleteDialogOpen = ref(false)

const createdAtLabel = computed(() => {
  const value = auth.me?.user.created_at
  return value
    ? new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value))
    : '—'
})
const activeConsentCount = computed(
  () => Object.values(auth.consents).filter(Boolean).length,
)

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
      deleteDialogOpen.value = false
      await router.replace({ name: 'sign-in', query: { deleted: '1' } })
    }
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  if (!auth.me) void refresh()
})
</script>

<style scoped>
.account-page {
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
  max-width: 60ch;
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

.account-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(250px, 0.6fr);
  gap: 40px;
  align-items: start;
}

.account-main {
  display: grid;
  gap: 28px;
}

.account-section {
  padding-top: 16px;
  border-top: 1px solid var(--color-ink);
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.section-head h2 {
  margin: 0;
  font-size: var(--text-h3);
}

.identity-list {
  margin: 0;
}

.identity-list div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding: 9px 0;
  border-bottom: 1px solid var(--color-line);
}

.identity-list dt {
  color: var(--color-muted);
  font-size: 0.8125rem;
}

.identity-list dd {
  margin: 0;
  overflow-wrap: anywhere;
  font-family: var(--font-data);
  font-size: 0.75rem;
  text-align: right;
}

.consent-table {
  width: 100%;
  border-collapse: collapse;
}

.consent-table th,
.consent-table td {
  padding: 9px 0;
  border-bottom: 1px solid var(--color-line);
  text-align: left;
}

.consent-table th {
  color: var(--color-muted);
  font-size: 0.8125rem;
  font-weight: 500;
}

.consent-table td {
  text-align: right;
}

.section-hint {
  margin: 10px 0;
  color: var(--color-muted);
  font-size: 0.8125rem;
  line-height: 1.45;
}

.account-rail {
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

.rail-danger {
  border-top-color: #f7d1cd;
}

.deletion-note {
  margin: 0 0 10px;
  color: var(--color-warning);
  font-family: var(--font-data);
  font-size: 0.6875rem;
}

.text-link {
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
.inline-error {
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

.muted {
  color: var(--color-muted);
}

@media (max-width: 960px) {
  .page-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .account-layout {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
</style>
