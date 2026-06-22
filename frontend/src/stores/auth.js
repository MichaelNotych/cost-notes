import { defineStore } from 'pinia'
import axiosIns from '@/plugins/axios'
import { toast } from '@/plugins/toast'

export const useAuthStore = defineStore('auth', {
	state: () => ({
		user: JSON.parse(localStorage.getItem('cn_user')) || null,
	}),

	getters: {
		isAuthenticated: (state) => !!state.user,
	},

	actions: {
		setUser(user, accessToken, refreshToken) {
			this.user = user
			if (user) {
				localStorage.setItem('cn_user', JSON.stringify(user))
			} else {
				localStorage.removeItem('cn_user')
			}

			if (accessToken) {
				localStorage.setItem('cn_access_token', accessToken)
			} else if (accessToken === null) {
				localStorage.removeItem('cn_access_token')
			}

			if (refreshToken) {
				localStorage.setItem('cn_refresh_token', refreshToken)
			} else if (refreshToken === null) {
				localStorage.removeItem('cn_refresh_token')
			}

			// Remove old token key if it exists
			localStorage.removeItem('cn_token')
		},

		setTokens(accessToken, refreshToken) {
			if (accessToken) {
				localStorage.setItem('cn_access_token', accessToken)
			}
			if (refreshToken) {
				localStorage.setItem('cn_refresh_token', refreshToken)
			}
		},

		updateSetting(key, value) {
			if (!this.user) return
			this.user = {
				...this.user,
				settings: { ...this.user.settings, [key]: value },
			}
			localStorage.setItem('cn_user', JSON.stringify(this.user))
		},

		async logout() {
			try {
				// Call backend logout endpoint to revoke refresh token
				await axiosIns.post('/auth/logout', {
					refreshToken: localStorage.getItem('cn_refresh_token'),
				})
			} catch (error) {
				console.error('Logout error:', error)
				toast.error('Failed to logout smoothly, clearing session locally')
			} finally {
				// Clear local state regardless of API call result
				this.setUser(null, null, null)
			}
		},
	},
})
