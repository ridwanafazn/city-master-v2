// src/router/index.ts

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    requiresProfile?: boolean
    guestOnly?: boolean
  }
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
      meta: { title: 'Engine Parameters | Fitness-RS' },
    },
    {
      path: '/process',
      name: 'process',
      component: () => import('../views/ProcessView.vue'),
      meta: { title: 'Optimization Console | Fitness-RS' },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { title: 'Dashboard | Fitness-RS' },
    },
    {
      path: '/auth/sign-in',
      name: 'sign-in',
      component: () => import('../views/auth/SignInView.vue'),
      meta: { title: 'Sign In | JYMZ', guestOnly: true },
    },
    {
      path: '/auth/sign-up',
      name: 'sign-up',
      component: () => import('../views/auth/SignUpView.vue'),
      meta: { title: 'Create Account | JYMZ', guestOnly: true },
    },
    {
      path: '/app',
      component: () => import('../components/layout/AppShell.vue'),
      meta: { title: 'App Console | JYMZ', requiresAuth: true },
      children: [
        {
          path: '',
          name: 'app-home',
          component: () => import('../views/app/AppHomeView.vue'),
          meta: { title: 'Control Room | JYMZ' },
        },
        {
          path: 'account',
          name: 'app-account',
          component: () => import('../views/app/AccountView.vue'),
          meta: { title: 'Account | JYMZ' },
        },
        {
          path: 'onboarding',
          name: 'app-onboarding',
          component: () => import('../views/app/OnboardingView.vue'),
          meta: { title: 'Profile Setup | JYMZ' },
        },
        {
          path: 'profile',
          name: 'app-profile',
          component: () => import('../views/app/ProfileSettingsView.vue'),
          meta: { title: 'Profile Settings | JYMZ' },
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
  document.title = to.meta.title || 'JYMZ App Console'
  const auth = useAuthStore()

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    await auth.initialize()
    if (!auth.isAuthenticated) {
      return {
        name: 'sign-in',
        query: { redirectTo: to.fullPath },
        replace: true,
      }
    }
  }

  if (to.matched.some((record) => record.meta.requiresProfile)) {
    await auth.initialize()
    if (!auth.isAuthenticated) {
      return {
        name: 'sign-in',
        query: { redirectTo: to.fullPath },
        replace: true,
      }
    }
    if (!auth.profileComplete) {
      return {
        name: 'app-onboarding',
        query: { redirectTo: to.fullPath },
        replace: true,
      }
    }
  }

  if (to.matched.some((record) => record.meta.guestOnly)) {
    await auth.initialize()
    if (auth.isAuthenticated) {
      return { name: 'app-home', replace: true }
    }
  }

  return true
})

export default router
