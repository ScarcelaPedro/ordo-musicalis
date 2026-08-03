<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import ServidorForm from './ServidorForm.vue'

const route = useRoute()
const router = useRouter()
const flash = useFlashStore()
const servidor = ref<any>(null)
const instruments = ref([])
const teams = ref([])
const loading = ref(false)
const errors = ref<Record<string, string>>({})

const initialData = computed(() => servidor.value ? {
  nome: servidor.value.nome,
  telefone: servidor.value.telefone ?? '',
  email: servidor.value.email ?? '',
  ativo: servidor.value.ativo,
  nivel: servidor.value.nivel,
  observacoes: servidor.value.observacoes ?? '',
  instruments: servidor.value.instruments.map((i: any) => i.instrumentId),
  teams: servidor.value.teams.map((t: any) => ({ teamId: t.teamId, funcao: t.funcao ?? '' })),
} : undefined)

onMounted(async () => {
  const [s, inst, tm] = await Promise.all([
    client.get(`/servidores/${route.params.id}`),
    client.get('/instruments'),
    client.get('/teams'),
  ])
  servidor.value = s.data
  instruments.value = inst.data
  teams.value = tm.data
})

async function submit(data: object) {
  loading.value = true
  try {
    await client.patch(`/servidores/${route.params.id}`, data)
    flash.set('success', 'Servidor atualizado com sucesso!')
    router.push('/servidores')
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
      <h2 class="font-semibold text-xl text-gray-800">Editar Servidor</h2>
    </template>
    <div class="bg-white shadow-sm rounded-lg p-6">
      <ServidorForm v-if="servidor" :initial-data="initialData" :instruments="instruments" :teams="teams" :errors="errors" :loading="loading" @submit="submit" />
    </div>
  </AuthenticatedLayout>
</template>
