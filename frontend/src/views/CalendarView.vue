<script setup>
import { onMounted, onUnmounted, onActivated, computed, ref, nextTick } from 'vue'
import { useExpensesStore } from '@/stores/expenses'
import { useNumberFormat } from '@/composables/useNumberFormat'
import DailyExpense from '@/components/DailyExpense.vue'
import HeatmapCell from '@/components/HeatmapCell.vue'
import BottomSheet from '@/components/BottomSheet.vue'

const expensesStore = useExpensesStore()
const { fmtCompact, formatAmount } = useNumberFormat()

const displayedMonths = ref([]) // [{year, month}], oldest first (current month at the bottom)
const isLoadingMore = ref(false)
const hasMore = ref(true)
const sentinel = ref(null)
let observer = null

const today = new Date()

const dayTotals = computed(() => expensesStore.calendarTotals)

const maxDailyAmount = computed(() => {
	const vals = Object.values(dayTotals.value)
	return vals.length ? Math.max(...vals) : 0
})

const periodTotal = computed(() => Object.values(dayTotals.value).reduce((s, v) => s + v, 0))

const monthsData = computed(() =>
	displayedMonths.value.map(({ year, month: m }) => {
		const daysInMonth = new Date(year, m + 1, 0).getDate()
		const firstDayOfWeek = (new Date(year, m, 1).getDay() + 6) % 7 // 0=Mon

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
				key,
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

		// Current month averages over the days elapsed so far, not the whole month
		const isCurrentMonth = today.getFullYear() === year && today.getMonth() === m
		const elapsedDays = isCurrentMonth ? today.getDate() : daysInMonth

		return {
			name: new Date(year, m, 1).toLocaleDateString(undefined, {
				month: 'long',
				year: 'numeric',
			}),
			total: monthTotal,
			dayAvg: monthTotal / elapsedDays,
			weeks,
		}
	}),
)

const selectedDayKey = ref(null)
const isDayOpen = ref(false)

// Cached totals are shown immediately; the spinner is only for a cold start
const hasCalendarData = computed(() => Object.keys(dayTotals.value).length > 0)
const isInitialLoading = computed(() => expensesStore.isLoadingCalendar && !hasCalendarData.value)

const selectedDayExpenses = computed(() => {
	if (!selectedDayKey.value) return []
	return expensesStore.dayExpenses[selectedDayKey.value] || []
})

const isLoadingSelectedDay = computed(
	() => expensesStore.isLoadingDayExpenses && !expensesStore.dayExpenses[selectedDayKey.value],
)

const selectedDayTotal = computed(() =>
	selectedDayExpenses.value.reduce((s, e) => s + (e.defaultCurrencyAmount || 0), 0),
)

const selectedDayLabel = computed(() => {
	if (!selectedDayKey.value) return ''
	const [y, mo, d] = selectedDayKey.value.split('-').map(Number)
	return new Date(y, mo - 1, d).toLocaleDateString(undefined, {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
	})
})

