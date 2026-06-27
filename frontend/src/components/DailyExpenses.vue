<script setup>
import { computed } from 'vue'
import getCurrencySymbolFromCode from '@/plugins/currencies'
import { useExpensesStore } from '@/stores/expenses'
import { useNumberFormat } from '@/composables/useNumberFormat'
import AppButton from '@/components/atoms/AppButton.vue'
import PlusIcon from './icons/PlusIcon.vue'
import AppTitle from '@/components/atoms/AppTitle.vue'
import AppDate from '@/components/atoms/AppDate.vue'
import Card from './Card.vue'
import DailyExpense from './DailyExpense.vue'

const expensesStore = useExpensesStore()
const { formatAmount } = useNumberFormat()

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

const dailyTotal = computed(() => {
	return props.expenses.reduce((sum, expense) => {
		return sum + (parseFloat(expense.defaultCurrencyAmount) || 0)
	}, 0)
})
</script>

<template>
	<Card class="mb-1">
		<header class="flex items-center gap-2 p-2 border-b border-zinc-700/30">
			<AppDate :date="date" class="mr-auto" />
			<AppButton
				variant="secondary"
				size="icon"
				rounded="full"
				@click="$emit('add-manual-expense', date)"
			>
				<PlusIcon />
			</AppButton>
			<AppTitle variant="subtitle">
				<span class="font-mono">{{ formatAmount(dailyTotal) }}</span>
				<span class="text-xs text-gray-400 ml-1">
					{{ getCurrencySymbolFromCode(expensesStore.defaultCurrency) }}
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
