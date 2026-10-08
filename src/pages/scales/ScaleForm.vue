<script setup lang="ts">
import { ref, watch, computed, reactive, nextTick } from 'vue'
import InputLabel from '@/components/InputLabel.vue'
import InputError from '@/components/InputError.vue'
import TextInput from '@/components/TextInput.vue'
import Select from '@/components/Select.vue'
import { celebrationNameFor, isDeacon } from '@/utils/celebrante'
import PrimaryButton from '@/components/PrimaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'
import TertiaryButton from '@/components/TertiaryButton.vue'
import ConflictAlert from '@/components/scale/ConflictAlert.vue'
import EmptyRole from '@/components/scale/EmptyRole.vue'
import ScaleRole from '@/components/scale/ScaleRole.vue'
import ScaleMember from '@/components/scale/ScaleMember.vue'
import Badge from '@/components/Badge.vue'
import Avatar from '@/components/Avatar.vue'
import { MagnifyingGlassIcon, SparklesIcon, TrashIcon, UserGroupIcon } from '@heroicons/vue/24/outline'
import client from '@/api/client'
import { parseDateOnly } from '@/utils/date'

interface Servidor {
  id: number
  nome: string
  instruments: { instrumentId: number; instrument: { id: number; nome: string } }[]
  teams: { teamId: number }[]
  categorias: { categoriaId: number }[]
}
interface Categoria { id: number; nome: string; ordem: number }
interface Team { id: number; nome: string; categoria: Categoria }
interface Comunidade { id: number; nome: string }
interface Celebrante { id: number; nome: string }

// `conflito` (TASK-0045, SPEC-004 §22): nenhum endpoint retorna esse dado hoje -- detecção de
// horário/indisponibilidade exige lógica de backend que não existe (confirmado em
// docs/tasks/0009-*.md e api/_lib/suggestServidores.ts, que só filtra indisponíveis da
// sugestão, sem expor o motivo). Campo opcional só para o `ConflictAlert` ter onde ler quando
// esse dado existir -- nenhuma lógica de detecção é escrita aqui, o campo fica sempre
// ausente/undefined na prática.
interface ScaleServidor {
  servidorId: number
  instrumentId: number | null
  teamId: number | null
  categoriaId: number | null
  funcaoLiturgica: string | null
  conflito?: { type: 'indisponivel' | 'ja-escalado' | 'incompativel'; detail?: string } | null
}

const FUNCAO_LITURGICA_LABELS: Record<string, string> = {
  cerimoniario_1: 'Cerimoniário 1',
  cerimoniario_2: 'Cerimoniário 2',
  librifero: 'Librífero',
  cruciferario: 'Cruciferário',
  ceroferario: 'Ceroferário',
  turiferario: 'Turiferário',
  naveteiro: 'Naveteiro',
}

interface FormData {
  dataCelebracao: string
  horario: string
  celebracao: string
  comunidadeId: number | null
  celebranteId: number | null
  observacoes: string
  status: 'rascunho' | 'confirmada'
  lembreteDiasAntes: number
  servidores: ScaleServidor[]
}

const props = defineProps<{
  initialData?: Partial<FormData>
  servidores: Servidor[]
  teams: Team[]
  comunidades: Comunidade[]
  celebrantes: Celebrante[]
  categorias: Categoria[]
  loading?: boolean
  /**
   * 'team' (TASK-0133, ADR-0009): only the team step, for community coordinators -- opens on the
   * team step, shows the celebration as read-only context and submits right from there. The
   * parent sends only `servidores` to PUT /scales/:id/servidores.
   */
  mode?: 'full' | 'team'
  /** Where "Cancelar" goes (team mode returns to the scale). */
  cancelTo?: string
}>()

const isTeamMode = computed(() => props.mode === 'team')
const cancelLink = computed(() => props.cancelTo ?? '/escalas')

const emit = defineEmits<{ submit: [data: FormData] }>()

const form = ref<FormData>({
  dataCelebracao: props.initialData?.dataCelebracao ?? '',
  horario: props.initialData?.horario ?? '',
  celebracao: props.initialData?.celebracao ?? '',
  comunidadeId: props.initialData?.comunidadeId ?? null,
  celebranteId: props.initialData?.celebranteId ?? null,
  observacoes: props.initialData?.observacoes ?? '',
  status: props.initialData?.status ?? 'rascunho',
  lembreteDiasAntes: props.initialData?.lembreteDiasAntes ?? 3,
  servidores: props.initialData?.servidores ?? [],
})

watch(() => props.initialData, (val) => { if (val) Object.assign(form.value, val) })

// Deacons cannot celebrate Masses (ADR-0008): picking a deacon switches the name to
// "Celebração da Palavra" and locks it. The API enforces the same rule.
const celebranteIsDeacon = computed(() => isDeacon(props.celebrantes.find((c) => c.id === form.value.celebranteId)?.nome))
watch([celebranteIsDeacon, () => form.value.celebracao], ([deacon]) => {
  if (!deacon) return
  const nome = props.celebrantes.find((c) => c.id === form.value.celebranteId)?.nome
  const name = celebrationNameFor(form.value.celebracao, nome)
  if (name !== form.value.celebracao) form.value.celebracao = name
}, { immediate: true })

// TASK-0073 (correção): `comunidades` chega de forma assíncrona em Create.vue -- calcular o
// padrão só na inicialização do `form` (acima) deixava o campo permanentemente vazio, porque o
// fetch ainda não tinha resolvido naquele momento. Preenche assim que a lista chegar, mas nunca
// sobrescreve uma comunidade já definida (por `initialData`, em Edit.vue, ou por uma escolha
// manual do usuário antes do fetch terminar).
watch(() => props.comunidades, (lista) => {
  if (lista.length && form.value.comunidadeId == null) {
    form.value.comunidadeId = lista[0].id
  }
}, { immediate: true })

// Navegação por etapas (TASK-0043, docs/tasks/0009-*.md §7.2) -- indicador textual simples
// ("Etapa N de 4"), sem componente de stepper visual novo (decisão já registrada na
// TASK-0026: uso único não justifica um componente dedicado). Só a Etapa 1 é redesenhada nesta
// task; Etapas 2-4 mantêm o conteúdo real de hoje até TASK-0044/0046/0047 -- ver
// docs/decisions/0002-scaleform-migracao-incremental-4-etapas.md.
const ETAPAS = ['Celebração', 'Equipe', 'Validação', 'Revisão']
const etapaAtual = ref(props.mode === 'team' ? 2 : 1)

