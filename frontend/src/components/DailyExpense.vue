<script setup>
import AppPrice from './atoms/AppPrice.vue'

defineProps({
	expense: {
		type: Object,
		required: true,
	},
})
</script>
<template>
	<div
		class="flex items-center justify-between p-2 cursor-pointer transition-colors active:bg-white/5"
		:class="{ 'opacity-60': expense.pending }"
	>
		<div class="flex items-baseline gap-2">
			<span class="leading-none" role="img" aria-label="Category">
				{{ expense.category?.emoji || '📝' }}
			</span>
			<span class="text-gray-400">
				{{ expense.title || expense.userDescription }}
			</span>
			<span
				v-if="expense.pending"
				class="text-[10px] uppercase tracking-wide text-amber-400/80"
			>
				pending
			</span>
		</div>
		<AppPrice :amount="expense.amount" :currency="expense.currency" />
	</div>
</template>
