<script setup>
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useExpensesStore } from '@/stores/expenses'
import { useCategoriesStore } from '@/stores/categories'
import AppButton from '@/components/AppButton.vue'

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
	<Transition
		enter-active-class="transition duration-200 ease-out"
		enter-from-class="opacity-0"
		enter-to-class="opacity-100"
		leave-active-class="transition duration-150 ease-in"
		leave-from-class="opacity-100"
		leave-to-class="opacity-0"
	>
		<div
			v-if="isOpen"
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm"
			@click="close"
		>
			<div
				class="bg-[#161b22] w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl overflow-hidden"
				@click.stop
			>
				<header class="flex justify-between items-center p-4 border-b border-gray-700">
					<h3 class="text-gray-400 font-bold text-lg">Add Expense for {{ selectedDate }}</h3>
					<button
						@click="close"
						class="text-[#8b949e] hover:text-gray-400 transition-colors"
						aria-label="Close"
					>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				</header>

				<form @submit.prevent="onSubmit" class="p-6 space-y-4">
					<div class="space-y-1">
						<label class="text-xs font-semibold text-[#8b949e] uppercase">Title</label>
						<input
							v-model="title"
							type="text"
							placeholder="e.g. Coffee"
							class="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-gray-400 focus:ring-1 focus:ring-sky-600 outline-none"
							:class="{ 'border-red-500': errors.title }"
						/>
						<small v-if="errors.title" class="text-red-500 text-xs">{{ errors.title }}</small>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-1">
							<label class="text-xs font-semibold text-[#8b949e] uppercase">Amount</label>
							<input
								v-model.number="amount"
								type="number"
								step="0.01"
								placeholder="0.00"
								class="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-gray-400 focus:ring-1 focus:ring-sky-600 outline-none"
								:class="{ 'border-red-500': errors.amount }"
							/>
							<small v-if="errors.amount" class="text-red-500 text-xs">{{ errors.amount }}</small>
						</div>

						<div class="space-y-1">
							<label class="text-xs font-semibold text-[#8b949e] uppercase">Currency</label>
							<select
								v-model="currency"
								class="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-gray-400 focus:ring-1 focus:ring-sky-600 outline-none appearance-none"
								:class="{ 'border-red-500': errors.currency }"
							>
								<option v-for="c in currencies" :key="c" :value="c">{{ c }}</option>
							</select>
							<small v-if="errors.currency" class="text-red-500 text-xs">{{
								errors.currency
							}}</small>
						</div>
					</div>

					<div class="space-y-1">
						<label class="text-xs font-semibold text-[#8b949e] uppercase">Category</label>
						<select
							v-model="category"
							class="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-gray-400 focus:ring-1 focus:ring-sky-600 outline-none appearance-none"
							:class="{ 'border-red-500': errors.category }"
						>
							<option
								v-for="cat in categoriesStore.categories"
								:key="cat._id"
								:value="cat._id"
							>
								{{ cat.emoji }} {{ cat.name }}
							</option>
						</select>
						<small v-if="errors.category" class="text-red-500 text-xs">{{
							errors.category
						}}</small>
					</div>

					<div class="pt-4 flex gap-3">
						<AppButton
							variant="secondary"
							class="flex-1"
							@click="close"
						>
							Cancel
						</AppButton>
						<AppButton
							type="submit"
							variant="primary"
							class="flex-1"
						>
							Save Expense
						</AppButton>
					</div>
				</form>
			</div>
		</div>
	</Transition>
</template>

<style scoped></style>
