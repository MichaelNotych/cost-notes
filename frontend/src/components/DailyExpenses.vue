<script setup>
import { computed } from 'vue'
import getCurrencySymbolFromCode from '@/plugins/currencies'
import AppButton from '@/components/AppButton.vue'
import PlusIcon from './icons/PlusIcon.vue'
import AppTitle from '@/components/atoms/AppTitle.vue'
import Card from './Card.vue'
import DailyExpense from './DailyExpense.vue'

const props = defineProps({
	date: {
		type: String,
		required: true,
	},
	expenses: {
		type: Array,
		required: true,
	},
})

const dateObject = new Date(props.date)
const dateString =
	dateObject.getDate().toString().padStart(2, '0') +
	' / ' +
	(dateObject.getMonth() + 1).toString().padStart(2, '0')

const dailyTotal = computed(() => {
	return props.expenses.reduce((sum, expense) => {
		return sum + (parseFloat(expense.defaultCurrencyAmount) || 0)
	}, 0)
})

const defaultCurrency = computed(() => {
	// Get the default currency from the first expense that has it
	const expenseWithCurrency = props.expenses.find((e) => e.defaultCurrency)
	return expenseWithCurrency?.defaultCurrency || 'USD'
})

const formatAmount = (value) => {
	if (!value) return '0'
	const parts = value.toString().split('.')
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	return parts.join('.')
}
</script>

<template>
	<Card class="mb-1">
		<header class="flex items-center gap-2 p-2 border-b border-zinc-700/30">
			<AppTitle variant="subtitle" class="mr-auto">{{ dateString }}</AppTitle>
			<AppButton
				variant="secondary"
				size="icon"
				rounded="full"
				@click="$emit('add-manual-expense', date)"
			>
				<PlusIcon />
			</AppButton>
			<AppTitle variant="subtitle">
				<span class="font-mono">{{ formatAmount(dailyTotal.toFixed(2)) }}</span>
				<span class="text-xs text-gray-400 ml-1">
					{{ getCurrencySymbolFromCode(defaultCurrency) }}
				</span>
			</AppTitle>
		</header>
		<div>
			<ul class="m-0 p-0 list-none">
				<li
					v-for="expense in expenses"
					:key="expense._id"
					@click="$emit('edit-expense', expense)"
				>
					<DailyExpense :expense="expense" />
				</li>
			</ul>
		</div>
	</Card>
</template>