const etapa1Erros = reactive<Record<string, boolean>>({})

function validarEtapa1(): boolean {
  etapa1Erros.dataCelebracao = !form.value.dataCelebracao
  etapa1Erros.horario = !form.value.horario
  etapa1Erros.celebracao = !form.value.celebracao.trim()
  etapa1Erros.comunidadeId = !form.value.comunidadeId
  return !Object.values(etapa1Erros).some(Boolean)
}

// TASK-0084 (correção): SPEC-005 §38 -- move o foco pro primeiro campo inválido, na mesma
// ordem em que aparecem no formulário, em vez de deixar o foco parado no botão "Avançar".
const ORDEM_ETAPA1: { chave: string; id: string }[] = [
  { chave: 'dataCelebracao', id: 'input-data' },
  { chave: 'horario', id: 'input-horario' },
  { chave: 'celebracao', id: 'input-celebracao' },
  { chave: 'comunidadeId', id: 'input-comunidade' },
]

async function focarPrimeiroErroEtapa1() {
  const primeiro = ORDEM_ETAPA1.find((campo) => etapa1Erros[campo.chave])
  if (!primeiro) return
  await nextTick()
  document.getElementById(primeiro.id)?.focus()
}

function avancar() {
  if (etapaAtual.value === 1 && !validarEtapa1()) {
    focarPrimeiroErroEtapa1()
    return
  }
  if (etapaAtual.value === 3 && obrigatoriosFaltando.value.length) return
  if (etapaAtual.value < 4) etapaAtual.value++
}

function voltar() {
  if (etapaAtual.value > 1) etapaAtual.value--
}

