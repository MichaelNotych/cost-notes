<script setup>
import { onMounted, ref, watch, onUnmounted, computed } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useExpensesStore } from '@/stores/expenses'
import AppTitle from './atoms/AppTitle.vue'
import getCurrencySymbolFromCode from '@/plugins/currencies'
import AppButton from './AppButton.vue'
import PlusIcon from './icons/PlusIcon.vue'

defineEmits(['add-manual-expense'])

Chart.register(...registerables)

const expensesStore = useExpensesStore()
const chartCanvas = ref(null)
let chartInstance = null

const initChart = () => {
	if (!chartCanvas.value) return

	const data = expensesStore.currentWeekDailyTotals

	chartInstance = new Chart(chartCanvas.value, {
		type: 'bar',
		data: {
			labels: data.map((d) => d.label),
			datasets: [
				{
					label: 'Daily Total',
					data: data.map((d) => d.value),
					backgroundColor: 'rgba(56, 189, 248, 0.8)', // sky-400
					borderRadius: 8,
					borderSkipped: false,
					hoverBackgroundColor: 'rgba(56, 189, 248, 1)',
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					display: false,
				},
				tooltip: {
					backgroundColor: '#18181b', // zinc-900
					titleColor: '#f4f4f5', // zinc-100
					bodyColor: '#d4d4d8', // zinc-300
					borderColor: '#3f3f46', // zinc-700
					borderWidth: 1,
					padding: 12,
					displayColors: false,
					callbacks: {
						label: (context) => {
							return `$${context.parsed.y.toLocaleString()}`
						},
					},
				},
			},
			scales: {
				y: {
					beginAtZero: true,
					grid: {
						color: 'rgba(63, 63, 70, 0.3)', // zinc-700
					},
					ticks: {
						color: '#71717a', // zinc-500
						callback: (value) => `$${value}`,
					},
				},
				x: {
					grid: {
						display: false,
					},
					ticks: {
						color: '#71717a', // zinc-500
					},
				},
			},
		},
	})
}

const updateChart = () => {
	if (chartInstance) {
		const data = expensesStore.currentWeekDailyTotals
		chartInstance.data.labels = data.map((d) => d.label)
		chartInstance.data.datasets[0].data = data.map((d) => d.value)
		chartInstance.update()
	}
}

onMounted(() => {
	initChart()
})

onUnmounted(() => {
	if (chartInstance) {
		chartInstance.destroy()
	}
})

watch(
	() => expensesStore.currentWeekDailyTotals,
	() => {
		updateChart()
	},
	{ deep: true },
)

const weeklyTotal = computed(() => {
	return expensesStore.currentWeekDailyTotals.reduce((acc, curr) => acc + curr.value, 0)
})
</script>

<template>
	<div class="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-4 mb-6">
		<div class="flex items-center gap-3 mb-4">
			<AppTitle variant="subtitle" class="mr-auto">Weekly total:</AppTitle>
			<AppButton
				variant="outline"
				size="icon"
				rounded="full"
				@click="$emit('add-manual-expense', new Date().toISOString(), true)"
			>
				<PlusIcon class="opacity-50" />
			</AppButton>
			<AppTitle variant="subtitle">
				<span class="font-mono">
					{{ weeklyTotal.toLocaleString() }}
				</span>
				<span class="text-xs text-gray-400 ml-1">
					{{ getCurrencySymbolFromCode('USD') }}
				</span>
			</AppTitle>
		</div>
		<div class="h-48">
			<canvas ref="chartCanvas"></canvas>
		</div>
	</div>
</template>
