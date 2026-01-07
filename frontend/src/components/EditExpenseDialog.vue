<script setup>
import { ref, onMounted } from 'vue'
import { useCategoriesStore } from '@/stores/categories'
import AppButton from '@/components/AppButton.vue'

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
					<h3 class="text-gray-400 font-bold text-lg">Edit Expense</h3>
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

				<form @submit.prevent="save" class="p-6 space-y-4">
					<div class="space-y-1">
						<label class="text-xs font-semibold text-[#8b949e] uppercase"
							>Category</label
						>
						<select
							v-model="editedExpense.category"
							required
							class="w-full bg-slate-900 border border-gray-700 rounded-lg py-2 px-3 text-gray-400 focus:ring-1 focus:ring-sky-600 outline-none appearance-none"
						>
							<option
								v-for="cat in categoriesStore.categories"
								:key="cat._id"
								:value="cat._id"
							>
								{{ cat.emoji }} {{ cat.name }}
							</option>
						</select>
					</div>

					<div class="space-y-1">
						<label class="text-xs font-semibold text-[#8b949e] uppercase"
							>Description</label
						>
						<input
							v-model="editedExpense.title"
							type="text"
							placeholder="Expense title"
							required
							class="w-full bg-slate-900 border border-gray-700 rounded-lg py-2 px-3 text-gray-400 focus:ring-1 focus:ring-sky-600 outline-none"
						/>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-1">
							<label class="text-xs font-semibold text-[#8b949e] uppercase"
								>Amount</label
							>
							<input
								v-model="editedExpense.amount"
								type="number"
								step="0.01"
								placeholder="0.00"
								required
								class="w-full bg-slate-900 border border-gray-700 rounded-lg py-2 px-3 text-gray-400 focus:ring-1 focus:ring-sky-600 outline-none"
							/>
						</div>
						<div class="space-y-1">
							<label class="text-xs font-semibold text-[#8b949e] uppercase"
								>Currency</label
							>
							<input
								v-model="editedExpense.currency"
								type="text"
								placeholder="USD"
								required
								class="w-full bg-slate-900 border border-gray-700 rounded-lg py-2 px-3 text-gray-400 focus:ring-1 focus:ring-sky-600 outline-none uppercase"
							/>
						</div>
					</div>

					<div class="pt-4 flex gap-3">
						<AppButton variant="secondary" class="flex-1" @click="close">
							Cancel
						</AppButton>
						<AppButton type="submit" variant="primary" class="flex-1">
							Save Changes
						</AppButton>
					</div>
				</form>
			</div>
		</div>
	</Transition>
</template>

<style scoped></style>
