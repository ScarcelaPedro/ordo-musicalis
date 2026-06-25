<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import client from '@/api/client'
import GuestLayout from '@/layouts/GuestLayout.vue'
import InputLabel from '@/components/InputLabel.vue'
import TextInput from '@/components/TextInput.vue'
import InputError from '@/components/InputError.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'

const route = useRoute()
const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  if (password.value !== confirmPassword.value) {
    error.value = 'As senhas não coincidem'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await client.post('/auth/reset-password', {
      email: route.query.email,
      token: route.query.token,
      password: password.value,
    })
    router.push('/login')
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    error.value = err.response?.data?.message ?? 'Erro ao redefinir senha'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <GuestLayout>
    <form @submit.prevent="submit" class="space-y-6">
      <div>
        <InputLabel value="Nova senha" :required="true" />
        <TextInput v-model="password" type="password" class="mt-1" autofocus />
      </div>
      <div>
        <InputLabel value="Confirmar senha" :required="true" />
        <TextInput v-model="confirmPassword" type="password" class="mt-1" />
      </div>
      <InputError :message="error" />
      <div class="flex justify-end">
        <PrimaryButton :disabled="loading">
          {{ loading ? 'Salvando...' : 'Redefinir senha' }}
        </PrimaryButton>
      </div>
    </form>
  </GuestLayout>
</template>
