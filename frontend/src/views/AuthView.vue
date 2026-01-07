<script lang="js" setup>
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useRouter } from 'vue-router'
import axiosIns from '@/plugins/axios'
import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
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

		authStore.setUser(data.user, data.token)

		router.push('/')
	} catch (error) {
		console.error(error)
		alert(error.message)
	}
})
</script>

<template>
	<div class="max-w-md mx-auto mt-12">
		<div class="bg-gray-800/50 p-8 rounded-2xl border border-zinc-700">
			<h1 class="text-3xl font-bold mb-8 text-center">
				{{ isNewUser ? 'Create Account' : 'Welcome Back' }}
			</h1>

			<form @submit.prevent="onSubmit" class="space-y-6">
				<AppInput
					label="Email"
					name="email"
					v-model="email"
					v-bind="emailAttrs"
					placeholder="email@example.com"
					autocomplete="email"
					:error-message="errors.email"
				/>

				<AppInput
					label="Password"
					type="password"
					name="password"
					v-model="password"
					v-bind="passwordAttrs"
					placeholder="••••••••"
					autocomplete="current-password"
					:error-message="errors.password"
				/>

				<AppButton type="submit" variant="primary" class="w-full">
					{{ isNewUser ? 'Sign up' : 'Sign in' }}
				</AppButton>

				<div class="text-center text-gray-400">
					<small v-if="isNewUser">
						Already have an account?
						<AppButton variant="ghost" @click="isNewUser = false" class="ml-1">
							Sign in
						</AppButton>
					</small>
					<small v-else>
						Don't have an account?
						<AppButton variant="ghost" @click="isNewUser = true" class="ml-1">
							Sign up
						</AppButton>
					</small>
				</div>
			</form>
		</div>
	</div>
</template>
