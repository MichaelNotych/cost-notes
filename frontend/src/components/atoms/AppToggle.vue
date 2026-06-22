<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		modelValue: boolean
		label?: string
		size?: 'md' | 'lg'
	}>(),
	{
		modelValue: false,
		label: '',
		size: 'md',
	},
)

const emit = defineEmits(['update:modelValue'])
const sizes = {
	md: 'text-sm',
	xl: 'text-xl',
}
</script>

<template>
	<label class="flex items-center justify-between gap-3 cursor-pointer select-none">
		<span v-if="label" :class="`text-zinc-300 ${sizes[size]}`">{{ label }}</span>
		<button
			type="button"
			role="switch"
			:aria-checked="modelValue"
			@click="emit('update:modelValue', !modelValue)"
			class="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none"
			:class="modelValue ? 'bg-sky-500' : 'bg-zinc-600'"
		>
			<span
				class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
				:class="modelValue ? 'translate-x-5' : 'translate-x-0'"
			/>
		</button>
	</label>
</template>
