<script setup>
import { ref, computed } from 'vue'
import * as zod from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useExpensesStore } from '@/stores/expenses'
import { useCategoriesStore } from '@/stores/categories'
import AppButton from '@/components/AppButton.vue'
import AppForm from '@/components/AppForm.vue'
import CloseIcon from './icons/CloseIcon.vue'
import AppTitle from './atoms/AppTitle.vue'

const expensesStore = useExpensesStore()
const categoriesStore = useCategoriesStore()

const isOpen = ref(false)
const selectedDate = ref('')
const formRef = ref(null)

const currencies = ['LAK', 'USD', 'EUR', 'GBP', 'UAH', 'PLN', 'TRY', 'THB']

const schema = toTypedSchema(
	zod.object({
		title: zod.string().min(1, 'Title is required'),
		amount: zod.coerce
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

const initialValues = ref({})

const open = (date) => {
	selectedDate.value = date
	initialValues.value = {
		title: '',
		amount: undefined,
		currency: 'LAK',
		category: categoriesStore.categories[0]?._id,
	}
	isOpen.value = true
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
					<AppTitle variant="subtitle">{{ selectedDate }}</AppTitle>
					<AppButton
						@click="close"
						variant="outline"
						size="icon"
						rounded="lg"
						aria-label="Close"
					>
						<CloseIcon />
					</AppButton>
				</header>

				<div class="p-4">
					<AppForm
						ref="formRef"
						:fields="fields"
						:schema="schema"
						:initial-values="initialValues"
						submit-text="Save Expense"
						:on-submit="handleFormSubmit"
					/>
				</div>
			</div>
		</div>
	</Transition>
</template>

<style scoped></style>
