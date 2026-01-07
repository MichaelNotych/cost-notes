import axios from 'axios'
import router from '../router'

import { useAuthStore } from '@/stores/auth'

const API_URL = import.meta.env.VITE_API_URL
const axiosIns = axios.create({
	baseURL: API_URL,
})

axiosIns.interceptors.request.use((config) => {
	const token = localStorage.getItem('cn_token')
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

axiosIns.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response && error.response.status === 401) {
			const authStore = useAuthStore()
			authStore.logout()
			router.push({ name: 'AuthView' })
		}
		return Promise.reject(error)
	},
)

export default axiosIns
