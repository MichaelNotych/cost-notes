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
		<h2 class="text-2xl font-bold text-gray-300 mb-6">Categories</h2>

		<!-- Existing Categories -->
		<div class="space-y-4">
			<div
				v-for="category in categoriesStore.categories"
				:key="category._id"
				class="bg-gray-900 rounded-xl p-4 border border-gray-700"
			>
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
		<div class="bg-gray-900 rounded-xl p-6 border border-gray-700 mt-8">
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

				<AppButton type="submit" variant="primary" class="w-full"> Add Category </AppButton>
			</form>
		</div>
	</div>
</template>

<style scoped></style>