// Navegação de um item da Etapa 3 (Validação) de volta ao campo/bloco correspondente -- usado
// pelo checklist mais abaixo neste arquivo.
async function irPara(etapa: number, anchorId?: string) {
  etapaAtual.value = etapa
  if (!anchorId) return
  await nextTick()
  document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// Inline selects of step 2 (instrument/ministry/liturgical role): compact, but with the same
// dark-mode surface as the shared Select/TextInput components.
const COMPACT_SELECT_CLASS = 'min-h-9 rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
const QUIET_BUTTON_CLASS = 'inline-flex min-h-9 items-center rounded-md px-3 text-caption font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'

const categoriasOrdenadas = computed(() => [...props.categorias].sort((a, b) => a.ordem - b.ordem))

// Instrumento só faz sentido pra quem está sendo escalado como Música -- um Acólito que
// também é músico não deve ganhar instrumento quando escalado como Acólito.
const musicaId = computed(() => props.categorias.find((c) => c.nome === 'Música')?.id ?? null)

// Função litúrgica (Cerimoniário, Cruciferário, Turiferário...) só faz sentido pra quem está
// sendo escalado como Acólito/Ancila -- qualquer um deles está apto pra qualquer função.
const acolitosId = computed(() => props.categorias.find((c) => c.nome === 'Acólitos e Ancilas')?.id ?? null)

function teamsDaCategoria(categoriaId: number) {
  return props.teams.filter((t) => t.categoria.id === categoriaId)
}

// A categoria de uma escalação é guardada direto (categoriaId), independente de existir um
// Ministério (teamId) pra ela -- assim qualquer função aparece na sua seção mesmo sem
// Ministério cadastrado (hoje só Música costuma ter Ministérios de verdade).
function entriesDaCategoria(categoriaId: number) {
  return form.value.servidores.filter((s) => s.categoriaId === categoriaId)
}

const entriesSemCategoria = computed(() => form.value.servidores.filter((s) => s.categoriaId == null))

// Só quem tem a função marcada no cadastro (ServidorCategoria) pode ser escalado naquela
// categoria -- um Acólito não aparece na lista de Música, por exemplo.
function servidoresDaCategoria(categoriaId: number) {
  return props.servidores.filter((s) => !isSelected(s.id) && s.categorias.some((c) => c.categoriaId === categoriaId))
}

// A seção "sem função definida" fica sem filtro -- é a válvula de escape pra alguém sem
// função cadastrada ainda.
const servidoresDisponiveis = computed(() => props.servidores.filter((s) => !isSelected(s.id)))

function servidorNome(servidorId: number) {
  return props.servidores.find((s) => s.id === servidorId)?.nome ?? '?'
}

function instrumentosDe(servidorId: number) {
  return props.servidores.find((s) => s.id === servidorId)?.instruments ?? []
}

function isSelected(servidorId: number) {
  return form.value.servidores.some((s) => s.servidorId === servidorId)
}

function getEntry(servidorId: number) {
  return form.value.servidores.find((s) => s.servidorId === servidorId)
}

// `instrumentId`/`funcaoLiturgica` são opcionais e distintos de `null`: quando NÃO passados
// (undefined -- caso de "equipe inteira"/"sem categoria"/sugestão aceita direto), o instrumento
// continua sendo auto-escolhido pra Música, igual sempre foi. Quando passados (busca inline,
// TASK-0044 -- o candidato já escolheu antes de confirmar), o valor explícito vale, mesmo que
// seja `null` (usuário deixou "sem função litúrgica", por exemplo).
function adicionarServidor(
  servidorId: number,
  categoriaId: number | null,
  teamId: number | null,
  instrumentId?: number | null,
  funcaoLiturgica?: string | null,
) {
  if (isSelected(servidorId)) return
  const ehMusica = musicaId.value != null && categoriaId === musicaId.value
  const resolvedInstrument = instrumentId !== undefined
    ? instrumentId
    : (ehMusica ? props.servidores.find((s) => s.id === servidorId)?.instruments[0]?.instrumentId ?? null : null)
  form.value.servidores.push({
    servidorId,
    instrumentId: resolvedInstrument,
    teamId,
    categoriaId,
    funcaoLiturgica: funcaoLiturgica ?? null,
  })
}

function removerServidor(servidorId: number) {
  const idx = form.value.servidores.findIndex((s) => s.servidorId === servidorId)
  if (idx >= 0) form.value.servidores.splice(idx, 1)
}

function setInstrument(servidorId: number, instrumentId: number) {
  const entry = getEntry(servidorId)
  if (entry) entry.instrumentId = instrumentId
}

function setServidorTeam(servidorId: number, teamId: number | null) {
  const entry = getEntry(servidorId)
  if (entry) entry.teamId = teamId
}

function setFuncaoLiturgica(servidorId: number, funcaoLiturgica: string | null) {
  const entry = getEntry(servidorId)
  if (entry) entry.funcaoLiturgica = funcaoLiturgica
}

// Estado do candidato escolhido por categoria (TASK-0044) -- criado sob demanda, já que a lista
// de categorias vem por prop. Antes só guardava servidorId/teamId (escolhidos num <select> e
// confirmados depois); agora também guarda instrumentId/funcaoLiturgica, preenchidos ANTES de
// confirmar (fluxo definido em docs/tasks/0009-*.md §7.3: "buscar → escolher pessoa → preencher
// o que for aplicável → um único Adicionar").
interface NovoServidorState { servidorId: number | null; teamId: number | null; instrumentId: number | null; funcaoLiturgica: string | null }
const novoPorCategoria = reactive<Record<number, NovoServidorState>>({})
function getNovoState(categoriaId: number): NovoServidorState {
  if (!novoPorCategoria[categoriaId]) {
    novoPorCategoria[categoriaId] = { servidorId: null, teamId: null, instrumentId: null, funcaoLiturgica: null }
  }
  return novoPorCategoria[categoriaId]
}

// Busca inline (TASK-0044, TASK-0009 §7.3): substitui o <select> "Adicionar servidor..." + botão
// separado. Um termo por categoria, já que cada bloco tem sua própria busca independente.
const buscaPorCategoria = reactive<Record<number, string>>({})
function getBusca(categoriaId: number) {
  return buscaPorCategoria[categoriaId] ?? ''
}
function setBusca(categoriaId: number, valor: string) {
  buscaPorCategoria[categoriaId] = valor
}
function resultadosBusca(categoriaId: number) {
  const termo = getBusca(categoriaId).trim().toLowerCase()
  if (!termo) return []
  // Mesmo filtro de elegibilidade de sempre (servidoresDaCategoria) -- previne "função
  // incompatível" na origem, a busca não regride esse comportamento.
  return servidoresDaCategoria(categoriaId).filter((s) => s.nome.toLowerCase().includes(termo)).slice(0, 8)
}

function escolherCandidato(categoriaId: number, servidorId: number) {
  const state = getNovoState(categoriaId)
  state.servidorId = servidorId
  // Mesmo default de sempre (primeiro instrumento cadastrado) -- só que agora visível e editável
  // antes de confirmar, em vez de só depois de já ter adicionado.
  state.instrumentId = categoriaId === musicaId.value ? (instrumentosDe(servidorId)[0]?.instrumentId ?? null) : null
  state.funcaoLiturgica = null
  buscaPorCategoria[categoriaId] = ''
}

function cancelarCandidato(categoriaId: number) {
  novoPorCategoria[categoriaId] = { servidorId: null, teamId: null, instrumentId: null, funcaoLiturgica: null }
}

function adicionarNaCategoria(categoriaId: number) {
  const state = getNovoState(categoriaId)
  if (!state.servidorId) return
  // Ministério fica sempre opcional -- nem todo servidor de uma categoria integra um
  // ministério formal, então nunca escolhemos um automaticamente.
  adicionarServidor(state.servidorId, categoriaId, state.teamId, state.instrumentId, state.funcaoLiturgica)
  novoPorCategoria[categoriaId] = { servidorId: null, teamId: null, instrumentId: null, funcaoLiturgica: null }
}

const novoSemCategoria = ref<number | null>(null)
function adicionarSemCategoria() {
  if (!novoSemCategoria.value) return
  adicionarServidor(novoSemCategoria.value, null, null)
  novoSemCategoria.value = null
}

// "Adicionar equipe inteira": busca os membros do ministério escolhido e adiciona
// todos de uma vez, já com o teamId e a categoria de cada um preenchidos -- pensado
// sobretudo pra grupos fixos (ex: um "Coral" específico).
const equipeParaAdicionar = reactive<Record<number, number | null>>({})
const addingEquipe = ref<number | null>(null)

async function adicionarEquipeInteira(categoriaId: number, teamIdForcado?: number) {
  const teamId = teamIdForcado ?? equipeParaAdicionar[categoriaId]
  if (!teamId) return
  addingEquipe.value = categoriaId
  try {
    const { data: team } = await client.get(`/teams/${teamId}`)
    for (const membro of team.servidores as { servidorId: number }[]) {
      adicionarServidor(membro.servidorId, categoriaId, team.id)
    }
    equipeParaAdicionar[categoriaId] = null
  } finally {
    addingEquipe.value = null
  }
}

interface Suggestion { servidorId: number; nome: string; nivel: string; score: number; motivo: string }

const suggestions = ref<Suggestion[]>([])
const loadingSuggestions = ref(false)
const suggestionsError = ref('')

async function buscarSugestoes() {
  if (!form.value.dataCelebracao || !form.value.horario) {
    suggestionsError.value = 'Preencha data e horário para ver sugestões.'
    suggestions.value = []
    return
  }
  suggestionsError.value = ''
  loadingSuggestions.value = true
  try {
    const excludeIds = form.value.servidores.map((s) => s.servidorId)
    const { data } = await client.get('/scales/sugestoes', {
      params: {
        data: form.value.dataCelebracao,
        horario: form.value.horario,
        excludeIds: excludeIds.length ? excludeIds.join(',') : undefined,
      },
    })
    suggestions.value = data
  } catch (e: any) {
    suggestionsError.value = e.response?.data?.message ?? 'Erro ao buscar sugestões'
  } finally {
    loadingSuggestions.value = false
  }
}

// Sugestões distribuídas por categoria (TASK-0044, docs/tasks/0009-*.md "Hierarquia entre
// sugestões e seleção manual"): a mesma busca (GET /scales/sugestoes) é feita uma vez só
// (buscarSugestoes); cruzar `Suggestion.servidorId` com `Servidor.categorias` (já disponível na
// prop `servidores`) é só filtragem client-side, sem chamada de API nova. Substitui o bloco
// "Sugeridos" único do topo -- e resolve de quebra a limitação de antes ("sugestão não sabe em
// qual categoria"), já que agora ela é mostrada dentro do bloco da categoria certa.
function sugestoesDaCategoria(categoriaId: number) {
  return suggestions.value.filter((s) => {
    const servidor = props.servidores.find((sv) => sv.id === s.servidorId)
    return !!servidor?.categorias.some((c) => c.categoriaId === categoriaId) && !isSelected(s.servidorId)
  })
}

function adicionarSugerido(s: Suggestion, categoriaId: number) {
  adicionarServidor(s.servidorId, categoriaId, null)
  suggestions.value = suggestions.value.filter((sug) => sug.servidorId !== s.servidorId)
}

// "Como ignorar" (SPEC-004 §27): descarta a sugestão da lista local desta sessão de edição, sem
// nenhuma chamada de API nem regra nova -- só para de aparecer.
function ignorarSugestao(s: Suggestion) {
  suggestions.value = suggestions.value.filter((sug) => sug.servidorId !== s.servidorId)
}

// Etapa 3 -- Validação (TASK-0046): checklist sobre dados já existentes no `form`, nenhum
// estado novo além do que já existia. "Obrigatórios" são os 4 mesmos campos já obrigatórios
// desde a Etapa 1 (nenhum campo novo adicionado/removido); "Categorias vazias" reaproveita
// `entriesDaCategoria` da Etapa 2; "Conflitos" reaproveita `entry.conflito` (TASK-0045),
// então fica sempre vazio na prática hoje.
interface ItemObrigatorio { anchorId: string; label: string }
const obrigatoriosFaltando = computed<ItemObrigatorio[]>(() => {
  const faltando: ItemObrigatorio[] = []
  if (!form.value.dataCelebracao) faltando.push({ anchorId: 'campo-dataCelebracao', label: 'Data da celebração' })
  if (!form.value.horario) faltando.push({ anchorId: 'campo-horario', label: 'Horário' })
  if (!form.value.celebracao.trim()) faltando.push({ anchorId: 'campo-celebracao', label: 'Nome da celebração' })
  if (!form.value.comunidadeId) faltando.push({ anchorId: 'campo-comunidadeId', label: 'Comunidade' })
  return faltando
})

const categoriasVazias = computed(() => categoriasOrdenadas.value.filter((c) => entriesDaCategoria(c.id).length === 0))

interface ItemConflito { servidorNome: string; categoriaId: number | null; conflito: NonNullable<ScaleServidor['conflito']> }
const conflitosResumo = computed<ItemConflito[]>(() =>
  form.value.servidores
    .filter((s): s is ScaleServidor & { conflito: NonNullable<ScaleServidor['conflito']> } => !!s.conflito)
    .map((s) => ({ servidorNome: servidorNome(s.servidorId), categoriaId: s.categoriaId, conflito: s.conflito })),
)

// Etapa 4 -- Revisão (TASK-0047): resumo só-leitura, nenhum dado novo além do que já está em
// `form`/props. `status` deixa de ser um campo preenchido antes -- os botões finais
// "Publicar escala"/"Salvar como rascunho" definem o valor no clique, imediatamente antes do
// submit (mesmo payload de sempre, só muda quando/como o valor é escolhido, SPEC-004 §29).
const dataFormatada = computed(() =>
  form.value.dataCelebracao
    ? parseDateOnly(form.value.dataCelebracao)!.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
    : '',
)
const nomeComunidade = computed(() => props.comunidades.find((c) => c.id === form.value.comunidadeId)?.nome ?? '—')
const nomeCelebrante = computed(() => props.celebrantes.find((c) => c.id === form.value.celebranteId)?.nome ?? null)

const categoriasComGente = computed(() => categoriasOrdenadas.value.filter((c) => entriesDaCategoria(c.id).length > 0))

function detalheEntry(entry: ScaleServidor) {
  const parts: string[] = []
  if (entry.instrumentId) {
    const inst = instrumentosDe(entry.servidorId).find((i) => i.instrumentId === entry.instrumentId)
    if (inst) parts.push(inst.instrument.nome)
  }
  if (entry.funcaoLiturgica) parts.push(FUNCAO_LITURGICA_LABELS[entry.funcaoLiturgica] ?? entry.funcaoLiturgica)
  if (entry.teamId) {
    const team = props.teams.find((t) => t.id === entry.teamId)
    if (team) parts.push(team.nome)
  }
  return parts.length ? parts.join(' · ') : null
}
</script>

<template>
  <form @submit.prevent="emit('submit', form)" class="space-y-6">
    <p v-if="!isTeamMode" class="text-label uppercase tracking-wide text-gray-600 dark:text-gray-400">
      Etapa {{ etapaAtual }} de 4 — {{ ETAPAS[etapaAtual - 1] }}
    </p>
    <!-- Team mode: the celebration is context only (cannot be changed here). -->
    <div v-else class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-body-sm dark:border-gray-700 dark:bg-gray-900/40">
      <p class="font-semibold text-gray-800 dark:text-gray-100">{{ form.celebracao || '—' }}</p>
      <p class="text-gray-600 dark:text-gray-400">
        {{ dataFormatada }}<span v-if="form.horario"> · {{ form.horario }}</span><span v-if="nomeComunidade"> · {{ nomeComunidade }}</span>
      </p>
    </div>

    <!-- Etapa 1 — Celebração (TASK-0043): campos principais (obrigatórios) separados dos
         secundários (opcionais), com validação inline antes de avançar. -->
    <template v-if="etapaAtual === 1">
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div id="campo-dataCelebracao">
          <InputLabel for="input-data" value="Data" :required="true" />
          <TextInput id="input-data" v-model="form.dataCelebracao" type="date" class="mt-1" :error="etapa1Erros.dataCelebracao" />
          <InputError message="Informe a data da celebração." v-if="etapa1Erros.dataCelebracao" />
        </div>
        <div id="campo-horario">
          <InputLabel for="input-horario" value="Horário" :required="true" />
          <TextInput id="input-horario" v-model="form.horario" type="time" class="mt-1" :error="etapa1Erros.horario" />
          <InputError message="Informe o horário." v-if="etapa1Erros.horario" />
        </div>
        <div id="campo-celebracao" class="sm:col-span-2">
          <InputLabel for="input-celebracao" value="Celebração" :required="true" />
          <TextInput id="input-celebracao" v-model="form.celebracao" class="mt-1 read-only:bg-gray-100 dark:read-only:bg-gray-800" :error="etapa1Erros.celebracao" :readonly="celebranteIsDeacon" />
          <InputError message="Informe o nome da celebração." v-if="etapa1Erros.celebracao" />
          <p v-if="celebranteIsDeacon" class="mt-1 text-xs text-gray-600 dark:text-gray-400">Com diácono como celebrante, a celebração é sempre uma Celebração da Palavra.</p>
        </div>
        <div id="campo-comunidadeId" class="sm:col-span-2">
          <InputLabel for="input-comunidade" value="Comunidade" :required="true" />
          <Select id="input-comunidade" v-model="form.comunidadeId" class="mt-1" :error="etapa1Erros.comunidadeId">
            <option v-for="c in comunidades" :key="c.id" :value="c.id">{{ c.nome }}</option>
          </Select>
          <InputError message="Selecione a comunidade." v-if="etapa1Erros.comunidadeId" />
        </div>
      </div>

      <!-- Campos secundários (opcionais) -- rebaixados visualmente, sem borda de validação. -->
      <div class="grid grid-cols-1 gap-6 border-t border-gray-100 pt-6 sm:grid-cols-2 dark:border-gray-700">
        <div>
          <InputLabel for="input-celebrante" value="Celebrante" />
          <Select id="input-celebrante" v-model="form.celebranteId" class="mt-1">
            <option :value="null">Nenhum</option>
            <option v-for="c in celebrantes" :key="c.id" :value="c.id">{{ c.nome }}</option>
          </Select>
        </div>
        <div>
          <InputLabel for="input-lembrete" value="Lembrar quem não confirmou (dias antes)" />
          <TextInput
            id="input-lembrete"
            :model-value="form.lembreteDiasAntes"
            @update:model-value="(v) => (form.lembreteDiasAntes = Number(v))"
            type="number" min="0" class="mt-1"
          />
          <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">0 desativa o lembrete automático para esta escala.</p>
        </div>
        <div class="sm:col-span-2">
          <InputLabel for="input-observacoes" value="Observações" />
          <textarea id="input-observacoes" v-model="form.observacoes" rows="3" class="mt-1 border-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
        </div>
      </div>

      <div class="flex items-center gap-4">
        <PrimaryButton type="button" @click="avancar">Avançar</PrimaryButton>
        <RouterLink :to="cancelLink"><SecondaryButton type="button">Cancelar</SecondaryButton></RouterLink>
      </div>
    </template>

    <!-- Etapa 2 — Equipe (TASK-0116): same card language as the dashboard (rounded-xl, soft
         shadow in light mode, layered gray surfaces in dark mode). Behavior unchanged. -->
    <template v-if="etapaAtual === 2">
    <section class="space-y-4" aria-labelledby="team-step-title">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0 flex-1">
          <h3 id="team-step-title" class="text-body font-semibold text-gray-800 dark:text-gray-100">Equipe da celebração</h3>
          <p class="mt-1 max-w-prose text-caption text-gray-600 dark:text-gray-400">
            Organizada por função. Nem toda celebração precisa de todas — adicione só o que se aplica.
            Sugestões, quando buscadas, aparecem dentro da função certa.
          </p>
        </div>
        <SecondaryButton type="button" :loading="loadingSuggestions" @click="buscarSugestoes" class="shrink-0 self-start">
          <SparklesIcon v-if="!loadingSuggestions" class="h-4 w-4" aria-hidden="true" />
          {{ loadingSuggestions ? 'Buscando...' : 'Buscar sugestões' }}
        </SecondaryButton>
      </div>
      <p v-if="suggestionsError" class="text-body-sm text-danger-600 dark:text-danger-400">{{ suggestionsError }}</p>

      <div
        v-for="cat in categoriasOrdenadas"
        :key="cat.id"
        :id="`categoria-${cat.id}`"
        class="rounded-xl border bg-white p-4 shadow-card sm:p-5 dark:bg-gray-900/40 dark:shadow-none"
        :class="entriesDaCategoria(cat.id).length === 0
          ? 'border-dashed border-warning-300 dark:border-warning-700/70'
          : 'border-gray-200 dark:border-gray-700'"
      >
        <div class="mb-3 flex items-center justify-between gap-3">
          <h4 class="truncate text-body-sm font-semibold text-gray-800 dark:text-gray-100">{{ cat.nome }}</h4>
          <Badge v-if="entriesDaCategoria(cat.id).length === 0" color="yellow" class="shrink-0">Ninguém escalado</Badge>
          <Badge v-else color="gray" class="shrink-0">{{ entriesDaCategoria(cat.id).length }} escalado(s)</Badge>
        </div>

        <ul v-if="entriesDaCategoria(cat.id).length" class="mb-4 space-y-2">
          <li v-for="entry in entriesDaCategoria(cat.id)" :key="entry.servidorId" class="space-y-1.5">
            <!-- Conflito (TASK-0045, SPEC-004 §22): só renderiza se `entry.conflito` vier
                 preenchido -- hoje esse campo nunca existe (detecção de horário/indisponibilidade
                 não existe em nenhum endpoint, ver docs/tasks/0009-*.md), então este bloco fica
                 sempre invisível na prática, pronto pra quando o dado existir. -->
            <ConflictAlert v-if="entry.conflito" :type="entry.conflito.type" :detail="entry.conflito.detail" />
            <div class="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-gray-100 bg-gray-50/70 p-2.5 dark:border-gray-700 dark:bg-gray-800">
              <div class="flex min-w-[10rem] flex-1 items-center gap-2.5">
                <Avatar :name="servidorNome(entry.servidorId)" size="sm" />
                <span class="truncate text-body-sm font-semibold text-gray-800 dark:text-gray-100">{{ servidorNome(entry.servidorId) }}</span>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <select
                  v-if="cat.id === musicaId && instrumentosDe(entry.servidorId).length"
                  :value="entry.instrumentId"
                  @change="setInstrument(entry.servidorId, Number(($event.target as HTMLSelectElement).value))"
                  :class="COMPACT_SELECT_CLASS"
                  aria-label="Instrumento"
                >
                  <option v-for="i in instrumentosDe(entry.servidorId)" :key="i.instrumentId" :value="i.instrumentId">{{ i.instrument.nome }}</option>
                </select>
                <select
                  v-if="teamsDaCategoria(cat.id).length > 0"
                  :value="entry.teamId ?? ''"
                  @change="setServidorTeam(entry.servidorId, ($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null)"
                  :class="COMPACT_SELECT_CLASS"
                  aria-label="Ministério"
                >
                  <option value="">Sem ministério</option>
                  <option v-for="t in teamsDaCategoria(cat.id)" :key="t.id" :value="t.id">{{ t.nome }}</option>
                </select>
                <select
                  v-if="cat.id === acolitosId"
                  :value="entry.funcaoLiturgica"
                  @change="setFuncaoLiturgica(entry.servidorId, ($event.target as HTMLSelectElement).value || null)"
                  :class="COMPACT_SELECT_CLASS"
                  aria-label="Função litúrgica"
                >
                  <option value="">Sem função litúrgica</option>
                  <option v-for="(label, value) in FUNCAO_LITURGICA_LABELS" :key="value" :value="value">{{ label }}</option>
                </select>
                <button
                  type="button"
                  @click="removerServidor(entry.servidorId)"
                  :aria-label="`Remover ${servidorNome(entry.servidorId)}`"
                  title="Remover"
                  class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-500 transition hover:bg-danger-50 hover:text-danger-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-gray-400 dark:hover:bg-danger-900/30 dark:hover:text-danger-300"
                >
                  <TrashIcon class="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </li>
        </ul>

        <!-- Sugestões desta categoria (TASK-0044) -- primeiro, antes da busca manual, sempre
             visível abaixo (nunca oculta), conforme docs/tasks/0009-*.md. -->
        <div v-if="sugestoesDaCategoria(cat.id).length" class="mb-4 rounded-lg border border-primary-100 bg-primary-50/50 p-3 dark:border-primary-900/60 dark:bg-primary-950/30">
          <p class="mb-1 flex items-center gap-1.5 text-caption font-semibold text-primary-700 dark:text-primary-300">
            <SparklesIcon class="h-4 w-4" aria-hidden="true" />
            Sugeridos para {{ cat.nome }}
          </p>
          <ul class="divide-y divide-primary-100 dark:divide-primary-900/60">
            <li v-for="s in sugestoesDaCategoria(cat.id)" :key="s.servidorId" class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 py-2">
              <div class="flex min-w-[12rem] flex-1 items-center gap-2.5">
                <Avatar :name="s.nome" size="sm" />
                <div class="min-w-0">
                  <p class="truncate text-body-sm font-semibold text-gray-800 dark:text-gray-100">{{ s.nome }}</p>
                  <p class="truncate text-caption text-gray-600 dark:text-gray-400">{{ s.motivo }}</p>
                </div>
              </div>
              <div class="flex shrink-0 items-center gap-1">
                <button type="button" @click="ignorarSugestao(s)" :class="QUIET_BUTTON_CLASS">Ignorar</button>
                <SecondaryButton type="button" @click="adicionarSugerido(s, cat.id)">Adicionar</SecondaryButton>
              </div>
            </li>
          </ul>
        </div>

        <p v-if="servidoresDaCategoria(cat.id).length === 0" class="text-caption text-gray-500 dark:text-gray-400">
          Nenhum servidor com a função "{{ cat.nome }}" cadastrado ainda.
        </p>
        <template v-else>
          <!-- Busca inline (TASK-0044, docs/tasks/0009-*.md §7.3): substitui o <select>
               "Adicionar servidor..." + botão separado por "buscar → escolher pessoa →
               preencher o que for aplicável → um único Adicionar". -->
          <div v-if="!getNovoState(cat.id).servidorId">
            <div class="relative">
              <MagnifyingGlassIcon class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <TextInput
                :model-value="getBusca(cat.id)"
                @update:model-value="(v) => setBusca(cat.id, String(v))"
                placeholder="Buscar servidor por nome..."
                :aria-label="`Buscar servidor para ${cat.nome}`"
                class="pl-9 text-sm"
              />
            </div>
            <ul v-if="resultadosBusca(cat.id).length" class="mt-2 divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
              <li v-for="s in resultadosBusca(cat.id)" :key="s.id">
                <button
                  type="button"
                  @click="escolherCandidato(cat.id, s.id)"
                  class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-body-sm text-gray-800 transition hover:bg-gray-50 focus:outline-none focus-visible:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-700/50 dark:focus-visible:bg-gray-700/50"
                >
                  <Avatar :name="s.nome" size="sm" />
                  <span class="truncate">{{ s.nome }}</span>
                </button>
              </li>
            </ul>
            <p v-else-if="getBusca(cat.id).trim()" class="mt-2 text-caption text-gray-500 dark:text-gray-400">
              Nenhum servidor encontrado com esse nome.
            </p>
          </div>

          <div v-else class="space-y-3 rounded-lg border border-primary-200 bg-primary-50/50 p-3 dark:border-primary-800 dark:bg-primary-950/30">
            <div class="flex items-center gap-2.5">
              <Avatar :name="servidorNome(getNovoState(cat.id).servidorId!)" size="sm" />
              <p class="truncate text-body-sm font-semibold text-gray-800 dark:text-gray-100">{{ servidorNome(getNovoState(cat.id).servidorId!) }}</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <select
                v-if="cat.id === musicaId && instrumentosDe(getNovoState(cat.id).servidorId!).length"
                v-model="getNovoState(cat.id).instrumentId"
                :class="COMPACT_SELECT_CLASS"
                aria-label="Instrumento"
              >
                <option v-for="i in instrumentosDe(getNovoState(cat.id).servidorId!)" :key="i.instrumentId" :value="i.instrumentId">{{ i.instrument.nome }}</option>
              </select>
              <select
                v-if="teamsDaCategoria(cat.id).length > 0"
                v-model="getNovoState(cat.id).teamId"
                :class="COMPACT_SELECT_CLASS"
                aria-label="Ministério"
              >
                <option :value="null">Sem ministério</option>
                <option v-for="t in teamsDaCategoria(cat.id)" :key="t.id" :value="t.id">{{ t.nome }}</option>
              </select>
              <select
                v-if="cat.id === acolitosId"
                v-model="getNovoState(cat.id).funcaoLiturgica"
                :class="COMPACT_SELECT_CLASS"
                aria-label="Função litúrgica"
              >
                <option :value="null">Sem função litúrgica</option>
                <option v-for="(label, value) in FUNCAO_LITURGICA_LABELS" :key="value" :value="value">{{ label }}</option>
              </select>
              <div class="flex items-center gap-1">
                <SecondaryButton type="button" @click="adicionarNaCategoria(cat.id)">Adicionar</SecondaryButton>
                <button type="button" @click="cancelarCandidato(cat.id)" :class="QUIET_BUTTON_CLASS">Cancelar</button>
              </div>
            </div>
          </div>
        </template>

        <div v-if="teamsDaCategoria(cat.id).length > 1" class="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4 dark:border-gray-700">
          <UserGroupIcon class="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" aria-hidden="true" />
          <span class="text-caption text-gray-600 dark:text-gray-400">Adicionar equipe inteira:</span>
          <select
            :value="equipeParaAdicionar[cat.id] ?? ''"
            @change="equipeParaAdicionar[cat.id] = ($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null"
            :class="COMPACT_SELECT_CLASS"
            aria-label="Ministério a adicionar"
          >
            <option value="">Selecione o ministério</option>
            <option v-for="t in teamsDaCategoria(cat.id)" :key="t.id" :value="t.id">{{ t.nome }}</option>
          </select>
          <SecondaryButton
            type="button"
            :disabled="!equipeParaAdicionar[cat.id]"
            :loading="addingEquipe === cat.id"
            @click="adicionarEquipeInteira(cat.id)"
          >
            {{ addingEquipe === cat.id ? 'Adicionando...' : 'Adicionar todos' }}
          </SecondaryButton>
        </div>
        <div v-else-if="teamsDaCategoria(cat.id).length === 1" class="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
          <SecondaryButton
            type="button"
            :loading="addingEquipe === cat.id"
            @click="adicionarEquipeInteira(cat.id, teamsDaCategoria(cat.id)[0].id)"
          >
            <UserGroupIcon v-if="addingEquipe !== cat.id" class="h-4 w-4" aria-hidden="true" />
            {{ addingEquipe === cat.id ? 'Adicionando...' : `Adicionar toda a equipe de ${teamsDaCategoria(cat.id)[0].nome}` }}
          </SecondaryButton>
        </div>
        <p v-else class="mt-4 border-t border-gray-100 pt-4 text-caption text-gray-500 dark:border-gray-700 dark:text-gray-400">
          Nenhum ministério cadastrado nesta categoria ainda -- dá pra escalar servidores mesmo assim.
        </p>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-card sm:p-5 dark:border-gray-700 dark:bg-gray-900/40 dark:shadow-none">
        <div class="mb-3 flex items-center justify-between gap-3">
          <h4 class="text-body-sm font-semibold text-gray-800 dark:text-gray-100">Outras pessoas (sem função definida)</h4>
          <Badge v-if="entriesSemCategoria.length" color="gray" class="shrink-0">{{ entriesSemCategoria.length }} escalado(s)</Badge>
        </div>
        <ul v-if="entriesSemCategoria.length" class="mb-4 space-y-2">
          <li v-for="entry in entriesSemCategoria" :key="entry.servidorId" class="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-gray-50/70 p-2.5 dark:border-gray-700 dark:bg-gray-800">
            <Avatar :name="servidorNome(entry.servidorId)" size="sm" />
            <span class="min-w-0 flex-1 truncate text-body-sm font-semibold text-gray-800 dark:text-gray-100">{{ servidorNome(entry.servidorId) }}</span>
            <button
              type="button"
              @click="removerServidor(entry.servidorId)"
              :aria-label="`Remover ${servidorNome(entry.servidorId)}`"
              title="Remover"
              class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-500 transition hover:bg-danger-50 hover:text-danger-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-gray-400 dark:hover:bg-danger-900/30 dark:hover:text-danger-300"
            >
              <TrashIcon class="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
        </ul>
        <div class="flex flex-wrap items-center gap-2">
          <select v-model="novoSemCategoria" :class="COMPACT_SELECT_CLASS" class="min-w-[10rem] flex-1" aria-label="Adicionar servidor sem função definida">
            <option :value="null">Adicionar servidor...</option>
            <option v-for="s in servidoresDisponiveis" :key="s.id" :value="s.id">{{ s.nome }}</option>
          </select>
          <SecondaryButton type="button" :disabled="!novoSemCategoria" @click="adicionarSemCategoria">
            Adicionar
          </SecondaryButton>
        </div>
      </div>
    </section>

    <div v-if="!isTeamMode" class="flex flex-wrap items-center gap-3 sm:gap-4">
      <TertiaryButton type="button" @click="voltar">Voltar</TertiaryButton>
      <PrimaryButton type="button" @click="avancar">Avançar</PrimaryButton>
      <RouterLink :to="cancelLink"><SecondaryButton type="button">Cancelar</SecondaryButton></RouterLink>
    </div>
    <div v-else class="flex flex-wrap items-center gap-3 sm:gap-4">
      <PrimaryButton type="submit" :disabled="loading">{{ loading ? 'Salvando...' : 'Salvar equipe' }}</PrimaryButton>
      <RouterLink :to="cancelLink"><SecondaryButton type="button">Cancelar</SecondaryButton></RouterLink>
    </div>
    </template>

    <!-- Etapa 3 — Validação (TASK-0046): checklist consolidado sobre dados já existentes no
         form -- "Obrigatórios" bloqueia avançar, "Categorias vazias" e "Conflitos" são
         informativos (SPEC-004 §28). -->
    <template v-if="etapaAtual === 3">
      <div class="space-y-5">
        <div>
          <h3 class="text-label uppercase tracking-wide text-gray-600 dark:text-gray-400">Obrigatórios</h3>
          <p v-if="!obrigatoriosFaltando.length" class="mt-2 text-body-sm text-success-700 dark:text-success-400">
            Tudo certo — nenhum campo obrigatório pendente.
          </p>
          <ul v-else class="mt-2 space-y-1.5">
            <li v-for="item in obrigatoriosFaltando" :key="item.anchorId">
              <button type="button" @click="irPara(1, item.anchorId)" class="text-body-sm text-danger-700 hover:underline dark:text-danger-400">
                ⚠ {{ item.label }} não preenchido
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-label uppercase tracking-wide text-gray-600 dark:text-gray-400">Categorias vazias</h3>
          <p v-if="!categoriasVazias.length" class="mt-2 text-body-sm text-gray-600 dark:text-gray-300">
            Nenhuma categoria vazia — pode ser intencional, não bloqueia avançar.
          </p>
          <div v-else class="mt-2 space-y-2">
            <EmptyRole v-for="cat in categoriasVazias" :key="cat.id" :message="`Ninguém escalado em ${cat.nome}`">
              <template #action>
                <button type="button" @click="irPara(2, `categoria-${cat.id}`)" class="text-body-sm font-semibold text-primary-600 hover:underline dark:text-primary-400">
                  Resolver
                </button>
              </template>
            </EmptyRole>
          </div>
        </div>

        <!-- Só aparece se a TASK-0045 tiver dado real de conflito -- hoje, na prática, sempre
             vazio (nenhum endpoint retorna esse campo, ver docs/tasks/0045-*.md). -->
        <div v-if="conflitosResumo.length">
          <h3 class="text-label uppercase tracking-wide text-gray-600 dark:text-gray-400">Conflitos</h3>
          <div class="mt-2 space-y-2">
            <ConflictAlert
              v-for="(c, idx) in conflitosResumo" :key="idx"
              :type="c.conflito.type"
              :detail="c.servidorNome + (c.conflito.detail ? ' — ' + c.conflito.detail : '')"
            >
              <template #action>
                <button
                  type="button"
                  @click="irPara(2, c.categoriaId ? `categoria-${c.categoriaId}` : undefined)"
                  class="text-xs font-semibold underline"
                >
                  Ver na equipe
                </button>
              </template>
            </ConflictAlert>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <TertiaryButton type="button" @click="voltar">Voltar</TertiaryButton>
        <PrimaryButton type="button" :disabled="!!obrigatoriosFaltando.length" @click="avancar">Avançar</PrimaryButton>
        <RouterLink :to="cancelLink"><SecondaryButton type="button">Cancelar</SecondaryButton></RouterLink>
      </div>
    </template>

    <!-- Etapa 4 — Revisão (TASK-0047): resumo só-leitura da celebração + equipe
         (ScaleRole/ScaleMember, editable=false); status deixa de ser um <select> preenchido
         antes e vira a ação final -- "Publicar escala"/"Salvar como rascunho" definem o valor
         no clique, mesmo payload de sempre no submit. -->
    <template v-if="etapaAtual === 4">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div class="space-y-2 rounded-md border border-gray-200 p-4 dark:border-gray-700">
          <h3 class="text-label uppercase tracking-wide text-gray-600 dark:text-gray-400">Celebração</h3>
          <dl class="space-y-2 text-body-sm">
            <div>
              <dt class="text-gray-600 dark:text-gray-400">Celebração</dt>
              <dd class="text-gray-800 dark:text-gray-100">{{ form.celebracao || '—' }}</dd>
            </div>
            <div>
              <dt class="text-gray-600 dark:text-gray-400">Data e horário</dt>
              <dd class="text-gray-800 dark:text-gray-100">{{ dataFormatada }}<span v-if="form.horario"> · {{ form.horario }}</span></dd>
            </div>
            <div>
              <dt class="text-gray-600 dark:text-gray-400">Comunidade</dt>
              <dd class="text-gray-800 dark:text-gray-100">{{ nomeComunidade }}</dd>
            </div>
            <div v-if="nomeCelebrante">
              <dt class="text-gray-600 dark:text-gray-400">Celebrante</dt>
              <dd class="text-gray-800 dark:text-gray-100">{{ nomeCelebrante }}</dd>
            </div>
            <div v-if="form.observacoes">
              <dt class="text-gray-600 dark:text-gray-400">Observações</dt>
              <dd class="text-gray-800 dark:text-gray-100">{{ form.observacoes }}</dd>
            </div>
          </dl>
        </div>

        <div class="space-y-3">
          <h3 class="text-label uppercase tracking-wide text-gray-600 dark:text-gray-400">Equipe</h3>
          <p v-if="!form.servidores.length" class="text-body-sm text-gray-400">Nenhum servidor escalado ainda.</p>
          <template v-else>
            <ScaleRole v-for="cat in categoriasComGente" :key="cat.id" :nome="cat.nome" :count="entriesDaCategoria(cat.id).length">
              <ScaleMember
                v-for="entry in entriesDaCategoria(cat.id)" :key="entry.servidorId"
                :nome="servidorNome(entry.servidorId)"
                :detalhe="detalheEntry(entry)"
                :editable="false"
              />
            </ScaleRole>
            <ScaleRole v-if="entriesSemCategoria.length" nome="Sem função definida" :count="entriesSemCategoria.length">
              <ScaleMember
                v-for="entry in entriesSemCategoria" :key="entry.servidorId"
                :nome="servidorNome(entry.servidorId)"
                :editable="false"
              />
            </ScaleRole>
          </template>
        </div>
      </div>

      <!-- Só aparece se o usuário avançou até aqui mesmo com pendência da Etapa 3 (não é
           bloqueante nesta etapa -- a Etapa 3 já é quem bloqueia). -->
      <div v-if="obrigatoriosFaltando.length" class="rounded-md border border-danger-200 bg-danger-50/40 p-3 text-body-sm text-danger-700 dark:border-danger-800 dark:bg-danger-900/10 dark:text-danger-300">
        ⚠ Ainda há campos obrigatórios pendentes: {{ obrigatoriosFaltando.map((i) => i.label).join(', ') }}.
        <button type="button" @click="irPara(1)" class="ml-1 font-semibold underline">Corrigir</button>
      </div>

      <div class="flex items-center gap-3">
        <span class="text-body-sm text-gray-600 dark:text-gray-400">Situação atual:</span>
        <Badge :color="form.status === 'confirmada' ? 'green' : 'yellow'">{{ form.status }}</Badge>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <TertiaryButton type="button" @click="voltar">Voltar</TertiaryButton>
        <PrimaryButton type="submit" :disabled="loading" @click="form.status = 'confirmada'">
          {{ loading ? 'Salvando...' : 'Publicar escala' }}
        </PrimaryButton>
        <SecondaryButton type="submit" :disabled="loading" @click="form.status = 'rascunho'">
          {{ loading ? 'Salvando...' : 'Salvar como rascunho' }}
        </SecondaryButton>
        <RouterLink :to="cancelLink"><SecondaryButton type="button">Cancelar</SecondaryButton></RouterLink>
      </div>
    </template>
  </form>
</template>
