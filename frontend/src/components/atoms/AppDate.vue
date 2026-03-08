<script setup>
import { computed } from 'vue'
import AppTitle from './AppTitle.vue'

const props = defineProps({
	date: {
		type: [String, Date],
		default: null,
	},
	startDate: {
		type: [String, Date],
		default: null,
	},
	endDate: {
		type: [String, Date],
		default: null,
	},
	variant: {
		type: String,
		default: 'subtitle',
	},
})

const formatDate = (dateVal) => {
	if (!dateVal) return ''
	const dateObj = new Date(dateVal)
	if (isNaN(dateObj)) return ''
	const day = String(dateObj.getDate()).padStart(2, '0')
	const month = String(dateObj.getMonth() + 1).padStart(2, '0')
	return `${day}/${month}`
}

const displayDate = computed(() => {
	if (props.startDate && props.endDate) {
		return `${formatDate(props.startDate)} - ${formatDate(props.endDate)}`
	}
	if (props.date) {
		return formatDate(props.date)
	}
	return ''
})
</script>

<template>
	<AppTitle :variant="variant">
		<slot>{{ displayDate }}</slot>
	</AppTitle>
</template>
