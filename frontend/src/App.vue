<script setup>
import { watch } from 'vue'
import AppNavigation from './components/AppNavigation.vue'
import ToastContainer from './components/ToastContainer.vue'
import { useAuthStore } from '@/stores/auth'
import { useCategoriesStore } from '@/stores/categories'

const authStore = useAuthStore()
const categoriesStore = useCategoriesStore()

watch(
	() => authStore.isAuthenticated,
	(authenticated) => {
		if (authenticated && categoriesStore.categories.length === 0) {
			categoriesStore.fetchCategories()
		}
	},
	{ immediate: true },
)
</script>

<template>
	<div class="px-4 pt-6 pb-50 max-w-2xl mx-auto w-full">
		<main>
			<RouterView />
		</main>
		<AppNavigation v-if="authStore.isAuthenticated" />
		<ToastContainer />
	</div>
</template>

<style>
body {
	background-color: var(--color-zinc-800);
	color: var(--color-gray-300);
	margin: 0;
	padding: 0;
}
</style>
