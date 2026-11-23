<template>
  <div class="plan-page">
    <header class="page-head">
      <div class="page-head__copy">
        <h1>Daftar plan</h1>
        <p>
          Program tersimpan, versi immutable, dan akses cepat ke hari latihan
          berikutnya.
        </p>
      </div>
      <div class="page-head__actions">
        <AppButton variant="secondary" :loading="planStore.loadingList" @click="refresh">
          Muat ulang
        </AppButton>
        <AppButton @click="router.push('/app/plans/new')">
          <Plus :size="17" aria-hidden="true" />
          Buat plan
        </AppButton>
      </div>
    </header>

    <ErrorState
      v-if="planStore.error && !planStore.plans.length"
      title="Plan tidak bisa dimuat"
      :message="planStore.error"
      @retry="refresh"
    />
    <p v-else-if="planStore.error" class="inline-error" role="alert">
      {{ planStore.error }}
    </p>

    <div v-if="planStore.loadingList && !planStore.plans.length" class="plan-loading" aria-busy="true">
      <div v-for="n in 3" :key="n" class="plan-loading__row">
        <Skeleton width="34%" height="1.25rem" />
        <Skeleton width="18%" height="0.75rem" />
      </div>
    </div>

    <EmptyState
      v-else-if="!planStore.plans.length"
      title="Belum ada plan tersimpan"
      description="Buat plan pertama dari profil, equipment, dan cedera Anda. Plan akan muncul di sini setelah dibuat."
    >
      <template #icon><ClipboardList :size="24" /></template>
      <template #action>
        <AppButton @click="router.push('/app/plans/new')">
          <Plus :size="17" aria-hidden="true" />
          Buat plan
        </AppButton>
      </template>
    </EmptyState>

    <section v-else class="plan-ledger" aria-labelledby="plan-ledger-title">
      <div class="plan-ledger__head">
        <h2 id="plan-ledger-title">Plan tersimpan</h2>
        <span class="type-data">{{ planStore.plans.length }} plan</span>
      </div>

      <RouterLink
        v-for="plan in planStore.plans"
        :key="plan.id"
        :to="`/app/plans/${plan.id}`"
        class="plan-row"
      >
        <div class="plan-row__title">
          <h3>{{ plan.title }}</h3>
          <p>{{ splitLabel(plan.split_type) }} · {{ plan.day_count }} hari</p>
        </div>
        <div class="plan-row__meta">
          <span>v{{ plan.current_version }}</span>
          <span>{{ formatDate(plan.updated_at) }}</span>
        </div>
        <Badge :variant="statusVariant(plan.status)" :dot="plan.status === 'active'">
          {{ statusLabel(plan.status) }}
        </Badge>
        <span class="plan-row__open">
          Buka
          <ArrowRight :size="15" aria-hidden="true" />
        </span>
      </RouterLink>
    </section>

    <div v-if="planStore.nextCursor" class="load-more">
      <AppButton variant="secondary" :loading="planStore.loadingList" @click="loadMore">
        Muat lagi
      </AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, ClipboardList, Plus } from '@lucide/vue'
import AppButton from '../../components/ui-v2/AppButton.vue'
import Badge from '../../components/ui-v2/Badge.vue'
import EmptyState from '../../components/ui-v2/EmptyState.vue'
import ErrorState from '../../components/ui-v2/ErrorState.vue'
import Skeleton from '../../components/ui-v2/Skeleton.vue'
import { splitLabel } from '../../lib/planOptions'
import { usePlanStore } from '../../stores/planStore'

const planStore = usePlanStore()
const router = useRouter()

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function statusLabel(status: string): string {
  if (status === 'active') return 'Aktif'
  if (status === 'archived') return 'Arsip'
  return status
}

function statusVariant(status: string): 'success' | 'neutral' | 'outline' {
  if (status === 'active') return 'success'
  if (status === 'archived') return 'neutral'
  return 'outline'
}

function refresh() {
  void planStore.list(true)
}

function loadMore() {
  void planStore.list(false)
}

onMounted(() => {
  void planStore.list(true)
})
</script>

<style scoped>
.plan-page {
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

.plan-loading {
  border-top: 1px solid var(--color-ink);
}

.plan-loading__row {
  display: grid;
  gap: 10px;
  padding: 20px 0;
  border-bottom: 1px solid var(--color-line);
}

.plan-ledger {
  border-top: 1px solid var(--color-ink);
}

.plan-ledger__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
}

.plan-ledger__head h2 {
  margin: 0;
  font-size: var(--text-h3);
}

.plan-ledger__head span {
  color: var(--color-muted);
  font-size: 0.6875rem;
}

.plan-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto auto;
  gap: 24px;
  align-items: center;
  padding: 18px 0;
  border-bottom: 1px solid var(--color-line);
  color: var(--color-ink);
  text-decoration: none;
}

.plan-row:hover {
  background: var(--color-surface);
}

.plan-row__title h3 {
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.2;
}

.plan-row__title p {
  margin: 4px 0 0;
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
  text-transform: uppercase;
}

.plan-row__meta {
  display: grid;
  gap: 2px;
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.6875rem;
  text-align: right;
}

.plan-row__open {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-signal-strong);
  font-size: 0.8125rem;
  font-weight: 650;
}

.load-more {
  display: flex;
  justify-content: center;
  padding-top: var(--space-4);
}

.inline-error {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid #f7d1cd;
  border-radius: var(--radius-control);
  background: var(--color-danger-bg);
  color: var(--color-danger);
  font-size: 0.8125rem;
}

@media (max-width: 780px) {
  .page-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .plan-row {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px 16px;
  }

  .plan-row__meta {
    grid-column: 1;
    grid-row: 2;
    grid-auto-flow: column;
    justify-content: start;
    text-align: left;
  }

  .plan-row > :deep(.ui-badge) {
    grid-column: 2;
    grid-row: 1;
    justify-self: end;
  }

  .plan-row__open {
    grid-column: 2;
    grid-row: 2;
    justify-self: end;
  }
}
</style>
