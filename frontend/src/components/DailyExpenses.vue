<script setup>
import { computed } from 'vue'
import getCurrencySymbolFromCode from '@/plugins/currencies'
import AppButton from '@/components/AppButton.vue'

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
	(dateObject.getMonth() + 1).toString().padStart(2, '0') +
	'.' +
	dateObject.getFullYear()

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
	<div class="mb-2 bg-zinc-900/50 rounded-md">
		<header class="flex justify-between items-center p-2 border-b border-zinc-700/20">
			<div class="text-gray-400 font-semibold">{{ dateString }}</div>
			<AppButton
				variant="outline"
				size="icon"
				rounded="lg"
				@click="$emit('add-manual-expense', date)"
			>
				<svg
					width="12"
					height="12"
					viewBox="0 0 12 12"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M5.25048 11.25V0.75H6.75048V11.25H5.25048ZM0.750488 6.75V5.25H11.2505V6.75H0.750488Z"
						fill="currentColor"
					/>
				</svg>
			</AppButton>
		</header>
		<div>
			<ul class="m-0 p-0 list-none">
				<li
					v-for="expense in expenses"
					:key="expense._id"
					class="flex items-center justify-between p-2 cursor-pointer border-b border-zinc-700/20 last:border-0"
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
						<span>{{ expense.amount }}</span>
						<span class="text-xs text-gray-400">
							{{ getCurrencySymbolFromCode(expense.currency) }}
						</span>
					</div>
				</li>
			</ul>
		</div>
		<footer class="flex justify-between items-center p-2 border-t border-zinc-700/20">
			<span class="text-gray-400 font-semibold">Total:</span>
			<span class="font-bold">
				{{ dailyTotal.toFixed(2) }}
				<span class="text-sm font-medium text-gray-400">
					{{ getCurrencySymbolFromCode(defaultCurrency) }}
				</span>
			</span>
		</footer>
	</div>
</template>
