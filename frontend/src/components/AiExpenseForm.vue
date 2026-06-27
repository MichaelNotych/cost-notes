<script setup>
import { ref } from 'vue'
import { useExpensesStore } from '@/stores/expenses'
import AppButton from '@/components/atoms/AppButton.vue'

const emit = defineEmits(['done'])

const expensesStore = useExpensesStore()
const aiText = ref('')

const handleAiSubmit = async () => {
	if (!aiText.value.trim() || expensesStore.isAddingExpense) return
	try {
		await expensesStore.addExpense(aiText.value.trim())
		emit('done')
	} catch {
		// toast shown by store
	}
}
</script>

<template>
	<div class="px-4 pt-2 pb-10">
		<form
			@submit.prevent="handleAiSubmit"
			class="flex gap-0 overflow-hidden rounded-full border border-zinc-700/30"
		>
			<input
				v-model="aiText"
				type="text"
				placeholder="Enter your expense"
				autocomplete="off"
				class="flex-1 bg-transparent border-none py-3 px-4 text-gray-100 placeholder-gray-400 focus:ring-0 outline-none"
			/>
			<AppButton
				type="submit"
				variant="primary"
				rounded="none"
				:loading="expensesStore.isAddingExpense"
				:disabled="!aiText.trim()"
			>
				Add
			</AppButton>
		</form>
	</div>
</template>
