<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import ScaleTemplateForm from './ScaleTemplateForm.vue'

const router = useRouter()
const flash = useFlashStore()
const teams = ref([])
const loading = ref(false)
const errors = ref<Record<string, string>>({})

onMounted(async () => {
  const { data } = await client.get('/teams')
  teams.value = data
})

async function submit(data: object) {
  loading.value = true
  try {
    await client.post('/scale-templates', data)
    flash.set('success', 'Recorrência criada com sucesso!')
    router.push('/escalas-recorrentes')
  } catch (e: any) {
    errors.value = e.response?.data?.errors ?? {}
    flash.set('error', e.response?.data?.message ?? 'Erro ao criar recorrência')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800">Nova Recorrência de Celebração</h2>
    </template>
    <div class="bg-white shadow-sm rounded-lg p-6">
      <ScaleTemplateForm :teams="teams" :errors="errors" :loading="loading" @submit="submit" />
    </div>
  </AuthenticatedLayout>
</template>
