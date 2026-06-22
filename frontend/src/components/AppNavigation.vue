<script setup>
import { ref } from 'vue'
import CalendarIcon from './icons/CalendarIcon.vue'
import HomeIcon from './icons/HomeIcon.vue'
import SeetingsIcon from './icons/SeetingsIcon.vue'
import PlusIcon from './icons/PlusIcon.vue'
import ManualExpenseDialog from './ManualExpenseDialog.vue'

const dialog = ref(null)

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
		class="fixed bottom-4 left-4 right-4 z-40 flex justify-around items-center gap-4 px-6 py-4 bg-zinc-900/90 backdrop-blur-md rounded-3xl shadow-xl shadow-black/30"
	>
		<!-- First two nav items -->
		<RouterLink
			v-for="item in menu.slice(0, 2)"
			:key="item.name"
			:to="item.path"
			class="p-1 flex gap-1 items-center justify-center flex-col opacity-60 flex-1"
			activeClass="opacity-100"
		>
			<component :is="item.icon" v-if="item.icon" />
			<span class="text-xs">{{ item.name }}</span>
		</RouterLink>

		<!-- Center add button -->
		<button
			@click="dialog.open()"
			class="flex items-center justify-center w-14 h-12 -my-1 rounded-2xl bg-sky-600 text-white shadow-md shadow-sky-500/40"
			aria-label="Add expense"
		>
			<PlusIcon size="6" />
		</button>

		<!-- Last nav item -->
		<RouterLink
			v-for="item in menu.slice(2)"
			:key="item.name"
			:to="item.path"
			class="p-1 flex gap-1 items-center justify-center flex-col opacity-60 flex-1"
			activeClass="opacity-100"
		>
			<component :is="item.icon" v-if="item.icon" />
			<span class="text-xs">{{ item.name }}</span>
		</RouterLink>
	</nav>

	<ManualExpenseDialog ref="dialog" />
</template>
