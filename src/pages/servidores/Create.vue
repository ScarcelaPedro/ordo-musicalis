<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Card from '@/components/Card.vue'
import ServidorForm from './ServidorForm.vue'

const router = useRouter()
const flash = useFlashStore()
const instruments = ref([])
const teams = ref([])
const categorias = ref([])
const loading = ref(false)
const errors = ref<Record<string, string>>({})

onMounted(async () => {
  const [inst, tm, cat] = await Promise.all([client.get('/instruments'), client.get('/teams'), client.get('/categorias')])
  instruments.value = inst.data
  teams.value = tm.data
  categorias.value = cat.data
})

async function submit(data: object) {
  if (loading.value) return // TASK-0075: guarda síncrona contra duplo clique
  loading.value = true
  try {
    await client.post('/servidores', data)
    flash.set('success', 'Servidor criado com sucesso!')
    router.push('/servidores')
  } catch (e: any) {
    errors.value = e.response?.data?.errors ?? {}
    flash.set('error', e.response?.data?.message ?? 'Erro ao criar servidor')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-100">Novo Servidor</h2>
    </template>
    <Card>
      <ServidorForm :instruments="instruments" :teams="teams" :categorias="categorias" :errors="errors" :loading="loading" @submit="submit" />
    </Card>
  </AuthenticatedLayout>
</template>
