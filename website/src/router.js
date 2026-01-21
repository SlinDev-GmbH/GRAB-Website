import { createRouter, createWebHistory } from 'vue-router';

const StartPage = () => import('./components/StartPage.vue');
const LevelBrowser = () => import('./components/LevelBrowser.vue');
const PlayerViewer = () => import('../player-viewer/PlayerViewer.vue');
const CurationPage = () => import('./components/CurationPage.vue');

const routes = [
	{ path: '/', component: StartPage },
	{ path: '/levels', component: LevelBrowser },
	{ path: '/player', component: PlayerViewer },
	{ path: '/curation', component: CurationPage },
	{ path: '/:pathMatch(.*)*', redirect: '/' },
	{ path: '/levels/:pathMatch(.*)*', redirect: '/levels' },
];

const router = createRouter({
	history: createWebHistory(),
	routes: routes,
});

export default router;
