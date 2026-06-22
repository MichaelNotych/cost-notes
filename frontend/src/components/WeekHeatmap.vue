<script setup>
import { computed } from 'vue'
import { useExpensesStore } from '@/stores/expenses'
import AppTitle from './atoms/AppTitle.vue'
import AppDate from './atoms/AppDate.vue'
import AppButton from './atoms/AppButton.vue'
import HeatmapCell from './HeatmapCell.vue'
import PlusIcon from './icons/PlusIcon.vue'
import ChevronLeftIcon from './icons/ChevronLeftIcon.vue'
import ChevronRightIcon from './icons/ChevronRightIcon.vue'
import getCurrencySymbolFromCode from '@/plugins/currencies'

defineEmits(['add-manual-expense'])

const expensesStore = useExpensesStore()

const today = new Date()

const defaultCurrency = computed(() => {
	const first = expensesStore.expenses.find((e) => e.defaultCurrency)
	return first?.defaultCurrency || 'USD'
})

const days = computed(() => {
	return expensesStore.currentWeekDailyTotals.map((d) => ({
		...d,
		isToday: new Date(d.date).toDateString() === today.toDateString(),
		isFuture: new Date(d.date) > today,
	}))
})

const maxDailyAmount = computed(() => {
	const vals = days.value.map((d) => d.value)
	return vals.length ? Math.max(...vals) : 0
})

const weeklyTotal = computed(() => days.value.reduce((acc, d) => acc + d.value, 0))

const weekStartDate = computed(() => days.value[0]?.date ?? null)
const weekEndDate = computed(() => days.value[days.value.length - 1]?.date ?? null)
</script>

<template>
	<div class="mb-6">
		<div class="flex items-center gap-3 mb-4">
			<div class="flex items-center gap-2 mr-auto">
				<AppButton
					variant="secondary"
					size="icon"
					rounded="full"
					@click="expensesStore.prevWeek()"
				>
					<ChevronLeftIcon />
				</AppButton>

				<AppDate :startDate="weekStartDate" :endDate="weekEndDate" variant="small" />

				<AppButton
					variant="secondary"
					size="icon"
					rounded="full"
					@click="expensesStore.nextWeek()"
					:disabled="expensesStore.currentWeekOffset >= 0"
				>
					<ChevronRightIcon />
				</AppButton>
			</div>

			<AppButton
				variant="secondary"
				size="icon"
				rounded="full"
				@click="$emit('add-manual-expense', new Date().toISOString(), true)"
			>
				<PlusIcon />
			</AppButton>

			<AppTitle variant="subtitle">
				<span class="font-mono">{{ weeklyTotal.toLocaleString() }}</span>
				<span class="text-xs text-gray-400 ml-1">{{
					getCurrencySymbolFromCode(defaultCurrency)
				}}</span>
			</AppTitle>
		</div>

		<!-- Day labels -->
		<div class="flex mb-1">
			<div
				v-for="(d, i) in days"
				:key="i"
				class="flex-1 text-center text-xs text-zinc-600 font-medium"
			>
				{{ d.label }}
			</div>
		</div>

		<!-- Heatmap cells -->
		<div class="flex items-center">
			<HeatmapCell
				v-for="(day, i) in days"
				:key="i"
				:amount="day.value"
				:max-amount="maxDailyAmount"
				:is-future="day.isFuture"
				:is-today="day.isToday"
				show-amount
			/>
		</div>
	</div>
</template>
