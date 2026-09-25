<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Calendar from '@/components/Calendar.vue'
import Badge from '@/components/Badge.vue'
import Select from '@/components/Select.vue'
import Skeleton from '@/components/Skeleton.vue'
import { parseDateOnly } from '@/utils/date'
import { currentAndNextMonthKeys, selectUpcoming } from '@/utils/upcoming'
import { assignmentRole, assignmentRoleLabel, resolveAssignment, type RoleLookups } from '@/utils/scaleRole'
import { LITURGICAL_COLORS, liturgicalColorLabel, liturgicalColorStyle } from '@/utils/liturgicalColors'
import { CheckCircleIcon } from '@heroicons/vue/20/solid'
import { ChevronRightIcon, MapPinIcon, UserIcon, UsersIcon } from '@heroicons/vue/24/outline'

const auth = useAuthStore()

interface ScaleServidor {
  servidorId: number
  servidor: { id: number; nome: string }
  instrument: { nome: string } | null
  // Já retornado pelo mesmo endpoint /scales hoje (confirmado em MyScales.vue, que consome o
  // mesmo campo) -- só não estava tipado aqui porque o Dashboard nunca tinha precisado dele.
  status: 'convidado' | 'confirmado' | 'recusado' | 'substituido'
  // Ministry/function of the assignment (already in GET /scales -- see api/_routes/scales.ts
  // `include`), used to show "Função" for any kind of server (TASK-0104).
  categoria?: { nome: string } | null
  team?: { nome: string; categoria?: { nome: string } | null } | null
  categoriaId?: number | null
  teamId?: number | null
  funcaoLiturgica?: string | null
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
  liturgia: string
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

// TASK-0088 (correção): "Sua próxima escala" (servidor) precisa de uma fonte de dado própria,
// sem o filtro de `mes` do calendário -- senão uma escala real do mês seguinte desaparece do
// bloco de prioridade #1 assim que o calendário não estiver mostrando aquele mês. Mesmo padrão
// já usado com sucesso em MyScales.vue (`GET /scales?mine=true`, sem `mes`).
const myScalesAll     = ref<Scale[]>([])
const loadingMyScales = ref(false)

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

const upcomingScales  = ref<Scale[]>([])
const loadingUpcoming = ref(false)

async function loadUpcoming() {
  if (!auth.isStaff) return
  loadingUpcoming.value = true
  try {
    const responses = await Promise.all(
      currentAndNextMonthKeys(new Date()).map((mes) => client.get<Scale[]>('/scales', { params: { mes } })),
    )
    upcomingScales.value = responses.flatMap((r) => r.data)
  } finally {
    loadingUpcoming.value = false
  }
}

async function loadPendencias() {
  if (!auth.isStaff) return
  const { data } = await client.get('/scales/pendentes')
  pendencias.value = data.slice(0, 8)
}

// The list endpoint only returns categoriaId/teamId per assignment; names come from the
// existing /categorias and /teams endpoints (TASK-0104 -- no API change, SPEC-003.1 §30).
const roleLookups = ref<RoleLookups>({ categoriasById: new Map(), teamsById: new Map() })

async function loadMyScales() {
  if (auth.isStaff) return
  loadingMyScales.value = true
  try {
    const [scalesRes, categoriasRes, teamsRes] = await Promise.all([
      client.get('/scales', { params: { mine: 'true' } }),
      client.get<{ id: number; nome: string }[]>('/categorias').catch(() => ({ data: [] })),
      client.get<{ id: number; nome: string; categoria?: { nome: string } | null }[]>('/teams').catch(() => ({ data: [] })),
    ])
    myScalesAll.value = scalesRes.data
    roleLookups.value = {
      categoriasById: new Map(categoriasRes.data.map((c) => [c.id, c])),
      teamsById: new Map(teamsRes.data.map((t) => [t.id, t])),
    }
  } finally {
    loadingMyScales.value = false
  }
}

// Repertoire is only in the scale detail (GET /scales/:id), so it is fetched for the next scale
// alone -- the "Repertório" shortcut shows up only when that celebration really has one (§6).
const myNextScaleDetail = ref<{ id: number; repertoire?: { items: unknown[] } | null } | null>(null)

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

onMounted(() => { load(); loadUpcoming(); loadPendencias(); loadComunidades(); loadLiturgias(); loadMyScales() })
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

// Cell background = liturgical color of the day (liturgical season, never status --
// SPEC-003.1 §9/§24); neutral when the day's liturgy is not synced yet. `dateKey` comes ready
// from Calendar.vue as "YYYY-MM-DD", the same format as scalesByDate/liturgiaByDate.
function cellBackground(dateKey: string) {
  return liturgicalColorStyle(liturgiaByDate.value[dateKey]?.cor).cell
}

// Desktop tiles show the liturgical color as a corner dot (TASK-0101); the mobile compact grid
// keeps the tinted cell above. Unknown/missing color -> no dot rather than a guessed one.
function cellMarker(dateKey: string) {
  const cor = liturgiaByDate.value[dateKey]?.cor
  return liturgicalColorLabel(cor) ? liturgicalColorStyle(cor).dot : null
}

// Tooltip/screen-reader text: liturgical season + the day's liturgy name, both from /liturgia.
function cellLabel(dateKey: string) {
  const l = liturgiaByDate.value[dateKey]
  const label = liturgicalColorLabel(l?.cor)
  if (!label) return null
  return l?.liturgia ? `${label} · ${l.liturgia}` : label
}

function hasEvents(dateKey: string) {
  return (scalesByDate.value[dateKey]?.length ?? 0) > 0
}

// Scale chips/cards stay neutral: they sit on top of the liturgical cell color, and the old
// colored chips (green "confirmada", amber morning, blue evening) read as liturgical
// information (SPEC-003.1 §24). Status is shown by icon + text (chip) or Badge (list) instead;
// the time of day is already written on the chip.
const SCALE_CHIP_CLASS = 'border-gray-200 bg-white/90 text-gray-800 hover:border-primary-300 hover:bg-white dark:border-gray-600 dark:bg-gray-900/80 dark:text-gray-100 dark:hover:border-primary-500'

const totalScales = computed(() => scales.value.length)
const confirmed   = computed(() => scales.value.filter(s => s.status === 'confirmada').length)
const drafts      = computed(() => scales.value.filter(s => s.status === 'rascunho').length)

// Dashboard-Coordenador (TASK-0008 §5.2, item 1): "lista curta" das próximas celebrações, não
// só a primeira -- mesma ordenação/filtro que já existia (`nextScale`), só sem cortar em 1.
// A "contagem de funções preenchidas" que o wireframe também descreve para este bloco NÃO é
// implementada: a API de /scales não retorna as categorias esperadas por celebração, mesma
// lacuna de dado já registrada para "Funções sem servidor" (ver Riscos da TASK-0039).
//
// TASK-0102: own data source (`upcomingScales`, current + next month via the existing `mes`
// param), no longer `scales.value` -- that one follows the month shown in the calendar, so
// browsing the calendar used to change "the next celebration". Same reasoning as TASK-0088.
const upcomingCelebrations = computed(() => selectUpcoming(upcomingScales.value, new Date(), 6))
const nextCelebration = computed(() => upcomingCelebrations.value[0] ?? null)
const laterCelebrations = computed(() => upcomingCelebrations.value.slice(1))

function teamSummary(s: Scale) {
  const total = s.servidores.length
  if (!total) return 'Nenhum servidor escalado ainda'
  const confirmedCount = s.servidores.filter((sv) => sv.status === 'confirmado').length
  return `${total} ${total === 1 ? 'servidor' : 'servidores'} · ${confirmedCount} ${confirmedCount === 1 ? 'confirmado' : 'confirmados'}`
}

function capitalizeFirst(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function weekdayShort(iso: string) {
  return parseDateOnly(iso)!.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase()
}

function monthShort(iso: string) {
  return parseDateOnly(iso)!.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
}

function dayOfMonth(iso: string) {
  return parseDateOnly(iso)!.getDate()
}

const shownMonthLabel = computed(() =>
  new Date(currentYear.value, currentMonth.value, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
)

// TASK-0088 (correção): fonte própria (myScalesAll, `GET /scales?mine=true`, sem `mes`), não
// mais `scales.value` (que só contém o mês em exibição no calendário do coordenador -- um
// conceito visual que não tem relação nenhuma com "qual é a próxima escala do servidor").
//
// TASK-0104: sorted by local date/time via selectUpcoming (the old `toISOString()` filter used
// UTC, so after 21:00 in Brazil that evening's scale disappeared). Assignments the person
// refused or was replaced in are not "their next scale" anymore, so they are left out here
// (they remain visible in Minha Escala).
const ACTIVE_ASSIGNMENT = new Set(['convidado', 'confirmado'])

const myActiveUpcoming = computed(() => {
  const mid = auth.user?.servidorId
  if (!mid) return []
  const mine = myScalesAll.value.filter(s => s.servidores.some(sv => sv.servidorId === mid && ACTIVE_ASSIGNMENT.has(sv.status)))
  return selectUpcoming(mine, new Date(), Number.MAX_SAFE_INTEGER)
})

const myNextScales = computed(() => myActiveUpcoming.value.slice(0, 4))

// "Pendências" block (SPEC-003.1 §6): upcoming scales still waiting for this person's answer.
const myPendingCount = computed(() => myActiveUpcoming.value.filter(s => myPivot(s)?.status === 'convidado').length)

// Prioridade do Dashboard-Servidor (docs/tasks/0008-*.md, §5.1): a próxima escala do PRÓPRIO
// servidor é a informação principal, não as próximas celebrações do sistema inteiro
// (`upcomingCelebrations`, usada só no dashboard do coordenador). Mesma lista `myNextScales` já
// carregada -- só destacamos o primeiro item e listamos o restante à parte, sem nova chamada de
// API.
const myNextScale = computed(() => myNextScales.value[0] ?? null)
const myUpcomingScales = computed(() => myNextScales.value.slice(1))

function myPivot(scale: Scale | null) {
  if (!scale) return null
  const pivot = scale.servidores.find(sv => sv.servidorId === auth.user?.servidorId) ?? null
  return resolveAssignment(pivot, roleLookups.value)
}

const myNextScalePivot = computed(() => myPivot(myNextScale.value))
const myNextScaleRole = computed(() => assignmentRole(myNextScalePivot.value))

// Repertoire is "when applicable" (§6): only offered when the celebration really has one.
watch(myNextScale, async (scale) => {
  myNextScaleDetail.value = null
  if (!scale) return
  try {
    const { data } = await client.get(`/scales/${scale.id}`)
    if (myNextScale.value?.id === scale.id) myNextScaleDetail.value = data
  } catch {
    // Shortcut simply stays hidden; the rest of the card does not depend on it.
  }
})

const myNextScaleHasRepertoire = computed(() => (myNextScaleDetail.value?.repertoire?.items.length ?? 0) > 0)

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

    <!-- Desktop: 3-column grid (reference layout, SPEC-003.1 §5/§22) -- staff: highlight + calendar
         on the left, short lists on the right. DOM order is the mobile priority order (§28):
         next celebration → upcoming → pending → month status → calendar. -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">

      <!-- Coordenador -- prioridades da TASK-0008 (§5.2) na linguagem da SPEC-003.1. Itens
           "Funções sem servidor" e "Conflitos" seguem FORA desta tela: dependem de dado que a API
           não retorna e não há detecção de conflito no sistema (Riscos da TASK-0039). Avisos/
           comunicações da referência também não entram: não existe esse módulo (SPEC-003.1 §5).
           Cobertura por ministério entra na TASK-0103. -->
      <template v-if="auth.isStaff">

        <!-- 1) Próxima celebração (informação principal) -->
        <section class="lg:col-span-2" aria-labelledby="next-celebration-title">
          <div v-if="loadingUpcoming" class="space-y-3 rounded-xl bg-white p-6 shadow-card dark:bg-gray-800 dark:shadow-none">
            <Skeleton width="w-32" height="h-3" />
            <Skeleton width="w-2/3" height="h-7" />
            <Skeleton width="w-1/2" height="h-4" />
          </div>
          <RouterLink
            v-else-if="nextCelebration"
            :to="`/escalas/${nextCelebration.id}`"
            class="group relative flex gap-5 overflow-hidden rounded-xl bg-white p-6 shadow-card transition hover:ring-1 hover:ring-primary-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-gray-800 dark:shadow-none dark:hover:ring-primary-700"
          >
            <!-- Discreet liturgical mark (§20) -->
            <span class="hidden h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-600 sm:flex dark:bg-accent-900/30 dark:text-accent-300" aria-hidden="true">
              <svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
                <path d="M12 3v18M7 8h10" />
              </svg>
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-start justify-between gap-2">
                <p class="text-label uppercase text-accent-700 dark:text-accent-300">Próxima celebração</p>
                <Badge :color="nextCelebration.status === 'confirmada' ? 'green' : 'yellow'">
                  {{ nextCelebration.status === 'confirmada' ? 'Escala confirmada' : 'Escala em rascunho' }}
                </Badge>
              </div>
              <h3 id="next-celebration-title" class="mt-1 text-h3 text-gray-900 dark:text-gray-50">
                {{ capitalizeFirst(formatFullDate(nextCelebration.dataCelebracao)) }} · {{ nextCelebration.horario }} — {{ nextCelebration.celebracao }}
              </h3>
              <ul class="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-body-sm text-gray-600 dark:text-gray-300">
                <li v-if="nextCelebration.comunidade" class="flex items-center gap-1.5">
                  <MapPinIcon class="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span class="sr-only">Local:</span>{{ nextCelebration.comunidade.nome }}
                </li>
                <li class="flex items-center gap-1.5">
                  <UserIcon class="h-4 w-4 shrink-0" aria-hidden="true" />
                  Celebrante: {{ nextCelebration.celebrante?.nome ?? 'não definido' }}
                </li>
                <li class="flex items-center gap-1.5">
                  <UsersIcon class="h-4 w-4 shrink-0" aria-hidden="true" />
                  {{ teamSummary(nextCelebration) }}
                </li>
              </ul>
            </div>
            <ChevronRightIcon class="hidden h-5 w-5 shrink-0 self-center text-gray-400 transition group-hover:text-primary-600 sm:block" aria-hidden="true" />
          </RouterLink>
          <div v-else class="rounded-xl bg-white p-6 text-center shadow-card dark:bg-gray-800 dark:shadow-none">
            <p class="text-body-sm text-gray-600 dark:text-gray-400">Nenhuma celebração agendada neste mês nem no próximo.</p>
          </div>
        </section>

        <!-- Coluna lateral (desktop) -->
        <div class="space-y-6 lg:col-start-3 lg:row-span-2 lg:row-start-1">

          <!-- 2) Próximas celebrações -->
          <section v-if="loadingUpcoming || laterCelebrations.length" class="rounded-xl bg-white p-5 shadow-card dark:bg-gray-800 dark:shadow-none" aria-labelledby="upcoming-title">
            <div class="mb-3 flex items-center justify-between gap-2">
              <h3 id="upcoming-title" class="text-body font-semibold text-gray-800 dark:text-gray-100">Próximas celebrações</h3>
              <RouterLink to="/escalas" class="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap text-body-sm font-semibold text-primary-600 hover:underline dark:text-primary-300">Ver todas</RouterLink>
            </div>
            <div v-if="loadingUpcoming" class="space-y-3">
              <Skeleton height="h-12" rounded="rounded-lg" />
              <Skeleton height="h-12" rounded="rounded-lg" />
            </div>
            <ul v-else class="divide-y divide-gray-100 dark:divide-gray-700">
              <li v-for="s in laterCelebrations" :key="s.id">
                <RouterLink :to="`/escalas/${s.id}`" class="flex items-center gap-3 rounded-lg py-3 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:bg-gray-700/50">
                  <span class="w-10 shrink-0 text-center">
                    <span class="block text-caption font-semibold text-gray-500 dark:text-gray-400">{{ weekdayShort(s.dataCelebracao) }}</span>
                    <span class="block text-h4 leading-tight text-gray-900 dark:text-gray-100">{{ dayOfMonth(s.dataCelebracao) }}</span>
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block truncate text-body-sm font-semibold text-gray-800 dark:text-gray-100">{{ s.celebracao }}</span>
                    <span class="block truncate text-caption text-gray-600 dark:text-gray-400">
                      {{ s.horario }}<template v-if="s.comunidade"> · {{ s.comunidade.nome }}</template>
                    </span>
                    <span v-if="s.celebrante" class="block truncate text-caption text-gray-500 dark:text-gray-400">{{ s.celebrante.nome }}</span>
                  </span>
                  <Badge v-if="s.status === 'rascunho'" color="yellow" class="shrink-0">rascunho</Badge>
                </RouterLink>
              </li>
            </ul>
          </section>

