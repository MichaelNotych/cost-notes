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
		:class="`size-5 size-${size}`"
		viewBox="0 0 12 12"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			transform="rotate(-45 6 6)"
			d="M5.25048 11.25V0.75H6.75048V11.25H5.25048ZM0.750488 6.75V5.25H11.2505V6.75H0.750488Z"
			fill="currentColor"
		/>
	</svg>
</template>
