<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Calendar from '@/components/Calendar.vue'
import Badge from '@/components/Badge.vue'
import Skeleton from '@/components/Skeleton.vue'
import ScaleCard from '@/components/scale/ScaleCard.vue'
import { parseDateOnly } from '@/utils/date'

const auth = useAuthStore()

interface ScaleServidor {
  servidorId: number
  servidor: { id: number; nome: string }
  instrument: { nome: string } | null
  // Já retornado pelo mesmo endpoint /scales hoje (confirmado em MyScales.vue, que consome o
  // mesmo campo) -- só não estava tipado aqui porque o Dashboard nunca tinha precisado dele.
  status: 'convidado' | 'confirmado' | 'recusado' | 'substituido'
}

interface Scale {
  id: number
  dataCelebracao: string
  horario: string
  celebracao: string
  status: 'rascunho' | 'confirmada'
  team: { id: number; nome: string } | null
  comunidade: { id: number; nome: string } | null
  celebrante: { id: number; nome: string } | null
  servidores: ScaleServidor[]
}

interface Liturgia {
  data: string
  cor: string
}

interface Pendencia {
  scaleServidorId: number
  servidorId: number
  servidorNome: string
  scaleId: number
  celebracao: string
  dataCelebracao: string
  horario: string
  diasRestantes: number
}

const today = new Date()

const currentMonth = ref(today.getMonth())
const currentYear  = ref(today.getFullYear())
const scales       = ref<Scale[]>([])
const loading      = ref(false)
const pendencias   = ref<Pendencia[]>([])
const comunidades  = ref<{ id: number; nome: string }[]>([])
const filterComunidadeId = ref('')
const liturgias    = ref<Liturgia[]>([])

const CORES_LITURGICAS_CLASSES: Record<string, string> = {
  Verde: 'bg-green-200',
  Roxo: 'bg-purple-200',
  Branco: 'bg-amber-100',
  Vermelho: 'bg-red-200',
  Rosa: 'bg-pink-200',
}

async function load() {
  loading.value = true
  try {
    const mes = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2,'0')}`
    const { data } = await client.get('/scales', {
      params: { mes, comunidadeId: filterComunidadeId.value || undefined },
    })
    scales.value = data
  } finally {
    loading.value = false
  }
}

async function loadPendencias() {
  if (!auth.isStaff) return
  const { data } = await client.get('/scales/pendentes')
  pendencias.value = data.slice(0, 8)
}

async function loadComunidades() {
  const { data } = await client.get('/comunidades')
  comunidades.value = data
}

async function loadLiturgias() {
  const mes = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2,'0')}`
  try {
    const { data } = await client.get('/liturgia', { params: { mes } })
    liturgias.value = data
  } catch {
    liturgias.value = []
  }
}

onMounted(() => { load(); loadPendencias(); loadComunidades(); loadLiturgias() })
watch([currentMonth, currentYear, filterComunidadeId], load)
watch([currentMonth, currentYear], loadLiturgias)

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

const liturgiaByDate = computed(() => {
  const map: Record<string, Liturgia> = {}
  for (const l of liturgias.value) map[l.data.slice(0, 10)] = l
  return map
})

// Fundo da célula pela cor litúrgica do dia; sem liturgia sincronizada ainda, fica neutro.
// `dateKey` já vem pronto do Calendar.vue no formato "YYYY-MM-DD" (mesmo formato usado por
// scalesByDate/liturgiaByDate), sem precisar recalcular a partir de currentMonth/currentYear.
function cellBackground(dateKey: string) {
  const cor = liturgiaByDate.value[dateKey]?.cor
  return CORES_LITURGICAS_CLASSES[cor] ?? 'bg-white dark:bg-gray-800'
}

function hasEvents(dateKey: string) {
  return (scalesByDate.value[dateKey]?.length ?? 0) > 0
}

