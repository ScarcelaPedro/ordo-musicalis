<script setup lang="ts">
import { ref, onMounted } from 'vue'
import client from '@/api/client'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Card from '@/components/Card.vue'
import InputLabel from '@/components/InputLabel.vue'
import Tabs from '@/components/Tabs.vue'
import ErrorState from '@/components/ErrorState.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'

interface MinisterioResumo {
  teamId: number | null
  nome: string
  celebracoes: number
  escalacoes: number
  confirmadas: number
  taxaConfirmacao: number
}

interface CategoriaResumo {
  categoriaId: number | null
  nome: string
  ordem: number
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
  porCategoria: CategoriaResumo[]
}

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

const resumo = ref<Resumo | null>(null)
const missas = ref<RelatorioMissas | null>(null)
const loading = ref(true)
const error = ref(false)
const agrupamento = ref<'ministerio' | 'categoria'>('ministerio')
const agrupamentoMissas = ref<'comunidade' | 'celebrante'>('comunidade')

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
const hoje = new Date()
const inicio = ref(new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10))
const fim = ref(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().slice(0, 10))

// TASK-0076 (correção): antes, uma falha de rede/API deixava a tela presa em "Carregando..." pra
// sempre, sem nenhuma indicação de erro -- catch adicionado + ErrorState com "Tentar novamente".
async function load() {
  loading.value = true
  error.value = false
  try {
    const params = { inicio: inicio.value, fim: fim.value }
    const [resumoRes, missasRes] = await Promise.all([
      client.get('/reports/resumo', { params }),
      client.get('/reports/missas', { params }),
    ])
    resumo.value = resumoRes.data
    missas.value = missasRes.data
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
      <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-100">Relatórios</h2>
    </template>

    <div class="space-y-6">
      <Card class="flex flex-wrap items-end gap-4">
        <div>
          <InputLabel value="Início" for="input-relatorio-inicio" />
          <input id="input-relatorio-inicio" v-model="inicio" @change="load" type="date"
            class="mt-1 border-gray-300 rounded-md shadow-sm text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
        </div>
        <div>
          <InputLabel value="Fim" for="input-relatorio-fim" />
          <input id="input-relatorio-fim" v-model="fim" @change="load" type="date"
            class="mt-1 border-gray-300 rounded-md shadow-sm text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
        </div>
        <div class="flex flex-wrap items-center gap-1 ml-auto">
          <RouterLink to="/servidores/intensidade" class="inline-flex min-h-11 items-center px-2 text-sm text-primary-600 hover:underline dark:text-primary-400">Intensidade</RouterLink>
          <RouterLink to="/disponibilidade/painel" class="inline-flex min-h-11 items-center px-2 text-sm text-primary-600 hover:underline dark:text-primary-400">Disponibilidade</RouterLink>
          <RouterLink to="/substituicoes" class="inline-flex min-h-11 items-center px-2 text-sm text-primary-600 hover:underline dark:text-primary-400">Substituições</RouterLink>
        </div>
      </Card>

      <div v-if="loading" class="p-8 text-center text-gray-600 dark:text-gray-400">Carregando...</div>

      <ErrorState v-else-if="error" title="Não foi possível carregar os relatórios."
        description="Verifique sua conexão e tente novamente.">
        <template #action><SecondaryButton type="button" @click="load">Tentar novamente</SecondaryButton></template>
      </ErrorState>

      <template v-else-if="resumo">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card>
            <p class="text-xs text-gray-500 uppercase dark:text-gray-400">Celebrações</p>
            <p class="text-2xl font-semibold text-gray-800 dark:text-gray-100">{{ resumo.totalCelebracoes }}</p>
          </Card>
          <Card>
            <p class="text-xs text-gray-500 uppercase dark:text-gray-400">Escalações</p>
            <p class="text-2xl font-semibold text-gray-800 dark:text-gray-100">{{ resumo.totalEscalacoes }}</p>
          </Card>
          <Card>
            <p class="text-xs text-gray-500 uppercase dark:text-gray-400">Confirmação</p>
            <p class="text-2xl font-semibold text-success-600 dark:text-success-400">{{ resumo.taxaConfirmacao }}%</p>
          </Card>
          <Card>
            <p class="text-xs text-gray-500 uppercase dark:text-gray-400">Pendentes</p>
            <p class="text-2xl font-semibold text-warning-600 dark:text-warning-400">{{ resumo.pendentesConfirmacao }}</p>
          </Card>
          <Card>
            <p class="text-xs text-gray-500 uppercase dark:text-gray-400">Substituições pend.</p>
            <p class="text-2xl font-semibold text-danger-600 dark:text-danger-400">{{ resumo.substituicoesPendentes }}</p>
          </Card>
        </div>

        <Card :bordered="false" class="!p-0 overflow-hidden">
          <div class="p-4 border-b dark:border-gray-700">
            <Tabs v-model="agrupamento" :tabs="[
              { value: 'ministerio', label: 'Por Ministério' },
              { value: 'categoria', label: 'Por Categoria de Função' },
            ]" />
          </div>

          <div v-if="agrupamento === 'ministerio'">
            <div class="hidden md:block overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-900/40">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Ministério</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Celebrações</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Escalações</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Taxa de confirmação</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  <tr v-for="m in resumo.porMinisterio" :key="m.teamId ?? 'sem'">
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{{ m.nome }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ m.celebracoes }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ m.escalacoes }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ m.taxaConfirmacao }}%</td>
                  </tr>
                  <tr v-if="!resumo.porMinisterio.length">
                    <td colspan="4" class="px-6 py-8 text-center text-gray-600 dark:text-gray-400">Nenhuma celebração no período.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="divide-y divide-gray-100 md:hidden dark:divide-gray-700">
              <div v-for="m in resumo.porMinisterio" :key="m.teamId ?? 'sem'" class="space-y-1 p-4">
                <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ m.nome }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                  {{ m.celebracoes }} celebrações · {{ m.escalacoes }} escalações · {{ m.taxaConfirmacao }}% confirmação
                </p>
              </div>
              <p v-if="!resumo.porMinisterio.length" class="p-8 text-center text-sm text-gray-600 dark:text-gray-400">Nenhuma celebração no período.</p>
            </div>
          </div>

          <div v-else>
            <div class="hidden md:block overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-900/40">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Categoria de Função</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Escalações</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Taxa de confirmação</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  <tr v-for="c in resumo.porCategoria" :key="c.categoriaId ?? 'sem'">
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{{ c.nome }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ c.escalacoes }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ c.taxaConfirmacao }}%</td>
                  </tr>
                  <tr v-if="!resumo.porCategoria.length">
                    <td colspan="3" class="px-6 py-8 text-center text-gray-600 dark:text-gray-400">Nenhuma escalação no período.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="divide-y divide-gray-100 md:hidden dark:divide-gray-700">
              <div v-for="c in resumo.porCategoria" :key="c.categoriaId ?? 'sem'" class="space-y-1 p-4">
                <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ c.nome }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                  {{ c.escalacoes }} escalações · {{ c.taxaConfirmacao }}% confirmação
                </p>
              </div>
              <p v-if="!resumo.porCategoria.length" class="p-8 text-center text-sm text-gray-600 dark:text-gray-400">Nenhuma escalação no período.</p>
            </div>
          </div>
        </Card>

        <Card v-if="missas" :bordered="false" class="!p-0 overflow-hidden">
          <div class="space-y-4 p-4 border-b dark:border-gray-700">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Missas e Celebrações da Palavra</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                <strong class="text-gray-800 dark:text-gray-100">{{ missas.totalMissas }}</strong> missas ·
                <strong class="text-gray-800 dark:text-gray-100">{{ missas.totalCelebracoesPalavra }}</strong> celebrações da Palavra<template v-if="missas.totalOutras"> ·
                <strong class="text-gray-800 dark:text-gray-100">{{ missas.totalOutras }}</strong> outras</template>
              </p>
            </div>
            <Tabs v-model="agrupamentoMissas" :tabs="[
              { value: 'comunidade', label: 'Por Comunidade' },
              { value: 'celebrante', label: 'Por Celebrante' },
            ]" />
          </div>

          <div v-if="agrupamentoMissas === 'comunidade'">
            <div class="hidden md:block overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-900/40">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Comunidade</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Missas</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Celebrações da Palavra</th>
                    <th v-if="missas.totalOutras" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Outras</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  <tr v-for="c in missas.porComunidade" :key="c.comunidadeId">
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{{ c.nome }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ c.missas }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ c.celebracoesPalavra }}</td>
                    <td v-if="missas.totalOutras" class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ c.outras }}</td>
                  </tr>
                  <tr v-if="!missas.porComunidade.length">
                    <td colspan="4" class="px-6 py-8 text-center text-gray-600 dark:text-gray-400">Nenhuma celebração no período.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="divide-y divide-gray-100 md:hidden dark:divide-gray-700">
              <div v-for="c in missas.porComunidade" :key="c.comunidadeId" class="space-y-1 p-4">
                <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ c.nome }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                  {{ c.missas }} missas · {{ c.celebracoesPalavra }} celebrações da Palavra<template v-if="c.outras"> · {{ c.outras }} outras</template>
                </p>
              </div>
              <p v-if="!missas.porComunidade.length" class="p-8 text-center text-sm text-gray-600 dark:text-gray-400">Nenhuma celebração no período.</p>
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
                  <tr v-for="c in missas.porCelebrante" :key="c.celebranteId">
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{{ c.nome }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ tipoCelebranteLabel[c.tipo] }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ celebracoesDoCelebrante(c) }}</td>
                  </tr>
                  <tr v-if="!missas.porCelebrante.length">
                    <td colspan="3" class="px-6 py-8 text-center text-gray-600 dark:text-gray-400">Nenhuma celebração com celebrante no período.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="divide-y divide-gray-100 md:hidden dark:divide-gray-700">
              <div v-for="c in missas.porCelebrante" :key="c.celebranteId" class="space-y-1 p-4">
                <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ c.nome }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">{{ celebracoesDoCelebrante(c) }}</p>
              </div>
              <p v-if="!missas.porCelebrante.length" class="p-8 text-center text-sm text-gray-600 dark:text-gray-400">Nenhuma celebração com celebrante no período.</p>
            </div>
          </div>
        </Card>
      </template>
    </div>
  </AuthenticatedLayout>
</template>
