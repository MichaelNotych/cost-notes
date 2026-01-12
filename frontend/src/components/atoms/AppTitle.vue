<script setup>
defineProps({
	variant: {
		type: String,
		default: 'default',
		validator: (value) => ['default', 'subtitle'].includes(value),
	},
})
const variantClasses = {
	default: 'text-2xl text-gray-200 font-bold',
	subtitle: 'text-lg text-gray-200 font-medium',
}
</script>
<template>
	<div :class="variantClasses[variant]">
		<slot />
	</div>
</template>
