<script setup>
defineProps({
	label: {
		type: String,
		default: '',
	},
	name: {
		type: String,
		default: '',
	},
})
</script>

<template>
	<label
		:for="name"
		class="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 group-focus-within:text-sky-500 transition-colors"
	>
		{{ label }}
	</label>
</template>
