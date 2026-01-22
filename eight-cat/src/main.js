// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'   // 🔥 引入 Pinia

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)   // 🔥 注册 Pinia
app.use(router)

app.mount('#app')
