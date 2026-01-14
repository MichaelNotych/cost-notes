<script setup>
import { useToast } from '@/plugins/toast'

const { state, remove } = useToast()
</script>

<template>
	<div
		class="fixed top-4 left-1/2 -translate-x-1/2 z-100 flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4"
	>
		<TransitionGroup name="toast" tag="div" class="flex flex-col items-center gap-2 w-full">
			<div
				v-for="toast in state.toasts"
				:key="toast.id"
				class="pointer-events-auto p-4 rounded-xl shadow-lg border backdrop-blur-md flex items-center justify-between gap-4 w-full cursor-pointer hover:brightness-110 transition-all"
				:class="{
					'bg-emerald-500/10 border-emerald-500/20 text-emerald-400':
						toast.type === 'success',
					'bg-red-500/10 border-red-500/20 text-red-400': toast.type === 'error',
					'bg-blue-500/10 border-blue-500/20 text-blue-400': toast.type === 'info',
				}"
				@click="remove(toast.id)"
			>
				<div class="flex items-center gap-3">
					<div
						v-if="toast.type === 'success'"
						class="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
					></div>
					<div
						v-if="toast.type === 'error'"
						class="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]"
					></div>
					<div
						v-if="toast.type === 'info'"
						class="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]"
					></div>
					<span class="text-sm font-medium">{{ toast.message }}</span>
				</div>
				<button
					class="opacity-50 hover:opacity-100 transition-opacity p-1 -mr-1"
					@click.stop="remove(toast.id)"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		</TransitionGroup>
	</div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
	transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.toast-enter-from {
	opacity: 0;
	transform: translateY(-20px) scale(0.95);
}

.toast-leave-to {
	opacity: 0;
	transform: translateY(-10px) scale(0.95);
}

.toast-move {
	transition: transform 0.3s ease;
}
</style>
