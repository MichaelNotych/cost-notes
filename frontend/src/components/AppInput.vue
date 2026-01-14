<script setup>
import { useAttrs } from 'vue'
import AppLabel from './atoms/AppLabel.vue'

defineOptions({ inheritAttrs: false })

defineProps({
	label: {
		type: String,
		default: '',
	},
	errorMessage: {
		type: String,
		default: '',
	},
})

const attrs = useAttrs()
</script>

<template>
	<div class="space-y-1.5 flex flex-col group">
		<AppLabel
			v-if="label"
			:name="attrs.name"
			:label="label"
			:class="`${errorMessage ? 'text-red-400' : ''}`"
		/>
		<input
			v-bind="attrs"
			:class="`w-full bg-zinc-900/50 border  rounded-md py-2.5 px-4 text-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all 
				${errorMessage ? 'border-red-500/50' : 'border-zinc-700'}`"
		/>
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
