import { defineStore } from 'pinia'
import axiosIns from '@/plugins/axios'
import { toast } from '@/plugins/toast'
import { LS_KEYS } from '@/constants'
import { useCategoriesStore } from '@/stores/categories'

const SYNC_TIMEOUT_MS = 15000

const loadCachedExpenses = () => {
	try {
		return JSON.parse(localStorage.getItem(LS_KEYS.EXPENSES_CACHE)) || {}
	} catch {
		return {}
	}
}

// Persist what's needed to render instantly on the next launch (and the offline queue)
export const persistExpensesCache = ({ allExpenses, calendarTotals, pendingExpenses }) => {
	try {
		localStorage.setItem(
			LS_KEYS.EXPENSES_CACHE,
			JSON.stringify({ allExpenses, calendarTotals, pendingExpenses }),
		)
	} catch (err) {
		console.error('Failed to persist expenses cache:', err)
	}
}

// crypto.randomUUID is unavailable on insecure origins (e.g. testing over LAN http)
const generateId = () =>
	crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

const isNetworkError = (err) => !err.response

// Returns the Monday (00:00:00) of the week containing `date`
const getMondayOfWeek = (date) => {
	const day = date.getDay()
	const monday = new Date(date)
	monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1))
	monday.setHours(0, 0, 0, 0)
	return monday
}

const mergeExpenses = (existing, incoming) => {
	const map = new Map(existing.map((e) => [e._id, e]))
	incoming.forEach((e) => map.set(e._id, e))
	return Array.from(map.values())
}

