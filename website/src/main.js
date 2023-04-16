import { createApp } from 'vue'
import { createPinia } from 'pinia'

import * as config from "./configuration";
import router from "./router";
import App from './App.vue'

import './assets/main.css'

const app = createApp(App)
app.config.globalProperties.$api_server_url = config.SERVER_URL
app.config.globalProperties.$max_level_format_version = config.MAX_FORMAT_VERSION

app.use(router)
app.use(createPinia())

app.mount('#app')
