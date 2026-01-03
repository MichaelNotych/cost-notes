import axios from 'axios'
import router from '../router'

const axiosIns = axios.create({
	baseURL: '/api',
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
			localStorage.removeItem('cn_token')
			router.push({ name: 'AuthView' })
		}
		return Promise.reject(error)
	}
)

export default axiosIns
