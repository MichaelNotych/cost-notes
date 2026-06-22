<script setup>
import { computed } from 'vue'
import { useHeatmapIntensity } from '@/composables/useHeatmapIntensity'

const props = defineProps({
	amount: { type: Number, default: 0 },
	maxAmount: { type: Number, default: 0 },
	isFuture: { type: Boolean, default: false },
	isToday: { type: Boolean, default: false },
	empty: { type: Boolean, default: false },
	clickable: { type: Boolean, default: false },
	showAmount: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])

const { intensityClass, fmtCompact } = useHeatmapIntensity()

const cellClass = computed(() => [
	props.empty ? 'invisible' : intensityClass(props.amount, props.isFuture, props.maxAmount),
	props.clickable && !props.isFuture && !props.empty ? 'cursor-pointer active:scale-90' : '',
])
</script>

<template>
	<div
		class="flex-1 aspect-square rounded-xl mx-0.5 transition-colors relative"
		:class="cellClass"
		@click="!empty && !isFuture && emit('click')"
	>
		<div
			v-if="isToday"
			class="absolute inset-0 rounded-xl ring-2 ring-sky-400 ring-offset-0 ring-offset-zinc-900"
		/>
		<div
			v-if="showAmount && amount > 0"
			class="absolute inset-0 flex items-end justify-center pb-1"
		>
			<span class="text-xs font-mono text-white/60 leading-none">{{
				fmtCompact(amount)
			}}</span>
		</div>
	</div>
</template>
