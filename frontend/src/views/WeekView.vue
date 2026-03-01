<script setup>
import { onMounted, ref, computed } from 'vue'
import { useExpensesStore } from '@/stores/expenses'
import AppTitle from '@/components/atoms/AppTitle.vue'
import DailyExpense from '@/components/DailyExpense.vue'
import AppPrice from '@/components/atoms/AppPrice.vue'
import Card from '@/components/Card.vue'
import ChevronIcon from '@/components/icons/ChevronIcon.vue'

const expensesStore = useExpensesStore()
const openWeeks = ref(new Set())

const toggleWeek = (id) => {
	if (openWeeks.value.has(id)) {
		openWeeks.value.delete(id)
	} else {
		openWeeks.value.add(id)
	}
}

const defaultCurrency = computed(() => {
	const firstExpenseWithCurrency = expensesStore.expenses.find((e) => e.defaultCurrency)
	return firstExpenseWithCurrency?.defaultCurrency || 'USD'
})

onMounted(async () => {
	if (expensesStore.expenses.length === 0) {
		await expensesStore.fetchExpenses()
	}
})
</script>

<template>
	<div class="flex flex-col flex-1 p-4 overflow-y-auto scrollbar-hide">
		<AppTitle class="mb-4">Weekly total:</AppTitle>

		<div v-if="expensesStore.isLoadingExpenses" class="flex justify-center py-8">
			<div
				class="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"
			></div>
		</div>

		<div
			v-else-if="expensesStore.expensesByWeek.length === 0"
			class="text-center py-12 bg-zinc-800 rounded-xl border border-zinc-700"
		>
			<p class="text-zinc-400">No expenses recorded yet.</p>
		</div>

		<div v-else class="space-y-3">
			<Card
				v-for="week in expensesStore.expensesByWeek"
				:key="week.id"
				class="overflow-hidden transition-all duration-300"
				:class="{ 'ring-1 ring-sky-500/30': openWeeks.has(week.id) }"
			>
				<button
					@click="toggleWeek(week.id)"
					class="w-full p-2 flex items-center justify-between text-lef"
				>
					<div>
						<AppTitle variant="subtitle">{{ week.name }}:</AppTitle>
						<AppPrice :amount="week.total" :currency="defaultCurrency" />
					</div>
					<div
						class="text-zinc-500 transition-transform duration-300 transform"
						:class="{ 'rotate-180': openWeeks.has(week.id) }"
					>
						<ChevronIcon />
					</div>
				</button>

				<div v-if="openWeeks.has(week.id)" class="py-2 border-t border-zinc-700/20">
					<div v-for="(amount, category) in week.categories" :key="category">
						<DailyExpense
							:expense="{
								category: {
									emoji: category.split(' ')[0],
								},
								title: category.split(' ')[1],
								amount: amount,
								currency: defaultCurrency,
							}"
						/>
					</div>
				</div>
			</Card>
		</div>
	</div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
	display: none;
}
.scrollbar-hide {
	-ms-overflow-style: none; /* IE and Edge */
	scrollbar-width: none; /* Firefox */
}
</style>
