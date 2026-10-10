import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/css/styles.css'

import { createToastPlugin } from './plugins/toast'
import { useAuthStore } from './stores/auth'
import { useExpensesStore, persistExpensesCache } from './stores/expenses'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(createToastPlugin())

app.mount('#app')

// Cached expenses render instantly on the next launch; the queue survives app restarts
const authStore = useAuthStore()
const expensesStore = useExpensesStore()
expensesStore.$subscribe((_mutation, state) => persistExpensesCache(state))

// Replay expenses created offline whenever we might be back online
const syncPending = () => {
	if (authStore.isAuthenticated) expensesStore.syncPending()
}
window.addEventListener('online', syncPending)
document.addEventListener('visibilitychange', () => {
	if (document.visibilityState === 'visible') syncPending()
})
syncPending()
