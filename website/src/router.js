import { createRouter, createWebHistory } from 'vue-router'

import StartPage from './components/StartPage.vue'
import LevelBrowser from './components/LevelBrowser.vue'
import PlayerViewer from '../player-viewer/PlayerViewer.vue'
import Curation from './components/Curation.vue'

const routes = [
  { path: '/', component: StartPage },
  { path: '/levels', component: LevelBrowser },
  { path: '/player', component: PlayerViewer },
  { path: '/curation', component: Curation }
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})

export default router
