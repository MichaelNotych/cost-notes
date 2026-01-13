import axios from 'axios'
import router from '../router'

import { useAuthStore } from '@/stores/auth'

const API_URL = import.meta.env.VITE_API_URL
const axiosIns = axios.create({
	baseURL: API_URL,
})

// Track if we're currently refreshing to prevent multiple simultaneous refresh requests
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error)
		} else {
			prom.resolve(token)
		}
	})

	failedQueue = []
}

axiosIns.interceptors.request.use((config) => {
	const token = localStorage.getItem('cn_access_token')
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

axiosIns.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config

		// If error is 401 and we haven't tried to refresh yet
		if (error.response && error.response.status === 401 && !originalRequest._retry) {
			// If we're already refreshing, queue this request
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject })
				})
					.then((token) => {
						originalRequest.headers.Authorization = `Bearer ${token}`
						return axiosIns(originalRequest)
					})
					.catch((err) => {
						return Promise.reject(err)
					})
			}

			originalRequest._retry = true
			isRefreshing = true

			const refreshToken = localStorage.getItem('cn_refresh_token')

			if (!refreshToken) {
				// No refresh token, logout user
				isRefreshing = false
				const authStore = useAuthStore()
				authStore.logout()
				router.push({ name: 'AuthView' })
				return Promise.reject(error)
			}

			try {
				// Call refresh endpoint
				const response = await axios.post(`${API_URL}/auth/refresh`, {
					refreshToken,
				})

				const { accessToken, refreshToken: newRefreshToken } = response.data

				// Update tokens in store
				const authStore = useAuthStore()
				authStore.setTokens(accessToken, newRefreshToken)

				// Update the authorization header
				axiosIns.defaults.headers.common.Authorization = `Bearer ${accessToken}`
				originalRequest.headers.Authorization = `Bearer ${accessToken}`

				// Process queued requests
				processQueue(null, accessToken)

				isRefreshing = false

				// Retry the original request
				return axiosIns(originalRequest)
			} catch (refreshError) {
				// Refresh failed, logout user
				processQueue(refreshError, null)
				isRefreshing = false

				const authStore = useAuthStore()
				authStore.logout()
				router.push({ name: 'AuthView' })

				return Promise.reject(refreshError)
			}
		}

		return Promise.reject(error)
	},
)

export default axiosIns
