<script setup lang="ts">
import { ref } from 'vue'
import client from '@/api/client'
import GuestLayout from '@/layouts/GuestLayout.vue'
import InputLabel from '@/components/InputLabel.vue'
import TextInput from '@/components/TextInput.vue'
import InputError from '@/components/InputError.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'

const email = ref('')
const status = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  if (loading.value) return // TASK-0075: guarda síncrona contra duplo clique
  loading.value = true
  error.value = ''
  status.value = ''
  try {
    const { data } = await client.post('/auth/forgot-password', { email: email.value })
    status.value = data.message
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    error.value = err.response?.data?.message ?? 'Erro ao enviar email'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <GuestLayout>
    <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
      Informe seu email e enviaremos um link para redefinir sua senha.
    </p>

    <p v-if="status" class="mb-4 text-sm text-success-700 dark:text-success-400">{{ status }}</p>

    <form @submit.prevent="submit" class="space-y-6">
      <div>
        <InputLabel value="Email" :required="true" for="input-email" />
        <TextInput id="input-email" v-model="email" type="email" class="mt-1" autofocus />
        <InputError :message="error" />
      </div>

      <div class="flex items-center justify-between">
        <RouterLink to="/login" class="text-sm text-gray-600 hover:text-gray-900 underline dark:text-gray-400 dark:hover:text-gray-200">Voltar</RouterLink>
        <PrimaryButton :disabled="loading">
          {{ loading ? 'Enviando...' : 'Enviar link' }}
        </PrimaryButton>
      </div>
    </form>
  </GuestLayout>
</template>
