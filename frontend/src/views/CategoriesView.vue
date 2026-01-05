<script setup>
import { onMounted, ref } from 'vue'
import { useCategoriesStore } from '@/stores/categories'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

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
	<h2>Categories</h2>

	<!-- Existing Categories -->
	<article
		v-for="category in categoriesStore.categories"
		:key="category._id"
		class="category-item"
	>
		<div class="category-inputs">
			<input
				v-if="categoryForms[category._id]"
				type="text"
				name="category-emoji"
				placeholder="Emoji"
				v-model="categoryForms[category._id].emoji"
				:aria-invalid="categoryForms[category._id].errors.emoji ? 'true' : undefined"
				class="emoji-input"
			/>
			<small v-if="categoryForms[category._id]?.errors.emoji" class="error">
				{{ categoryForms[category._id].errors.emoji }}
			</small>

			<input
				v-if="categoryForms[category._id]"
				type="text"
				name="category-name"
				placeholder="Category name"
				v-model="categoryForms[category._id].name"
				:aria-invalid="categoryForms[category._id].errors.name ? 'true' : undefined"
				class="name-input"
			/>
			<small v-if="categoryForms[category._id]?.errors.name" class="error">
				{{ categoryForms[category._id].errors.name }}
			</small>
		</div>

		<div class="category-actions">
			<button @click="onUpdateCategory(category._id)" class="save-btn">Save</button>
			<button @click="onDeleteCategory(category._id)" class="delete-btn secondary">
				Delete
			</button>
		</div>
	</article>

	<!-- Add New Category -->
	<article class="new-category">
		<h3>Add New Category</h3>
		<form @submit.prevent="onAddCategory">
			<div class="category-inputs">
				<input
					type="text"
					name="new-category-emoji"
					placeholder="Emoji"
					v-model="newEmoji"
					:aria-invalid="newEmojiError ? 'true' : undefined"
					class="emoji-input"
				/>
				<small v-if="newEmojiError" class="error">{{ newEmojiError }}</small>

				<input
					type="text"
					name="new-category-name"
					placeholder="Category name"
					v-model="newName"
					:aria-invalid="newNameError ? 'true' : undefined"
					class="name-input"
				/>
				<small v-if="newNameError" class="error">{{ newNameError }}</small>
			</div>

			<button type="submit" class="add-btn">Add Category</button>
		</form>
	</article>
</template>

<style scoped>
.category-item,
.new-category {
	margin-bottom: 1rem;
}

.category-inputs {
	display: grid;
	grid-template-columns: 80px 1fr;
	gap: 0.5rem;
	margin-bottom: 0.5rem;
}

.emoji-input {
	grid-column: 1;
	text-align: center;
	font-size: 1.5rem;
}

.name-input {
	grid-column: 2;
}

.error {
	grid-column: span 2;
	color: var(--pico-del-color);
	margin-top: -0.5rem;
}

.category-actions {
	display: flex;
	gap: 0.5rem;
}

.save-btn,
.delete-btn,
.add-btn {
	flex: 1;
}
</style>
