import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '../views/AuthView.vue'
import ExpensesView from '../views/ExpensesView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import BrandKitView from '../views/BrandKitView.vue'

import { useAuthStore } from '@/stores/auth'
import WeekView from '@/views/WeekView.vue'

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
			path: '/categories',
			name: 'CategoriesView',
			component: CategoriesView,
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
