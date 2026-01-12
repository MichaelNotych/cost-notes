<script setup>
import { ref } from 'vue'
import { Form, Field } from 'vee-validate'
import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'

const props = defineProps({
	fields: {
		type: Array,
		required: true,
		// Expected format: { name: string, label: string, type?: string, placeholder?: string, ...attrs }
	},
	schema: {
		type: Object,
		required: true,
	},
	submitText: {
		type: String,
		default: 'Submit',
	},
	onSubmit: {
		type: Function,
		required: true,
	},
	initialValues: {
		type: Object,
		default: undefined,
	},
})

const formRef = ref(null)
const submitError = ref(null)

const handleFormSubmit = async (values, ctx) => {
	submitError.value = null
	try {
		await props.onSubmit(values, ctx)
	} catch (err) {
		console.error('Form submission error:', err)
		submitError.value = err.message || 'An unexpected error occurred.'
		// Optional: re-throw if the component needs to handle it differently
		// throw err
	}
}

// Helper to filter out props that shouldn't be bound to the input element directly
const getFieldAttrs = (field) => {
	const { name, label, type, placeholder, width, options, ...rest } = field
	return rest
}

defineExpose({
	resetForm: (opts) => formRef.value?.resetForm(opts),
	setValues: (values) => formRef.value?.setValues(values),
})
</script>

<template>
	<Form
		ref="formRef"
		:validation-schema="schema"
		:initial-values="initialValues"
		@submit="handleFormSubmit"
		class="space-y-6"
		v-slot="{ isSubmitting, errors }"
	>
		<div class="flex flex-wrap gap-x-2 gap-y-4">
			<template v-for="field in fields" :key="field.name">
				<div
					:style="{
						width: field.width === '1fr' ? 'auto' : field.width || '100%',
						flex: field.width === '1fr' ? '1 1 0%' : 'none',
					}"
					class="min-w-0"
				>
					<Field :name="field.name" v-slot="{ field: fieldProps, errorMessage }">
						<template v-if="field.type === 'select'">
							<div class="space-y-1.5 flex flex-col group">
								<label
									v-if="field.label"
									class="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 group-focus-within:text-sky-500 transition-colors"
								>
									{{ field.label }}
								</label>
								<div class="relative">
									<select
										v-bind="fieldProps"
										class="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg py-2.5 px-4 text-gray-100 placeholder-gray-600 focus:ring-1 focus:ring-sky-600 outline-none transition-all appearance-none"
										:class="{ 'border-red-500': errorMessage }"
									>
										<option
											v-for="option in field.options"
											:key="option.value"
											:value="option.value"
										>
											{{ option.label }}
										</option>
									</select>
									<!-- Chevron icon -->
									<div
										class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500"
									>
										<svg
											class="w-4 h-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M19 9l-7 7-7-7"
											></path>
										</svg>
									</div>
								</div>
								<small v-if="errorMessage" class="text-red-500 text-xs ml-1">
									{{ errorMessage }}
								</small>
							</div>
						</template>
						<template v-else>
							<AppInput
								:label="field.label"
								:type="field.type || 'text'"
								:placeholder="field.placeholder"
								v-bind="fieldProps"
								:error-message="errorMessage"
								:class="field.class"
							/>
						</template>
					</Field>
				</div>
			</template>
		</div>

		<slot name="actions" :is-submitting="isSubmitting">
			<AppButton type="submit" variant="primary" class="w-full" :loading="isSubmitting">
				{{ submitText }}
			</AppButton>
		</slot>

		<!-- Slot for extra content like 'Forgot Password' or 'Sign Up' links -->
		<slot name="footer" />
	</Form>
</template>
