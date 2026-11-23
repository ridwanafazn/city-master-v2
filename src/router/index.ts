// src/router/index.ts

import { createRouter, createWebHistory } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    requiresProfile?: boolean
    guestOnly?: boolean
  }
}

async function getAuthStore() {
  const { useAuthStore } = await import('../stores/authStore')
  return useAuthStore()
}

/**
 * Public recommendation flow + authenticated JYMZ application.
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'config',
      component: () => import('../views/ConfigView.vue'),
      meta: { title: 'Parameter latihan | JYMZ' },
    },
    {
      path: '/process',
      name: 'process',
      component: () => import('../views/ProcessView.vue'),
      meta: { title: 'Konsol optimasi | JYMZ' },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { title: 'Hasil optimasi | JYMZ' },
    },
    {
      path: '/style-guide',
      name: 'style-guide',
      component: () => import('../views/StyleGuideView.vue'),
      meta: { title: 'Style guide | JYMZ' },
    },
    {
      path: '/auth/sign-in',
      name: 'sign-in',
      component: () => import('../views/auth/SignInView.vue'),
      meta: { title: 'Masuk | JYMZ', guestOnly: true },
    },
    {
      path: '/auth/sign-up',
      name: 'sign-up',
      component: () => import('../views/auth/SignUpView.vue'),
      meta: { title: 'Buat akun | JYMZ', guestOnly: true },
    },
    {
      path: '/shared/:token',
      name: 'shared-plan',
      component: () => import('../views/shared/PublicPlanView.vue'),
      meta: { title: 'Plan dibagikan | JYMZ' },
    },
    {
      path: '/app',
      component: () => import('../components/layout/AppShell.vue'),
      meta: { title: 'Aplikasi | JYMZ', requiresAuth: true },
      children: [
        {
          path: '',
          name: 'app-home',
          component: () => import('../views/app/AppHomeView.vue'),
          meta: { title: 'Hari ini | JYMZ' },
        },
        {
          path: 'account',
          name: 'app-account',
          component: () => import('../views/app/AccountView.vue'),
          meta: { title: 'Akun | JYMZ' },
        },
        {
          path: 'onboarding',
          name: 'app-onboarding',
          component: () => import('../views/app/OnboardingView.vue'),
          meta: { title: 'Siapkan profil | JYMZ' },
        },
        {
          path: 'profile',
          name: 'app-profile',
          component: () => import('../views/app/ProfileSettingsView.vue'),
          meta: { title: 'Profil latihan | JYMZ' },
        },
        {
          path: 'plans',
          name: 'app-plans',
          component: () => import('../views/app/PlanListView.vue'),
          meta: { title: 'Plan | JYMZ', requiresProfile: true },
        },
        {
          path: 'plans/new',
          name: 'app-plan-new',
          component: () => import('../views/app/PlanCreateView.vue'),
          meta: { title: 'Buat plan | JYMZ', requiresProfile: true },
        },
        {
          path: 'plans/:planId',
          name: 'app-plan-detail',
          component: () => import('../views/app/PlanDetailView.vue'),
          meta: { title: 'Detail plan | JYMZ', requiresProfile: true },
        },
        {
          path: 'workouts',
          name: 'app-workouts',
          component: () => import('../views/app/WorkoutHistoryView.vue'),
          meta: { title: 'Riwayat sesi | JYMZ', requiresProfile: true },
        },
        {
          path: 'workouts/:workoutId',
          name: 'app-workout-detail',
          component: () => import('../views/app/WorkoutDetailView.vue'),
          meta: { title: 'Sesi latihan | JYMZ', requiresProfile: true },
        },
        {
          path: 'progress',
          name: 'app-progress',
          component: () => import('../views/app/ProgressView.vue'),
          meta: { title: 'Progres | JYMZ', requiresProfile: true },
        },
        {
          path: 'debug',
          name: 'app-debug',
          component: () => import('../views/app/DebugView.vue'),
          meta: { title: 'Diagnostics | JYMZ', requiresAuth: true },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  document.title = to.meta.title || 'JYMZ'

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    const auth = await getAuthStore()
    await auth.ensureSession()
    if (!auth.isAuthenticated) {
      return {
        name: 'sign-in',
        query: { redirectTo: to.fullPath },
        replace: true,
      }
    }
  }

  if (to.matched.some((record) => record.meta.requiresProfile)) {
    const auth = await getAuthStore()
    await auth.ensureSession()
    if (!auth.isAuthenticated) {
      return {
        name: 'sign-in',
        query: { redirectTo: to.fullPath },
        replace: true,
      }
    }
    if (!auth.me) {
      await auth.loadMe()
    }
    if (auth.me && !auth.profileComplete) {
      return {
        name: 'app-onboarding',
        query: { redirectTo: to.fullPath },
        replace: true,
      }
    }
  }

  // guestOnly pages render immediately and redirect themselves if a session
  // already exists. Blocking here used to delay the sign-in form behind
  // Neon Auth get-session on every visit.

  return true
})

export default router
