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
	<header class="flex justify-center items-center mb-6">
		<nav>
			<ul class="flex items-center gap-4">
				<template v-if="authStore.isAuthenticated">
					<li v-for="item in menu" :key="item.name">
						<RouterLink
							:to="item.path"
							class="p-1"
							activeClass="border-b-2 border-sky-600 text-gray-400"
						>
							{{ item.name }}
						</RouterLink>
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
</template>
