import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import * as config from './configuration';
import router from './router';
import App from './App.vue';

import './assets/main.css';

const app = createApp(App);
app.config.globalProperties.$api_server_url = config.SERVER_URL;
app.config.globalProperties.$images_server_url = config.IMAGES_SERVER_URL;
app.config.globalProperties.$page_url = config.PAGE_URL;
app.config.globalProperties.$max_level_format_version = config.MAX_FORMAT_VERSION;

app.config.unwrapInjectedRef = true;

app.use(router);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

app.mount('#app');
