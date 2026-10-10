<script>
// Shared across all sheets so nested/overlapping sheets don't unlock the page early
let scrollLocks = 0

const lockScroll = () => {
	if (scrollLocks++ === 0) document.documentElement.style.overflow = 'hidden'
}

const unlockScroll = () => {
	if (--scrollLocks === 0) document.documentElement.style.overflow = ''
}
</script>

<script setup>
import { ref, computed, watch, onBeforeUnmount, onDeactivated } from 'vue'
import CloseIcon from './icons/CloseIcon.vue'

defineProps({
	title: { type: String, default: '' },
})

const open = defineModel({ type: Boolean, default: false })

const DISMISS_DISTANCE = 0.3 // fraction of sheet height
const DISMISS_VELOCITY = 0.5 // px/ms
const SETTLE_MS = 250

const panel = ref(null)
const body = ref(null)
const dragY = ref(0)
const isDragging = ref(false)
const isSettling = ref(false)

let isActive = false
let historyId = null

// ---------- Open / close lifecycle ----------

const close = () => {
	open.value = false
}

const onPopState = () => {
	// Back gesture / button: the history entry is already gone, just close
	historyId = null
	close()
}

const onKeydown = (e) => {
	if (e.key === 'Escape') close()
}

const activate = () => {
	isActive = true
	lockScroll()
	// Push a history entry so the Android back gesture closes the sheet instead of leaving the page
	historyId = Math.random().toString(36).slice(2)
	history.pushState({ ...history.state, sheet: historyId }, '')
	window.addEventListener('popstate', onPopState)
	window.addEventListener('keydown', onKeydown)
}

const deactivate = () => {
	if (!isActive) return
	isActive = false
	unlockScroll()
	window.removeEventListener('popstate', onPopState)
	window.removeEventListener('keydown', onKeydown)
	if (historyId && history.state?.sheet === historyId) history.back()
	historyId = null
}

watch(open, (isOpen) => (isOpen ? activate() : deactivate()))

onDeactivated(close)
onBeforeUnmount(deactivate)

// ---------- Swipe down to dismiss ----------

let startX = 0
let startY = 0
let lastY = 0
let lastT = 0
let velocity = 0
let tracking = false
let sheetHeight = 0
let suppressClick = false

// `keep` holds the final position (used when dismissing) until resetDrag runs after the sheet leaves,
// otherwise the panel would snap back to fully open before closing
const settle = (y, keep = false) => {
	isSettling.value = true
	dragY.value = y
	if (!keep) setTimeout(() => (isSettling.value = false), SETTLE_MS)
}

const onTouchStart = (e) => {
	if (e.touches.length !== 1 || isSettling.value) return
	const t = e.touches[0]
	startX = t.clientX
	startY = lastY = t.clientY
	lastT = e.timeStamp
	velocity = 0
	tracking = true
	sheetHeight = panel.value?.offsetHeight || window.innerHeight
}

const onTouchMove = (e) => {
	if (!tracking) return
	const t = e.touches[0]
	const dx = t.clientX - startX
	const dy = t.clientY - startY

	if (!isDragging.value) {
		const scrolledDown = body.value?.contains(e.target) && body.value.scrollTop > 0
		// Only pull the sheet for a downward, mostly vertical gesture when content is at the top
		if (dy <= 0 || Math.abs(dx) > Math.abs(dy) || scrolledDown) {
			if (Math.abs(dx) > 8 || Math.abs(dy) > 8) tracking = false
			return
		}
		e.preventDefault()
		if (dy < 8) return
		isDragging.value = true
	}

	e.preventDefault()
	if (e.timeStamp > lastT) velocity = (t.clientY - lastY) / (e.timeStamp - lastT)
	lastY = t.clientY
	lastT = e.timeStamp
	dragY.value = Math.max(0, dy - 8)
}

const onTouchEnd = () => {
	tracking = false
	if (!isDragging.value) return
	isDragging.value = false
	suppressClick = true
	setTimeout(() => (suppressClick = false), 50)

	if (dragY.value > sheetHeight * DISMISS_DISTANCE || velocity > DISMISS_VELOCITY) {
		settle(sheetHeight, true)
		setTimeout(close, SETTLE_MS)
	} else {
		settle(0)
	}
}

// A drag that ends over a button must not also press it
const onClickCapture = (e) => {
	if (!suppressClick) return
	e.stopPropagation()
	e.preventDefault()
}

const resetDrag = () => {
	dragY.value = 0
	isSettling.value = false
}

const panelStyle = computed(() => {
	if (isDragging.value) return { transform: `translateY(${dragY.value}px)`, transition: 'none' }
	if (isSettling.value)
		return {
			transform: `translateY(${dragY.value}px)`,
			transition: `transform ${SETTLE_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
		}
	return null
})

const backdropStyle = computed(() =>
	dragY.value && sheetHeight
		? {
				opacity: Math.max(0, 1 - dragY.value / sheetHeight),
				transition: isDragging.value ? 'none' : `opacity ${SETTLE_MS}ms`,
			}
		: null,
)

defineExpose({ close })
</script>

<template>
	<Teleport to="body">
		<Transition
			enter-active-class="transition-opacity duration-300 ease-out"
			enter-from-class="opacity-0"
			leave-active-class="transition-opacity duration-200 ease-in"
			leave-to-class="opacity-0"
		>
			<div
				v-if="open"
				class="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm"
				:style="backdropStyle"
				@click="close"
			/>
		</Transition>

		<Transition
			enter-active-class="transition-[translate] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
			enter-from-class="translate-y-full"
			leave-active-class="transition-[translate] duration-200 ease-in"
			leave-to-class="translate-y-full"
			@after-leave="resetDrag"
		>
			<div
				v-if="open"
				ref="panel"
				role="dialog"
				aria-modal="true"
				class="fixed inset-x-0 bottom-0 z-60 mx-auto w-full max-w-2xl max-h-[92dvh] flex flex-col bg-zinc-900 rounded-t-3xl shadow-2xl shadow-black/50"
				:style="panelStyle"
				@touchstart.passive="onTouchStart"
				@touchmove="onTouchMove"
				@touchend="onTouchEnd"
				@touchcancel="onTouchEnd"
				@click.capture="onClickCapture"
			>
				<!-- Grab handle -->
				<div class="flex justify-center pt-2 pb-1 shrink-0">
					<div class="h-1.5 w-10 rounded-full bg-zinc-700" />
				</div>

				<header class="flex items-center justify-between gap-3 px-5 pb-2 shrink-0">
					<slot name="header">
						<span class="font-semibold text-white text-base">{{ title }}</span>
					</slot>
					<button
						class="-mr-2 p-2.5 rounded-full text-zinc-400 transition-colors active:bg-zinc-800 hover:text-white"
						aria-label="Close"
						@click="close"
					>
						<CloseIcon />
					</button>
				</header>

				<div
					ref="body"
					class="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hide pb-[env(safe-area-inset-bottom)]"
				>
					<slot :close="close" />
				</div>
			</div>
		</Transition>
	</Teleport>
</template>
