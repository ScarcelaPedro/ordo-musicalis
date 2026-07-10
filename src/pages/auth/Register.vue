<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import GuestLayout from '@/layouts/GuestLayout.vue'
import InputLabel from '@/components/InputLabel.vue'
import TextInput from '@/components/TextInput.vue'
import InputError from '@/components/InputError.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'

const auth = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''

  if (password.value !== passwordConfirmation.value) {
    error.value = 'As senhas não coincidem'
    return
  }

  loading.value = true
  try {
    await auth.register(name.value, email.value, password.value)
    router.push('/dashboard')
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    error.value = err.response?.data?.message ?? 'Erro ao criar conta'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <GuestLayout>
    <form @submit.prevent="submit" class="space-y-6">
      <div>
        <InputLabel value="Nome" :required="true" />
        <TextInput v-model="name" type="text" class="mt-1" autofocus />
      </div>

      <div>
        <InputLabel value="Email" :required="true" />
        <TextInput v-model="email" type="email" class="mt-1" />
      </div>

      <div>
        <InputLabel value="Senha" :required="true" />
        <TextInput v-model="password" type="password" class="mt-1" />
      </div>

      <div>
        <InputLabel value="Confirmar senha" :required="true" />
        <TextInput v-model="passwordConfirmation" type="password" class="mt-1" />
      </div>

      <InputError :message="error" />

      <div class="flex items-center justify-between">
        <RouterLink to="/login" class="text-sm text-gray-600 hover:text-gray-900 underline dark:text-gray-400 dark:hover:text-gray-200">
          Já tem conta? Entrar
        </RouterLink>
        <PrimaryButton :disabled="loading">
          {{ loading ? 'Criando conta...' : 'Criar conta' }}
        </PrimaryButton>
      </div>
    </form>
  </GuestLayout>
</template>
