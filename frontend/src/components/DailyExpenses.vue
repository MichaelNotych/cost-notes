<script setup>
import { computed } from 'vue'
import getCurrencySymbolFromCode from '@/plugins/currencies'

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
	<article>
		<header style="display: flex; justify-content: space-between; align-items: center">
			<strong>{{ date }}</strong>
			<button
				class="outline contrast"
				style="
					display: flex;
					align-items: center;
					justify-content: center;
					height: 1.5rem;
					width: 1.5rem;
					padding: 0;
				"
				@click="$emit('add-manual-expense', date)"
			>
				<svg
					width="9"
					height="9"
					viewBox="0 0 9 9"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M3.41974 8.84659V0H5.42685V8.84659H3.41974ZM0 5.42685V3.41974H8.84659V5.42685H0Z"
						fill="white"
					/>
				</svg>
			</button>
		</header>
		<ul style="padding: 0; list-style: none; margin-bottom: 0">
			<li
				v-for="expense in expenses"
				:key="expense._id"
				style="display: flex; align-items: center; justify-content: space-between"
				@click="$emit('edit-expense', expense)"
			>
				<div style="display: flex; align-items: center; gap: 0.5rem">
					<span role="img" aria-label="Category">
						{{ expense.category?.emoji || '📝' }}
					</span>
					<div>
						{{ expense.title || expense.userDescription }}
					</div>
				</div>
				<div>
					{{ expense.amount }}
					<small>{{ getCurrencySymbolFromCode(expense.currency) }}</small>
				</div>
			</li>
		</ul>
		<footer style="display: flex; justify-content: space-between">
			<strong>Total:</strong>
			<strong>
				{{ dailyTotal.toFixed(2) }} {{ getCurrencySymbolFromCode(defaultCurrency) }}
			</strong>
		</footer>
	</article>
</template>
