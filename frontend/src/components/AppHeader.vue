<script setup>
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
	<header
		class="fixed bottom-0 left-0 right-0 z-50 flex justify-center items-center gap-8 p-6 pb-10 bg-zinc-900 h-25"
	>
		<RouterLink
			v-for="item in menu"
			:key="item.name"
			:to="item.path"
			class="p-1"
			activeClass="border-b-2 border-sky-600 text-gray-400"
		>
			{{ item.name }}
		</RouterLink>
	</header>
</template>
