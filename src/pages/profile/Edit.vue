<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import InputLabel from '@/components/InputLabel.vue'
import TextInput from '@/components/TextInput.vue'
import InputError from '@/components/InputError.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import DangerButton from '@/components/DangerButton.vue'

const auth = useAuthStore()
const flash = useFlashStore()
const router = useRouter()

const profileForm = ref({ name: '', email: '' })
const passwordForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })
const deletePassword = ref('')
const profileError = ref('')
const passwordError = ref('')
const savingProfile = ref(false)
const savingPassword = ref(false)
const deleting = ref(false)

onMounted(async () => {
  const { data } = await client.get('/profile')
  profileForm.value.name = data.name
  profileForm.value.email = data.email
})

async function saveProfile() {
  savingProfile.value = true
  profileError.value = ''
  try {
    const { data } = await client.patch('/profile', profileForm.value)
    auth.user = { ...auth.user!, name: data.name, email: data.email }
    flash.set('success', 'Perfil atualizado!')
  } catch (e: any) {
    profileError.value = e.response?.data?.message ?? 'Erro ao atualizar perfil'
  } finally {
    savingProfile.value = false
  }
}

async function savePassword() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'As senhas não coincidem'
    return
  }
  savingPassword.value = true
  passwordError.value = ''
  try {
    await client.patch('/profile', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    })
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    flash.set('success', 'Senha atualizada!')
  } catch (e: any) {
    passwordError.value = e.response?.data?.message ?? 'Erro ao atualizar senha'
  } finally {
    savingPassword.value = false
  }
}

async function deleteAccount() {
  if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível.')) return
  deleting.value = true
  try {
    await client.delete('/profile', { data: { password: deletePassword.value } })
    auth.logout()
    router.push('/login')
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao excluir conta')
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header><h2 class="font-semibold text-xl text-gray-800">Perfil</h2></template>

    <div class="space-y-6">
      <!-- Dados pessoais -->
      <div class="bg-white shadow-sm rounded-lg p-6">
        <h3 class="font-semibold text-gray-700 mb-4">Informações do Perfil</h3>
        <form @submit.prevent="saveProfile" class="space-y-4">
          <div>
            <InputLabel value="Nome" />
            <TextInput v-model="profileForm.name" class="mt-1" />
          </div>
          <div>
            <InputLabel value="Email" />
            <TextInput v-model="profileForm.email" type="email" class="mt-1" />
          </div>
          <InputError :message="profileError" />
          <PrimaryButton :disabled="savingProfile">{{ savingProfile ? 'Salvando...' : 'Salvar' }}</PrimaryButton>
        </form>
      </div>

      <!-- Senha -->
      <div class="bg-white shadow-sm rounded-lg p-6">
        <h3 class="font-semibold text-gray-700 mb-4">Atualizar Senha</h3>
        <form @submit.prevent="savePassword" class="space-y-4">
          <div>
            <InputLabel value="Senha atual" />
            <TextInput v-model="passwordForm.currentPassword" type="password" class="mt-1" />
          </div>
          <div>
            <InputLabel value="Nova senha" />
            <TextInput v-model="passwordForm.newPassword" type="password" class="mt-1" />
          </div>
          <div>
            <InputLabel value="Confirmar nova senha" />
            <TextInput v-model="passwordForm.confirmPassword" type="password" class="mt-1" />
          </div>
          <InputError :message="passwordError" />
          <PrimaryButton :disabled="savingPassword">{{ savingPassword ? 'Salvando...' : 'Atualizar senha' }}</PrimaryButton>
        </form>
      </div>

      <!-- Excluir conta -->
      <div class="bg-white shadow-sm rounded-lg p-6 border border-red-100">
        <h3 class="font-semibold text-red-700 mb-2">Excluir Conta</h3>
        <p class="text-sm text-gray-600 mb-4">Esta ação é permanente e não pode ser desfeita.</p>
        <div class="space-y-3">
          <div>
            <InputLabel value="Confirme sua senha" />
            <TextInput v-model="deletePassword" type="password" class="mt-1 max-w-xs" />
          </div>
          <DangerButton :disabled="deleting" @click="deleteAccount">
            {{ deleting ? 'Excluindo...' : 'Excluir conta' }}
          </DangerButton>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
