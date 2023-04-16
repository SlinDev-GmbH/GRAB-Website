import { createRouter, createWebHistory } from 'vue-router'

import StartPage from './components/StartPage.vue'
import LevelBrowser from './components/LevelBrowser.vue'

const routes = [
  { path: '/', component: StartPage },
  { path: '/levels', component: LevelBrowser }
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})

export default router
