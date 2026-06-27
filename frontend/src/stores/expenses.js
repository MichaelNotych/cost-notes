import { defineStore } from 'pinia'
import axiosIns from '@/plugins/axios'
import { toast } from '@/plugins/toast'

// Returns the Monday (00:00:00) of the week containing `date`
const getMondayOfWeek = (date) => {
	const day = date.getDay()
	const monday = new Date(date)
	monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1))
	monday.setHours(0, 0, 0, 0)
	return monday
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
	state: () => ({
		expenses: [],
		error: null,
		isAddingExpense: false,
		isLoadingExpenses: false,
		currentWeekOffset: 0,
		loadedWeeks: 0,
		totalPages: 1,
		currentPage: 1,
		calendarExpenses: [],
		isLoadingCalendar: false,
	}),

	getters: {
		/**
		 * User's default currency, derived from loaded expense data.
		 * Checks both the regular and calendar expense lists.
		 */
		defaultCurrency: (state) => {
			return (
				state.expenses.find((e) => e.defaultCurrency)?.defaultCurrency ||
				state.calendarExpenses.find((e) => e.defaultCurrency)?.defaultCurrency ||
				'USD'
			)
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
			if (!state.expenses) return []

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

			state.expenses.forEach((expense) => {
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
			if (!state.expenses) return []

			const { monday, sunday } = this.selectedWeekRange

			const filteredExpenses = state.expenses.filter((expense) => {
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
			if (!state.expenses || state.expenses.length === 0) return []
			return groupExpensesByPeriod(state.expenses, (expense) => {
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
			if (!state.expenses || state.expenses.length === 0) return []
			return groupExpensesByPeriod(state.expenses, (expense) => {
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
				this.expenses = response.data.expenses
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
				this.expenses = response.data.expenses
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
		 * Create a new expense
		 * @param {Object} expenseData
		 */
		async addExpense(expenseData) {
			this.error = null
			this.isAddingExpense = true
			try {
				const response = await axiosIns.post('/expense', {
					userDescription: expenseData,
				})
				this.expenses.push(response.data)
				toast.success('Expense added successfully')
				return response.data
			} catch (err) {
				console.error(err)
				this.error = err.response?.data?.message || 'Failed to add expense'
				toast.error(this.error)
				throw err
			} finally {
				this.isAddingExpense = false
			}
		},

		/**
		 * Create a new manual expense
		 * @param {Object} expenseData
		 */
		async addManualExpense(expenseData) {
			this.error = null
			this.isAddingExpense = true
			try {
				const response = await axiosIns.post('/manual-expense', expenseData)
				this.expenses.push(response.data)
				toast.success('Expense added successfully')
				return response.data
			} catch (err) {
				console.error(err)
				this.error = err.response?.data?.message || 'Failed to add manual expense'
				toast.error(this.error)
				throw err
			} finally {
				this.isAddingExpense = false
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
				const response = await axiosIns.put(`/expense/${id}`, expenseData)
				const updatedExpense = response.data
				const index = this.expenses.findIndex((e) => e._id === id)
				if (index !== -1) {
					this.expenses[index] = updatedExpense
				}
				toast.success('Expense updated successfully')
				return updatedExpense
			} catch (err) {
				console.error(err)
				this.error = err.response?.data?.message || 'Failed to update expense'
				toast.error(this.error)
				throw err
			}
		},

		async fetchCalendarExpenses(startDate, endDate) {
			this.isLoadingCalendar = true
			try {
				const response = await axiosIns.get('/expenses', {
					params: { startDate, endDate, limit: 2000 },
				})
				this.calendarExpenses = response.data.expenses
			} catch (err) {
				console.error(err)
				this.error = err.response?.data?.message || 'Failed to fetch calendar expenses'
			} finally {
				this.isLoadingCalendar = false
			}
		},

		async appendCalendarExpenses(startDate, endDate) {
			try {
				const response = await axiosIns.get('/expenses', {
					params: { startDate, endDate, limit: 2000 },
				})
				this.calendarExpenses.push(...response.data.expenses)
				return response.data.expenses.length
			} catch (err) {
				console.error(err)
				return 0
			}
		},

		/**
		 * Delete an expense
		 * @param {string} id
		 */
		async deleteExpense(id) {
			this.error = null
			try {
				await axiosIns.delete(`/expense/${id}`)
				this.expenses = this.expenses.filter((e) => e._id !== id)
				toast.success('Expense deleted successfully')
			} catch (err) {
				console.error(err)
				this.error = err.response?.data?.message || 'Failed to delete expense'
				toast.error(this.error)
				throw err
			}
		},
	},
})
