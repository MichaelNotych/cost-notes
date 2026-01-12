<script setup>
import { onMounted } from 'vue'
import { useCategoriesStore } from '@/stores/categories'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import AppButton from '@/components/AppButton.vue'
import AppForm from '@/components/AppForm.vue'
import SpinnerIcon from '@/components/icons/SpinnerIcon.vue'
import AppTitle from '@/components/atoms/AppTitle.vue'

const categoriesStore = useCategoriesStore()

const categorySchema = toTypedSchema(
	z.object({
		emoji: z.string().min(1, 'Emoji is required'),
		name: z.string().min(1, 'Name is required'),
	}),
)

const fields = [
	{
		name: 'emoji',
		placeholder: '🏷️',
		width: '60px',
		class: 'text-center',
	},
	{
		name: 'name',
		placeholder: 'Category name',
		width: '1fr',
	},
]

onMounted(async () => {
	await categoriesStore.fetchCategories()
})

const onAddCategory = async (values, { resetForm }) => {
	try {
		await categoriesStore.addCategory(values)
		resetForm()
	} catch (err) {
		console.error('Failed to add category:', err)
	}
}

const onUpdateCategory = async (values, categoryId) => {
	try {
		await categoriesStore.updateCategory(categoryId, values)
	} catch (err) {
		console.error('Failed to update category:', err)
	}
}

const onDeleteCategory = async (categoryId) => {
	if (!confirm('Are you sure?')) return
	try {
		await categoriesStore.deleteCategory(categoryId)
	} catch (err) {
		console.error('Failed to delete category:', err)
	}
}
</script>

<template>
	<div class="space-y-8">
		<div v-if="categoriesStore.loading" class="h-30 flex items-center justify-center">
			<SpinnerIcon />
		</div>
		<template v-else>
			<!-- Existing Categories -->
			<div class="space-y-8">
				<AppTitle variant="subtitle">Categories</AppTitle>
				<div
					v-for="category in categoriesStore.categories"
					:key="category._id"
					class="pb-8 border-b border-zinc-700 last:border-0"
				>
					<AppForm
						:fields="fields"
						:schema="categorySchema"
						:initial-values="{ emoji: category.emoji, name: category.name }"
						:on-submit="(values) => onUpdateCategory(values, category._id)"
					>
						<template #actions="{ isSubmitting }">
							<div class="flex gap-2">
								<AppButton
									variant="danger"
									size="sm"
									class="flex-1"
									type="button"
									@click="onDeleteCategory(category._id)"
								>
									Delete
								</AppButton>
								<AppButton
									variant="secondary"
									size="sm"
									class="flex-1"
									type="submit"
									:loading="isSubmitting"
								>
									Save
								</AppButton>
							</div>
						</template>
					</AppForm>
				</div>
			</div>

			<!-- Add New Category -->
			<div class="pt-4 space-y-4 border-t border-zinc-700">
				<AppTitle variant="subtitle">Add New Category</AppTitle>
				<AppForm
					:fields="fields"
					:schema="categorySchema"
					:on-submit="onAddCategory"
					submit-text="Create"
				/>
			</div>
		</template>
	</div>
</template>

<style scoped></style>
