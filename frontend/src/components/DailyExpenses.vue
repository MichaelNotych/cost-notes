<script setup>
import { computed } from 'vue'
import getCurrencySymbolFromCode from '@/plugins/currencies'
import AppButton from '@/components/AppButton.vue'
import PlusIcon from './icons/PlusIcon.vue'
import AppTitle from '@/components/atoms/AppTitle.vue'

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
	'.' +
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
</script>

<template>
	<article class="mb-2 bg-zinc-900/20 p-2 rounded-md">
		<header class="flex items-center gap-4 p-2 border-b border-zinc-700/30">
			<AppTitle variant="subtitle" class="font-mono">{{ dateString }}</AppTitle>
			<AppTitle variant="subtitle" class="font-mono opacity-20">|</AppTitle>
			<AppTitle variant="subtitle">
				<span class="font-mono">{{ dailyTotal.toFixed(2) }}</span>
				<span class="text-xs text-gray-400 ml-1">
					{{ getCurrencySymbolFromCode(defaultCurrency) }}
				</span>
			</AppTitle>
			<AppTitle variant="subtitle" class="font-mono opacity-20">|</AppTitle>
			<AppButton
				variant="outline"
				size="icon"
				rounded="lg"
				@click="$emit('add-manual-expense', date)"
			>
				<PlusIcon />
			</AppButton>
		</header>
		<div>
			<ul class="m-0 p-0 list-none">
				<li
					v-for="expense in expenses"
					:key="expense._id"
					class="flex items-center justify-between p-2 cursor-pointer border-b border-zinc-700/30 last:border-0"
					@click="$emit('edit-expense', expense)"
				>
					<div class="flex items-center gap-2">
						<span class="leading-none" role="img" aria-label="Category">
							{{ expense.category?.emoji || '📝' }}
						</span>
						<span>
							{{ expense.title || expense.userDescription }}
						</span>
					</div>
					<div class="flex items-baseline gap-1">
						<span class="font-mono">{{ expense.amount }}</span>
						<span class="text-xs text-gray-400">
							{{ getCurrencySymbolFromCode(expense.currency) }}
						</span>
					</div>
				</li>
			</ul>
		</div>
	</article>
</template>
