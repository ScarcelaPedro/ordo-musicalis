<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Card from '@/components/Card.vue'
import InputLabel from '@/components/InputLabel.vue'
import TextInput from '@/components/TextInput.vue'
import Checkbox from '@/components/Checkbox.vue'
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
  if (loading.value) return // TASK-0075: guarda síncrona contra duplo clique
  loading.value = true
  try {
    await client.patch(`/comunidades/${route.params.id}`, form.value)
    flash.set('success', 'Comunidade atualizada com sucesso!')
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
    <template #header><h2 class="font-semibold text-xl text-gray-800 dark:text-gray-100">Editar Comunidade</h2></template>
    <Card>
      <form v-if="loaded" @submit.prevent="submit" class="space-y-6">
        <div>
          <InputLabel value="Nome" :required="true" for="input-nome" />
          <TextInput id="input-nome" v-model="form.nome" class="mt-1" />
        </div>
        <div>
          <InputLabel value="Endereço" for="input-endereco" />
          <TextInput id="input-endereco" v-model="form.endereco" class="mt-1" />
        </div>
        <Checkbox v-model="form.ativo" label="Comunidade ativa" />

        <div class="flex items-center gap-4">
          <PrimaryButton :disabled="loading">{{ loading ? 'Salvando...' : 'Salvar' }}</PrimaryButton>
          <RouterLink to="/comunidades"><SecondaryButton type="button">Cancelar</SecondaryButton></RouterLink>
        </div>
      </form>
    </Card>
  </AuthenticatedLayout>
</template>
