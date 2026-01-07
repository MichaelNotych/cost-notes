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
	<div class="bg-gray-800/50 rounded-md overflow-hidden mb-6 border border-gray-700 shadow-lg">
		<header class="flex justify-between items-center p-4 border-b border-gray-700">
			<h3 class="font-bold text-base m-0">{{ date }}</h3>
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
		<div class="p-0">
			<ul class="m-0 p-0 list-none">
				<li
					v-for="expense in expenses"
					:key="expense._id"
					class="flex items-center justify-between p-4 hover:bg-[#21262d] cursor-pointer border-b border-gray-700/50 last:border-0 transition-colors"
					@click="$emit('edit-expense', expense)"
				>
					<div class="flex items-center gap-3">
						<span class="text-xl leading-none" role="img" aria-label="Category">
							{{ expense.category?.emoji || '📝' }}
						</span>
						<span class="font-medium">
							{{ expense.title || expense.userDescription }}
						</span>
					</div>
					<div class="font-medium flex items-baseline gap-1">
						<span>{{ expense.amount }}</span>
						<span class="text-xs text-gray-400">
							{{ getCurrencySymbolFromCode(expense.currency) }}
						</span>
					</div>
				</li>
			</ul>
		</div>
		<footer
			class="flex justify-between items-center p-4 bg-gray-950/50 border-t border-gray-700"
		>
			<span class="text-gray-400 font-semibold">Total:</span>
			<span class="font-bold text-lg">
				{{ dailyTotal.toFixed(2) }}
				<span class="text-sm font-medium text-gray-400">
					{{ getCurrencySymbolFromCode(defaultCurrency) }}
				</span>
			</span>
		</footer>
	</div>
</template>
