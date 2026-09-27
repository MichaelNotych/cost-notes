<script setup>
import { ref } from 'vue'
import CloseIcon from './icons/CloseIcon.vue'
import ManualExpenseForm from './ManualExpenseForm.vue'

const isOpen = ref(false)
const selectedDateStr = ref('')
const openCount = ref(0)

const toInputDate = (d) => {
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	return `${y}-${m}-${day}`
}

const open = (date, _isWeek = false) => {
	const d = date ? new Date(date) : new Date()
	selectedDateStr.value = toInputDate(isNaN(d.getTime()) ? new Date() : d)
	openCount.value++
	isOpen.value = true
}

const close = () => {
	isOpen.value = false
}

defineExpose({ open })
</script>

<template>
	<Teleport to="body">
		<!-- Backdrop -->
		<Transition
			enter-active-class="transition duration-200 ease-out"
			enter-from-class="opacity-0"
			enter-to-class="opacity-100"
			leave-active-class="transition duration-150 ease-in"
			leave-from-class="opacity-100"
			leave-to-class="opacity-0"
		>
			<div
				v-if="isOpen"
				class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
				@click="close"
			/>
		</Transition>

		<!-- Sheet -->
		<Transition
			enter-active-class="transition duration-300 ease-out"
			enter-from-class="translate-y-full"
			enter-to-class="translate-y-0"
			leave-active-class="transition duration-200 ease-in"
			leave-from-class="translate-y-0"
			leave-to-class="translate-y-full"
		>
			<div
				v-if="isOpen"
				class="fixed inset-x-0 bottom-0 z-50 flex justify-center"
				@click="close"
			>
				<div class="bg-zinc-900 w-full max-w-2xl rounded-t-3xl overflow-hidden" @click.stop>
					<!-- Header -->
					<header class="flex items-center justify-between px-5 py-2">
						<span class="font-semibold text-white text-base">New expense</span>
						<button
							@click="close"
							class="p-2 -mr-2 text-zinc-400 hover:text-white transition-colors"
						>
							<CloseIcon />
						</button>
					</header>

					<ManualExpenseForm
						:key="openCount"
						:initial-date="selectedDateStr"
						@done="close"
					/>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>
