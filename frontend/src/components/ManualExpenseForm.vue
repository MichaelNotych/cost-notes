<script setup>
import { ref, computed } from 'vue'
import { useExpensesStore } from '@/stores/expenses'
import { useCategoriesStore } from '@/stores/categories'
import { LS_KEYS, CURRENCIES } from '@/constants'
import BackspaceIcon from './icons/BackspaceIcon.vue'
import AppInput from '@/components/atoms/AppInput.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import getCurrencySymbolFromCode from '@/plugins/currencies'

const props = defineProps({
	initialDate: { type: String, required: true },
})
const emit = defineEmits(['done'])

const expensesStore = useExpensesStore()
const categoriesStore = useCategoriesStore()

const amountStr = ref('0')
const note = ref('')
const selectedCategory = ref(categoriesStore.categories[0]?._id || null)
const selectedCurrency = ref(localStorage.getItem(LS_KEYS.LAST_CURRENCY) || 'USD')
const selectedDateStr = ref(props.initialDate)
const isSubmitting = ref(false)

const currencySymbol = computed(
	() => getCurrencySymbolFromCode(selectedCurrency.value) || selectedCurrency.value,
)

const canSave = computed(() => {
	const val = parseFloat(amountStr.value)
	return !isNaN(val) && val > 0 && selectedCategory.value
})

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
		localStorage.setItem(LS_KEYS.LAST_CURRENCY, selectedCurrency.value)
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
		emit('done')
	} catch {
		// toast shown by store
	} finally {
		isSubmitting.value = false
	}
}
</script>

<template>
	<!-- Currency picker -->
	<div class="flex justify-center mb-1">
		<label class="currency-picker relative">
			<select
				v-model="selectedCurrency"
				class="appearance-none bg-zinc-800 text-white text-sm font-medium pl-7 pr-7 py-1.5 rounded-full border border-zinc-700 focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
			>
				<option v-for="c in CURRENCIES" :key="c" :value="c">
					{{ c }}
				</option>
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
			v-for="key in ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫']"
			:key="key"
			@click="pressKey(key)"
			class="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-white text-2xl font-light rounded-2xl h-14 flex items-center justify-center transition-colors select-none touch-manipulation"
		>
			<template v-if="key === '⌫'">
				<BackspaceIcon class="w-6 h-6" />
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
			size="xl"
			rounded="2xl"
			class="w-full"
			@click="handleSave"
		>
			<span :class="`${isSubmitting ? 'opacity-0 w-0' : ''}`">Save</span>
		</AppButton>
	</div>
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
