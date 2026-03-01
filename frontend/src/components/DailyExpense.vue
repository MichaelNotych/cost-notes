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
		class="flex items-center justify-between p-2 cursor-pointer border-b border-zinc-700/30 last:border-0"
	>
		<div class="flex items-center gap-2">
			<span class="leading-none" role="img" aria-label="Category">
				{{ expense.category?.emoji || '📝' }}
			</span>
			<span class="text-gray-400">
				{{ expense.title || expense.userDescription }}
			</span>
		</div>
		<AppPrice :amount="expense.amount" :currency="expense.currency" />
	</div>
</template>
