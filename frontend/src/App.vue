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
	<!-- Opaque strip behind the translucent iOS status bar -->
	<div
		class="fixed inset-x-0 top-0 z-30 h-[env(safe-area-inset-top)] bg-zinc-800/90 backdrop-blur-md"
	/>

	<div
		class="px-4 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(8rem+env(safe-area-inset-bottom))] max-w-2xl mx-auto w-full"
	>
		<main>
			<RouterView v-slot="{ Component }">
				<!-- Tabs keep their state & data between switches; reset when the user changes -->
				<KeepAlive :key="authStore.user?._id ?? 'guest'" exclude="AuthView">
					<component :is="Component" />
				</KeepAlive>
			</RouterView>
		</main>
		<AppNavigation v-if="authStore.isAuthenticated" />
		<ToastContainer />
	</div>
</template>
