<script setup>
import { ref, computed } from 'vue'
import * as zod from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useExpensesStore } from '@/stores/expenses'
import { useCategoriesStore } from '@/stores/categories'
import AppButton from '@/components/AppButton.vue'
import AppForm from '@/components/AppForm.vue'

const expensesStore = useExpensesStore()
const categoriesStore = useCategoriesStore()

const isOpen = ref(false)
const selectedDate = ref('')
const formRef = ref(null)

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

const fields = computed(() => [
	{
		name: 'title',
		label: 'Title',
		placeholder: 'e.g. Coffee',
		type: 'text',
		width: '100%',
	},
	{
		name: 'amount',
		label: 'Amount',
		placeholder: '0.00',
		type: 'number',
		width: '1fr',
		step: '0.01',
	},
	{
		name: 'currency',
		label: 'Currency',
		type: 'select',
		width: '120px', // Fixed width for currency
		options: currencies.map((c) => ({ label: c, value: c })),
	},
	{
		name: 'category',
		label: 'Category',
		type: 'select',
		width: '100%',
		options: categoriesStore.categories.map((c) => ({
			label: `${c.emoji} ${c.name}`,
			value: c._id,
		})),
	},
])

const open = (date) => {
	selectedDate.value = date
	isOpen.value = true
	// Wait for next tick to ensure formRef is available
	setTimeout(() => {
		if (formRef.value) {
			formRef.value.resetForm()
			formRef.value.setValues({
				currency: 'LAK',
				category: categoriesStore.categories[0]?._id,
			})
		}
	}, 0)
}

const close = () => {
	isOpen.value = false
}

const handleFormSubmit = async (values) => {
	try {
		await expensesStore.addManualExpense({
			...values,
			createdAt: new Date(selectedDate.value),
		})
		close()
	} catch (err) {
		console.error('Failed to add manual expense:', err)
	}
}

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
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-800/80 backdrop-blur-sm"
			@click="close"
		>
			<div
				class="bg-zinc-800 w-full max-w-md rounded-2xl border border-zinc-700 shadow-2xl overflow-hidden"
				@click.stop
			>
				<header class="flex justify-between items-center p-4 border-b border-zinc-700">
					<h3 class="text-gray-400 font-semibold text-lg">
						Add Expense for {{ selectedDate }}
					</h3>
					<button
						@click="close"
						class="text-gray-400 hover:text-gray-400 transition-colors"
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

				<div class="p-6">
					<AppForm
						ref="formRef"
						:fields="fields"
						:schema="schema"
						submit-text="Save Expense"
						:on-submit="handleFormSubmit"
					>
						<template #actions="{ isSubmitting }">
							<div class="pt-4 flex gap-3">
								<AppButton
									variant="secondary"
									class="flex-1"
									@click="close"
									type="button"
								>
									Cancel
								</AppButton>
								<AppButton
									type="submit"
									variant="primary"
									class="flex-1"
									:loading="isSubmitting"
								>
									Save Expense
								</AppButton>
							</div>
						</template>
					</AppForm>
				</div>
			</div>
		</div>
	</Transition>
</template>

<style scoped></style>
