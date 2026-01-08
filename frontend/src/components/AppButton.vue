<script setup>
import { computed } from 'vue'
import SpinnerIcon from './icons/SpinnerIcon.vue'

const props = defineProps({
	variant: {
		type: String,
		default: 'primary',
		validator: (value) => ['primary', 'secondary', 'danger', 'ghost'].includes(value),
	},
	type: {
		type: String,
		default: 'button',
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	loading: {
		type: Boolean,
		default: false,
	},
	size: {
		type: String,
		default: 'md',
		validator: (value) => ['sm', 'md', 'icon'].includes(value),
	},
	rounded: {
		type: String,
		default: 'md',
	},
})

const variantClasses = {
	primary: 'bg-sky-600 hover:bg-sky-700 text-white border-transparent',
	secondary: 'bg-gray-500/20 hover:bg-gray-500/40 text-gray-100 border-gray-500/20',
	danger: 'bg-red-500/20 hover:bg-red-500/40 text-red-500 border-red-500/20',
	ghost: 'bg-transparent text-sky-600 hover:underline border-transparent p-0 inline',
	outline:
		'bg-zinc-700/20 border-transparent text-gray-100 hover:bg-sky-600/10 hover:text-sky-600 hover:border-sky-600',
}

const sizeClasses = {
	sm: 'py-2 px-4 text-sm',
	md: 'py-2.5 px-6 text-base',
	icon: 'w-8 h-8',
}

const classes = computed(() => {
	const base =
		'font-medium transition-all border outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'

	if (props.variant === 'ghost') {
		return 'text-sky-600 font-medium hover:underline bg-transparent border-none p-0 inline cursor-pointer'
	}

	const roundedClass = props.rounded === 'none' ? '' : `rounded-${props.rounded}`

	return `${base} ${variantClasses[props.variant]} ${sizeClasses[props.size]} ${roundedClass}`
})
</script>

<template>
	<button :type="type" :class="classes" :disabled="disabled || loading">
		<span v-if="loading" class="mr-2">
			<SpinnerIcon />
		</span>
		<slot />
	</button>
</template>
