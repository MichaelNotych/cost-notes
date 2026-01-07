<script setup>
import { onMounted, ref } from 'vue'
import { useCategoriesStore } from '@/stores/categories'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import AppButton from '@/components/AppButton.vue'

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
		<h2 class="text-2xl font-bold text-gray-400 mb-6">Categories</h2>

		<!-- Existing Categories -->
		<div class="space-y-4">
			<div
				v-for="category in categoriesStore.categories"
				:key="category._id"
				class="bg-[#161b22] rounded-xl p-4 border border-gray-700 shadow-lg"
			>
				<div class="grid grid-cols-[80px_1fr] gap-4 mb-4">
					<div class="relative">
						<input
							v-if="categoryForms[category._id]"
							type="text"
							placeholder="Emoji"
							v-model="categoryForms[category._id].emoji"
							class="w-full bg-slate-900 border border-gray-700 rounded-lg py-2 text-center focus:ring-1 focus:ring-sky-600 outline-none"
						/>
						<small
							v-if="categoryForms[category._id]?.errors.emoji"
							class="text-red-500 text-xs absolute -bottom-5 left-0"
						>
							{{ categoryForms[category._id].errors.emoji }}
						</small>
					</div>

					<div class="relative">
						<input
							v-if="categoryForms[category._id]"
							type="text"
							placeholder="Category name"
							v-model="categoryForms[category._id].name"
							class="w-full bg-slate-900 border border-gray-700 rounded-lg py-2 px-3 text-gray-400 focus:ring-1 focus:ring-sky-600 outline-none"
						/>
						<small
							v-if="categoryForms[category._id]?.errors.name"
							class="text-red-500 text-xs absolute -bottom-5 left-0"
						>
							{{ categoryForms[category._id].errors.name }}
						</small>
					</div>
				</div>

				<div class="flex gap-3">
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
		<div class="bg-[#161b22] rounded-xl p-6 border border-gray-700 shadow-xl mt-8">
			<h3 class="text-lg font-bold text-gray-400 mb-4">Add New Category</h3>
			<form @submit.prevent="onAddCategory" class="space-y-6">
				<div class="grid grid-cols-[80px_1fr] gap-4">
					<div class="relative">
						<input
							type="text"
							placeholder="Emoji"
							v-model="newEmoji"
							class="w-full bg-slate-900 border border-gray-700 rounded-lg py-2 text-center focus:ring-1 focus:ring-sky-600 outline-none"
						/>
						<small
							v-if="newEmojiError"
							class="text-red-500 text-xs absolute -bottom-5 left-0"
						>
							{{ newEmojiError }}
						</small>
					</div>

					<div class="relative">
						<input
							type="text"
							placeholder="Category name"
							v-model="newName"
							class="w-full bg-slate-900 border border-gray-700 rounded-lg py-2 px-3 text-gray-400 focus:ring-1 focus:ring-sky-600 outline-none"
						/>
						<small
							v-if="newNameError"
							class="text-red-500 text-xs absolute -bottom-5 left-0"
						>
							{{ newNameError }}
						</small>
					</div>
				</div>

				<AppButton type="submit" variant="primary" class="w-full"> Add Category </AppButton>
			</form>
		</div>
	</div>
</template>

<style scoped></style>
