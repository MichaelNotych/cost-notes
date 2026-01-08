<script setup>
import { onMounted, ref } from 'vue'
import { useCategoriesStore } from '@/stores/categories'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'

const categoriesStore = useCategoriesStore()

// New category form
const newCategorySchema = toTypedSchema(
	z.object({
		emoji: z.string().min(1, 'Emoji is required'),
		name: z.string().min(1, 'Name is required'),
	}),
)

const { handleSubmit: handleNewCategory, resetForm } = useForm({
	validationSchema: newCategorySchema,
})

const { value: newEmoji, errorMessage: newEmojiError } = useField('emoji')
const { value: newName, errorMessage: newNameError } = useField('name')

// Existing categories forms
const categoryForms = ref({})

const createCategoryForm = (category) => {
	const schema = toTypedSchema(
		z.object({
			emoji: z.string().min(1, 'Emoji is required'),
			name: z.string().min(1, 'Name is required'),
		}),
	)

	const form = useForm({
		validationSchema: schema,
		initialValues: {
			emoji: category.emoji,
			name: category.name,
		},
	})

	const [emoji] = form.defineField('emoji')
	const [name] = form.defineField('name')

	return { ...form, emoji, name }
}

onMounted(async () => {
	await categoriesStore.fetchCategories()
	// Initialize forms for existing categories
	categoriesStore.categories.forEach((category) => {
		categoryForms.value[category._id] = createCategoryForm(category)
	})
})

const onAddCategory = handleNewCategory(async (values) => {
	try {
		const newCategory = await categoriesStore.addCategory(values)
		categoryForms.value[newCategory._id] = createCategoryForm(newCategory)
		resetForm()
	} catch (err) {
		console.error('Failed to add category:', err)
	}
})

const onUpdateCategory = async (categoryId) => {
	const form = categoryForms.value[categoryId]
	if (!form) return

	await form.handleSubmit(async (values) => {
		try {
			await categoriesStore.updateCategory(categoryId, values)
		} catch (err) {
			console.error('Failed to update category:', err)
		}
	})()
}

const onDeleteCategory = async (categoryId) => {
	try {
		await categoriesStore.deleteCategory(categoryId)
		delete categoryForms.value[categoryId]
	} catch (err) {
		console.error('Failed to delete category:', err)
	}
}
</script>

<template>
	<div class="space-y-8">
		<div v-if="categoriesStore.loading" class="h-30 flex items-center justify-center">
			<svg
				class="animate-spin h-5 w-5 text-current"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle
					class="opacity-25"
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					stroke-width="4"
				></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
		</div>
		<template v-else>
			<!-- Existing Categories -->
			<div class="space-y-4">
				<div v-for="category in categoriesStore.categories" :key="category._id">
					<div class="grid grid-cols-[60px_1fr] gap-2 mb-2">
						<AppInput
							v-if="categoryForms[category._id]"
							placeholder="Emoji"
							v-model="categoryForms[category._id].emoji"
							:error-message="categoryForms[category._id].errors.emoji"
							class="text-center"
						/>

						<AppInput
							v-if="categoryForms[category._id]"
							placeholder="Category name"
							v-model="categoryForms[category._id].name"
							:error-message="categoryForms[category._id].errors.name"
						/>
					</div>

					<div class="flex gap-2">
						<AppButton
							variant="danger"
							size="sm"
							class="flex-1"
							@click="onDeleteCategory(category._id)"
						>
							Delete
						</AppButton>
						<AppButton
							variant="secondary"
							size="sm"
							class="flex-1"
							@click="onUpdateCategory(category._id)"
						>
							Save
						</AppButton>
					</div>
				</div>
			</div>
			<!-- Add New Category -->
			<div>
				<h3 class="text-lg font-bold text-gray-300 mb-4">Add New Category</h3>
				<form @submit.prevent="onAddCategory" class="space-y-2">
					<div class="grid grid-cols-[60px_1fr] gap-2">
						<AppInput
							placeholder="Emoji"
							v-model="newEmoji"
							:error-message="newEmojiError"
							class="text-center"
						/>

						<AppInput
							placeholder="Category name"
							v-model="newName"
							:error-message="newNameError"
						/>
					</div>

					<AppButton type="submit" size="sm" variant="primary" class="w-full">
						Create
					</AppButton>
				</form>
			</div>
		</template>
	</div>
</template>

<style scoped></style>
