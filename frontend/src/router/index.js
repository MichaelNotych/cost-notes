import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '../views/AuthView.vue'
import ExpensesView from '../views/ExpensesView.vue'
import BrandKitView from '../views/BrandKitView.vue'

import { useAuthStore } from '@/stores/auth'
import WeekView from '@/views/WeekView.vue'
import CalendarView from '@/views/CalendarView.vue'
import SettingsView from '@/views/SettingsView.vue'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/auth',
			name: 'AuthView',
			component: AuthView,
		},
		{
			path: '/',
			name: 'ExpensesView',
			component: ExpensesView,
			meta: { requiresAuth: true },
		},
		{
			path: '/week',
			name: 'WeekView',
			component: WeekView,
			meta: { requiresAuth: true },
		},
		{
			path: '/calendar',
			name: 'CalendarView',
			component: CalendarView,
			meta: { requiresAuth: true },
		},
		{
			path: '/settings',
			name: 'SettingsView',
			component: SettingsView,
			meta: { requiresAuth: true },
		},
		{
			path: '/brand-kit',
			name: 'BrandKitView',
			component: BrandKitView,
		},
	],
})

router.beforeEach((to, from, next) => {
	const authStore = useAuthStore()
	if (to.meta.requiresAuth) {
		if (authStore.isAuthenticated) {
			next()
		} else {
			next({ name: 'AuthView' })
		}
	} else {
		next()
	}
})

export default router
