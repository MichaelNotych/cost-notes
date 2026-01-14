import { defineStore } from 'pinia'
import axiosIns from '@/plugins/axios'
import { toast } from '@/plugins/toast'

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
				toast.success('Category added successfully')
				return response.data
			} catch (err) {
				console.error(err)
				this.error = err.response?.data?.message || 'Failed to add category'
				toast.error(this.error)
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
				toast.success('Category updated successfully')
				return updatedCategory
			} catch (err) {
				console.error(err)
				this.error = err.response?.data?.message || 'Failed to update category'
				toast.error(this.error)
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
				toast.success('Category deleted successfully')
			} catch (err) {
				console.error(err)
				this.error = err.response?.data?.message || 'Failed to delete category'
				toast.error(this.error)
				throw err
			}
		},
	},
})
