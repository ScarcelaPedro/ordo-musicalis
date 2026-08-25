<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import client from '@/api/client'
import { parseDateOnly } from '@/utils/date'
import { STATUS_LABELS, STATUS_COLORS } from '@/utils/status'
import Badge from '@/components/Badge.vue'

interface PublicScale {
  id: number
  dataCelebracao: string
  horario: string
  celebracao: string
  observacoes: string | null
  team: { id: number; nome: string } | null
  comunidade: { id: number; nome: string } | null
  servidores: { status: string; servidor: { nome: string }; instrument: { nome: string } | null }[]
}

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())
const scales = ref<PublicScale[]>([])
const loading = ref(false)
const comunidades = ref<{ id: number; nome: string }[]>([])
const filterComunidadeId = ref('')

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

async function load() {
  loading.value = true
  try {
    const mes = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}`
    const { data } = await client.get('/public/scales', {
      params: { mes, comunidadeId: filterComunidadeId.value || undefined },
    })
    scales.value = data
  } finally {
    loading.value = false
  }
}

async function loadComunidades() {
  const { data } = await client.get('/public/comunidades')
  comunidades.value = data
}

onMounted(() => { load(); loadComunidades() })
watch([currentMonth, currentYear, filterComunidadeId], load)

function prevMonth() {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- }
  else currentMonth.value--
}
function nextMonth() {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ }
  else currentMonth.value++
}

function formatDate(d: string) {
  return parseDateOnly(d)!.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
}

function imprimir() {
  window.print()
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <header class="bg-white border-b border-gray-100 dark:bg-gray-800 dark:border-gray-700 no-print">
      <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">Ordo Musicalis</h1>
        <button @click="imprimir" class="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-semibold uppercase rounded-md hover:bg-gray-300">
          Imprimir
        </button>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-6 no-print">
        <button @click="prevMonth" class="px-3 py-1.5 rounded-md bg-white dark:bg-gray-800 shadow-sm text-gray-600 dark:text-gray-300">&larr;</button>
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">{{ MONTH_NAMES[currentMonth] }} {{ currentYear }}</h2>
        <button @click="nextMonth" class="px-3 py-1.5 rounded-md bg-white dark:bg-gray-800 shadow-sm text-gray-600 dark:text-gray-300">&rarr;</button>
      </div>
      <div v-if="comunidades.length > 1" class="mb-6 no-print">
        <select v-model="filterComunidadeId" class="w-full sm:w-auto border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-md shadow-sm text-sm">
          <option value="">Todas as comunidades</option>
          <option v-for="c in comunidades" :key="c.id" :value="c.id">{{ c.nome }}</option>
        </select>
      </div>
      <h2 class="hidden print:block text-lg font-semibold mb-6">Escala — {{ MONTH_NAMES[currentMonth] }} {{ currentYear }}</h2>

      <div v-if="loading" class="text-center text-gray-500 py-8">Carregando...</div>

      <div v-else class="space-y-4">
        <div v-for="s in scales" :key="s.id" class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-5">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h3 class="font-semibold text-gray-800 dark:text-gray-100">{{ s.celebracao }}</h3>
            <span v-if="s.team" class="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 px-2 py-0.5 rounded-full">{{ s.team.nome }}</span>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 capitalize">
            {{ formatDate(s.dataCelebracao) }} · {{ s.horario }}
            <span v-if="s.comunidade"> · {{ s.comunidade.nome }}</span>
          </p>
          <ul class="space-y-1">
            <li v-for="(sv, idx) in s.servidores" :key="idx" class="flex items-center justify-between text-sm py-1 border-t border-gray-100 dark:border-gray-700 first:border-0">
              <span class="text-gray-700 dark:text-gray-300">
                {{ sv.servidor.nome }}
                <span v-if="sv.instrument" class="text-gray-400">· {{ sv.instrument.nome }}</span>
              </span>
              <Badge :color="STATUS_COLORS[sv.status]">{{ STATUS_LABELS[sv.status] ?? sv.status }}</Badge>
            </li>
            <li v-if="!s.servidores.length" class="text-sm text-gray-400 py-1">Ninguém escalado ainda.</li>
          </ul>
        </div>
        <p v-if="!scales.length" class="text-center text-gray-500 py-8">Nenhuma celebração neste mês.</p>
      </div>
    </main>
  </div>
</template>
