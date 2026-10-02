<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Card from '@/components/Card.vue'
import ScaleTemplateForm from './ScaleTemplateForm.vue'
import FixedLinksEditor from './FixedLinksEditor.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'

const router = useRouter()
const flash = useFlashStore()
const comunidades = ref([])
const loading = ref(false)
const errors = ref<Record<string, string>>({})

// TASK-0086 (correção): abordagem (b) recomendada no texto da task -- sem mudar o contrato da
// API (POST /scale-templates continua idêntico), só libera a seção de vínculos fixos nesta
// mesma tela assim que a recorrência criada tiver um id, em vez de exigir criar → salvar →
// voltar e editar depois. The links section is the same component as Edit.vue (TASK-0117).
const criado = ref<any>(null)

onMounted(async () => {
  const { data } = await client.get('/comunidades')
  comunidades.value = data
})

async function submit(data: object) {
  if (loading.value) return // TASK-0075: guarda síncrona contra duplo clique
  loading.value = true
  try {
    const { data: template } = await client.post('/scale-templates', data)
    criado.value = template
    flash.set('success', 'Recorrência criada com sucesso!')
  } catch (e: any) {
    errors.value = e.response?.data?.errors ?? {}
    flash.set('error', e.response?.data?.message ?? 'Erro ao criar recorrência')
  } finally {
    loading.value = false
  }
}

function concluir() {
  router.push('/escalas-recorrentes')
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-100">Nova Recorrência de Celebração</h2>
    </template>

    <div class="space-y-6">
      <Card v-if="!criado">
        <ScaleTemplateForm :comunidades="comunidades" :errors="errors" :loading="loading" @submit="submit" />
      </Card>

      <template v-else>
        <Card class="border border-success-200 dark:border-success-900/40">
          <p class="text-sm font-medium text-success-700 dark:text-success-400">
            Recorrência "{{ criado.celebracao }}" criada com sucesso<template v-if="criado.comunidade"> em {{ criado.comunidade.nome }}</template>. Configure abaixo os servidores que devem ser escalados automaticamente, se houver, ou conclua sem nenhum.
          </p>
        </Card>

        <Card>
          <FixedLinksEditor :scale-template-id="criado.id" />
        </Card>

        <div class="flex justify-end">
          <PrimaryButton type="button" @click="concluir">Concluir</PrimaryButton>
        </div>
      </template>
    </div>
  </AuthenticatedLayout>
</template>