function chipClass(horario: string, status: string) {
  if (status === 'confirmada') return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
  const h = parseInt(horario.slice(0, 2))
  if (h < 12) return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
  return 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
}

const totalScales = computed(() => scales.value.length)
const confirmed   = computed(() => scales.value.filter(s => s.status === 'confirmada').length)
const drafts      = computed(() => scales.value.filter(s => s.status === 'rascunho').length)

// Dashboard-Coordenador (TASK-0008 §5.2, item 1): "lista curta" das próximas celebrações, não
// só a primeira -- mesma ordenação/filtro que já existia (`nextScale`), só sem cortar em 1.
// A "contagem de funções preenchidas" que o wireframe também descreve para este bloco NÃO é
// implementada: a API de /scales não retorna as categorias esperadas por celebração, mesma
// lacuna de dado já registrada para "Funções sem servidor" (ver Riscos da TASK-0039).
const upcomingCelebrations = computed(() => {
  const todayStr  = today.toISOString().slice(0, 10)
  const nowTime   = today.toTimeString().slice(0, 5)
  return [...scales.value]
    .sort((a, b) => a.dataCelebracao.localeCompare(b.dataCelebracao) || a.horario.localeCompare(b.horario))
    .filter(s => {
      const d = s.dataCelebracao.slice(0, 10)
      return d > todayStr || (d === todayStr && s.horario >= nowTime)
    })
    .slice(0, 3)
})

function upcomingScaleCardProps(s: Scale) {
  return {
    celebracao: s.celebracao,
    dataFormatada: formatFullDate(s.dataCelebracao),
    horario: s.horario,
    comunidade: s.comunidade?.nome ?? null,
    status: s.status,
    to: `/escalas/${s.id}`,
  }
}

const myNextScales = computed(() => {
  const mid = auth.user?.servidorId
  if (!mid) return []
  const todayStr = today.toISOString().slice(0, 10)
  return scales.value
    .filter(s => s.dataCelebracao.slice(0, 10) >= todayStr && s.servidores.some(sv => sv.servidorId === mid))
    .slice(0, 3)
})

// Prioridade do Dashboard-Servidor (docs/tasks/0008-*.md, §5.1): a próxima escala do PRÓPRIO
// servidor é a informação principal, não as próximas celebrações do sistema inteiro
// (`upcomingCelebrations`, usada só no dashboard do coordenador). Mesma lista `myNextScales` já
// carregada -- só destacamos o primeiro item e listamos o restante à parte, sem nova chamada de
// API.
const myNextScale = computed(() => myNextScales.value[0] ?? null)
const myUpcomingScales = computed(() => myNextScales.value.slice(1))

function myPivot(scale: Scale | null) {
  if (!scale) return null
  return scale.servidores.find(sv => sv.servidorId === auth.user?.servidorId) ?? null
}

const myNextScalePivot = computed(() => myPivot(myNextScale.value))

