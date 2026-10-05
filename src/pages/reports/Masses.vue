<script setup lang="ts">
import { ref, onMounted } from 'vue'
import client from '@/api/client'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Card from '@/components/Card.vue'
import InputLabel from '@/components/InputLabel.vue'
import Tabs from '@/components/Tabs.vue'
import ErrorState from '@/components/ErrorState.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'

// TASK-0123: Masses / Liturgies of the Word report.
interface ComunidadeMissas {
  comunidadeId: number
  nome: string
  missas: number
  celebracoesPalavra: number
  outras: number
}

interface CelebranteMissas {
  celebranteId: number
  nome: string
  tipo: 'padre' | 'diacono' | 'outro'
  missas: number
  celebracoesPalavra: number
}

interface RelatorioMissas {
  totalMissas: number
  totalCelebracoesPalavra: number
  totalOutras: number
  porComunidade: ComunidadeMissas[]
  porCelebrante: CelebranteMissas[]
}

const relatorio = ref<RelatorioMissas | null>(null)
const loading = ref(true)
const error = ref(false)
const agrupamento = ref<'comunidade' | 'celebrante'>('comunidade')
const hoje = new Date()
const inicio = ref(new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10))
const fim = ref(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().slice(0, 10))

const tipoCelebranteLabel: Record<CelebranteMissas['tipo'], string> = {
  padre: 'Padre',
  diacono: 'Diácono',
  outro: '—',
}

// Priests are counted by Masses, deacons by Liturgies of the Word.
function celebracoesDoCelebrante(c: CelebranteMissas): string {
  if (c.tipo === 'padre') return `${c.missas} missa${c.missas === 1 ? '' : 's'}`
  if (c.tipo === 'diacono') return `${c.celebracoesPalavra} celebraç${c.celebracoesPalavra === 1 ? 'ão' : 'ões'} da Palavra`
  return `${c.missas} missas · ${c.celebracoesPalavra} celebrações da Palavra`
}

async function load() {
  loading.value = true
  error.value = false
  try {
    const { data } = await client.get('/reports/missas', { params: { inicio: inicio.value, fim: fim.value } })
    relatorio.value = data
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-100">Relatório de Missas</h2>
    </template>

    <div class="space-y-6">
      <Card class="flex flex-wrap items-end gap-4">
        <div>
          <InputLabel value="Início" for="input-missas-inicio" />
          <input id="input-missas-inicio" v-model="inicio" @change="load" type="date"
            class="mt-1 border-gray-300 rounded-md shadow-sm text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
        </div>
        <div>
          <InputLabel value="Fim" for="input-missas-fim" />
          <input id="input-missas-fim" v-model="fim" @change="load" type="date"
            class="mt-1 border-gray-300 rounded-md shadow-sm text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
        </div>
      </Card>

      <div v-if="loading" class="p-8 text-center text-gray-600 dark:text-gray-400">Carregando...</div>

      <ErrorState v-else-if="error" title="Não foi possível carregar o relatório de missas."
        description="Verifique sua conexão e tente novamente.">
        <template #action><SecondaryButton type="button" @click="load">Tentar novamente</SecondaryButton></template>
      </ErrorState>

      <template v-else-if="relatorio">
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card>
            <p class="text-xs text-gray-500 uppercase dark:text-gray-400">Missas</p>
            <p class="text-2xl font-semibold text-gray-800 dark:text-gray-100">{{ relatorio.totalMissas }}</p>
          </Card>
          <Card>
            <p class="text-xs text-gray-500 uppercase dark:text-gray-400">Celebrações da Palavra</p>
            <p class="text-2xl font-semibold text-gray-800 dark:text-gray-100">{{ relatorio.totalCelebracoesPalavra }}</p>
          </Card>
          <Card v-if="relatorio.totalOutras">
            <p class="text-xs text-gray-500 uppercase dark:text-gray-400">Outras</p>
            <p class="text-2xl font-semibold text-gray-800 dark:text-gray-100">{{ relatorio.totalOutras }}</p>
          </Card>
        </div>

        <Card :bordered="false" class="!p-0 overflow-hidden">
          <div class="p-4 border-b dark:border-gray-700">
            <Tabs v-model="agrupamento" :tabs="[
              { value: 'comunidade', label: 'Por Comunidade' },
              { value: 'celebrante', label: 'Por Celebrante' },
            ]" />
          </div>

          <div v-if="agrupamento === 'comunidade'">
            <div class="hidden md:block overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-900/40">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Comunidade</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Missas</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Celebrações da Palavra</th>
                    <th v-if="relatorio.totalOutras" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Outras</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  <tr v-for="c in relatorio.porComunidade" :key="c.comunidadeId">
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{{ c.nome }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ c.missas }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ c.celebracoesPalavra }}</td>
                    <td v-if="relatorio.totalOutras" class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ c.outras }}</td>
                  </tr>
                  <tr v-if="!relatorio.porComunidade.length">
                    <td colspan="4" class="px-6 py-8 text-center text-gray-600 dark:text-gray-400">Nenhuma celebração no período.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="divide-y divide-gray-100 md:hidden dark:divide-gray-700">
              <div v-for="c in relatorio.porComunidade" :key="c.comunidadeId" class="space-y-1 p-4">
                <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ c.nome }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                  {{ c.missas }} missas · {{ c.celebracoesPalavra }} celebrações da Palavra<template v-if="c.outras"> · {{ c.outras }} outras</template>
                </p>
              </div>
              <p v-if="!relatorio.porComunidade.length" class="p-8 text-center text-sm text-gray-600 dark:text-gray-400">Nenhuma celebração no período.</p>
            </div>
          </div>

          <div v-else>
            <div class="hidden md:block overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-900/40">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Celebrante</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Ordem</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Celebrações</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  <tr v-for="c in relatorio.porCelebrante" :key="c.celebranteId">
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{{ c.nome }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ tipoCelebranteLabel[c.tipo] }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ celebracoesDoCelebrante(c) }}</td>
                  </tr>
                  <tr v-if="!relatorio.porCelebrante.length">
                    <td colspan="3" class="px-6 py-8 text-center text-gray-600 dark:text-gray-400">Nenhuma celebração com celebrante no período.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="divide-y divide-gray-100 md:hidden dark:divide-gray-700">
              <div v-for="c in relatorio.porCelebrante" :key="c.celebranteId" class="space-y-1 p-4">
                <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ c.nome }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">{{ celebracoesDoCelebrante(c) }}</p>
              </div>
              <p v-if="!relatorio.porCelebrante.length" class="p-8 text-center text-sm text-gray-600 dark:text-gray-400">Nenhuma celebração com celebrante no período.</p>
            </div>
          </div>
        </Card>
      </template>
    </div>
  </AuthenticatedLayout>
</template>
