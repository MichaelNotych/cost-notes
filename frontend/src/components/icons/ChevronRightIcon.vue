<script setup>
defineProps({
	size: {
		type: String,
		default: '5',
	},
})
</script>

<template>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		:class="`size-5 size-${size}`"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2.5"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path d="m9 18 6-6-6-6" />
	</svg>
</template>
