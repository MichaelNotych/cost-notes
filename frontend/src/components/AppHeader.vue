<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const menu = [
	{
		name: 'Expenses',
		path: '/',
	},
	{
		name: 'Categories',
		path: '/categories',
	},
]
</script>

<template>
	<header class="flex justify-center items-center gap-8 pb-6">
		<template v-if="authStore.isAuthenticated">
			<RouterLink
				v-for="item in menu"
				:key="item.name"
				:to="item.path"
				class="p-1"
				activeClass="border-b-2 border-sky-600 text-gray-400"
			>
				{{ item.name }}
			</RouterLink>
		</template>
		<template v-else>
			<img
				src="/favicon.svg"
				alt="Logo"
				width="64"
				height="64"
				class="border border-zinc-700 rounded-md"
			/>
		</template>
	</header>
</template>
