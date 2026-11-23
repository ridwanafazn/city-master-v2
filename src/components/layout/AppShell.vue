<template>
  <div class="ui-v2-scope app-shell">
    <div class="app-layout">
      <aside class="app-sidebar">
        <RouterLink to="/app" class="app-brand">
          <span class="app-brand__mark">JYMZ</span>
          <span class="app-brand__sub">field log</span>
        </RouterLink>

        <nav class="app-nav" aria-label="Navigasi utama">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="app-nav__item"
            :class="{ 'is-active': isActive(item) }"
            :aria-current="isActive(item) ? 'page' : undefined"
            @mouseenter="prefetchRoute(item.to)"
            @focus="prefetchRoute(item.to)"
            @touchstart.passive="prefetchRoute(item.to)"
          >
            <component :is="item.icon" :size="18" :stroke-width="1.8" aria-hidden="true" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>

        <RouterLink
          to="/app/account"
          class="app-account"
          @mouseenter="prefetchRoute('/app/account')"
          @focus="prefetchRoute('/app/account')"
          @touchstart.passive="prefetchRoute('/app/account')"
        >
          <span class="app-avatar" aria-hidden="true">{{ initials }}</span>
          <span class="app-account__copy">
            <strong>{{ auth.displayName }}</strong>
            <small>{{ auth.email || 'Akun JYMZ' }}</small>
          </span>
          <Settings :size="16" aria-hidden="true" />
        </RouterLink>
      </aside>

      <div class="app-workspace">
        <header class="app-worktop">
          <RouterLink to="/app" class="app-brand app-brand--compact">
            <span class="app-brand__mark">JYMZ</span>
          </RouterLink>
          <RouterLink
            to="/app/account"
            class="app-avatar-link"
            :aria-label="`Akun ${auth.displayName}`"
          >
            <span class="app-avatar" aria-hidden="true">{{ initials }}</span>
          </RouterLink>
        </header>

        <div v-if="wake.visible.value" class="app-wake">
          <ServerWakeBanner
            :state="wake.state.value"
            :elapsed-seconds="wake.elapsed.value"
            :can-retry="wake.canRetry.value"
            @retry="wake.retry"
          />
        </div>

        <main class="app-main">
          <RouterView v-slot="{ Component }">
            <Transition name="page" mode="out-in">
              <component :is="Component" />
            </Transition>
          </RouterView>
        </main>
      </div>
    </div>

    <nav class="app-bottom" aria-label="Navigasi utama mobile">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="app-bottom__item"
        :class="{ 'is-active': isActive(item) }"
        :aria-current="isActive(item) ? 'page' : undefined"
        @mouseenter="prefetchRoute(item.to)"
        @focus="prefetchRoute(item.to)"
        @touchstart.passive="prefetchRoute(item.to)"
      >
        <component :is="item.icon" :size="20" :stroke-width="1.8" aria-hidden="true" />
        <span>{{ item.shortLabel }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, type Component } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { ChartColumn, ClipboardList, Dumbbell, House, Settings, UserRound } from '@lucide/vue'
import ServerWakeBanner from '../ui-v2/ServerWakeBanner.vue'
import { preloadUiFonts } from '../../lib/preloadFonts'
import { useServerWake } from '../../lib/useServerWake'
import { useAuthStore } from '../../stores/authStore'

interface NavItem {
  to: string
  label: string
  shortLabel: string
  icon: Component
  exact?: boolean
}

const auth = useAuthStore()
const route = useRoute()
const wake = useServerWake()

preloadUiFonts()
onMounted(() => {
  if (!auth.me) void auth.loadMe()
})

const navItems: NavItem[] = [
  { to: '/app', label: 'Hari ini', shortLabel: 'Hari ini', icon: House, exact: true },
  { to: '/app/plans', label: 'Plan', shortLabel: 'Plan', icon: ClipboardList },
  { to: '/app/workouts', label: 'Sesi', shortLabel: 'Sesi', icon: Dumbbell },
  { to: '/app/progress', label: 'Progres', shortLabel: 'Progres', icon: ChartColumn },
  { to: '/app/profile', label: 'Profil', shortLabel: 'Profil', icon: UserRound },
]

/**
 * Intent-based prefetch: warm the route chunk on hover/focus/touch before the
 * click lands. The router still owns the actual navigation.
 */
const routeChunks: Record<string, () => Promise<unknown>> = {
  '/app/plans': () => import('../../views/app/PlanListView.vue'),
  '/app/plans/new': () => import('../../views/app/PlanCreateView.vue'),
  '/app/workouts': () => import('../../views/app/WorkoutHistoryView.vue'),
  '/app/progress': () => import('../../views/app/ProgressView.vue'),
  '/app/profile': () => import('../../views/app/ProfileSettingsView.vue'),
  '/app/account': () => import('../../views/app/AccountView.vue'),
}
const prefetched = new Set<string>()

