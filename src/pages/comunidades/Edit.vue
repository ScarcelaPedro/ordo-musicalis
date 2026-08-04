<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import InputLabel from '@/components/InputLabel.vue'
import TextInput from '@/components/TextInput.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'

const route = useRoute()
const router = useRouter()
const flash = useFlashStore()
const form = ref({ nome: '', endereco: '', ativo: true })
const loading = ref(false)
const loaded = ref(false)

onMounted(async () => {
  const { data } = await client.get(`/comunidades/${route.params.id}`)
  form.value.nome = data.nome
  form.value.endereco = data.endereco ?? ''
  form.value.ativo = data.ativo
  loaded.value = true
})

async function submit() {
  loading.value = true
  try {
    await client.patch(`/comunidades/${route.params.id}`, form.value)
    flash.set('success', 'Comunidade atualizada!')
    router.push('/comunidades')
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao atualizar')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header><h2 class="font-semibold text-xl text-gray-800">Editar Comunidade</h2></template>
    <div class="bg-white shadow-sm rounded-lg p-6">
      <form v-if="loaded" @submit.prevent="submit" class="space-y-6">
        <div>
          <InputLabel value="Nome" :required="true" />
          <TextInput v-model="form.nome" class="mt-1" />
        </div>
        <div>
          <InputLabel value="Endereço" />
          <TextInput v-model="form.endereco" class="mt-1" />
        </div>
        <div class="flex items-center gap-3">
          <input v-model="form.ativo" type="checkbox" class="rounded border-gray-300 text-indigo-600" />
          <InputLabel value="Comunidade ativa" />
        </div>

        <div class="flex items-center gap-4">
          <PrimaryButton :disabled="loading">{{ loading ? 'Salvando...' : 'Salvar' }}</PrimaryButton>
          <RouterLink to="/comunidades"><SecondaryButton type="button">Cancelar</SecondaryButton></RouterLink>
        </div>
      </form>
    </div>
  </AuthenticatedLayout>
</template>