function scaleCardProps(s: Scale) {
  const pivot = myPivot(s)
  return {
    celebracao: s.celebracao,
    dataFormatada: formatFullDate(s.dataCelebracao),
    horario: s.horario,
    comunidade: s.comunidade?.nome ?? null,
    status: s.status,
    minhaConfirmacao: pivot?.status ?? null,
    to: `/escalas/${s.id}`,
  }
}

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
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-0.5 truncate">Bem-vindo, {{ auth.user?.name }}</p>
        </div>
        <div v-if="auth.isStaff" class="flex flex-wrap gap-2">
          <RouterLink to="/substituicoes"
            class="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-transparent bg-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 transition duration-150 ease-in-out hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800">
            Substituições
          </RouterLink>
          <RouterLink to="/relatorios"
            class="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-transparent bg-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 transition duration-150 ease-in-out hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800">
            Relatórios
          </RouterLink>
          <RouterLink to="/escalas/criar"
            class="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-transparent bg-primary-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-primary-700 focus:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:bg-primary-800 dark:focus:ring-offset-gray-800">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nova Escala
          </RouterLink>
        </div>
      </div>
    </template>

    <div class="space-y-6">

      <!-- Coordenador -- ordem de prioridade exata da TASK-0008 (§5.2): 1) próximas
           celebrações, 2) situação das escalas, 3) pendências (mais abaixo, já no bloco
           existente). Itens 4 "Funções sem servidor" e 5 "Conflitos" ficam FORA desta tela --
           dependem de dado agregado que a API de /scales não retorna hoje e que não existe
           detecção de conflito em lugar nenhum do sistema; simular esse dado no frontend violaria
           SPEC-004 §43/§44, então o problema fica só registrado (ver Riscos da TASK-0039), sem
           placeholder algum na tela -- um placeholder vazio ainda seria uma promessa de recurso
           que não existe. -->
      <template v-if="auth.isStaff">

        <!-- 1) Próximas celebrações (lista curta) -->
        <div v-if="loading" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3 dark:bg-gray-800 dark:border-gray-700">
          <Skeleton width="w-40" height="h-3" />
          <Skeleton height="h-16" rounded="rounded-xl" />
          <Skeleton height="h-16" rounded="rounded-xl" />
        </div>
        <div v-else-if="upcomingCelebrations.length" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 dark:bg-gray-800 dark:border-gray-700">
          <p class="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-3 dark:text-gray-400">Próximas celebrações</p>
          <div class="space-y-2">
            <ScaleCard v-for="s in upcomingCelebrations" :key="s.id" v-bind="upcomingScaleCardProps(s)" />
          </div>
        </div>

        <!-- 2) Situação das escalas -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p class="text-xs font-semibold text-gray-600 uppercase tracking-widest">Total</p>
            <p class="mt-2 text-4xl font-extrabold text-gray-800">{{ totalScales }}</p>
            <p class="mt-1 text-xs text-gray-600">celebrações no mês</p>
          </div>
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p class="text-xs font-semibold text-emerald-700 uppercase tracking-widest">Confirmadas</p>
            <p class="mt-2 text-4xl font-extrabold text-emerald-600">{{ confirmed }}</p>
            <p class="mt-1 text-xs text-gray-600">escalas prontas</p>
          </div>
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p class="text-xs font-semibold text-amber-700 uppercase tracking-widest">Rascunhos</p>
            <p class="mt-2 text-4xl font-extrabold text-amber-600">{{ drafts }}</p>
            <p class="mt-1 text-xs text-gray-600">aguardando servidores</p>
          </div>
        </div>
      </template>

      <!-- Servidor -- ordem de prioridade exata da TASK-0008 (§5.1). Bloco 3 "Alterações
           importantes" foi deliberadamente omitido: depende do indicador de alteração ainda não
           implementado (pendência de dado registrada na própria TASK-0008, a resolver na
           TASK-0041) -- não inventamos o dado aqui. -->
      <template v-if="!auth.isStaff">

        <!-- 1) Próxima escala em destaque + 2) confirmação pendente embutida -->
        <div v-if="loading" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3 dark:bg-gray-800 dark:border-gray-700">
          <Skeleton width="w-32" height="h-3" />
          <Skeleton width="w-2/3" height="h-7" />
          <Skeleton width="w-1/2" height="h-4" />
        </div>
        <div v-else-if="myNextScale"
          class="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-purple-900 rounded-2xl p-6 text-white shadow-lg">
          <div class="absolute right-4 top-3 text-white/5 text-[8rem] font-serif select-none leading-none">♪</div>
          <p class="text-primary-300 text-xs font-semibold uppercase tracking-widest">Sua próxima escala</p>
          <p class="mt-1.5 text-2xl font-bold leading-snug">{{ myNextScale.celebracao }}</p>
          <p class="mt-1 text-primary-200 text-body-sm">
            {{ formatFullDate(myNextScale.dataCelebracao) }} · {{ myNextScale.horario }}
            <template v-if="myNextScale.comunidade">
              <span class="mx-1 text-primary-400">·</span>{{ myNextScale.comunidade.nome }}
            </template>
            <template v-if="myNextScalePivot?.instrument">
              <span class="mx-1 text-primary-400">·</span>{{ myNextScalePivot.instrument.nome }}
            </template>
          </p>
          <div class="mt-4 flex flex-wrap items-center gap-3">
            <RouterLink
              v-if="myNextScalePivot?.status === 'convidado'"
              :to="`/escalas/${myNextScale.id}`"
              class="inline-flex min-h-11 items-center gap-1.5 rounded-md bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary-700 shadow-sm transition hover:bg-primary-50"
            >
              Confirmar presença
            </RouterLink>
            <RouterLink :to="`/escalas/${myNextScale.id}`"
              class="inline-flex items-center gap-1 text-xs font-semibold text-primary-200 hover:text-white transition">
              Ver escala completa
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </RouterLink>
          </div>
        </div>
        <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center dark:bg-gray-800 dark:border-gray-700">
          <p class="text-body-sm text-gray-600 dark:text-gray-400">Nenhuma escala sua neste período.</p>
        </div>

        <!-- 4) Próximas escalas (resto da lista, já carregada -- sem nova chamada) -->
        <div v-if="myUpcomingScales.length" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 dark:bg-gray-800 dark:border-gray-700">
          <p class="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-3 dark:text-gray-400">Próximas escalas</p>
          <div class="space-y-2">
            <ScaleCard v-for="s in myUpcomingScales" :key="s.id" v-bind="scaleCardProps(s)" />
          </div>
        </div>

        <!-- 5) Disponibilidade: atalho de navegação, sem novo endpoint (o indicador "preenchida/
             pendente" exigiria consultar /availability, fora do escopo desta task). -->
        <RouterLink to="/disponibilidade"
          class="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
          <div>
            <p class="text-body-sm font-semibold text-gray-800 dark:text-gray-100">Disponibilidade</p>
            <p class="text-body-sm text-gray-600 dark:text-gray-400">Informe os períodos em que você pode servir.</p>
          </div>
          <svg class="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </RouterLink>

        <!-- 6) Repertório/liturgia contextual à próxima celebração -->
        <div v-if="myNextScale" class="flex flex-wrap gap-3">
          <RouterLink :to="`/escalas/${myNextScale.id}/repertorio`"
            class="flex-1 rounded-2xl border border-gray-100 bg-white p-4 text-center text-body-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
            Repertório da celebração
          </RouterLink>
          <RouterLink :to="`/escalas/${myNextScale.id}/liturgia`"
            class="flex-1 rounded-2xl border border-gray-100 bg-white p-4 text-center text-body-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
            Liturgia do dia
          </RouterLink>
        </div>
      </template>

      <!-- Pendências de confirmação (staff) -->
      <div v-if="auth.isStaff && pendencias.length" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <p class="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-3">Pendências de confirmação</p>
        <div class="space-y-2">
          <RouterLink v-for="p in pendencias" :key="p.scaleServidorId" :to="`/escalas/${p.scaleId}`"
            class="flex items-center justify-between p-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition group">
            <div class="min-w-0">
              <p class="text-sm font-semibold text-amber-800 truncate">{{ p.servidorNome }} — {{ p.celebracao }}</p>
              <p class="text-xs text-amber-600">{{ formatFullDate(p.dataCelebracao) }} · {{ p.horario }}</p>
            </div>
            <span class="shrink-0 ml-3 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
              {{ p.diasRestantes === 0 ? 'hoje' : `${p.diasRestantes}d` }}
            </span>
          </RouterLink>
        </div>
      </div>

      <!-- Calendário -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">

        <!-- Filtro por comunidade (fica fora do Calendar.vue -- componente genérico, sem
             conhecimento de "comunidade") -->
        <div v-if="comunidades.length > 1" class="flex justify-end border-b border-gray-100 px-6 py-3 dark:border-gray-700">
          <select v-model="filterComunidadeId" class="rounded-md border-gray-300 text-body-sm shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
            <option value="">Todas as comunidades</option>
            <option v-for="c in comunidades" :key="c.id" :value="c.id">{{ c.nome }}</option>
          </select>
        </div>

        <!-- Desktop: grade completa com chips (mantida igual). Mobile (TASK-0008 §31): grade
             compacta (só marcador de dia) + lista abaixo com informação completa, resolvendo o
             min-w-[560px]/scroll horizontal que forçava o mobile a rolar. -->
        <Calendar
          v-model:month="currentMonth"
          v-model:year="currentYear"
          :loading="loading"
          :cellBackground="cellBackground"
          :hasEvents="hasEvents"
        >
          <template #day="{ dateKey }">
            <RouterLink
              v-for="scale in scalesByDate[dateKey] ?? []"
              :key="scale.id"
              :to="`/escalas/${scale.id}`"
              class="mb-0.5 flex items-center gap-1 truncate rounded-md border px-1.5 py-0.5 text-xs font-medium transition"
              :class="chipClass(scale.horario, scale.status)"
              :title="`${scale.celebracao} · ${scale.celebrante?.nome ?? 'Sem celebrante'}`"
            >
              <span class="shrink-0 font-mono text-[10px]">{{ scale.horario }}</span>
              <span v-if="scale.celebrante" class="ml-0.5 hidden truncate text-[10px] opacity-75 lg:inline">
                {{ scale.celebrante.nome }}
              </span>
            </RouterLink>
          </template>

          <template #list-item="{ day, dateKey, isToday: dayIsToday }">
            <p class="mb-2 text-label uppercase tracking-wide text-gray-600 dark:text-gray-400">
              Dia {{ day }}<span v-if="dayIsToday"> · Hoje</span>
            </p>
            <div class="space-y-2">
              <RouterLink
                v-for="scale in scalesByDate[dateKey] ?? []"
                :key="scale.id"
                :to="`/escalas/${scale.id}`"
                class="flex items-center justify-between gap-3 rounded-xl border p-3 transition"
                :class="chipClass(scale.horario, scale.status)"
              >
                <div class="min-w-0">
                  <p class="truncate text-body-sm font-semibold">{{ scale.celebracao }}</p>
                  <p class="truncate text-body-sm opacity-80">
                    {{ formatFullDate(scale.dataCelebracao) }} · {{ scale.horario }}
                    <template v-if="scale.comunidade"> · {{ scale.comunidade.nome }}</template>
                  </p>
                  <p v-if="scale.celebrante" class="truncate text-body-sm opacity-80">{{ scale.celebrante.nome }}</p>
                </div>
                <Badge :color="scale.status === 'confirmada' ? 'green' : 'yellow'" class="shrink-0">{{ scale.status }}</Badge>
              </RouterLink>
            </div>
          </template>
        </Calendar>

        <!-- Legenda -->
        <div class="px-5 py-3 border-t border-gray-100 bg-gray-50/60 flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
          <span class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded bg-amber-50 border border-amber-200 inline-block"></span> Manhã
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded bg-indigo-50 border border-indigo-200 inline-block"></span> Tarde / Noite
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded bg-emerald-50 border border-emerald-200 inline-block"></span> Confirmada
          </span>
          <span class="ml-auto text-gray-600 dark:text-gray-400 italic hidden sm:inline">Passe o cursor sobre a celebração para ver os servidores</span>
        </div>

        <!-- Legenda das cores litúrgicas -->
        <div class="px-5 py-3 border-t border-gray-100 bg-gray-50/60 flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
          <span v-for="(classes, cor) in CORES_LITURGICAS_CLASSES" :key="cor" class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded border border-gray-300 inline-block" :class="classes"></span> {{ cor }}
          </span>
        </div>
      </div>

    </div>
  </AuthenticatedLayout>
</template>
