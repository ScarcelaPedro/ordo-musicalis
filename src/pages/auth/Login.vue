<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import GuestLayout from '@/layouts/GuestLayout.vue'
import InputLabel from '@/components/InputLabel.vue'
import TextInput from '@/components/TextInput.vue'
import InputError from '@/components/InputError.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    const redirect = (route.query.redirect as string) ?? '/dashboard'
    router.push(redirect)
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    error.value = err.response?.data?.message ?? 'Erro ao fazer login'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <GuestLayout>
    <form @submit.prevent="submit" class="space-y-6">
      <div>
        <InputLabel value="Email" :required="true" />
        <TextInput v-model="email" type="email" class="mt-1" autofocus />
      </div>

      <div>
        <InputLabel value="Senha" :required="true" />
        <TextInput v-model="password" type="password" class="mt-1" />
      </div>

      <InputError :message="error" />

      <div class="flex items-center justify-between">
        <RouterLink to="/forgot-password" class="text-sm text-gray-600 hover:text-gray-900 underline">
          Esqueceu a senha?
        </RouterLink>
        <PrimaryButton :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </PrimaryButton>
      </div>
    </form>
  </GuestLayout>
</template>