function prefetchRoute(path: string) {
  if (prefetched.has(path)) return
  const loader = routeChunks[path]
  if (!loader) return
  prefetched.add(path)
  void loader().catch(() => {
    // A failed prefetch is harmless; the router will retry on navigation.
  })
}

function isActive(item: NavItem): boolean {
  if (item.exact) return route.path === item.to
  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}

const initials = computed(() => {
  const words = auth.displayName.trim().split(/\s+/).filter(Boolean)
  const first = words[0]?.[0] ?? 'J'
  const second = words.length > 1 ? words[1]?.[0] : ''
  return `${first}${second}`.toUpperCase()
})
</script>

<style scoped>
.app-shell {
  min-height: 100dvh;
  background: var(--color-paper);
  color: var(--color-ink);
}

.app-layout {
  display: grid;
  grid-template-columns: 232px minmax(0, 1fr);
  min-height: 100dvh;
}

.app-sidebar {
  position: sticky;
  top: 0;
  display: flex;
  height: 100dvh;
  flex-direction: column;
  gap: 32px;
  padding: 24px 16px;
  border-right: 1px solid var(--color-line);
  background: var(--color-paper);
}

.app-brand {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  min-height: var(--touch-target);
  color: var(--color-ink);
  text-decoration: none;
}

.app-brand__mark {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
}

.app-brand__sub {
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.625rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.app-nav {
  display: grid;
  gap: 2px;
}

.app-nav__item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: var(--touch-target);
  padding: 0 12px;
  border-radius: var(--radius-control);
  color: var(--color-muted);
  font-family: var(--font-body);
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: none;
  transition:
    background-color var(--motion-fast) var(--ease-exit),
    color var(--motion-fast) var(--ease-exit);
}

.app-nav__item:hover {
  background: var(--color-surface);
  color: var(--color-ink);
}

.app-nav__item.is-active {
  background: var(--color-surface);
  color: var(--color-ink);
}

.app-nav__item.is-active :deep(svg) {
  color: var(--color-signal-strong);
}

.app-account {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 56px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--color-line);
  color: var(--color-ink);
  text-decoration: none;
}

.app-avatar {
  display: inline-grid;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--color-line);
  border-radius: 50%;
  background: var(--color-surface);
  font-family: var(--font-data);
  font-size: 0.6875rem;
  font-weight: 600;
}

.app-account__copy {
  display: grid;
  min-width: 0;
  flex: 1 1 auto;
  gap: 2px;
}

.app-account__copy strong {
  overflow: hidden;
  font-size: 0.8125rem;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-account__copy small {
  overflow: hidden;
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.625rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-workspace {
  min-width: 0;
}

.app-worktop {
  display: none;
}

.app-wake {
  max-width: var(--content-max);
  margin: 0 auto;
  padding: 16px var(--gutter-desktop) 0;
}

.app-main {
  width: 100%;
  max-width: var(--content-max);
  margin: 0 auto;
  padding: 32px var(--gutter-desktop) 64px;
}

.app-bottom {
  display: none;
}

@media (max-width: 1023px) {
  .app-layout {
    grid-template-columns: 1fr;
  }

  .app-sidebar {
    display: none;
  }

  .app-worktop {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px var(--gutter-mobile);
    border-bottom: 1px solid var(--color-line);
    background: var(--color-paper);
  }

  .app-brand--compact .app-brand__mark {
    font-size: 1.375rem;
  }

  .app-avatar-link {
    display: inline-flex;
    min-width: var(--touch-target);
    min-height: var(--touch-target);
    align-items: center;
    justify-content: center;
    text-decoration: none;
  }

  .app-wake {
    padding: 12px var(--gutter-mobile) 0;
  }

  .app-main {
    padding: 20px var(--gutter-mobile) 96px;
  }

  .app-bottom {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 30;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    padding: 6px 4px calc(6px + env(safe-area-inset-bottom, 0px));
    border-top: 1px solid var(--color-line);
    background: var(--color-paper);
  }

  .app-bottom__item {
    display: flex;
    min-height: 48px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    border-radius: var(--radius-control);
    color: var(--color-muted);
    font-family: var(--font-body);
    font-size: 0.625rem;
    font-weight: 600;
    text-decoration: none;
  }

  .app-bottom__item.is-active {
    background: var(--color-surface);
    color: var(--color-signal-strong);
  }
}
</style>
