<script setup>
import AppHeader from './components/AppHeader.vue'
</script>

<template>
	<div class="px-4 py-6 max-w-2xl mx-auto w-full">
		<main>
			<RouterView />
		</main>
		<AppHeader />
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
