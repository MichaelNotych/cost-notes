<script setup>
import { onMounted, ref } from 'vue'
import { useExpensesStore } from '@/stores/expenses'
import DailyExpenses from '@/components/DailyExpenses.vue'
import EditExpenseDialog from '@/components/EditExpenseDialog.vue'
import ManualExpenseDialog from '@/components/ManualExpenseDialog.vue'
import WeekHeatmap from '@/components/WeekHeatmap.vue'

const expensesStore = useExpensesStore()

const editDialog = ref(null)
const manualDialog = ref(null)

const handleEdit = (expense) => {
	editDialog.value.open(expense)
}

const handleAddManual = (date, isWeek = false) => {
	manualDialog.value.open(date, isWeek)
}

const handleSave = async ({ id, data }) => {
	try {
		await expensesStore.updateExpense(id, data)
	} catch (err) {
		console.error('Failed to update expense:', err)
	}
}

onMounted(async () => {
	await expensesStore.fetchExpenses()
})
</script>

<template>
	<div class="flex flex-col flex-1 relative min-h-0">
		<div class="flex-1 overflow-y-auto scrollbar-hide">
			<div
				class="flex justify-center items-center py-8"
				v-if="expensesStore.isLoadingExpenses"
			>
				<div
					class="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"
				></div>
			</div>

			<template v-else>
				<WeekHeatmap @add-manual-expense="handleAddManual" />

				<DailyExpenses
					v-for="group in expensesStore.groupedExpenses"
					:key="group.date"
					:date="group.date"
					:expenses="group.items"
					@edit-expense="handleEdit"
					@add-manual-expense="handleAddManual"
				/>

				<div
					v-if="expensesStore.groupedExpenses.length === 0"
					class="bg-zinc-800 rounded-md p-8 text-center border border-zinc-700"
				>
					<h3 class="font-semibold mb-2">No Data</h3>
					<p>No expenses recorded yet.</p>
				</div>
			</template>
		</div>

		<EditExpenseDialog ref="editDialog" @save="handleSave" />
		<ManualExpenseDialog ref="manualDialog" />
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
