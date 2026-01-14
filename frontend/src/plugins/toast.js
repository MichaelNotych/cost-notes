import { reactive, inject } from 'vue'

const TOAST_SYMBOL = Symbol('toast')

export function createToastPlugin() {
	const state = reactive({
		toasts: [],
	})

	const removeToast = (id) => {
		state.toasts = state.toasts.filter((t) => t.id !== id)
	}

	const addToast = (message, type = 'info', duration = 3000) => {
		const id = Date.now() + Math.random()
		state.toasts.push({ id, message, type })

		if (duration > 0) {
			setTimeout(() => {
				removeToast(id)
			}, duration)
		}

		return id
	}

	const toast = {
		success: (message, duration) => addToast(message, 'success', duration),
		error: (message, duration) => addToast(message, 'error', duration),
		info: (message, duration) => addToast(message, 'info', duration),
		remove: removeToast,
		state: state,
	}

	return {
		install: (app) => {
			app.config.globalProperties.$toast = toast
			app.provide(TOAST_SYMBOL, toast)
		},
	}
}

export function useToast() {
	const toast = inject(TOAST_SYMBOL)
	if (!toast) {
		throw new Error('useToast() must be used within a component provided with the toast plugin')
	}
	return toast
}
