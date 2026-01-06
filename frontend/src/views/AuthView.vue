<script lang="js" setup>
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useRouter } from 'vue-router'
import axiosIns from '@/plugins/axios'
import AppButton from '@/components/AppButton.vue'

const router = useRouter()
const isNewUser = ref(false)

const validationSchema = toTypedSchema(
	z.object({
		email: z.string().min(1, 'Email is required').email('Invalid email address'),
		password: z.string().min(6, 'Password must be at least 6 characters'),
	}),
)

const { errors, defineField, handleSubmit } = useForm({
	validationSchema,
})

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

const onSubmit = handleSubmit(async (values) => {
	try {
		const endpoint = isNewUser.value ? '/auth/register' : '/auth/login'
		const url = endpoint

		const response = await axiosIns.post(url, values)

		const data = response.data

		if (response.status !== 200) {
			throw new Error(data.message || 'Authentication failed')
		}

		// specific logic for storing token
		localStorage.setItem('cn_token', data.token)
		localStorage.setItem('cn_user', JSON.stringify(data.user))

		router.push('/')
	} catch (error) {
		console.error(error)
		alert(error.message)
	}
})
</script>

<template>
	<div class="max-w-md mx-auto mt-12">
		<div class="bg-[#161b22] p-8 rounded-2xl border border-gray-700 shadow-2xl">
			<h1 class="text-3xl font-bold text-[#c9d1d9] mb-8 text-center">
				{{ isNewUser ? 'Create Account' : 'Welcome Back' }}
			</h1>

			<form @submit.prevent="onSubmit" class="space-y-6">
				<div class="space-y-2">
					<label class="text-sm font-semibold text-[#8b949e] uppercase ml-1">Email</label>
					<input
						name="email"
						v-model="email"
						v-bind="emailAttrs"
						placeholder="email@example.com"
						autocomplete="email"
						class="w-full bg-slate-900 border border-gray-700 rounded-xl py-3 px-4 text-[#c9d1d9] shadow-inner focus:ring-2 focus:ring-sky-600 focus:border-transparent outline-none transition-all"
						:class="{ 'border-red-500 ring-red-500/20': errors.email }"
					/>
					<p v-if="errors.email" class="text-red-500 text-xs ml-1">{{ errors.email }}</p>
				</div>

				<div class="space-y-2">
					<label class="text-sm font-semibold text-[#8b949e] uppercase ml-1"
						>Password</label
					>
					<input
						type="password"
						name="password"
						v-model="password"
						v-bind="passwordAttrs"
						placeholder="••••••••"
						autocomplete="current-password"
						class="w-full bg-slate-900 border border-gray-700 rounded-xl py-3 px-4 text-[#c9d1d9] shadow-inner focus:ring-2 focus:ring-sky-600 focus:border-transparent outline-none transition-all"
						:class="{ 'border-red-500 ring-red-500/20': errors.password }"
					/>
					<p v-if="errors.password" class="text-red-500 text-xs ml-1">
						{{ errors.password }}
					</p>
				</div>

				<AppButton
					type="submit"
					variant="primary"
					class="w-full"
					:loading="true"
				>
					{{ isNewUser ? 'Sign up' : 'Sign in' }}
				</AppButton>

				<div class="text-center pt-2">
					<p v-if="isNewUser" class="text-[#8b949e] text-sm">
						Already have an account?
						<AppButton
							variant="ghost"
							@click="isNewUser = false"
							class="ml-1"
						>
							Sign in
						</AppButton>
					</p>
					<p v-else class="text-[#8b949e] text-sm">
						Don't have an account?
						<AppButton
							variant="ghost"
							@click="isNewUser = true"
							class="ml-1"
						>
							Sign up
						</AppButton>
					</p>
				</div>
			</form>
		</div>
	</div>
</template>

<style scoped></style>
