<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import MusicianForm from './MusicianForm.vue'

const route = useRoute()
const router = useRouter()
const flash = useFlashStore()
const musician = ref<any>(null)
const instruments = ref([])
const teams = ref([])
const loading = ref(false)
const errors = ref<Record<string, string>>({})

const initialData = computed(() => musician.value ? {
  nome: musician.value.nome,
  telefone: musician.value.telefone ?? '',
  email: musician.value.email ?? '',
  ativo: musician.value.ativo,
  nivel: musician.value.nivel,
  observacoes: musician.value.observacoes ?? '',
  instruments: musician.value.instruments.map((i: any) => i.instrumentId),
  teams: musician.value.teams.map((t: any) => t.teamId),
} : undefined)

onMounted(async () => {
  const [m, inst, tm] = await Promise.all([
    client.get(`/musicians/${route.params.id}`),
    client.get('/instruments'),
    client.get('/teams'),
  ])
  musician.value = m.data
  instruments.value = inst.data
  teams.value = tm.data
})

async function submit(data: object) {
  loading.value = true
  try {
    await client.patch(`/musicians/${route.params.id}`, data)
    flash.set('success', 'Músico atualizado com sucesso!')
    router.push('/musicos')
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
      <h2 class="font-semibold text-xl text-gray-800">Editar Músico</h2>
    </template>
    <div class="bg-white shadow-sm rounded-lg p-6">
      <MusicianForm v-if="musician" :initial-data="initialData" :instruments="instruments" :teams="teams" :errors="errors" :loading="loading" @submit="submit" />
    </div>
  </AuthenticatedLayout>
</template>
