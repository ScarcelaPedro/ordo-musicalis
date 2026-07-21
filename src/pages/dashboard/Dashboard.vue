<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import { parseDateOnly } from '@/utils/date'

const auth = useAuthStore()

interface ScaleMusician {
  musicianId: number
  musician: { id: number; nome: string }
  instrument: { nome: string } | null
}

interface Scale {
  id: number
  dataCelebracao: string
  horario: string
  celebracao: string
  status: 'rascunho' | 'confirmada'
  team: { id: number; nome: string } | null
  musicians: ScaleMusician[]
}

const today = new Date()

const currentMonth = ref(today.getMonth())
const currentYear  = ref(today.getFullYear())
const scales       = ref<Scale[]>([])
const loading      = ref(false)

const MONTH_NAMES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]
const DAY_NAMES = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

async function load() {
  loading.value = true
  try {
    const mes = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2,'0')}`
    const { data } = await client.get('/scales', { params: { mes } })
    scales.value = data
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch([currentMonth, currentYear], load)

function prevMonth() {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- }
  else currentMonth.value--
}
function nextMonth() {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ }
  else currentMonth.value++
}

const calendarCells = computed(() => {
  const firstDow    = new Date(currentYear.value, currentMonth.value, 1).getDay()
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const cells: (number | null)[] = Array(firstDow).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
})

const scalesByDate = computed(() => {
  const map: Record<string, Scale[]> = {}
  for (const s of scales.value) {
    const key = s.dataCelebracao.slice(0, 10)
    if (!map[key]) map[key] = []
    map[key].push(s)
  }
  for (const key in map) map[key].sort((a, b) => a.horario.localeCompare(b.horario))
  return map
})

function dayKey(day: number) {
  const m = String(currentMonth.value + 1).padStart(2,'0')
  const d = String(day).padStart(2,'0')
  return `${currentYear.value}-${m}-${d}`
}

function isToday(day: number) {
  return today.getFullYear() === currentYear.value
    && today.getMonth()    === currentMonth.value
    && today.getDate()     === day
}
function isSunday(day: number)   { return new Date(currentYear.value, currentMonth.value, day).getDay() === 0 }
function isSaturday(day: number) { return new Date(currentYear.value, currentMonth.value, day).getDay() === 6 }

function chipClass(horario: string, status: string) {
  if (status === 'confirmada') return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
  const h = parseInt(horario.slice(0, 2))
  if (h < 12) return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
  return 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
}

const totalScales = computed(() => scales.value.length)
const confirmed   = computed(() => scales.value.filter(s => s.status === 'confirmada').length)
const drafts      = computed(() => scales.value.filter(s => s.status === 'rascunho').length)

const nextScale = computed(() => {
  const todayStr  = today.toISOString().slice(0, 10)
  const nowTime   = today.toTimeString().slice(0, 5)
  return [...scales.value]
    .sort((a, b) => a.dataCelebracao.localeCompare(b.dataCelebracao) || a.horario.localeCompare(b.horario))
    .find(s => {
      const d = s.dataCelebracao.slice(0, 10)
      return d > todayStr || (d === todayStr && s.horario >= nowTime)
    }) ?? null
})

const myNextScales = computed(() => {
  const mid = auth.user?.musicianId
  if (!mid) return []
  const todayStr = today.toISOString().slice(0, 10)
  return scales.value
    .filter(s => s.dataCelebracao.slice(0, 10) >= todayStr && s.musicians.some(m => m.musicianId === mid))
    .slice(0, 3)
})

function formatFullDate(iso: string) {
  return parseDateOnly(iso)!.toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long',
  })
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0">
          <h2 class="font-bold text-xl text-gray-800">Dashboard</h2>
          <p class="text-sm text-gray-400 mt-0.5 truncate">Bem-vindo, {{ auth.user?.name }}</p>
        </div>
        <div v-if="auth.isStaff" class="flex flex-wrap gap-2">
          <RouterLink to="/substituicoes"
            class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 text-xs font-semibold uppercase rounded-md hover:bg-gray-300">
            Substituições
          </RouterLink>
          <RouterLink to="/relatorios"
            class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 text-xs font-semibold uppercase rounded-md hover:bg-gray-300">
            Relatórios
          </RouterLink>
          <RouterLink to="/escalas/criar"
            class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-indigo-700 active:scale-95 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nova Escala
          </RouterLink>
        </div>
      </div>
    </template>

    <div class="space-y-6">

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest">Total</p>
          <p class="mt-2 text-4xl font-extrabold text-gray-800">{{ totalScales }}</p>
          <p class="mt-1 text-xs text-gray-400">celebrações no mês</p>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p class="text-xs font-semibold text-emerald-500 uppercase tracking-widest">Confirmadas</p>
          <p class="mt-2 text-4xl font-extrabold text-emerald-600">{{ confirmed }}</p>
          <p class="mt-1 text-xs text-gray-400">escalas prontas</p>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p class="text-xs font-semibold text-amber-500 uppercase tracking-widest">Rascunhos</p>
          <p class="mt-2 text-4xl font-extrabold text-amber-500">{{ drafts }}</p>
          <p class="mt-1 text-xs text-gray-400">aguardando músicos</p>
        </div>
      </div>

      <!-- Banner: próxima celebração -->
      <div v-if="nextScale"
        class="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900 rounded-2xl p-6 text-white shadow-lg">
        <div class="absolute right-4 top-3 text-white/5 text-[8rem] font-serif select-none leading-none">♪</div>
        <p class="text-indigo-300 text-xs font-semibold uppercase tracking-widest">Próxima celebração</p>
        <p class="mt-1.5 text-2xl font-bold leading-snug">{{ nextScale.celebracao }}</p>
        <p class="mt-1 text-indigo-200 text-sm">
          {{ formatFullDate(nextScale.dataCelebracao) }} · {{ nextScale.horario }}
          <template v-if="nextScale.team">
            <span class="mx-1 text-indigo-400">·</span>{{ nextScale.team.nome }}
          </template>
        </p>
        <div v-if="nextScale.musicians.length" class="mt-3 flex flex-wrap gap-1.5">
          <span v-for="m in nextScale.musicians" :key="m.musicianId"
            class="bg-white/15 text-white text-xs px-2.5 py-0.5 rounded-full border border-white/20">
            {{ m.musician.nome }}
            <span v-if="m.instrument" class="text-indigo-300 ml-1">· {{ m.instrument.nome }}</span>
          </span>
        </div>
        <p v-else class="mt-3 text-sm text-indigo-300/80 italic">Nenhum músico escalado ainda.</p>
        <RouterLink :to="`/escalas/${nextScale.id}`"
          class="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-200 hover:text-white transition">
          Ver escala completa
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </RouterLink>
      </div>

      <!-- Minhas próximas escalas (músico) -->
      <div v-if="myNextScales.length" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Minhas próximas escalas</p>
        <div class="space-y-2">
          <RouterLink v-for="s in myNextScales" :key="s.id" :to="`/escalas/${s.id}`"
            class="flex items-center justify-between p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition group">
            <div>
              <p class="text-sm font-semibold text-indigo-800">{{ s.celebracao }}</p>
              <p class="text-xs text-indigo-500">{{ formatFullDate(s.dataCelebracao) }} · {{ s.horario }}</p>
            </div>
            <svg class="w-4 h-4 text-indigo-300 group-hover:text-indigo-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </RouterLink>
        </div>
      </div>

      <!-- Calendário -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        <!-- Navegação do mês -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <button @click="prevMonth"
            class="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h3 class="text-base font-bold text-gray-700 tracking-wide">
            {{ MONTH_NAMES[currentMonth] }} {{ currentYear }}
          </h3>
          <button @click="nextMonth"
            class="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <div class="overflow-x-auto">
        <div class="min-w-[560px]">

        <!-- Cabeçalho dias da semana -->
        <div class="grid grid-cols-7 border-b border-gray-100">
          <div v-for="(name, i) in DAY_NAMES" :key="name"
            class="py-2.5 text-center text-xs font-bold uppercase tracking-widest"
            :class="i === 0 ? 'text-rose-400' : i === 6 ? 'text-indigo-400' : 'text-gray-400'">
            {{ name }}
          </div>
        </div>

        <!-- Grade -->
        <div v-if="!loading" class="grid grid-cols-7 divide-x divide-y divide-gray-100">
          <div
            v-for="(day, idx) in calendarCells"
            :key="idx"
            class="min-h-[90px] sm:min-h-[108px] p-1.5"
            :class="[
              day === null       ? 'bg-gray-50/80'     : '',
              day && isToday(day)    ? 'bg-indigo-50/50'   : '',
              day && isSunday(day)   ? 'bg-rose-50/40'    : '',
              day && isSaturday(day) ? 'bg-indigo-50/25'  : '',
              !day || (!isToday(day) && !isSunday(day) && !isSaturday(day)) ? 'bg-white' : '',
            ]"
          >
            <!-- Número -->
            <div v-if="day" class="mb-1">
              <span
                class="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold"
                :class="[
                  isToday(day)    ? 'bg-indigo-600 text-white shadow-sm' : '',
                  !isToday(day) && isSunday(day)   ? 'text-rose-500'   : '',
                  !isToday(day) && isSaturday(day) ? 'text-indigo-500' : '',
                  !isToday(day) && !isSunday(day) && !isSaturday(day) ? 'text-gray-600' : '',
                ]">
                {{ day }}
              </span>
            </div>

            <!-- Chips de missa -->
            <template v-if="day">
              <RouterLink
                v-for="scale in scalesByDate[dayKey(day)] ?? []"
                :key="scale.id"
                :to="`/escalas/${scale.id}`"
                class="flex items-center gap-1 mb-0.5 px-1.5 py-0.5 rounded-md border text-xs font-medium transition truncate"
                :class="chipClass(scale.horario, scale.status)"
                :title="`${scale.celebracao} · ${scale.musicians.map(m => m.musician.nome).join(', ') || 'Sem músicos'}`"
              >
                <span class="shrink-0 font-mono text-[10px]">{{ scale.horario }}</span>
                <span v-if="scale.musicians.length" class="truncate hidden lg:inline text-[10px] ml-0.5 opacity-75">
                  {{ scale.musicians.map(m => m.musician.nome.split(' ')[0]).join(', ') }}
                </span>
              </RouterLink>
            </template>
          </div>
        </div>

        <!-- Loading -->
        <div v-else class="py-24 flex flex-col items-center justify-center text-gray-400">
          <svg class="animate-spin h-8 w-8 text-indigo-400 mb-3" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p class="text-sm">Carregando calendário...</p>
        </div>

        </div>
        </div>

        <!-- Legenda -->
        <div class="px-5 py-3 border-t border-gray-100 bg-gray-50/60 flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded bg-amber-50 border border-amber-200 inline-block"></span> Manhã
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded bg-indigo-50 border border-indigo-200 inline-block"></span> Tarde / Noite
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded bg-emerald-50 border border-emerald-200 inline-block"></span> Confirmada
          </span>
          <span class="ml-auto text-gray-300 italic hidden sm:inline">Passe o cursor sobre a celebração para ver os músicos</span>
        </div>
      </div>

    </div>
  </AuthenticatedLayout>
</template>
