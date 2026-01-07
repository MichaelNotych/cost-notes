<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import AppButton from './components/AppButton.vue'

const authStore = useAuthStore()
const router = useRouter()

const logout = () => {
	authStore.logout()
	router.push('/auth')
}
</script>

<template>
	<div class="px-4 py-6 max-w-2xl mx-auto w-full">
		<header class="flex justify-between items-center mb-8">
			<RouterLink to="/" class="text-sky-600 font-bold text-lg">CN</RouterLink>
			<nav>
				<ul class="flex items-center gap-6">
					<template v-if="authStore.isAuthenticated">
						<li>
							<RouterLink
								to="/categories"
								class="text-sm transition-colors hover:text-sky-600"
								>Categories</RouterLink
							>
						</li>
						<li>
							<AppButton @click="logout" variant="secondary" size="sm">
								Logout
							</AppButton>
						</li>
					</template>
					<template v-else>
						<li>
							<AppButton variant="secondary" size="sm">
								<RouterLink to="/auth">Login</RouterLink>
							</AppButton>
						</li>
					</template>
				</ul>
			</nav>
		</header>
		<main>
			<RouterView />
		</main>
	</div>
</template>

<style>
body {
	background-color: var(--color-gray-950);
	color: var(--color-gray-100);
	margin: 0;
	padding: 0;
}
</style>
