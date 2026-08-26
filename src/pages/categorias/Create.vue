<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Card from '@/components/Card.vue'
import InputLabel from '@/components/InputLabel.vue'
import TextInput from '@/components/TextInput.vue'
import Checkbox from '@/components/Checkbox.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'

const router = useRouter()
const flash = useFlashStore()
const form = ref({ nome: '', ordem: 0, ativo: true })
const loading = ref(false)

async function submit() {
  if (loading.value) return // TASK-0075: guarda síncrona contra duplo clique
  loading.value = true
  try {
    await client.post('/categorias', form.value)
    flash.set('success', 'Categoria criada com sucesso!')
    router.push('/categorias')
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao criar categoria')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header><h2 class="font-semibold text-xl text-gray-800 dark:text-gray-100">Nova Categoria de Função</h2></template>
    <Card>
      <form @submit.prevent="submit" class="space-y-6">
        <div>
          <InputLabel value="Nome" :required="true" for="input-nome" />
          <TextInput id="input-nome" v-model="form.nome" class="mt-1" autofocus placeholder="Ex: Leitores" />
        </div>
        <div>
          <InputLabel value="Ordem de exibição" for="input-ordem" />
          <TextInput
            id="input-ordem"
            :model-value="form.ordem"
            @update:model-value="(v) => (form.ordem = Number(v))"
            type="number" class="mt-1"
          />
        </div>
        <Checkbox v-model="form.ativo" label="Categoria ativa" />

        <div class="flex items-center gap-4">
          <PrimaryButton :disabled="loading">{{ loading ? 'Salvando...' : 'Salvar' }}</PrimaryButton>
          <RouterLink to="/categorias"><SecondaryButton type="button">Cancelar</SecondaryButton></RouterLink>
        </div>
      </form>
    </Card>
  </AuthenticatedLayout>
</template>
