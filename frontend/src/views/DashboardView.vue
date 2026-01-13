<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useExpensesStore } from '@/stores/expenses'
import DailyExpenses from '@/components/DailyExpenses.vue'
import EditExpenseDialog from '@/components/EditExpenseDialog.vue'
import ManualExpenseDialog from '@/components/ManualExpenseDialog.vue'
import AppButton from '@/components/AppButton.vue'

const expensesStore = useExpensesStore()

const expense = ref('')
const editDialog = ref(null)
const manualDialog = ref(null)

const handleSubmit = async () => {
	window.scrollTo({ top: 0, behavior: 'smooth' })
	try {
		await expensesStore.addExpense(expense.value)
		expense.value = ''
	} catch (err) {
		console.error('Failed to add expense:', err)
	}
}

const handleEdit = (expense) => {
	editDialog.value.open(expense)
}

const handleAddManual = (date) => {
	manualDialog.value.open(date)
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
		<div class="flex-1 overflow-y-auto mb-40 scrollbar-hide">
			<div
				class="flex justify-center items-center py-8"
				v-if="expensesStore.isLoadingExpenses"
			>
				<div
					class="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"
				></div>
			</div>

			<template v-else>
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

		<div
			class="fixed bottom-25 left-0 right-0 p-4 pb-0 bg-zinc-900 rounded-tl-4xl rounded-tr-4xl z-10"
		>
			<form
				@submit.prevent="handleSubmit"
				class="flex gap-0 overflow-hidden rounded-full border border-zinc-700/30 max-w-xl mx-auto"
			>
				<input
					name="expense"
					type="text"
					placeholder="Enter your expense"
					autocomplete="off"
					v-model="expense"
					class="flex-1 bg-transparent border-none py-3 px-4 text-gray-100 placeholder-gray-400 focus:ring-0 outline-none"
				/>
				<AppButton
					type="submit"
					variant="primary"
					rounded="none"
					:loading="expensesStore.isAddingExpense"
					:disabled="!expense.trim()"
				>
					Add
				</AppButton>
			</form>
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
