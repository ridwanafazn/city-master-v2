<template>
  <div class="debug">
    <header class="debug-head">
      <div>
        <h1>Diagnostics</h1>
        <p>Route internal untuk memeriksa koneksi backend. Tidak ditautkan dari navigasi.</p>
      </div>
      <AppButton variant="secondary" :loading="loading" @click="check">
        Periksa ulang
      </AppButton>
    </header>

    <dl class="debug-list">
      <div><dt>API base URL</dt><dd>{{ appStore.apiBaseUrl }}</dd></div>
      <div><dt>Health</dt><dd>{{ appStore.health?.status ?? '—' }}</dd></div>
      <div><dt>Ready</dt><dd>{{ appStore.ready?.status ?? '—' }}</dd></div>
      <div><dt>Database</dt><dd>{{ appStore.databaseLabel }}</dd></div>
      <div><dt>Redis</dt><dd>{{ appStore.redisLabel }}</dd></div>
      <div><dt>Rate limit</dt><dd>{{ appStore.rateLimitLabel }}</dd></div>
      <div><dt>Dataset</dt><dd>{{ appStore.datasetLabel }}</dd></div>
      <div><dt>Environment</dt><dd>{{ appStore.health?.environment ?? '—' }}</dd></div>
      <div><dt>Last check</dt><dd>{{ appStore.lastCheckedAt ?? '—' }}</dd></div>
    </dl>

    <div v-if="appStore.error" class="debug-error" role="alert">
      <strong>{{ appStore.errorCode || 'backend_error' }}</strong>
      <p>{{ appStore.error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppButton from '../../components/ui-v2/AppButton.vue'
import { useAppStore } from '../../stores/appStore'

const appStore = useAppStore()
const loading = ref(false)

async function check() {
  loading.value = true
  try {
    await appStore.checkBackend()
  } finally {
    loading.value = false
  }
}

onMounted(check)
</script>

<style scoped>
.debug {
  display: grid;
  gap: 24px;
  max-width: 820px;
}

.debug-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-ink);
}

.debug-head h1 {
  margin: 0;
  font-size: var(--text-h1);
}

.debug-head p {
  margin: 8px 0 0;
  color: var(--color-muted);
  font-size: var(--text-small);
}

.debug-list {
  margin: 0;
  border-top: 1px solid var(--color-line);
}

.debug-list div {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-line);
}

.debug-list dt {
  color: var(--color-muted);
  font-size: 0.8125rem;
}

.debug-list dd {
  margin: 0;
  overflow-wrap: anywhere;
  font-family: var(--font-data);
  font-size: 0.75rem;
}

.debug-error {
  padding: 14px 16px;
  border: 1px solid #f7d1cd;
  border-radius: var(--radius-control);
  background: var(--color-danger-bg);
}

.debug-error strong {
  font-family: var(--font-data);
  font-size: 0.75rem;
  color: var(--color-danger);
}

.debug-error p {
  margin: 4px 0 0;
  color: var(--color-ink);
  font-size: 0.8125rem;
}

@media (max-width: 640px) {
  .debug-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .debug-list div {
    grid-template-columns: 1fr;
    gap: 2px;
  }
}
</style>
