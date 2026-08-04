<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import InputLabel from '@/components/InputLabel.vue'
import TextInput from '@/components/TextInput.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'

const router = useRouter()
const flash = useFlashStore()
const form = ref({ nome: '', telefone: '', email: '', ativo: true })
const loading = ref(false)

async function submit() {
  loading.value = true
  try {
    await client.post('/celebrantes', form.value)
    flash.set('success', 'Celebrante criado com sucesso!')
    router.push('/celebrantes')
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao criar celebrante')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header><h2 class="font-semibold text-xl text-gray-800">Novo Celebrante</h2></template>
    <div class="bg-white shadow-sm rounded-lg p-6">
      <form @submit.prevent="submit" class="space-y-6">
        <div>
          <InputLabel value="Nome" :required="true" />
          <TextInput v-model="form.nome" class="mt-1" autofocus />
        </div>
        <div>
          <InputLabel value="Telefone" />
          <TextInput v-model="form.telefone" type="tel" class="mt-1" />
        </div>
        <div>
          <InputLabel value="Email" />
          <TextInput v-model="form.email" type="email" class="mt-1" />
        </div>
        <div class="flex items-center gap-3">
          <input id="ativo" v-model="form.ativo" type="checkbox" class="rounded border-gray-300 text-indigo-600" />
          <InputLabel value="Ativo" />
        </div>

        <div class="flex items-center gap-4">
          <PrimaryButton :disabled="loading">{{ loading ? 'Salvando...' : 'Salvar' }}</PrimaryButton>
          <RouterLink to="/celebrantes"><SecondaryButton type="button">Cancelar</SecondaryButton></RouterLink>
        </div>
      </form>
    </div>
  </AuthenticatedLayout>
</template>
