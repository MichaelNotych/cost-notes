<script setup>
import { onMounted, ref } from 'vue'
import { useCategoriesStore } from '@/stores/categories'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import CategoryItem from '@/components/CategoryItem.vue'
import AppForm from '@/components/AppForm.vue'
import AppButton from '@/components/AppButton.vue'
import SpinnerIcon from '@/components/icons/SpinnerIcon.vue'
import AppTitle from '@/components/atoms/AppTitle.vue'

const categoriesStore = useCategoriesStore()
const isCreating = ref(false)

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
		isCreating.value = false
	} catch (err) {
		console.error('Failed to add category:', err)
	}
}
</script>

<template>
	<div class="space-y-4">
		<div v-if="categoriesStore.loading" class="h-30 flex items-center justify-center">
			<SpinnerIcon />
		</div>
		<template v-else>
			<!-- Existing Categories -->
			<AppTitle>Categories</AppTitle>
			<div class="space-y-2">
				<CategoryItem
					v-for="category in categoriesStore.categories"
					:key="category._id"
					:category="category"
				/>
			</div>

			<!-- Add New Category -->
			<AppButton
				v-if="!isCreating"
				variant="secondary"
				class="w-full"
				@click="isCreating = true"
			>
				Create category
			</AppButton>
			<AppForm v-else :fields="fields" :schema="categorySchema" :on-submit="onAddCategory">
				<template #actions="{ isSubmitting }">
					<div class="flex gap-2">
						<AppButton
							variant="secondary"
							size="sm"
							class="flex-1"
							type="button"
							@click="isCreating = false"
						>
							Cancel
						</AppButton>
						<AppButton
							variant="primary"
							size="sm"
							class="flex-1"
							type="submit"
							:loading="isSubmitting"
						>
							Create
						</AppButton>
					</div>
				</template>
			</AppForm>
		</template>
	</div>
</template>

<style scoped></style>
