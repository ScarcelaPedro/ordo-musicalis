<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import ScaleTemplateForm from './ScaleTemplateForm.vue'
import FixedLinksEditor from './FixedLinksEditor.vue'
import Card from '@/components/Card.vue'

const route = useRoute()
const router = useRouter()
const flash = useFlashStore()
const template = ref<any>(null)
const comunidades = ref([])
const loading = ref(false)
const errors = ref<Record<string, string>>({})

const initialData = computed(() => template.value ? {
  celebracao: template.value.celebracao,
  horario: template.value.horario,
  diaSemana: template.value.diaSemana,
  tipoRecorrencia: template.value.tipoRecorrencia,
  ordinal: template.value.ordinal ?? 1,
  comunidadeId: template.value.comunidadeId,
  observacoes: template.value.observacoes ?? '',
  ativo: template.value.ativo,
} : undefined)

onMounted(async () => {
  const [t, c] = await Promise.all([
    client.get(`/scale-templates/${route.params.id}`),
    client.get('/comunidades'),
  ])
  template.value = t.data
  comunidades.value = c.data
})

async function submit(data: object) {
  if (loading.value) return // TASK-0075: guarda síncrona contra duplo clique
  loading.value = true
  try {
    await client.patch(`/scale-templates/${route.params.id}`, data)
    flash.set('success', 'Recorrência atualizada com sucesso!')
    router.push('/escalas-recorrentes')
  } catch (e: any) {
    errors.value = e.response?.data?.errors ?? {}
    flash.set('error', e.response?.data?.message ?? 'Erro ao atualizar')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-100">Editar Recorrência</h2>
    </template>
    <div class="space-y-6">
      <Card>
        <ScaleTemplateForm v-if="template" :initial-data="initialData" :comunidades="comunidades" :errors="errors" :loading="loading" @submit="submit" />
      </Card>

      <Card>
        <FixedLinksEditor :scale-template-id="Number(route.params.id)" />
      </Card>
    </div>
  </AuthenticatedLayout>
</template>
