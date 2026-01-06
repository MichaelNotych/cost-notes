<script setup>
import { onMounted, ref } from 'vue'
import { useExpensesStore } from '@/stores/expenses'
import DailyExpenses from '@/components/DailyExpenses.vue'
import EditExpenseDialog from '@/components/EditExpenseDialog.vue'
import ManualExpenseDialog from '@/components/ManualExpenseDialog.vue'

const expensesStore = useExpensesStore()

onMounted(() => {
	expensesStore.fetchExpenses()
})

const expense = ref('')
const editDialog = ref(null)
const manualDialog = ref(null)

const handleSubmit = async () => {
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
</script>

<template>
	<div class="expenses">
		<div
			class="expenses__loader"
			v-if="expensesStore.isLoadingExpenses"
			:aria-busy="true"
		></div>
		<DailyExpenses
			v-else
			v-for="group in expensesStore.groupedExpenses"
			:key="group.date"
			:date="group.date"
			:expenses="group.items"
			@edit-expense="handleEdit"
			@add-manual-expense="handleAddManual"
		/>

		<EditExpenseDialog ref="editDialog" @save="handleSave" />
		<ManualExpenseDialog ref="manualDialog" />

		<article v-if="expensesStore.groupedExpenses.length === 0">
			<header>No Data</header>
			No expenses recorded yet.
		</article>
	</div>
	<form class="form" @submit.prevent="handleSubmit">
		<fieldset role="group">
			<input
				name="expense"
				type="text"
				placeholder="Enter your expense"
				autocomplete="off"
				v-model="expense"
			/>
			<button
				type="submit"
				value="Add"
				:aria-busy="expensesStore.isAddingExpense"
				:disabled="expensesStore.isAddingExpense"
			>
				Add
			</button>
		</fieldset>
	</form>
</template>

<style>
.expenses {
	height: 100%;
	flex: 1;
	overflow-y: auto;
	padding-bottom: 6rem;
	display: flex;
	flex-direction: column;
}

.expenses__loader {
	flex: 1;

	display: flex;
	justify-content: center;
	align-items: center;
}

.form {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 1rem;
	background-color: var(--pico-background-color);
}
</style>
