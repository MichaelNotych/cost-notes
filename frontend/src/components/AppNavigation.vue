<script setup>
import CalendarIcon from './icons/CalendarIcon.vue'
import HomeIcon from './icons/HomeIcon.vue'
import SeetingsIcon from './icons/SeetingsIcon.vue'

const menu = [
	{
		name: 'Home',
		icon: HomeIcon,
		path: '/',
	},
	{
		name: 'Calendar',
		icon: CalendarIcon,
		path: '/calendar',
	},
	{
		name: 'Settings',
		icon: SeetingsIcon,
		path: '/settings',
	},
]
</script>

<template>
	<nav
		class="fixed bottom-0 left-0 right-0 z-50 flex justify-between items-center gap-8 p-6 px-10 pb-10 bg-zinc-900 h-25"
	>
		<RouterLink
			v-for="item in menu"
			:key="item.name"
			:to="item.path"
			class="p-1 flex gap-2 items-center justify-center flex-col opacity-60"
			activeClass="opacity-100"
		>
			<component :is="item.icon" v-if="item.icon" />
			<span class="text-xs">{{ item.name }}</span>
		</RouterLink>
	</nav>
</template>
