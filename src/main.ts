import './styles/tokens.css'
import './styles/ui-v2.css'
import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { installAuthBridge } from './lib/authBridge'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
installAuthBridge(router)

app.use(router)
app.mount('#app')
