import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/Home.vue'
import Shop from '@/views/Shop.vue'
import Study from '@/views/Study.vue'
import Gallery from '@/views/Gallery.vue'
import Visit from '@/views/Visit.vue'
import Chat from '@/views/Chat.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/shop', component: Shop },
  { path: '/study', component: Study },
  { path: '/gallery', component: Gallery },
  { path: '/visit', component: Visit },
  { path: '/chat', component: Chat },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
