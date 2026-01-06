import { defineStore } from 'pinia'
import axiosIns from '@/plugins/axios'

export const useExpensesStore = defineStore('expenses', {
	state: () => ({
		expenses: [],
		error: null,
		isAddingExpense: false,
		isLoadingExpenses: false
	}),

	getters: {
		/**
		 * Group expenses by date in descending order
		 * Returns an array of { date: string, items: Expense[] }
		 */
		groupedExpenses: (state) => {
			if (!state.expenses) return []

			const sortedExpenses = [...state.expenses].sort(
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
	},

	actions: {
		/**
		 * Fetch all user expenses
		 */
		async fetchExpenses() {
			this.error = null
			this.isLoadingExpenses = true
			try {
				const response = await axiosIns.get('/expenses')
				this.expenses = response.data
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
				return response.data
			} catch (err) {
				console.error(err)
				this.error = err.response?.data?.message || 'Failed to add expense'
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
				return response.data
			} catch (err) {
				console.error(err)
				this.error = err.response?.data?.message || 'Failed to add manual expense'
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
				return updatedExpense
			} catch (err) {
				console.error(err)
				this.error = err.response?.data?.message || 'Failed to update expense'
				throw err
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
			} catch (err) {
				console.error(err)
				this.error = err.response?.data?.message || 'Failed to delete expense'
				throw err
			}
		},
	},
})
