import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '../views/AuthView.vue'
import DashboardView from '../views/DashboardView.vue'
import CategoriesView from '../views/CategoriesView.vue'

import { useAuthStore } from '@/stores/auth'

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
			name: 'DashboardView',
			component: DashboardView,
			meta: { requiresAuth: true },
		},
		{
			path: '/categories',
			name: 'CategoriesView',
			component: CategoriesView,
			meta: { requiresAuth: true },
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
