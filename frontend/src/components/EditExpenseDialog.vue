<script setup>
import { ref, computed, onMounted } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useCategoriesStore } from '@/stores/categories'
import AppForm from '@/components/AppForm.vue'
import AppButton from './AppButton.vue'
import CloseIcon from './icons/CloseIcon.vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue', 'save'])

const categoriesStore = useCategoriesStore()
const isOpen = ref(false)
const editedExpenseId = ref(null)
const initialValues = ref({})

onMounted(async () => {
	if (categoriesStore.categories.length === 0) {
		await categoriesStore.fetchCategories()
	}
})

const validationSchema = toTypedSchema(
	z.object({
		category: z.string().min(1, 'Category is required'),
		title: z.string().min(1, 'Description is required'),
		amount: z.number({ coerce: true }).min(0.01, 'Amount must be greater than 0'),
		currency: z.string().min(3, 'Currency is required').max(3),
	}),
)

const fields = computed(() => [
	{
		name: 'category',
		label: 'Category',
		type: 'select',
		options: categoriesStore.categories.map((c) => ({
			value: c._id,
			label: `${c.emoji} ${c.name}`,
		})),
		width: '100%',
	},
	{
		name: 'title',
		label: 'Description',
		placeholder: 'Expense title',
		width: '100%',
	},
	{
		name: 'amount',
		label: 'Amount',
		type: 'number',
		placeholder: '0.00',
		step: '0.01',
		width: '1fr',
	},
	{
		name: 'currency',
		label: 'Currency',
		placeholder: 'USD',
		width: '1fr',
		class: 'uppercase',
	},
])

const open = (expense) => {
	editedExpenseId.value = expense._id
	initialValues.value = {
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

const onSave = async (values) => {
	emit('save', {
		id: editedExpenseId.value,
		data: values,
	})
	close()
}

defineExpose({
	open,
})
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
				class="bg-zinc-800 w-full max-w-md rounded-xl border border-zinc-700 overflow-hidden"
				@click.stop
			>
				<header class="flex justify-between items-center p-4 border-b border-zinc-700">
					<h3 class="text-gray-400 font-semibold text-lg">Edit Expense</h3>
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

				<div class="p-6">
					<AppForm
						:fields="fields"
						:schema="validationSchema"
						:initial-values="initialValues"
						:on-submit="onSave"
						submitText="Save Changes"
					/>
				</div>
			</div>
		</div>
	</Transition>
</template>

<style scoped></style>
