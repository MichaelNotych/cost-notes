<script setup>
import { ref } from 'vue'
import BottomSheet from './BottomSheet.vue'
import ManualExpenseForm from './ManualExpenseForm.vue'

const isOpen = ref(false)
const selectedDateStr = ref('')
const openCount = ref(0)

const toInputDate = (d) => {
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	return `${y}-${m}-${day}`
}

const open = (date, _isWeek = false) => {
	const d = date ? new Date(date) : new Date()
	selectedDateStr.value = toInputDate(isNaN(d.getTime()) ? new Date() : d)
	openCount.value++
	isOpen.value = true
}

const close = () => {
	isOpen.value = false
}

defineExpose({ open })
</script>

<template>
	<BottomSheet v-model="isOpen" title="New expense">
		<ManualExpenseForm :key="openCount" :initial-date="selectedDateStr" @done="close" />
	</BottomSheet>
</template>
