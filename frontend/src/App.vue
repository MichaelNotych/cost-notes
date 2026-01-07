<script setup>
import { useAuthStore } from '@/stores/auth'
import AppButton from './components/AppButton.vue'

const authStore = useAuthStore()
</script>

<template>
	<div class="px-4 py-6 max-w-2xl mx-auto w-full">
		<header class="flex justify-center items-center mb-4">
			<nav>
				<ul class="flex items-center gap-6">
					<template v-if="authStore.isAuthenticated">
						<li>
							<RouterLink to="/"> Home </RouterLink>
						</li>
						<li>
							<RouterLink to="/categories"> Categories </RouterLink>
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
