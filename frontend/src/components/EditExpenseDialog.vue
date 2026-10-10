<script setup>
import { ref } from 'vue'
import BottomSheet from './BottomSheet.vue'
import ManualExpenseForm from './ManualExpenseForm.vue'

const isOpen = ref(false)
const expense = ref(null)
const openCount = ref(0)

const open = (value) => {
	expense.value = value
	openCount.value++
	isOpen.value = true
}

const close = () => {
	isOpen.value = false
}

defineExpose({ open })
</script>

<template>
	<BottomSheet v-model="isOpen" title="Edit expense">
		<ManualExpenseForm v-if="expense" :key="openCount" :expense="expense" @done="close" />
	</BottomSheet>
</template>
