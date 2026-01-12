<script setup>
import { ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useCategoriesStore } from '@/stores/categories'
import AppButton from '@/components/AppButton.vue'
import AppForm from '@/components/AppForm.vue'
import PencilIcon from '@/components/icons/PencilIcon.vue'

const props = defineProps({
	category: {
		type: Object,
		required: true,
	},
})

const categoriesStore = useCategoriesStore()
const isEditing = ref(false)

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

const onUpdateCategory = async (values) => {
	try {
		await categoriesStore.updateCategory(props.category._id, values)
		isEditing.value = false
	} catch (err) {
		console.error('Failed to update category:', err)
	}
}

const onDeleteCategory = async () => {
	if (!confirm('Are you sure?')) return
	try {
		await categoriesStore.deleteCategory(props.category._id)
	} catch (err) {
		console.error('Failed to delete category:', err)
	}
}
</script>

<template>
	<div class="pb-1 border-b border-zinc-700 last:border-0">
		<div v-if="!isEditing" class="flex items-center gap-4 py-1">
			<div class="w-[60px] text-center text-2xl">{{ category.emoji }}</div>
			<div class="flex-1 text-lg font-medium text-gray-100">{{ category.name }}</div>
			<AppButton variant="ghost" size="icon" @click="isEditing = true">
				<PencilIcon class="w-5 h-5" />
			</AppButton>
		</div>

		<AppForm
			v-else
			:fields="fields"
			:schema="categorySchema"
			:initial-values="{ emoji: category.emoji, name: category.name }"
			:on-submit="onUpdateCategory"
		>
			<template #actions="{ isSubmitting }">
				<div class="flex gap-2">
					<AppButton
						variant="secondary"
						size="sm"
						class="flex-1"
						type="button"
						@click="isEditing = false"
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
						Save
					</AppButton>
					<AppButton
						variant="danger"
						size="sm"
						class="flex-1"
						type="button"
						@click="onDeleteCategory"
					>
						Delete
					</AppButton>
				</div>
			</template>
		</AppForm>
	</div>
</template>
