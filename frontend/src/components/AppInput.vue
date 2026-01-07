<script setup>
defineProps({
	label: {
		type: String,
		default: '',
	},
	errorMessage: {
		type: String,
		default: '',
	},
	modelValue: {
		type: [String, Number],
		default: '',
	},
	type: {
		type: String,
		default: 'text',
	},
})

defineEmits(['update:modelValue'])
</script>

<template>
	<div class="space-y-1.5 flex flex-col group">
		<label
			v-if="label"
			class="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 group-focus-within:text-sky-500 transition-colors"
		>
			{{ label }}
		</label>
		<div class="relative">
			<input
				:type="type"
				:value="modelValue"
				v-bind="$attrs"
				@input="$emit('update:modelValue', $event.target.value)"
				class="w-full bg-slate-900/50 border border-gray-700 rounded-md py-2.5 px-4 text-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
				:class="{
					'border-red-500/50 focus:border-red-500 focus:ring-red-500/20': errorMessage,
				}"
			/>
		</div>
		<Transition
			enter-active-class="transition duration-200 ease-out"
			enter-from-class="transform -translate-y-1 opacity-0"
			enter-to-class="transform translate-y-0 opacity-100"
		>
			<p v-if="errorMessage" class="text-red-400 text-xs font-medium ml-1">
				{{ errorMessage }}
			</p>
		</Transition>
	</div>
</template>

<style scoped>
/* Remove spin buttons for number inputs */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
	appearance: none;
	-webkit-appearance: none;
	margin: 0;
}

input[type='number'] {
	appearance: textfield;
	-moz-appearance: textfield;
}
</style>
