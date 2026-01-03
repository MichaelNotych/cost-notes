<script setup>
import { onMounted, ref } from 'vue'
import { useExpensesStore } from '@/stores/expenses'
import DailyExpenses from '@/components/DailyExpenses.vue'
import EditExpenseDialog from '@/components/EditExpenseDialog.vue'

const expensesStore = useExpensesStore()

onMounted(() => {
	expensesStore.fetchExpenses()
})

const expense = ref('')
const editDialog = ref(null)

const handleSubmit = () => {
	expensesStore.addExpense(expense.value)
	expense.value = ''
}

const handleEdit = (expense) => {
	editDialog.value.open(expense)
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
		<DailyExpenses
			v-for="group in expensesStore.groupedExpenses"
			:key="group.date"
			:date="group.date"
			:expenses="group.items"
			@edit-expense="handleEdit"
		/>

		<EditExpenseDialog ref="editDialog" @save="handleSave" />

		<article v-if="expensesStore.groupedExpenses.length === 0">
			<header>No Data</header>
			No expenses recorded yet.
		</article>
	</div>
	<form class="form" @submit.prevent="handleSubmit">
		<fieldset role="group">
			<input name="expense" type="text" placeholder="Enter your expense" v-model="expense" />
			<input type="submit" value="Add" />
		</fieldset>
	</form>
</template>

<style>
.expenses {
	height: 100%;
	overflow-y: auto;
}

.form {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 1rem;
}
</style>
