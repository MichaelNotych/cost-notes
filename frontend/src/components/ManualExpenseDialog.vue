<script setup>
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useExpensesStore } from '@/stores/expenses'
import { useCategoriesStore } from '@/stores/categories'

const expensesStore = useExpensesStore()
const categoriesStore = useCategoriesStore()

const isOpen = ref(false)
const selectedDate = ref('')

const currencies = ['LAK', 'USD', 'EUR', 'GBP', 'UAH', 'PLN', 'TRY', 'THB']

const schema = toTypedSchema(
	zod.object({
		title: zod.string().min(1, 'Title is required'),
		amount: zod
			.number({ invalid_type_error: 'Amount must be a number' })
			.positive('Amount must be positive'),
		currency: zod.string().min(1, 'Currency is required'),
		category: zod.string().min(1, 'Category is required'),
	}),
)

const { defineField, handleSubmit, errors, resetForm, setValues } = useForm({
	validationSchema: schema,
})

const [title] = defineField('title')
const [amount] = defineField('amount')
const [currency] = defineField('currency')
const [category] = defineField('category')

const open = (date) => {
	selectedDate.value = date
	resetForm()
	setValues({
		currency: 'USD',
		category: categoriesStore.categories[0]?._id,
	})
	isOpen.value = true
}

const close = () => {
	isOpen.value = false
}

const onSubmit = handleSubmit(async (values) => {
	try {
		await expensesStore.addManualExpense({
			...values,
			createdAt: new Date(selectedDate.value),
		})
		close()
	} catch (err) {
		console.error('Failed to add manual expense:', err)
	}
})

defineExpose({ open })
</script>

<template>
	<dialog :open="isOpen">
		<article>
			<header>
				<a href="#close" aria-label="Close" class="close" @click="close"></a>
				Add Expense for {{ selectedDate }}
			</header>
			<form @submit.prevent="onSubmit">
				<label>
					Title
					<input
						v-model="title"
						type="text"
						placeholder="e.g. Coffee"
						:aria-invalid="errors.title ? 'true' : undefined"
					/>
					<small v-if="errors.title" class="error">{{ errors.title }}</small>
				</label>

				<div class="grid">
					<label>
						Amount
						<input
							v-model.number="amount"
							type="number"
							step="0.01"
							placeholder="0.00"
							:aria-invalid="errors.amount ? 'true' : undefined"
						/>
						<small v-if="errors.amount" class="error">{{ errors.amount }}</small>
					</label>

					<label>
						Currency
						<select
							v-model="currency"
							:aria-invalid="errors.currency ? 'true' : undefined"
						>
							<option v-for="c in currencies" :key="c" :value="c">{{ c }}</option>
						</select>
						<small v-if="errors.currency" class="error">{{ errors.currency }}</small>
					</label>
				</div>

				<label>
					Category
					<select v-model="category" :aria-invalid="errors.category ? 'true' : undefined">
						<option
							v-for="cat in categoriesStore.categories"
							:key="cat._id"
							:value="cat._id"
						>
							{{ cat.emoji }} {{ cat.name }}
						</option>
					</select>
					<small v-if="errors.category" class="error">{{ errors.category }}</small>
				</label>

				<footer>
					<button type="submit">Save</button>
				</footer>
			</form>
		</article>
	</dialog>
</template>

<style scoped>
.error {
	color: var(--pico-form-element-invalid-border-color);
}
</style>
