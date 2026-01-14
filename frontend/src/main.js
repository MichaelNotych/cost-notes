import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/css/styles.css'

import { createToastPlugin } from './plugins/toast'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(createToastPlugin())

app.mount('#app')
