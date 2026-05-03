import { createRouter, createWebHistory } from 'vue-router'
import Consultation from '../views/Consultation.vue'
import History from '../views/History.vue'

const routes = [
  {
    path: '/',
    name: 'Consultation',
    component: Consultation
  },
  {
    path: '/history',
    name: 'History',
    component: History
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
