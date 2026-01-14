<script setup>
import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'
import AppForm from '@/components/AppForm.vue'
import Card from '@/components/Card.vue'
import AppTitle from '@/components/atoms/AppTitle.vue'
import AppLabel from '@/components/atoms/AppLabel.vue'
import PlusIcon from '@/components/icons/PlusIcon.vue'
import SpinnerIcon from '@/components/icons/SpinnerIcon.vue'
import CloseIcon from '@/components/icons/CloseIcon.vue'
import PencilIcon from '@/components/icons/PencilIcon.vue'
import * as zod from 'zod'
import { toTypedSchema } from '@vee-validate/zod'

const buttonVariants = ['primary', 'secondary', 'danger', 'ghost']

// Form Example Setup
const schema = toTypedSchema(
	zod.object({
		title: zod.string().min(1, 'Title is required'),
		amount: zod.number().min(0.01, 'Amount must be positive'),
		category: zod.string().min(1, 'Category is required'),
	}),
)

const fields = [
	{ name: 'title', label: 'Title', placeholder: 'e.g. Coffee', width: '100%' },
	{ name: 'amount', label: 'Amount', type: 'number', placeholder: '0.00', width: '1fr' },
	{
		name: 'category',
		label: 'Category',
		type: 'select',
		width: '1fr',
		options: [
			{ label: 'Food', value: 'food' },
			{ label: 'Transport', value: 'transport' },
		],
	},
]

const handleFormSubmit = (values) => {
	console.log('Form values:', values)
	return new Promise((resolve) => setTimeout(resolve, 1000))
}
</script>

<template>
	<div class="min-h-screen text-gray-200 px-6 py-8 pb-50">
		<header class="mb-12">
			<h1
				class="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-sky-400 to-blue-600 mb-2"
			>
				Component Brand Kit
			</h1>
			<p class="text-zinc-500">A collection of base components and their variants.</p>
		</header>

		<div class="grid grid-cols-1 gap-12 max-w-4xl">
			<!-- Typography Section -->
			<section class="space-y-6">
				<h2
					class="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2"
				>
					Typography (Atoms)
				</h2>

				<div class="space-y-8">
					<div class="space-y-2">
						<span class="text-[10px] text-zinc-500 font-mono uppercase"
							>AppTitle (default)</span
						>
						<AppTitle>The quick brown fox</AppTitle>
					</div>

					<div class="space-y-2">
						<span class="text-[10px] text-zinc-500 font-mono uppercase"
							>AppTitle (subtitle)</span
						>
						<AppTitle variant="subtitle">Jumps over the lazy dog</AppTitle>
					</div>

					<div class="space-y-2">
						<span class="text-[10px] text-zinc-500 font-mono uppercase">AppLabel</span>
						<div class="flex flex-col gap-1">
							<AppLabel label="Email Address" name="example-email" />
						</div>
					</div>
				</div>
			</section>

			<!-- Buttons Section -->
			<section class="space-y-6">
				<h2
					class="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2"
				>
					AppButton
				</h2>

				<div class="space-y-8">
					<div>
						<h3 class="text-xs font-medium text-zinc-500 mb-4">Variants</h3>
						<div class="flex flex-wrap gap-4 items-center">
							<AppButton
								v-for="variant in buttonVariants"
								:key="variant"
								:variant="variant"
							>
								{{ variant }}
							</AppButton>
						</div>
					</div>

					<div>
						<h3 class="text-xs font-medium text-zinc-500 mb-4">Sizes & Icons</h3>
						<div class="flex flex-wrap items-center gap-4">
							<AppButton size="md">Medium</AppButton>
							<AppButton size="sm">Small</AppButton>
							<AppButton size="icon" variant="secondary" aria-label="Add">
								<PlusIcon />
							</AppButton>
						</div>
					</div>

					<div>
						<h3 class="text-xs font-medium text-zinc-500 mb-4">States</h3>
						<div class="flex flex-wrap gap-4 items-center">
							<AppButton disabled>Disabled</AppButton>
							<AppButton loading>Loading</AppButton>
							<AppButton variant="secondary" loading size="icon">
								<PlusIcon />
							</AppButton>
						</div>
					</div>
				</div>
			</section>

			<!-- Inputs Section -->
			<section class="space-y-6">
				<h2
					class="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2"
				>
					AppInput
				</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
					<AppInput label="Username" placeholder="Enter username" />
					<AppInput label="Password" type="password" value="secret" />
					<AppInput
						label="Error State"
						placeholder="Email"
						errorMessage="Invalid email format"
					/>
					<AppInput label="Number" type="number" placeholder="0.00" step="0.01" />
				</div>
			</section>

			<!-- Layout & Forms Section -->
			<section class="space-y-6">
				<h2
					class="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2"
				>
					Layout (Card) & AppForm
				</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div class="space-y-4">
						<h3 class="text-xs font-medium text-zinc-500">Card Component</h3>
						<Card>
							<p class="text-sm text-zinc-400">
								This is a simple card component used for grouping content.
							</p>
						</Card>
					</div>

					<div class="space-y-4">
						<h3 class="text-xs font-medium text-zinc-500">AppForm Integration</h3>
						<AppForm
							:fields="fields"
							:schema="schema"
							submit-text="Test Submit"
							:on-submit="handleFormSubmit"
						/>
					</div>
				</div>
			</section>

			<!-- Icons Section -->
			<section class="space-y-6">
				<h2
					class="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2"
				>
					Icons
				</h2>
				<div class="flex flex-wrap gap-8 text-sky-500">
					<div class="flex flex-col items-center gap-2">
						<PlusIcon />
						<span class="text-[10px] text-zinc-500">PlusIcon</span>
					</div>
					<div class="flex flex-col items-center gap-2">
						<SpinnerIcon />
						<span class="text-[10px] text-zinc-500">SpinnerIcon</span>
					</div>
					<div class="flex flex-col items-center gap-2">
						<CloseIcon />
						<span class="text-[10px] text-zinc-500">CloseIcon</span>
					</div>
					<div class="flex flex-col items-center gap-2">
						<PencilIcon />
						<span class="text-[10px] text-zinc-500">PencilIcon</span>
					</div>
				</div>
			</section>
		</div>
	</div>
</template>
