<script setup>
import getCurrencySymbolFromCode from '@/plugins/currencies'

defineProps({
	amount: {
		type: Number,
		required: true,
	},
	currency: {
		type: String,
		required: true,
	},
})

const formatAmount = (value) => {
	if (value === undefined || value === null) return '0'
	const parts = Number(value).toFixed(2).split('.')
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	return parts.join('.')
}
</script>

<template>
	<div class="flex items-baseline gap-1">
		<span class="font-mono text-gray-400">{{ formatAmount(amount) }}</span>
		<span class="text-xs text-gray-400">
			{{ getCurrencySymbolFromCode(currency) }}
		</span>
	</div>
</template>
