<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import ScaleForm from './ScaleForm.vue'

const router = useRouter()
const flash = useFlashStore()
const servidores = ref([])
const teams = ref([])
const comunidades = ref([])
const celebrantes = ref([])
const categorias = ref([])
const loading = ref(false)

onMounted(async () => {
  const [s, t, c, cel, cat] = await Promise.all([
    client.get('/servidores'),
    client.get('/teams'),
    client.get('/comunidades'),
    client.get('/celebrantes'),
    client.get('/categorias'),
  ])
  servidores.value = s.data
  teams.value = t.data
  comunidades.value = c.data
  celebrantes.value = cel.data
  categorias.value = cat.data
})

async function submit(data: object) {
  loading.value = true
  try {
    const { data: scale } = await client.post('/scales', data)
    flash.set('success', 'Escala criada com sucesso!')
    router.push(`/escalas/${scale.id}`)
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao criar escala')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header><h2 class="font-semibold text-xl text-gray-800">Nova Escala</h2></template>
    <div class="bg-white shadow-sm rounded-lg p-6 dark:bg-gray-800">
      <ScaleForm :servidores="servidores" :teams="teams" :comunidades="comunidades" :celebrantes="celebrantes" :categorias="categorias" :loading="loading" @submit="submit" />
    </div>
  </AuthenticatedLayout>
</template>