const openDay = async (day) => {
	if (!day || day.isFuture) return
	selectedDayKey.value = day.key
	isDayOpen.value = true
	await expensesStore.fetchDayExpenses(day.key)
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

const scrollToBottom = () => window.scrollTo(0, document.documentElement.scrollHeight)

// Older months are inserted above the viewport; shift the scroll by the added height so the
// visible months stay in place (browser scroll anchoring is off so it doesn't double-adjust)
const prependMonths = async (months) => {
	const root = document.documentElement
	const prevHeight = root.scrollHeight
	root.style.overflowAnchor = 'none'
	displayedMonths.value.unshift(...months)
	await nextTick()
	window.scrollBy(0, root.scrollHeight - prevHeight)
	root.style.overflowAnchor = ''
}

const loadMoreMonths = async () => {
	if (isLoadingMore.value || expensesStore.isLoadingCalendar || !hasMore.value) return
	isLoadingMore.value = true

	const oldest = displayedMonths.value[0]
	const nextBatch = buildMonthsList(6, oldest.year, oldest.month - 1).reverse()
	const { startDate, endDate } = rangeForMonths(nextBatch)

	const count = await expensesStore.appendCalendarTotals(startDate, endDate)

	if (count === 0) {
		hasMore.value = false
		observer?.disconnect()
	} else {
		await prependMonths(nextBatch)
	}

	isLoadingMore.value = false
}

onMounted(async () => {
	const initialMonths = buildMonthsList(6, today.getFullYear(), today.getMonth()).reverse()
	displayedMonths.value = initialMonths

	// Cached totals render right away, so start at the current month before the refresh
	let scrolled = false
	await nextTick()
	if (hasCalendarData.value) {
		scrollToBottom()
		scrolled = true
	}

	const { startDate, endDate } = rangeForMonths(initialMonths)
	await expensesStore.fetchCalendarTotals(startDate, endDate)

	await nextTick()
	if (!scrolled) scrollToBottom()

	// Observe only once we're at the bottom, so the top sentinel doesn't fire straight away

	observer = new IntersectionObserver(
		(entries) => {
			if (entries[0].isIntersecting) loadMoreMonths()
		},
		{ threshold: 0.1 },
	)
	if (sentinel.value) observer.observe(sentinel.value)
})

// The tab is kept alive between switches; always come back to the current month
onActivated(scrollToBottom)

onUnmounted(() => {
	observer?.disconnect()
})
</script>

<template>
	<div class="flex flex-col flex-1">
		<!-- Header + legend stay visible while scrolling back through older months -->
		<div
			class="sticky top-[env(safe-area-inset-top)] z-20 -mx-4 px-4 pt-2 -mt-2 bg-zinc-800/90 backdrop-blur-md"
		>
			<div class="flex items-center justify-between mb-2">
				<h1 class="text-2xl font-semibold text-white">Calendar</h1>
				<p class="text-xs text-sky-400 font-mono">
					{{ formatAmount(periodTotal) }} {{ expensesStore.defaultCurrency }}
				</p>
			</div>

			<!-- Legend -->
			<div v-if="!isInitialLoading" class="flex items-center gap-2 pt-2 pb-3">
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
		</div>

		<!-- Initial loading -->
		<div v-if="isInitialLoading" class="flex justify-center py-12">
			<div
				class="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"
			></div>
		</div>

		<template v-else>
			<!-- Month blocks: oldest at the top, current month at the bottom -->
			<div class="space-y-6 pt-2 pb-4">
				<!-- Sentinel + loading more indicator: scrolling up loads older months -->
				<div ref="sentinel" class="flex justify-center py-4">
					<div
						v-if="isLoadingMore"
						class="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"
					></div>
					<p v-else-if="!hasMore" class="text-xs text-zinc-600">No more expenses</p>
				</div>

				<div v-for="month in monthsData" :key="month.name">
					<!-- Month header -->
					<div class="flex items-baseline justify-between mb-2">
						<h3 class="text-sm font-medium text-zinc-300 uppercase tracking-wide">
							{{ month.name }}
						</h3>
						<div class="flex items-baseline gap-2">
							<span v-if="month.total > 0" class="text-xs font-mono text-zinc-500">
								{{ formatAmount(month.dayAvg) }}/day
							</span>
							<span class="text-xs font-mono text-sky-500">
								{{ month.total > 0 ? formatAmount(month.total) : '—' }}
							</span>
						</div>
					</div>

					<!-- Day-of-week labels -->
					<div class="flex mb-1">
						<div
							v-for="d in ['M', 'T', 'W', 'T', 'F', 'S', 'S']"
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
							<HeatmapCell
								v-for="(day, di) in week.days"
								:key="di"
								:amount="day?.amount ?? 0"
								:max-amount="maxDailyAmount"
								:is-future="day?.isFuture ?? false"
								:is-today="day?.isToday ?? false"
								:empty="!day"
								clickable
								@click="openDay(day)"
							/>
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
			</div>
		</template>

		<!-- Day detail sheet -->
		<BottomSheet v-model="isDayOpen">
			<template #header>
				<div>
					<p class="font-semibold text-white text-sm">{{ selectedDayLabel }}</p>
					<p class="text-xs text-sky-400 font-mono mt-0.5">
						{{ formatAmount(selectedDayTotal) }}
						{{ expensesStore.defaultCurrency }}
					</p>
				</div>
			</template>

			<div class="px-2 pt-1 pb-6">
				<div v-if="isLoadingSelectedDay" class="flex justify-center py-6">
					<div
						class="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"
					></div>
				</div>
				<div v-else-if="selectedDayExpenses.length > 0" class="divide-y divide-zinc-700/30">
					<DailyExpense
						v-for="expense in selectedDayExpenses"
						:key="expense._id"
						:expense="expense"
					/>
				</div>
				<p v-else class="text-center text-zinc-500 text-sm py-6">No expenses</p>
			</div>
		</BottomSheet>
	</div>
</template>
