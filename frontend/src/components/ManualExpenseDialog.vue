<script setup>
import { ref, computed } from 'vue'
import { useExpensesStore } from '@/stores/expenses'
import { useCategoriesStore } from '@/stores/categories'
import CloseIcon from './icons/CloseIcon.vue'
import AppInput from '@/components/atoms/AppInput.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import getCurrencySymbolFromCode from '@/plugins/currencies'

const expensesStore = useExpensesStore()
const categoriesStore = useCategoriesStore()

const CURRENCIES = ['VND', 'LAK', 'USD', 'EUR', 'GBP', 'UAH', 'PLN', 'TRY', 'THB']
const LAST_CURRENCY_KEY = 'lastUsedCurrency'

const isOpen = ref(false)
const selectedDateStr = ref('')
const amountStr = ref('0')
const note = ref('')
const selectedCategory = ref(null)
const selectedCurrency = ref('USD')
const isSubmitting = ref(false)

const currencySymbol = computed(
	() => getCurrencySymbolFromCode(selectedCurrency.value) || selectedCurrency.value,
)

const canSave = computed(() => {
	const val = parseFloat(amountStr.value)
	return !isNaN(val) && val > 0 && selectedCategory.value
})

const toInputDate = (d) => {
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	return `${y}-${m}-${day}`
}

const open = (date, _isWeek = false) => {
	const d = date ? new Date(date) : new Date()
	selectedDateStr.value = toInputDate(isNaN(d.getTime()) ? new Date() : d)
	amountStr.value = '0'
	note.value = ''
	selectedCategory.value = categoriesStore.categories[0]?._id || null
	selectedCurrency.value = localStorage.getItem(LAST_CURRENCY_KEY) || 'USD'
	isOpen.value = true
}

const close = () => {
	isOpen.value = false
}

const pressKey = (key) => {
	if (key === '⌫') {
		amountStr.value = amountStr.value.length <= 1 ? '0' : amountStr.value.slice(0, -1)
		return
	}
	if (key === '.') {
		if (!amountStr.value.includes('.')) amountStr.value += '.'
		return
	}
	const parts = amountStr.value.split('.')
	if (parts[1] !== undefined && parts[1].length >= 2) return
	amountStr.value = amountStr.value === '0' ? key : amountStr.value + key
}

const handleSave = async () => {
	if (!canSave.value || isSubmitting.value) return
	isSubmitting.value = true
	try {
		localStorage.setItem(LAST_CURRENCY_KEY, selectedCurrency.value)
		const [y, m, d] = selectedDateStr.value.split('-').map(Number)
		const now = new Date()
		const createdAt = new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds())
		await expensesStore.addManualExpense({
			title: note.value.trim() || `${currencySymbol.value}${amountStr.value}`,
			amount: parseFloat(amountStr.value),
			currency: selectedCurrency.value,
			category: selectedCategory.value,
			createdAt,
		})
		close()
	} catch {
		// toast is shown by the store
	} finally {
		isSubmitting.value = false
	}
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
						<div class="w-9" />
						<span class="font-semibold text-white text-base">New expense</span>
						<button
							@click="close"
							class="p-2 -mr-2 text-zinc-400 hover:text-white transition-colors"
						>
							<CloseIcon />
						</button>
					</header>

					<!-- Currency picker -->
					<div class="flex justify-center mb-1">
						<label class="currency-picker relative">
							<select
								v-model="selectedCurrency"
								class="appearance-none bg-zinc-800 text-white text-sm font-medium pl-7 pr-7 py-1.5 rounded-full border border-zinc-700 focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
							>
								<option v-for="c in CURRENCIES" :key="c" :value="c">{{ c }}</option>
							</select>
							<span
								class="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-white pointer-events-none"
							>
								{{ currencySymbol }}
							</span>
						</label>
					</div>

					<!-- Amount display -->
					<div class="flex items-baseline justify-center gap-2 px-5 py-4">
						<span class="text-3xl text-zinc-500 font-light">{{ currencySymbol }}</span>
						<span
							class="text-6xl font-bold text-white tabular-nums tracking-tight min-w-0 break-all text-center"
						>
							{{ amountStr }}
						</span>
					</div>

					<!-- Note field -->
					<div class="mx-4 mb-3">
						<AppInput
							:value="note"
							@input="note = $event.target.value"
							type="text"
							placeholder="Title"
							class="text-base"
						/>
					</div>

					<!-- Date field -->
					<div class="mx-4 mb-3">
						<AppInput
							:value="selectedDateStr"
							@change="selectedDateStr = $event.target.value"
							type="date"
							class="text-base [color-scheme:dark]"
						/>
					</div>

					<!-- Category chips -->
					<div class="overflow-x-auto px-4 mb-3 scrollbar-hide">
						<div class="flex gap-2 w-max">
							<button
								v-for="cat in categoriesStore.categories"
								:key="cat._id"
								@click="selectedCategory = cat._id"
								class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
								:class="
									selectedCategory === cat._id
										? 'bg-sky-600 text-white'
										: 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
								"
							>
								<span>{{ cat.emoji }}</span>
								<span>{{ cat.name }}</span>
							</button>
						</div>
					</div>

					<!-- Numpad -->
					<div class="grid grid-cols-3 gap-2 px-4 mb-3">
						<button
							v-for="key in [
								'1',
								'2',
								'3',
								'4',
								'5',
								'6',
								'7',
								'8',
								'9',
								'.',
								'0',
								'⌫',
							]"
							:key="key"
							@click="pressKey(key)"
							class="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-white font-semibold text-xl rounded-2xl h-14 flex items-center justify-center transition-colors select-none touch-manipulation"
						>
							<template v-if="key === '⌫'">
								<svg
									class="w-5 h-5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
									<line x1="18" y1="9" x2="13" y2="14" />
									<line x1="13" y1="9" x2="18" y2="14" />
								</svg>
							</template>
							<template v-else>{{ key }}</template>
						</button>
					</div>

					<!-- Save button -->
					<div class="px-4 pb-10">
						<AppButton
							variant="primary"
							:disabled="!canSave"
							:loading="isSubmitting"
							rounded="2xl"
							class="w-full !py-4 font-semibold"
							@click="handleSave"
						>
							Save
						</AppButton>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<style scoped>
.currency-picker::after {
	content: '';
	position: absolute;
	right: 10px;
	top: 50%;
	width: 5px;
	height: 5px;
	border-right: 1.5px solid #a1a1aa;
	border-bottom: 1.5px solid #a1a1aa;
	transform: translateY(-70%) rotate(45deg);
	transition: transform 0.2s ease;
	pointer-events: none;
}

.currency-picker:focus-within::after {
	transform: translateY(-30%) rotate(225deg);
}

.scrollbar-hide::-webkit-scrollbar {
	display: none;
}
.scrollbar-hide {
	-ms-overflow-style: none;
	scrollbar-width: none;
}
</style>
