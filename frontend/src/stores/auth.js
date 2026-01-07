import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
	state: () => ({
		user: JSON.parse(localStorage.getItem('cn_user')) || null,
	}),

	getters: {
		isAuthenticated: (state) => !!state.user,
	},

	actions: {
		setUser(user, token) {
			this.user = user
			if (user) {
				localStorage.setItem('cn_user', JSON.stringify(user))
			} else {
				localStorage.removeItem('cn_user')
			}

			if (token) {
				localStorage.setItem('cn_token', token)
			} else if (token === null) {
				localStorage.removeItem('cn_token')
			}
		},

		logout() {
			this.setUser(null, null)
		},
	},
})
