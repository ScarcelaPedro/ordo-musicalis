<script setup lang="ts">
import { ref, onMounted } from 'vue'
import client from '@/api/client'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'

interface MinisterioResumo {
  teamId: number | null
  nome: string
  celebracoes: number
  escalacoes: number
  confirmadas: number
  taxaConfirmacao: number
}

interface Resumo {
  totalCelebracoes: number
  totalEscalacoes: number
  confirmadas: number
  pendentesConfirmacao: number
  taxaConfirmacao: number
  substituicoesPendentes: number
  porMinisterio: MinisterioResumo[]
}

const resumo = ref<Resumo | null>(null)
const loading = ref(true)
const hoje = new Date()
const inicio = ref(new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10))
const fim = ref(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().slice(0, 10))

async function load() {
  loading.value = true
  const { data } = await client.get('/reports/resumo', { params: { inicio: inicio.value, fim: fim.value } })
  resumo.value = data
  loading.value = false
}

onMounted(load)
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800">Relatórios</h2>
    </template>

    <div class="space-y-6">
      <div class="bg-white shadow-sm rounded-lg p-4 flex flex-wrap items-end gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Início</label>
          <input v-model="inicio" @change="load" type="date" class="border-gray-300 rounded-md shadow-sm text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fim</label>
          <input v-model="fim" @change="load" type="date" class="border-gray-300 rounded-md shadow-sm text-sm" />
        </div>
        <div class="flex gap-2 ml-auto">
          <RouterLink to="/musicos/intensidade" class="text-sm text-indigo-600 hover:underline">Intensidade</RouterLink>
          <RouterLink to="/disponibilidade/painel" class="text-sm text-indigo-600 hover:underline">Disponibilidade</RouterLink>
          <RouterLink to="/substituicoes" class="text-sm text-indigo-600 hover:underline">Substituições</RouterLink>
        </div>
      </div>

      <div v-if="loading" class="p-8 text-center text-gray-500">Carregando...</div>

      <template v-else-if="resumo">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div class="bg-white shadow-sm rounded-lg p-4">
            <p class="text-xs text-gray-500 uppercase">Celebrações</p>
            <p class="text-2xl font-semibold text-gray-800">{{ resumo.totalCelebracoes }}</p>
          </div>
          <div class="bg-white shadow-sm rounded-lg p-4">
            <p class="text-xs text-gray-500 uppercase">Escalações</p>
            <p class="text-2xl font-semibold text-gray-800">{{ resumo.totalEscalacoes }}</p>
          </div>
          <div class="bg-white shadow-sm rounded-lg p-4">
            <p class="text-xs text-gray-500 uppercase">Confirmação</p>
            <p class="text-2xl font-semibold text-green-600">{{ resumo.taxaConfirmacao }}%</p>
          </div>
          <div class="bg-white shadow-sm rounded-lg p-4">
            <p class="text-xs text-gray-500 uppercase">Pendentes</p>
            <p class="text-2xl font-semibold text-yellow-600">{{ resumo.pendentesConfirmacao }}</p>
          </div>
          <div class="bg-white shadow-sm rounded-lg p-4">
            <p class="text-xs text-gray-500 uppercase">Substituições pend.</p>
            <p class="text-2xl font-semibold text-red-600">{{ resumo.substituicoesPendentes }}</p>
          </div>
        </div>

        <div class="bg-white shadow-sm rounded-lg overflow-hidden">
          <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ministério</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Celebrações</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Escalações</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taxa de confirmação</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="m in resumo.porMinisterio" :key="m.teamId ?? 'sem'">
                <td class="px-6 py-4 font-medium text-gray-900">{{ m.nome }}</td>
                <td class="px-6 py-4 text-sm text-gray-700">{{ m.celebracoes }}</td>
                <td class="px-6 py-4 text-sm text-gray-700">{{ m.escalacoes }}</td>
                <td class="px-6 py-4 text-sm text-gray-700">{{ m.taxaConfirmacao }}%</td>
              </tr>
              <tr v-if="!resumo.porMinisterio.length">
                <td colspan="4" class="px-6 py-8 text-center text-gray-500">Nenhuma celebração no período.</td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </template>
    </div>
  </AuthenticatedLayout>
</template>
