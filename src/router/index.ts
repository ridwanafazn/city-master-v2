// src/router/index.ts

import { createRouter, createWebHistory } from 'vue-router'

/**
 * Public recommendation flow + application shell.
 *
 * M0 keeps /app open; M1 adds the Neon Auth guard and redirects anonymous
 * users to /login.
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
      path: '/app',
      component: () => import('../components/layout/AppShell.vue'),
      meta: { title: 'App Console | JYMZ' },
      children: [
        {
          path: '',
          name: 'app-home',
          component: () => import('../views/app/AppHomeView.vue'),
          meta: { title: 'Control Room | JYMZ' },
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

router.beforeEach((to, _from, next) => {
  const defaultTitle = 'JYMZ App Console'
  document.title = (to.meta.title as string) || defaultTitle
  next()
})

export default router
