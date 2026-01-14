<script setup>
import AppHeader from './components/AppHeader.vue'
import ToastContainer from './components/ToastContainer.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
	<div class="px-2 py-6 max-w-2xl mx-auto w-full">
		<main>
			<RouterView />
		</main>
		<AppHeader v-if="authStore.isAuthenticated" />
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
