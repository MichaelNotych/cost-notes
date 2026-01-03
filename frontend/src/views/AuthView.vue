<script lang="js" setup>
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useRouter } from 'vue-router'
import axiosIns from '@/plugins/axios'

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
	<div class="container">
		<h1>{{ isNewUser ? 'Sign up' : 'Sign in' }}</h1>
		<form @submit="onSubmit">
			<fieldset>
				<label>
					Email
					<input
						name="email"
						v-model="email"
						v-bind="emailAttrs"
						placeholder="Email"
						autocomplete="email"
					/>
					<span class="error-msg">{{ errors.email }}</span>
				</label>
				<label>
					Password
					<input
						type="password"
						name="password"
						v-model="password"
						v-bind="passwordAttrs"
						placeholder="Password"
						autocomplete="current-password"
					/>
					<span class="error-msg">{{ errors.password }}</span>
				</label>
			</fieldset>

			<input type="submit" :value="isNewUser ? 'Sign up' : 'Sign in'" />
			<small v-if="isNewUser">
				Already have an account?
				<button type="button" @click="isNewUser = false">Sign in</button>
			</small>
			<small v-else>
				Don't have an account?
				<button type="button" @click="isNewUser = true">Sign up</button>
			</small>
		</form>
	</div>
</template>

<style scoped>
.error-msg {
	color: red;
	font-size: 0.8em;
	display: block;
	margin-top: 4px;
}
</style>
