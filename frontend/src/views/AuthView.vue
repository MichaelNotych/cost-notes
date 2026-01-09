<script lang="js" setup>
import { ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useRouter } from 'vue-router'
import axiosIns from '@/plugins/axios'
import AppButton from '@/components/AppButton.vue'
import AppForm from '@/components/AppForm.vue'
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

const formFields = [
	{
		name: 'email',
		label: 'Email',
		placeholder: 'email@example.com',
		type: 'text',
		autocomplete: 'email',
	},
	{
		name: 'password',
		label: 'Password',
		placeholder: '••••••••',
		type: 'password',
		autocomplete: 'current-password',
	},
]

const handleFormSubmit = async (values) => {
	const endpoint = isNewUser.value ? '/auth/register' : '/auth/login'
	const url = endpoint

	const response = await axiosIns.post(url, values)

	const data = response.data

	if (response.status !== 200) {
		throw new Error(data.message || 'Authentication failed')
	}

	authStore.setUser(data.user, data.token)

	router.push('/')
}
</script>

<template>
	<div class="max-w-md mx-auto mt-12">
		<div>
			<h1 class="text-3xl font-medium mb-8 text-center">
				{{ isNewUser ? 'Create Account' : 'Welcome Back' }}
			</h1>

			<AppForm
				:fields="formFields"
				:schema="validationSchema"
				:submit-text="isNewUser ? 'Sign up' : 'Sign in'"
				:on-submit="handleFormSubmit"
			>
				<template #footer>
					<div class="text-center text-gray-400 mt-4">
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
				</template>
			</AppForm>
		</div>
	</div>
</template>