// Returns a "YYYY-MM-DD" key for a date in local time
const localDateKey = (date) => {
	const d = new Date(date)
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Returns the browser's UTC offset as a fixed "+HH:MM"/"-HH:MM" string
const tzOffsetString = () => {
	const minutes = -new Date().getTimezoneOffset()
	const sign = minutes >= 0 ? '+' : '-'
	const abs = Math.abs(minutes)
	return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`
}

// Returns a "<emoji> <name>" string for grouping category buckets
const getCategoryKey = (category) => {
	const name = typeof category === 'object' ? category?.name || 'Uncategorized' : 'Uncategorized'
	const emoji = typeof category === 'object' ? category?.emoji || '📝' : '📝'
	return `${emoji} ${name}`
}

// Groups expenses by a period key returned from `getPeriod(expense)`
// getPeriod must return { key, name, sortDate }
const groupExpensesByPeriod = (expenses, getPeriod) => {
	const map = {}
	expenses.forEach((expense) => {
		const { key, name, sortDate } = getPeriod(expense)
		if (!map[key]) {
			map[key] = { id: key, name, categories: {}, total: 0, sortDate }
		}
		const categoryKey = getCategoryKey(expense.category)
		const amount = expense.defaultCurrencyAmount || 0
		map[key].categories[categoryKey] = (map[key].categories[categoryKey] || 0) + amount
		map[key].total += amount
	})
	return Object.values(map)
		.sort((a, b) => b.sortDate - a.sortDate)
		.map(({ id, name, categories, total }) => ({ id, name, categories, total }))
}

export const useExpensesStore = defineStore('expenses', {
	state: () => {
		const cache = loadCachedExpenses()
		return {
			allExpenses: cache.allExpenses || [],
			// Expenses created offline: [{ localId, data }], replayed by syncPending()
			pendingExpenses: cache.pendingExpenses || [],
			isSyncing: false,
			error: null,
			isAddingExpense: false,
			isLoadingExpenses: false,
			currentWeekOffset: 0,
			loadedWeeks: 0,
			totalPages: 1,
			currentPage: 1,
			isLoadingCalendar: false,
			calendarTotals: cache.calendarTotals || {},
			dayExpenses: {},
			isLoadingDayExpenses: false,
		}
	},

	getters: {
		/**
		 * User's default currency, derived from loaded expense data.
		 * Checks both the regular and calendar expense lists.
		 */
		defaultCurrency: (state) => {
			return state.allExpenses.find((e) => e.defaultCurrency)?.defaultCurrency || 'USD'
		},

		/**
		 * Start and end dates of the currently selected week
		 */
		selectedWeekRange: (state) => {
			const monday = getMondayOfWeek(new Date())
			monday.setDate(monday.getDate() + state.currentWeekOffset * 7)

			const sunday = new Date(monday)
			sunday.setDate(monday.getDate() + 6)
			sunday.setHours(23, 59, 59, 999)

			return { monday, sunday }
		},

		/**
		 * Total amounts per day for the current week (Monday to Sunday)
		 * Returns an array of { label: string, value: number }
		 */
		currentWeekDailyTotals(state) {
			if (!state.allExpenses) return []

			const { monday, sunday } = this.selectedWeekRange

			const days = []
			for (let i = 0; i < 7; i++) {
				const date = new Date(monday)
				date.setDate(monday.getDate() + i)
				days.push({
					date: date.toDateString(),
					label: date.toLocaleDateString(undefined, { weekday: 'short' }),
					value: 0,
				})
			}

			state.allExpenses.forEach((expense) => {
				const expenseDate = new Date(expense.createdAt)
				expenseDate.setHours(0, 0, 0, 0)

				if (expenseDate >= monday && expenseDate <= sunday) {
					const expenseDateString = expenseDate.toDateString()

					const dayEntry = days.find((d) => d.date === expenseDateString)
					if (dayEntry) {
						dayEntry.value += expense.defaultCurrencyAmount || 0
					}
				}
			})

			return days.map(({ label, date, value }) => ({
				label,
				date: new Date(date).toISOString(),
				value,
			}))
		},

		/**
		 * Group expenses by date in descending order
		 * Returns an array of { date: string, items: Expense[] }
		 */
		groupedExpenses(state) {
			if (!state.allExpenses) return []

			const { monday, sunday } = this.selectedWeekRange

			const filteredExpenses = state.allExpenses.filter((expense) => {
				const d = new Date(expense.createdAt)
				return d >= monday && d <= sunday
			})

			const sortedExpenses = [...filteredExpenses].sort(
				(a, b) => new Date(b.createdAt) - new Date(a.createdAt),
			)

			const groupsArray = []
			let currentGroup = null

			sortedExpenses.forEach((expense) => {
				const date = new Date(expense.createdAt).toLocaleDateString(undefined, {
					weekday: 'short',
					month: 'short',
					day: 'numeric',
					year: 'numeric',
				})

				if (!currentGroup || currentGroup.date !== date) {
					currentGroup = { date, items: [] }
					groupsArray.push(currentGroup)
				}
				currentGroup.items.push(expense)
			})

			return groupsArray
		},

		/**
		 * Group expenses by week (Monday to Sunday)
		 * Returns an array of { id, name, categories, total }
		 */
		expensesByWeek: (state) => {
			if (!state.allExpenses || state.allExpenses.length === 0) return []
			return groupExpensesByPeriod(state.allExpenses, (expense) => {
				const monday = getMondayOfWeek(new Date(expense.createdAt))
				const sunday = new Date(monday)
				sunday.setDate(monday.getDate() + 6)
				sunday.setHours(23, 59, 59, 999)
				return {
					key: monday.toISOString().split('T')[0],
					name: `${monday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${sunday.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`,
					sortDate: monday,
				}
			})
		},

		/**
		 * Group expenses by month
		 * Returns an array of { id, name, categories, total }
		 */
		expensesByMonth: (state) => {
			if (!state.allExpenses || state.allExpenses.length === 0) return []
			return groupExpensesByPeriod(state.allExpenses, (expense) => {
				const date = new Date(expense.createdAt)
				const year = date.getFullYear()
				const month = date.getMonth()
				const monthDate = new Date(year, month, 1)
				return {
					key: `${year}-${String(month + 1).padStart(2, '0')}`,
					name: monthDate.toLocaleDateString(undefined, {
						month: 'long',
						year: 'numeric',
					}),
					sortDate: monthDate,
				}
			})
		},
	},

	actions: {
		prevWeek() {
			this.currentWeekOffset -= 1
			this.fetchExpenses()
		},
		nextWeek() {
			if (this.currentWeekOffset < 0) {
				this.currentWeekOffset += 1
				this.fetchExpenses()
			}
		},
		/**
		 * Fetch user expenses
		 */
		async fetchExpenses() {
			const requiredWeeks = Math.abs(this.currentWeekOffset) + 1
			if (this.loadedWeeks >= requiredWeeks) {
				return
			}

			this.error = null
			this.isLoadingExpenses = true
			try {
				const response = await axiosIns.get('/expenses', {
					params: {
						period: `${requiredWeeks}w`,
					},
				})
				// The first fetch replaces the cached snapshot (drops expenses deleted elsewhere)
				const base =
					this.loadedWeeks === 0
						? this.allExpenses.filter((e) => e.pending)
						: this.allExpenses
				this.allExpenses = mergeExpenses(base, response.data.expenses)
				this.totalPages = response.data.totalPages
				this.currentPage = response.data.currentPage
				this.loadedWeeks = requiredWeeks
			} catch (err) {
				console.error(err)
				this.error = err.response?.data?.message || 'Failed to fetch expenses'
			} finally {
				this.isLoadingExpenses = false
			}
		},

		async fetchAllExpenses(page = 1) {
			this.error = null
			this.isLoadingExpenses = true
			try {
				const response = await axiosIns.get('/expenses', {
					params: { page },
				})
				this.allExpenses = mergeExpenses(this.allExpenses, response.data.expenses)
				this.totalPages = response.data.totalPages
				this.currentPage = response.data.currentPage
			} catch (err) {
				console.error(err)
				this.error = err.response?.data?.message || 'Failed to fetch expenses'
			} finally {
				this.isLoadingExpenses = false
			}
		},

		/**
		 * Apply an expense to the local list, calendar totals and day cache
		 */
		applyAdded(expense) {
			this.allExpenses.push(expense)
			const dateKey = localDateKey(expense.createdAt)
			this.calendarTotals[dateKey] =
				(this.calendarTotals[dateKey] || 0) + (expense.defaultCurrencyAmount || 0)
			if (this.dayExpenses[dateKey]) {
				this.dayExpenses[dateKey] = [...this.dayExpenses[dateKey], expense]
			}
		},

		/**
		 * Remove an expense from the local list, calendar totals and day cache
		 */
		applyRemoved(expense) {
			this.allExpenses = this.allExpenses.filter((e) => e._id !== expense._id)
			const dateKey = localDateKey(expense.createdAt)
			this.calendarTotals[dateKey] =
				(this.calendarTotals[dateKey] || 0) - (expense.defaultCurrencyAmount || 0)
			if (this.dayExpenses[dateKey]) {
				this.dayExpenses[dateKey] = this.dayExpenses[dateKey].filter(
					(e) => e._id !== expense._id,
				)
			}
		},

		findExpense(id) {
			return (
				this.allExpenses.find((e) => e._id === id) ||
				Object.values(this.dayExpenses)
					.flat()
					.find((e) => e._id === id)
			)
		},

		/**
		 * Keep an expense locally and send it when the connection is back
		 */
		queueExpense(data) {
			const localId = `local-${generateId()}`
			const category = useCategoriesStore().categories.find((c) => c._id === data.category)
			this.pendingExpenses.push({ localId, data })
			this.applyAdded({
				...data,
				_id: localId,
				createdAt: new Date(data.createdAt || Date.now()).toISOString(),
				category: category || data.category,
				// Conversion happens on the server; only same-currency amounts can be counted now
				defaultCurrency: this.defaultCurrency,
				defaultCurrencyAmount: data.currency === this.defaultCurrency ? data.amount : 0,
				pending: true,
			})
		},

		/**
		 * Create a new expense. Falls back to the offline queue on network failure.
		 * @param {Object} expenseData
		 */
		async addExpense(expenseData) {
			this.error = null
			this.isAddingExpense = true
			try {
				if (!navigator.onLine) throw new Error('offline')
				const response = await axiosIns.post('/expense', expenseData, {
					timeout: SYNC_TIMEOUT_MS,
				})
				this.applyAdded(response.data)
				toast.success('Expense added successfully')
				return response.data
			} catch (err) {
				if (isNetworkError(err)) {
					this.queueExpense(expenseData)
					toast.info("You're offline — expense saved and will sync automatically")
					return null
				}
				console.error(err)
				this.error = err.response?.data?.message || 'Failed to add expense'
				toast.error(this.error)
				throw err
			} finally {
				this.isAddingExpense = false
			}
		},

		/**
		 * Send expenses created offline
		 */
		async syncPending() {
			if (this.isSyncing || this.pendingExpenses.length === 0 || !navigator.onLine) return
			this.isSyncing = true
			let synced = 0
			try {
				for (const item of [...this.pendingExpenses]) {
					const local = this.findExpense(item.localId)
					try {
						const response = await axiosIns.post('/expense', item.data, {
							timeout: SYNC_TIMEOUT_MS,
						})
						this.pendingExpenses = this.pendingExpenses.filter(
							(p) => p.localId !== item.localId,
						)
						if (local) this.applyRemoved(local)
						this.applyAdded(response.data)
						synced++
					} catch (err) {
						// Still offline: keep the rest of the queue for the next attempt
						if (isNetworkError(err)) break
						// Rejected by the server: drop it so it doesn't block the queue forever
						this.pendingExpenses = this.pendingExpenses.filter(
							(p) => p.localId !== item.localId,
						)
						if (local) this.applyRemoved(local)
						toast.error(
							`Couldn't sync "${item.data.title}": ${err.response?.data?.message || 'rejected by server'}`,
						)
					}
				}
				if (synced > 0) {
					toast.success(`Synced ${synced} offline expense${synced > 1 ? 's' : ''}`)
				}
			} finally {
				this.isSyncing = false
			}
		},

		/**
		 * Update an existing expense
		 * @param {string} id
		 * @param {Object} expenseData
		 */
		async updateExpense(id, expenseData) {
			this.error = null
			try {
				const oldExpense = this.findExpense(id)
				const response = await axiosIns.put(`/expense/${id}`, expenseData)
				const updatedExpense = response.data
				if (oldExpense) this.applyRemoved(oldExpense)
				this.applyAdded(updatedExpense)

				toast.success('Expense updated successfully')
				return updatedExpense
			} catch (err) {
				console.error(err)
				this.error = err.response?.data?.message || 'Failed to update expense'
				toast.error(this.error)
				throw err
			}
		},

		async fetchCalendarTotals(startDate, endDate) {
			this.isLoadingCalendar = true
			try {
				const response = await axiosIns.get('/expenses/totals', {
					params: { startDate, endDate, tz: tzOffsetString() },
				})
				// Replace the whole range so days whose expenses were deleted elsewhere are cleared
				const from = localDateKey(startDate)
				const to = localDateKey(endDate)
				const totals = Object.fromEntries(
					Object.entries(this.calendarTotals).filter(([key]) => key < from || key > to),
				)
				response.data.forEach(({ date, total }) => {
					totals[date] = total
				})
				this.allExpenses
					.filter((e) => e.pending)
					.forEach((e) => {
						const key = localDateKey(e.createdAt)
						totals[key] = (totals[key] || 0) + (e.defaultCurrencyAmount || 0)
					})
				this.calendarTotals = totals
			} catch (err) {
				console.error(err)
				this.error = err.response?.data?.message || 'Failed to fetch calendar totals'
			} finally {
				this.isLoadingCalendar = false
			}
		},

		async appendCalendarTotals(startDate, endDate) {
			try {
				const response = await axiosIns.get('/expenses/totals', {
					params: { startDate, endDate, tz: tzOffsetString() },
				})
				response.data.forEach(({ date, total }) => {
					this.calendarTotals[date] = total
				})
				return response.data.length
			} catch (err) {
				console.error(err)
				return 0
			}
		},

		async fetchDayExpenses(dateKey) {
			if (this.dayExpenses[dateKey]) return this.dayExpenses[dateKey]
			this.isLoadingDayExpenses = true
			try {
				const [y, m, d] = dateKey.split('-').map(Number)
				const startDate = new Date(y, m - 1, d, 0, 0, 0, 0).toISOString()
				const endDate = new Date(y, m - 1, d, 23, 59, 59, 999).toISOString()
				const response = await axiosIns.get('/expenses', {
					params: { startDate, endDate, limit: 500 },
				})
				this.dayExpenses[dateKey] = response.data.expenses
				return this.dayExpenses[dateKey]
			} catch (err) {
				console.error(err)
				this.error = err.response?.data?.message || 'Failed to fetch day expenses'
				return []
			} finally {
				this.isLoadingDayExpenses = false
			}
		},

		/**
		 * Delete an expense (optimistically — restored if the request fails)
		 * @param {string} id
		 */
		async deleteExpense(id) {
			this.error = null
			const expense = this.findExpense(id)
			if (expense) this.applyRemoved(expense)

			// Never reached the server: just drop it from the queue
			if (this.pendingExpenses.some((p) => p.localId === id)) {
				this.pendingExpenses = this.pendingExpenses.filter((p) => p.localId !== id)
				return
			}

			try {
				await axiosIns.delete(`/expense/${id}`)
				toast.success('Expense deleted successfully')
			} catch (err) {
				console.error(err)
				if (expense) this.applyAdded(expense)
				this.error = err.response?.data?.message || 'Failed to delete expense'
				toast.error(this.error)
				throw err
			}
		},
	},
})
