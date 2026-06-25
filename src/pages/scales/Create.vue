<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import ScaleForm from './ScaleForm.vue'

const router = useRouter()
const flash = useFlashStore()
const musicians = ref([])
const teams = ref([])
const loading = ref(false)

onMounted(async () => {
  const [m, t] = await Promise.all([client.get('/musicians'), client.get('/teams')])
  musicians.value = m.data
  teams.value = t.data
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
    <div class="bg-white shadow-sm rounded-lg p-6">
      <ScaleForm :musicians="musicians" :teams="teams" :loading="loading" @submit="submit" />
    </div>
  </AuthenticatedLayout>
</template>
