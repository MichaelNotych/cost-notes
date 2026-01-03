<script setup>
import { ref, onMounted } from 'vue'
import { useCategoriesStore } from '@/stores/categories'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue', 'save'])

const categoriesStore = useCategoriesStore()
const isOpen = ref(false)
const editedExpense = ref({
	_id: null,
	category: null,
	title: '',
	amount: 0,
	currency: 'USD',
})

onMounted(async () => {
	if (categoriesStore.categories.length === 0) {
		await categoriesStore.fetchCategories()
	}
})

const open = (expense) => {
	editedExpense.value = {
		_id: expense._id,
		category: expense.category?._id || expense.category,
		title: expense.title || expense.userDescription || '',
		amount: expense.amount,
		currency: expense.currency || 'USD',
	}
	isOpen.value = true
}

const close = () => {
	isOpen.value = false
}

const save = () => {
	emit('save', {
		id: editedExpense.value._id,
		data: {
			category: editedExpense.value.category,
			title: editedExpense.value.title,
			amount: editedExpense.value.amount,
			currency: editedExpense.value.currency,
		},
	})
	close()
}

defineExpose({
	open,
})
</script>

<template>
	<dialog :open="isOpen">
		<article>
			<header>
				<button aria-label="Close" rel="prev" @click="close"></button>
				<p><strong>Edit Expense</strong></p>
			</header>
			<form @submit.prevent="save">
				<select v-model="editedExpense.category" required>
					<option
						v-for="cat in categoriesStore.categories"
						:key="cat._id"
						:value="cat._id"
					>
						{{ cat.emoji }} {{ cat.name }}
					</option>
				</select>

				<input
					v-model="editedExpense.title"
					type="text"
					placeholder="Expense title"
					required
				/>

				<div role="group">
					<input
						v-model="editedExpense.amount"
						type="number"
						step="0.01"
						placeholder="0.00"
						required
					/>
					<input
						v-model="editedExpense.currency"
						type="text"
						placeholder="USD"
						required
					/>
				</div>

				<button type="submit">Save</button>
			</form>
		</article>
	</dialog>
</template>

<style scoped>
dialog article {
	max-width: 500px;
	width: 100%;
}
</style>
