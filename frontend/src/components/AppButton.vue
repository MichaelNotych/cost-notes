<script setup>
import { computed } from 'vue'

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
		'bg-transparent border-zinc-700 text-gray-100 hover:bg-sky-600/10 hover:text-sky-600 hover:border-sky-600',
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
			<svg
				class="animate-spin h-5 w-5 text-current"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle
					class="opacity-25"
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					stroke-width="4"
				></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
		</span>
		<slot />
	</button>
</template>
