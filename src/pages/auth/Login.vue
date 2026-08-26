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
  if (loading.value) return // TASK-0075: guarda síncrona contra duplo clique
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
        <InputLabel value="Email" :required="true" for="input-email" />
        <TextInput id="input-email" v-model="email" type="email" class="mt-1" autofocus />
      </div>

      <div>
        <InputLabel value="Senha" :required="true" for="input-senha" />
        <TextInput id="input-senha" v-model="password" type="password" class="mt-1" />
      </div>

      <InputError :message="error" />

      <div class="flex items-center justify-between">
        <RouterLink to="/forgot-password" class="text-sm text-gray-600 hover:text-gray-900 underline dark:text-gray-400 dark:hover:text-gray-200">
          Esqueceu a senha?
        </RouterLink>
        <PrimaryButton :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </PrimaryButton>
      </div>

      <p class="text-center text-sm text-gray-600 dark:text-gray-400">
        Não tem conta?
        <RouterLink to="/register" class="text-gray-800 hover:text-gray-900 underline dark:text-gray-200 dark:hover:text-gray-100">
          Cadastre-se
        </RouterLink>
      </p>
    </form>
  </GuestLayout>
</template>