          <!-- 3) Pendências de confirmação -->
          <section v-if="pendencias.length" class="rounded-xl bg-white p-5 shadow-card dark:bg-gray-800 dark:shadow-none" aria-labelledby="pending-title">
            <h3 id="pending-title" class="mb-3 text-body font-semibold text-gray-800 dark:text-gray-100">
              Pendências de confirmação
              <span class="ml-1 whitespace-nowrap text-body-sm font-normal text-gray-500 dark:text-gray-400">({{ pendencias.length }})</span>
            </h3>
            <ul class="space-y-2">
              <li v-for="p in pendencias" :key="p.scaleServidorId">
                <RouterLink :to="`/escalas/${p.scaleId}`"
                  class="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-3 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-gray-700 dark:hover:bg-gray-700/50">
                  <span class="min-w-0">
                    <span class="block truncate text-body-sm font-semibold text-gray-800 dark:text-gray-100">{{ p.servidorNome }}</span>
                    <span class="block truncate text-caption text-gray-600 dark:text-gray-400">{{ p.celebracao }} · {{ formatFullDate(p.dataCelebracao) }} · {{ p.horario }}</span>
                  </span>
                  <Badge color="yellow" class="shrink-0">{{ p.diasRestantes === 0 ? 'hoje' : `em ${p.diasRestantes}d` }}</Badge>
                </RouterLink>
              </li>
            </ul>
          </section>

          <!-- 4) Situação das escalas (mês exibido no calendário) -->
          <section class="rounded-xl bg-white p-5 shadow-card dark:bg-gray-800 dark:shadow-none" aria-labelledby="month-status-title">
            <h3 id="month-status-title" class="text-body font-semibold text-gray-800 dark:text-gray-100">Situação das escalas</h3>
            <p class="mb-4 text-caption text-gray-600 dark:text-gray-400">{{ capitalizeFirst(shownMonthLabel) }}</p>
            <dl class="grid grid-cols-3 gap-3 text-center">
              <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                <dt class="text-caption text-gray-600 dark:text-gray-400">Celebrações</dt>
                <dd class="mt-1 text-h2 text-gray-900 dark:text-gray-50">{{ totalScales }}</dd>
              </div>
              <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                <dt class="text-caption text-gray-600 dark:text-gray-400">Confirmadas</dt>
                <dd class="mt-1 text-h2 text-success-700 dark:text-success-400">{{ confirmed }}</dd>
              </div>
              <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                <dt class="text-caption text-gray-600 dark:text-gray-400">Rascunhos</dt>
                <dd class="mt-1 text-h2 text-warning-700 dark:text-warning-400">{{ drafts }}</dd>
              </div>
            </dl>
          </section>
        </div>
      </template>

      <!-- Servidor -- simplificado (SPEC-003.1 §6/§26): "o que eu preciso saber ou fazer agora?".
           Ordem de prioridade (também a ordem do mobile): próxima escala → próximas escalas →
           pendências → disponibilidade → conteúdo. Sem estatísticas, dados de outros servidores
           nem comunicações (não há módulo). "Alterações importantes" segue omitido: depende de
           um indicador de alteração que não existe (TASK-0008/TASK-0041). -->
      <div v-if="!auth.isStaff" class="grid grid-cols-1 gap-6 lg:col-span-3 lg:grid-cols-3">

        <!-- 1) Sua próxima escala (informação + ação principal) -->
        <section class="lg:col-span-2" aria-labelledby="my-next-title">
          <div v-if="loadingMyScales" class="space-y-3 rounded-xl bg-white p-6 shadow-card dark:bg-gray-800 dark:shadow-none">
            <Skeleton width="w-32" height="h-3" />
            <Skeleton width="w-2/3" height="h-7" />
            <Skeleton width="w-1/2" height="h-4" />
          </div>
          <div v-else-if="myNextScale" class="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-800 to-primary-950 p-6 text-white shadow-card">
            <!-- Discreet liturgical mark (§20) instead of the old musical note -->
            <svg class="pointer-events-none absolute -right-4 -top-4 h-40 w-40 text-white/5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
              <path d="M12 3v18M7 8h10" />
            </svg>
            <p class="text-label uppercase text-accent-300">Sua próxima escala</p>
            <h3 id="my-next-title" class="mt-1.5 text-h2 leading-snug">
              {{ capitalizeFirst(formatFullDate(myNextScale.dataCelebracao)) }} · {{ myNextScale.horario }}
            </h3>
            <p class="text-h4 font-medium text-primary-100">{{ myNextScale.celebracao }}</p>
            <dl class="mt-4 grid gap-3 text-body-sm sm:grid-cols-2">
              <div v-if="myNextScale.comunidade" class="flex items-start gap-2">
                <MapPinIcon class="mt-0.5 h-4 w-4 shrink-0 text-primary-300" aria-hidden="true" />
                <div>
                  <dt class="text-caption text-primary-300">Local</dt>
                  <dd>{{ myNextScale.comunidade.nome }}</dd>
                </div>
              </div>
              <div class="flex items-start gap-2">
                <UserIcon class="mt-0.5 h-4 w-4 shrink-0 text-primary-300" aria-hidden="true" />
                <div>
                  <dt class="text-caption text-primary-300">Função</dt>
                  <dd class="font-semibold">
                    {{ myNextScaleRole.ministry ?? 'Não definida' }}<span v-if="myNextScaleRole.details.length" class="font-normal text-primary-100"> · {{ myNextScaleRole.details.join(' · ') }}</span>
                  </dd>
                </div>
              </div>
            </dl>
            <div class="mt-5 flex flex-wrap items-center gap-3">
              <RouterLink
                v-if="myNextScalePivot?.status === 'convidado'"
                :to="`/escalas/${myNextScale.id}`"
                class="inline-flex min-h-11 items-center rounded-lg bg-white px-4 py-2 text-body-sm font-semibold text-primary-800 shadow-sm transition hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-300"
              >
                Confirmar presença
              </RouterLink>
              <span v-else-if="myNextScalePivot?.status === 'confirmado'" class="inline-flex items-center gap-1.5 text-body-sm text-primary-100">
                <CheckCircleIcon class="h-4 w-4" aria-hidden="true" /> Presença confirmada
              </span>
              <RouterLink :to="`/escalas/${myNextScale.id}`"
                class="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-body-sm font-semibold text-primary-100 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-300">
                Ver escala
                <ChevronRightIcon class="h-4 w-4" aria-hidden="true" />
              </RouterLink>
            </div>
          </div>
          <div v-else class="rounded-xl bg-white p-6 text-center shadow-card dark:bg-gray-800 dark:shadow-none">
            <p class="text-body-sm text-gray-600 dark:text-gray-400">Você não tem escalas futuras no momento.</p>
          </div>
        </section>

        <!-- 2) Próximas escalas -->
        <section v-if="myUpcomingScales.length" class="self-start rounded-xl bg-white p-5 shadow-card lg:col-span-2 lg:row-start-2 dark:bg-gray-800 dark:shadow-none" aria-labelledby="my-upcoming-title">
          <div class="mb-2 flex items-center justify-between gap-2">
            <h3 id="my-upcoming-title" class="text-body font-semibold text-gray-800 dark:text-gray-100">Próximas escalas</h3>
            <RouterLink to="/minha-escala" class="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap text-body-sm font-semibold text-primary-600 hover:underline dark:text-primary-300">Ver todas</RouterLink>
          </div>
          <ul class="divide-y divide-gray-100 dark:divide-gray-700">
            <li v-for="s in myUpcomingScales" :key="s.id">
              <RouterLink :to="`/escalas/${s.id}`" class="flex items-center gap-4 rounded-lg py-3 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:bg-gray-700/50">
                <span class="w-12 shrink-0 text-center">
                  <span class="block text-h4 leading-tight text-gray-900 dark:text-gray-100">{{ dayOfMonth(s.dataCelebracao) }}</span>
                  <span class="block text-caption font-semibold uppercase text-gray-500 dark:text-gray-400">{{ monthShort(s.dataCelebracao) }}</span>
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-body-sm font-semibold text-gray-800 dark:text-gray-100">{{ s.horario }} — {{ s.celebracao }}</span>
                  <span class="block truncate text-caption text-gray-600 dark:text-gray-400">
                    {{ assignmentRoleLabel(myPivot(s)) ?? 'Função não definida' }}<template v-if="s.comunidade"> · {{ s.comunidade.nome }}</template>
                  </span>
                </span>
                <Badge :color="myPivot(s)?.status === 'confirmado' ? 'green' : 'yellow'" class="shrink-0">
                  {{ myPivot(s)?.status === 'confirmado' ? 'Confirmado' : 'Aguardando' }}
                </Badge>
              </RouterLink>
            </li>
          </ul>
        </section>

        <!-- Coluna lateral (desktop) -->
        <div class="space-y-6 lg:col-start-3 lg:row-span-2 lg:row-start-1">

          <!-- 3) Pendências -->
          <section v-if="myPendingCount" class="rounded-xl border border-warning-200 bg-warning-50 p-5 dark:border-warning-800 dark:bg-warning-900/20" aria-labelledby="my-pending-title">
            <h3 id="my-pending-title" class="text-body font-semibold text-gray-900 dark:text-gray-50">Pendências</h3>
            <p class="mt-1 text-body-sm text-gray-700 dark:text-gray-300">
              Você possui {{ myPendingCount }} {{ myPendingCount === 1 ? 'escala aguardando' : 'escalas aguardando' }} confirmação.
            </p>
            <RouterLink to="/minha-escala" class="mt-2 inline-flex min-h-11 items-center gap-1 text-body-sm font-semibold text-primary-700 hover:underline dark:text-primary-300">
              Ver pendências <ChevronRightIcon class="h-4 w-4" aria-hidden="true" />
            </RouterLink>
          </section>

          <!-- 4) Disponibilidade: atalho, sem novo endpoint -->
          <RouterLink to="/disponibilidade"
            class="flex items-center justify-between gap-3 rounded-xl bg-white p-5 shadow-card transition hover:ring-1 hover:ring-primary-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-gray-800 dark:shadow-none dark:hover:ring-primary-700">
            <span>
              <span class="block text-body font-semibold text-gray-800 dark:text-gray-100">Disponibilidade</span>
              <span class="block text-body-sm text-gray-600 dark:text-gray-400">Informe os períodos em que você pode servir.</span>
            </span>
            <ChevronRightIcon class="h-5 w-5 shrink-0 text-gray-400" aria-hidden="true" />
          </RouterLink>

          <!-- 6) Conteúdo da próxima celebração: liturgia sempre (vale para todo ministério);
               repertório só quando a celebração tem um. -->
          <section v-if="myNextScale" class="rounded-xl bg-white p-5 shadow-card dark:bg-gray-800 dark:shadow-none" aria-labelledby="my-content-title">
            <h3 id="my-content-title" class="mb-2 text-body font-semibold text-gray-800 dark:text-gray-100">Para a próxima celebração</h3>
            <ul class="divide-y divide-gray-100 dark:divide-gray-700">
              <li>
                <RouterLink :to="`/escalas/${myNextScale.id}/liturgia`" class="flex min-h-11 items-center justify-between gap-3 py-2 text-body-sm font-medium text-gray-700 hover:text-primary-700 dark:text-gray-200 dark:hover:text-primary-300">
                  Liturgia do dia <ChevronRightIcon class="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                </RouterLink>
              </li>
              <li v-if="myNextScaleHasRepertoire">
                <RouterLink :to="`/escalas/${myNextScale.id}/repertorio`" class="flex min-h-11 items-center justify-between gap-3 py-2 text-body-sm font-medium text-gray-700 hover:text-primary-700 dark:text-gray-200 dark:hover:text-primary-300">
                  Repertório da celebração <ChevronRightIcon class="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                </RouterLink>
              </li>
            </ul>
          </section>
        </div>

      </div>

      <!-- Calendário -->
      <div class="overflow-hidden rounded-xl bg-white shadow-card dark:bg-gray-800 dark:shadow-none" :class="auth.isStaff ? 'lg:col-span-2 lg:row-start-2' : 'lg:col-span-3'">

        <!-- Filtro por comunidade (fica fora do Calendar.vue -- componente genérico, sem
             conhecimento de "comunidade") -->
        <div v-if="comunidades.length > 1" class="flex justify-end border-b border-gray-100 px-4 py-3 sm:px-6 dark:border-gray-700">
          <label for="calendar-community-filter" class="sr-only">Filtrar calendário por comunidade</label>
          <Select id="calendar-community-filter" v-model="filterComunidadeId" class="text-body-sm sm:w-64">
            <option value="">Todas as comunidades</option>
            <option v-for="c in comunidades" :key="c.id" :value="c.id">{{ c.nome }}</option>
          </Select>
        </div>

        <!-- Desktop: grade completa com chips (mantida igual). Mobile (TASK-0008 §31): grade
             compacta (só marcador de dia) + lista abaixo com informação completa, resolvendo o
             min-w-[560px]/scroll horizontal que forçava o mobile a rolar. -->
        <Calendar
          v-model:month="currentMonth"
          v-model:year="currentYear"
          :loading="loading"
          title="Calendário Litúrgico"
          :cellBackground="cellBackground"
          :cellMarker="cellMarker"
          :cellLabel="cellLabel"
          :hasEvents="hasEvents"
        >
          <template #day="{ dateKey }">
            <RouterLink
              v-for="scale in scalesByDate[dateKey] ?? []"
              :key="scale.id"
              :to="`/escalas/${scale.id}`"
              class="mb-0.5 flex items-center gap-1 truncate rounded-md border px-1.5 py-0.5 text-xs font-medium transition"
              :class="SCALE_CHIP_CLASS"
              :title="`${scale.celebracao} · ${scale.celebrante?.nome ?? 'Sem celebrante'} · ${scale.status === 'confirmada' ? 'Escala confirmada' : 'Rascunho'}`"
            >
              <CheckCircleIcon v-if="scale.status === 'confirmada'" class="h-3.5 w-3.5 shrink-0 text-gray-600 dark:text-gray-300" aria-hidden="true" />
              <span class="sr-only">{{ scale.status === 'confirmada' ? 'Escala confirmada:' : 'Rascunho:' }}</span>
              <span class="shrink-0 font-mono text-caption">{{ scale.horario }}</span>
              <span v-if="scale.celebrante" class="ml-0.5 hidden truncate text-caption text-gray-600 dark:text-gray-300 xl:inline">
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
                :class="SCALE_CHIP_CLASS"
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

        <!-- Two separate legends on purpose (SPEC-003.1 §24): cell colors = liturgical season;
             scale status = icon/text, no color. -->
        <div class="border-t border-gray-100 bg-gray-50/60 px-5 py-3 dark:border-gray-700 dark:bg-gray-900/40">
          <p class="mb-2 text-label uppercase text-gray-600 dark:text-gray-400">Cor do dia · Tempo litúrgico</p>
          <ul class="flex flex-wrap gap-x-5 gap-y-2 text-caption text-gray-700 dark:text-gray-300">
            <li v-for="cor in LITURGICAL_COLORS" :key="cor" class="flex items-center gap-1.5">
              <span class="inline-block h-3 w-3 shrink-0 rounded-full" :class="liturgicalColorStyle(cor).dot" aria-hidden="true"></span>
              <span><span class="font-semibold">{{ cor }}</span> — {{ liturgicalColorStyle(cor).meaning }}</span>
            </li>
          </ul>
        </div>

        <div class="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-gray-100 bg-gray-50/60 px-5 py-3 text-caption text-gray-700 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
          <p class="text-label uppercase text-gray-600 dark:text-gray-400">Escalas</p>
          <span class="flex items-center gap-1.5">
            <CheckCircleIcon class="h-4 w-4 text-gray-600 dark:text-gray-300" aria-hidden="true" /> Confirmada
          </span>
          <span>Sem ícone: rascunho</span>
          <span class="ml-auto hidden italic text-gray-600 dark:text-gray-400 sm:inline">Passe o cursor sobre a escala para ver celebração e celebrante</span>
        </div>
      </div>

    </div>
  </AuthenticatedLayout>
</template>
