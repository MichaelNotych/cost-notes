import { defineStore } from 'pinia'
import axiosIns from '@/plugins/axios'
import { toast } from '@/plugins/toast'
import { LS_KEYS } from '@/constants'

const { USER, ACCESS_TOKEN, REFRESH_TOKEN } = LS_KEYS

export const useAuthStore = defineStore('auth', {
	state: () => ({
		user: JSON.parse(localStorage.getItem(USER)) || null,
	}),

	getters: {
		isAuthenticated: (state) => !!state.user,
	},

	actions: {
		setUser(user, accessToken, refreshToken) {
			this.user = user
			if (user) {
				localStorage.setItem(USER, JSON.stringify(user))
			} else {
				localStorage.removeItem(USER)
			}

			if (accessToken) {
				localStorage.setItem(ACCESS_TOKEN, accessToken)
			} else if (accessToken === null) {
				localStorage.removeItem(ACCESS_TOKEN)
			}

			if (refreshToken) {
				localStorage.setItem(REFRESH_TOKEN, refreshToken)
			} else if (refreshToken === null) {
				localStorage.removeItem(REFRESH_TOKEN)
			}

			// Remove old token key if it exists
			localStorage.removeItem('cn_token')
		},

		setTokens(accessToken, refreshToken) {
			if (accessToken) {
				localStorage.setItem(ACCESS_TOKEN, accessToken)
			}
			if (refreshToken) {
				localStorage.setItem(REFRESH_TOKEN, refreshToken)
			}
		},

		updateSetting(key, value) {
			if (!this.user) return
			this.user = {
				...this.user,
				settings: { ...this.user.settings, [key]: value },
			}
			localStorage.setItem(USER, JSON.stringify(this.user))
		},

		async logout() {
			try {
				await axiosIns.post('/auth/logout', {
					refreshToken: localStorage.getItem(REFRESH_TOKEN),
				})
			} catch (error) {
				console.error('Logout error:', error)
				toast.error('Failed to logout smoothly, clearing session locally')
			} finally {
				this.setUser(null, null, null)
			}
		},
	},
})
