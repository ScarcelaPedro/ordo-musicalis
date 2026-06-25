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
const musicians = ref([])
const teams = ref([])
const loading = ref(false)

const initialData = computed(() => scale.value ? {
  dataCelebracao: scale.value.dataCelebracao.slice(0, 10),
  horario: scale.value.horario,
  celebracao: scale.value.celebracao,
  teamId: scale.value.teamId ?? null,
  observacoes: scale.value.observacoes ?? '',
  status: scale.value.status,
  musicians: scale.value.musicians.map((m: any) => ({
    musicianId: m.musicianId,
    instrumentId: m.instrumentId,
  })),
} : undefined)

onMounted(async () => {
  const [s, m, t] = await Promise.all([
    client.get(`/scales/${route.params.id}`),
    client.get('/musicians'),
    client.get('/teams'),
  ])
  scale.value = s.data
  musicians.value = m.data
  teams.value = t.data
})

async function submit(data: object) {
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
    <div class="bg-white shadow-sm rounded-lg p-6">
      <ScaleForm v-if="scale" :initial-data="initialData" :musicians="musicians" :teams="teams" :loading="loading" @submit="submit" />
    </div>
  </AuthenticatedLayout>
</template>
