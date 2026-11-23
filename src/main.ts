import './styles/tokens.css'
import './styles/ui-v2.css'
import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { setAuthTokenProvider, setUnauthorizedHandler } from './api/client'
import { useAuthStore } from './stores/authStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const auth = useAuthStore(pinia)
setAuthTokenProvider(() => auth.getToken())
setUnauthorizedHandler(() => {
  auth.clearSession()
  const current = router.currentRoute.value
  if (current.matched.some((record) => record.meta.requiresAuth)) {
    void router.replace({
      name: 'sign-in',
      query: { redirectTo: current.fullPath },
    })
  }
})

app.use(router)
void auth.initialize()
app.mount('#app')
