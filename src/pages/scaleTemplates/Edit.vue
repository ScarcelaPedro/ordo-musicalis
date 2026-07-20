<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import ScaleTemplateForm from './ScaleTemplateForm.vue'

const route = useRoute()
const router = useRouter()
const flash = useFlashStore()
const template = ref<any>(null)
const teams = ref([])
const loading = ref(false)
const errors = ref<Record<string, string>>({})

const initialData = computed(() => template.value ? {
  celebracao: template.value.celebracao,
  horario: template.value.horario,
  diaSemana: template.value.diaSemana,
  tipoRecorrencia: template.value.tipoRecorrencia,
  ordinal: template.value.ordinal ?? 1,
  teamId: template.value.teamId,
  observacoes: template.value.observacoes ?? '',
  ativo: template.value.ativo,
} : undefined)

onMounted(async () => {
  const [t, tm] = await Promise.all([
    client.get(`/scale-templates/${route.params.id}`),
    client.get('/teams'),
  ])
  template.value = t.data
  teams.value = tm.data
})

async function submit(data: object) {
  loading.value = true
  try {
    await client.patch(`/scale-templates/${route.params.id}`, data)
    flash.set('success', 'Recorrência atualizada!')
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
      <h2 class="font-semibold text-xl text-gray-800">Editar Recorrência</h2>
    </template>
    <div class="bg-white shadow-sm rounded-lg p-6">
      <ScaleTemplateForm v-if="template" :initial-data="initialData" :teams="teams" :errors="errors" :loading="loading" @submit="submit" />
    </div>
  </AuthenticatedLayout>
</template>
