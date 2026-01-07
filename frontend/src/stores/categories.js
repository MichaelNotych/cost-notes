import { defineStore } from 'pinia'
import axiosIns from '@/plugins/axios'

export const useCategoriesStore = defineStore('categories', {
	state: () => ({
		categories: [],
		error: null,
		loading: false,
	}),

	actions: {
		/**
		 * Fetch all user categories
		 */
		async fetchCategories() {
			this.error = null
			this.loading = true
			try {
				const response = await axiosIns.get('/categories')
				this.categories = response.data
			} catch (err) {
				console.error(err)
				this.error = err.response?.data?.message || 'Failed to fetch categories'
			} finally {
				this.loading = false
			}
		},

		/**
		 * Create a new category
		 * @param {Object} categoryData - { name: string, emoji: string }
		 */
		async addCategory(categoryData) {
			this.error = null
			try {
				const response = await axiosIns.post('/category', categoryData)
				this.categories.push(response.data)
				return response.data
			} catch (err) {
				console.error(err)
				this.error = err.response?.data?.message || 'Failed to add category'
				throw err
			}
		},

		/**
		 * Update an existing category
		 * @param {string} id
		 * @param {Object} categoryData - { name: string, emoji: string }
		 */
		async updateCategory(id, categoryData) {
			this.error = null
			try {
				const response = await axiosIns.patch(`/category/${id}`, categoryData)
				const updatedCategory = response.data
				const index = this.categories.findIndex((c) => c._id === id)
				if (index !== -1) {
					this.categories[index] = updatedCategory
				}
				return updatedCategory
			} catch (err) {
				console.error(err)
				this.error = err.response?.data?.message || 'Failed to update category'
				throw err
			}
		},

		/**
		 * Delete a category
		 * @param {string} id
		 */
		async deleteCategory(id) {
			this.error = null
			try {
				await axiosIns.delete(`/category/${id}`)
				this.categories = this.categories.filter((c) => c._id !== id)
			} catch (err) {
				console.error(err)
				this.error = err.response?.data?.message || 'Failed to delete category'
				throw err
			}
		},
	},
})
