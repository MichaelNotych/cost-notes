import { defineStore } from 'pinia'
import axiosIns from '@/plugins/axios'
import { toast } from '@/plugins/toast'

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
		 * Start and end dates of the currently selected week
		 */
		selectedWeekRange: (state) => {
			const today = new Date()
			const currentDay = today.getDay() // 0 (Sun) to 6 (Sat)
			const mondayDiff = currentDay === 0 ? -6 : 1 - currentDay
			const monday = new Date(today)
			monday.setDate(today.getDate() + mondayDiff + state.currentWeekOffset * 7)
			monday.setHours(0, 0, 0, 0)

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

			const weeksMap = {}

			state.expenses.forEach((expense) => {
				const date = new Date(expense.createdAt)
				// Get Monday of the week
				const day = date.getDay()
				const diff = date.getDate() - (day === 0 ? 6 : day - 1)
				const monday = new Date(date)
				monday.setDate(diff)
				monday.setHours(0, 0, 0, 0)

				const sunday = new Date(monday)
				sunday.setDate(monday.getDate() + 6)
				sunday.setHours(23, 59, 59, 999)

				const weekKey = monday.toISOString().split('T')[0]

				if (!weeksMap[weekKey]) {
					weeksMap[weekKey] = {
						id: weekKey,
						name: `${monday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${sunday.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`,
						categories: {},
						total: 0,
						mondayDate: monday,
					}
				}

				const categoryName =
					typeof expense.category === 'object'
						? expense.category.name || 'Uncategorized'
						: 'Uncategorized'
				const categoryEmoji =
					typeof expense.category === 'object' ? expense.category.emoji || '📝' : '📝'

				const categoryKey = `${categoryEmoji} ${categoryName}`
				const amount = expense.defaultCurrencyAmount || 0

				if (!weeksMap[weekKey].categories[categoryKey]) {
					weeksMap[weekKey].categories[categoryKey] = 0
				}
				weeksMap[weekKey].categories[categoryKey] += amount
				weeksMap[weekKey].total += amount
			})

			return Object.values(weeksMap)
				.sort((a, b) => b.mondayDate - a.mondayDate)
				.map(({ id, name, categories, total }) => ({
					id,
					name,
					categories,
					total,
				}))
		},

		/**
		 * Group expenses by month
		 * Returns an array of { id, name, categories, total }
		 */
		expensesByMonth: (state) => {
			if (!state.expenses || state.expenses.length === 0) return []

			const monthsMap = {}

			state.expenses.forEach((expense) => {
				const date = new Date(expense.createdAt)
				const month = date.getMonth()
				const year = date.getFullYear()

				const monthDate = new Date(year, month, 1)
				const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`

				if (!monthsMap[monthKey]) {
					monthsMap[monthKey] = {
						id: monthKey,
						name: monthDate.toLocaleDateString(undefined, {
							month: 'long',
							year: 'numeric',
						}),
						categories: {},
						total: 0,
						monthDate: monthDate,
					}
				}

				const categoryName =
					typeof expense.category === 'object'
						? expense.category.name || 'Uncategorized'
						: 'Uncategorized'
				const categoryEmoji =
					typeof expense.category === 'object' ? expense.category.emoji || '📝' : '📝'

				const categoryKey = `${categoryEmoji} ${categoryName}`
				const amount = expense.defaultCurrencyAmount || 0

				if (!monthsMap[monthKey].categories[categoryKey]) {
					monthsMap[monthKey].categories[categoryKey] = 0
				}
				monthsMap[monthKey].categories[categoryKey] += amount
				monthsMap[monthKey].total += amount
			})

			return Object.values(monthsMap)
				.sort((a, b) => b.monthDate - a.monthDate)
				.map(({ id, name, categories, total }) => ({
					id,
					name,
					categories,
					total,
				}))
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
