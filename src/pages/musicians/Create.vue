<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import MusicianForm from './MusicianForm.vue'

const router = useRouter()
const flash = useFlashStore()
const instruments = ref([])
const teams = ref([])
const loading = ref(false)
const errors = ref<Record<string, string>>({})

onMounted(async () => {
  const [inst, tm] = await Promise.all([client.get('/instruments'), client.get('/teams')])
  instruments.value = inst.data
  teams.value = tm.data
})

async function submit(data: object) {
  loading.value = true
  try {
    await client.post('/musicians', data)
    flash.set('success', 'Músico criado com sucesso!')
    router.push('/musicos')
  } catch (e: any) {
    errors.value = e.response?.data?.errors ?? {}
    flash.set('error', e.response?.data?.message ?? 'Erro ao criar músico')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800">Novo Músico</h2>
    </template>
    <div class="bg-white shadow-sm rounded-lg p-6">
      <MusicianForm :instruments="instruments" :teams="teams" :errors="errors" :loading="loading" @submit="submit" />
    </div>
  </AuthenticatedLayout>
</template>
