// src/router/index.ts

import { createRouter, createWebHistory } from 'vue-router'

/**
 * Tabel Routing untuk Fitness-RS Engine.
 * Mengatur alur (flow) 3 halaman utama: Config -> Process -> Dashboard.
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'config',
      // Lazy loading: komponen hanya diunduh saat user membuka halaman ini
      component: () => import('../views/ConfigView.vue'),
      meta: { title: 'Engine Parameters | Fitness-RS' }
    },
    {
      path: '/process',
      name: 'process',
      component: () => import('../views/ProcessView.vue'),
      meta: { title: 'Optimization Console | Fitness-RS' }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { title: 'Dashboard | Fitness-RS' }
    },
    // Fallback route: melempar user kembali ke halaman utama jika URL tidak ditemukan
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
  // Menjaga posisi scroll tetap di atas saat pindah halaman
  scrollBehavior() {
    return { top: 0 }
  }
})

/**
 * Global Navigation Guard.
 * Bertugas mengubah judul tab browser (document.title) secara dinamis
 * sesuai dengan meta.title yang didefinisikan pada routes di atas.
 */
router.beforeEach((to, _from, next) => {
  const defaultTitle = 'Fitness-RS Engine'
  document.title = (to.meta.title as string) || defaultTitle
  
  // (Opsional) Di masa depan, proteksi rute bisa ditambahkan di sini.
  // Contoh: Cegah masuk ke '/dashboard' jika Pinia store belum memiliki data hasil optimasi.
  
  next()
})

export default router