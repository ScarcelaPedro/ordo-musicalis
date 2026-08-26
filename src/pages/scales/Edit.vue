<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import ScaleForm from './ScaleForm.vue'

const route = useRoute()
const router = useRouter()
const flash = useFlashStore()
const scale = ref<any>(null)
const servidores = ref([])
const teams = ref([])
const comunidades = ref([])
const celebrantes = ref([])
const categorias = ref([])
const loading = ref(false)

const initialData = computed(() => scale.value ? {
  dataCelebracao: scale.value.dataCelebracao.slice(0, 10),
  horario: scale.value.horario,
  celebracao: scale.value.celebracao,
  comunidadeId: scale.value.comunidadeId ?? null,
  celebranteId: scale.value.celebranteId ?? null,
  observacoes: scale.value.observacoes ?? '',
  status: scale.value.status,
  lembreteDiasAntes: scale.value.lembreteDiasAntes,
  servidores: scale.value.servidores.map((s: any) => ({
    servidorId: s.servidorId,
    instrumentId: s.instrumentId,
    teamId: s.teamId ?? null,
    categoriaId: s.categoriaId ?? null,
    funcaoLiturgica: s.funcaoLiturgica ?? null,
  })),
} : undefined)

onMounted(async () => {
  const [s, sv, t, c, cel, cat] = await Promise.all([
    client.get(`/scales/${route.params.id}`),
    client.get('/servidores'),
    client.get('/teams'),
    client.get('/comunidades'),
    client.get('/celebrantes'),
    client.get('/categorias'),
  ])
  scale.value = s.data
  servidores.value = sv.data
  teams.value = t.data
  comunidades.value = c.data
  celebrantes.value = cel.data
  categorias.value = cat.data
})

async function submit(data: object) {
  if (loading.value) return // TASK-0075: guarda síncrona contra duplo clique
  loading.value = true
  try {
    await client.patch(`/scales/${route.params.id}`, data)
    flash.set('success', 'Escala atualizada!')
    router.push(`/escalas/${route.params.id}`)
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao atualizar')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header><h2 class="font-semibold text-xl text-gray-800">Editar Escala</h2></template>
    <div class="bg-white shadow-sm rounded-lg p-6 dark:bg-gray-800">
      <ScaleForm v-if="scale" :initial-data="initialData" :servidores="servidores" :teams="teams" :comunidades="comunidades" :celebrantes="celebrantes" :categorias="categorias" :loading="loading" @submit="submit" />
    </div>
  </AuthenticatedLayout>
</template>
