<script setup>
import { onMounted, onUnmounted, computed, ref, nextTick } from 'vue'
import { useExpensesStore } from '@/stores/expenses'

const expensesStore = useExpensesStore()

const displayedMonths = ref([]) // [{year, month}], newest first
const isLoadingMore = ref(false)
const hasMore = ref(true)
const sentinel = ref(null)
let observer = null

const today = new Date()

const defaultCurrency = computed(() => {
	const first = expensesStore.calendarExpenses.find((e) => e.defaultCurrency)
	return first?.defaultCurrency || 'USD'
})

const dayTotals = computed(() => {
	const map = {}
	expensesStore.calendarExpenses.forEach((expense) => {
		const d = new Date(expense.createdAt)
		const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
		map[key] = (map[key] || 0) + (expense.defaultCurrencyAmount || 0)
	})
	return map
})

const maxDailyAmount = computed(() => {
	const vals = Object.values(dayTotals.value)
	return vals.length ? Math.max(...vals) : 0
})

const periodTotal = computed(() => Object.values(dayTotals.value).reduce((s, v) => s + v, 0))

const monthsData = computed(() =>
	displayedMonths.value.map(({ year, month: m }) => {
		const daysInMonth = new Date(year, m + 1, 0).getDate()
		const firstDayOfWeek = new Date(year, m, 1).getDay() // 0=Sun

		let monthTotal = 0
		const weeks = []
		let weekDays = Array(firstDayOfWeek).fill(null)
		let weekTotal = 0

		for (let day = 1; day <= daysInMonth; day++) {
			const key = `${year}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
			const amount = dayTotals.value[key] || 0
			monthTotal += amount

			weekDays.push({
				day,
				amount,
				isToday:
					today.getFullYear() === year &&
					today.getMonth() === m &&
					today.getDate() === day,
				isFuture: new Date(year, m, day) > today,
			})
			weekTotal += amount

			if (weekDays.length === 7) {
				weeks.push({ days: weekDays, total: weekTotal })
				weekDays = []
				weekTotal = 0
			}
		}

		if (weekDays.length > 0) {
			while (weekDays.length < 7) weekDays.push(null)
			weeks.push({ days: weekDays, total: weekTotal })
		}

		return {
			name: new Date(year, m, 1).toLocaleDateString(undefined, {
				month: 'long',
				year: 'numeric',
			}),
			total: monthTotal,
			weeks,
		}
	}),
)

const intensityClass = (amount, isFuture) => {
	if (isFuture) return 'bg-white/5'
	if (!amount) return 'bg-white/5'
	const max = maxDailyAmount.value
	if (!max) return 'bg-white/5'
	const r = amount / max
	if (r <= 0.15) return 'bg-sky-950'
	if (r <= 0.35) return 'bg-sky-900'
	if (r <= 0.55) return 'bg-sky-800'
	if (r <= 0.75) return 'bg-sky-700'
	if (r <= 0.9) return 'bg-sky-600'
	return 'bg-sky-400'
}

const fmt = (value) => {
	if (!value) return '0'
	return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const fmtCompact = (value) => {
	if (!value) return ''
	if (value >= 10000) return `${(value / 1000).toFixed(0)}k`
	if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
	return value.toFixed(0)
}

const buildMonthsList = (count, fromYear, fromMonth) =>
	Array.from({ length: count }, (_, i) => {
		const d = new Date(fromYear, fromMonth - i, 1)
		return { year: d.getFullYear(), month: d.getMonth() }
	})

const rangeForMonths = (months) => {
	const sorted = [...months].sort((a, b) => a.year - b.year || a.month - b.month)
	const first = sorted[0]
	const last = sorted[sorted.length - 1]
	return {
		startDate: new Date(first.year, first.month, 1).toISOString(),
		endDate: new Date(last.year, last.month + 1, 0, 23, 59, 59, 999).toISOString(),
	}
}

const loadMoreMonths = async () => {
	if (isLoadingMore.value || expensesStore.isLoadingCalendar || !hasMore.value) return
	isLoadingMore.value = true

	const oldest = displayedMonths.value[displayedMonths.value.length - 1]
	const nextBatch = buildMonthsList(6, oldest.year, oldest.month - 1)
	const { startDate, endDate } = rangeForMonths(nextBatch)

	const count = await expensesStore.appendCalendarExpenses(startDate, endDate)

	if (count === 0) {
		hasMore.value = false
		observer?.disconnect()
	} else {
		displayedMonths.value.push(...nextBatch)
	}

	isLoadingMore.value = false
}

onMounted(async () => {
	const initialMonths = buildMonthsList(6, today.getFullYear(), today.getMonth())
	displayedMonths.value = initialMonths

	const { startDate, endDate } = rangeForMonths(initialMonths)
	await expensesStore.fetchCalendarExpenses(startDate, endDate)

	await nextTick()

	observer = new IntersectionObserver(
		(entries) => {
			if (entries[0].isIntersecting) loadMoreMonths()
		},
		{ threshold: 0.1 },
	)
	if (sentinel.value) observer.observe(sentinel.value)
})

onUnmounted(() => {
	observer?.disconnect()
})
</script>

<template>
	<div class="flex flex-col flex-1 overflow-y-auto scrollbar-hide">
		<!-- Header -->
		<div class="flex items-center justify-between px-4 py-3 sticky top-0 bg-zinc-900 z-10">
			<p class="font-semibold text-white">Calendar</p>
			<p class="text-xs text-sky-400 font-mono">
				{{ fmt(periodTotal) }} {{ defaultCurrency }}
			</p>
		</div>

		<!-- Initial loading -->
		<div v-if="expensesStore.isLoadingCalendar" class="flex justify-center py-12">
			<div
				class="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"
			></div>
		</div>

		<template v-else>
			<!-- Legend -->
			<div class="flex items-center gap-2 px-4 pt-2 pb-4">
				<span class="text-xs text-zinc-500">$0</span>
				<div class="flex gap-0.5 flex-1">
					<div
						v-for="cls in [
							'bg-white/5',
							'bg-sky-950',
							'bg-sky-900',
							'bg-sky-800',
							'bg-sky-700',
							'bg-sky-600',
							'bg-sky-400',
						]"
						:key="cls"
						:class="cls"
						class="flex-1 h-3 rounded-sm"
					></div>
				</div>
				<span class="text-xs text-zinc-500">${{ fmtCompact(maxDailyAmount) }}</span>
			</div>

			<!-- Month blocks -->
			<div class="px-4 space-y-6 pb-4">
				<div v-for="(month, mi) in monthsData" :key="mi">
					<!-- Month header -->
					<div class="flex items-baseline justify-between mb-2">
						<h3 class="text-sm font-medium text-zinc-300 uppercase tracking-wide">
							{{ month.name }}
						</h3>
						<span class="text-xs font-mono text-sky-500">
							{{ month.total > 0 ? fmt(month.total) : '—' }}
						</span>
					</div>

					<!-- Day-of-week labels -->
					<div class="flex mb-1">
						<div
							v-for="d in ['S', 'M', 'T', 'W', 'T', 'F', 'S']"
							:key="d"
							class="flex-1 text-center text-xs text-zinc-600 font-medium"
						>
							{{ d }}
						</div>
						<div class="w-10 text-right text-xs text-zinc-600 font-medium pr-1">∑</div>
					</div>

					<!-- Weeks -->
					<div class="space-y-1">
						<div v-for="(week, wi) in month.weeks" :key="wi" class="flex items-center">
							<div
								v-for="(day, di) in week.days"
								:key="di"
								class="flex-1 aspect-square rounded-xl mx-0.5 transition-colors relative"
								:class="
									day ? intensityClass(day.amount, day.isFuture) : 'invisible'
								"
							>
								<div
									v-if="day?.isToday"
									class="absolute inset-0 rounded-xl ring-2 ring-sky-400 ring-offset-1 ring-offset-zinc-900"
								></div>
							</div>
							<div class="w-10 flex items-center justify-end pr-1">
								<span
									v-if="week.total > 0"
									class="text-xs font-mono text-zinc-400 leading-none"
								>
									{{ fmtCompact(week.total) }}
								</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Sentinel + loading more indicator -->
				<div ref="sentinel" class="flex justify-center py-4">
					<div
						v-if="isLoadingMore"
						class="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"
					></div>
					<p v-else-if="!hasMore" class="text-xs text-zinc-600">No more expenses</p>
				</div>
			</div>
		</template>
	</div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
	display: none;
}
.scrollbar-hide {
	-ms-overflow-style: none;
	scrollbar-width: none;
}
</style>
