<script setup lang="ts">
import { ref, watch, computed, reactive } from 'vue'
import InputLabel from '@/components/InputLabel.vue'
import TextInput from '@/components/TextInput.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'
import client from '@/api/client'

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

interface ScaleServidor { servidorId: number; instrumentId: number | null; teamId: number | null; categoriaId: number | null; funcaoLiturgica: string | null }

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
}>()

const emit = defineEmits<{ submit: [data: FormData] }>()

const form = ref<FormData>({
  dataCelebracao: props.initialData?.dataCelebracao ?? '',
  horario: props.initialData?.horario ?? '',
  celebracao: props.initialData?.celebracao ?? '',
  comunidadeId: props.initialData?.comunidadeId ?? props.comunidades[0]?.id ?? null,
  celebranteId: props.initialData?.celebranteId ?? null,
  observacoes: props.initialData?.observacoes ?? '',
  status: props.initialData?.status ?? 'rascunho',
  lembreteDiasAntes: props.initialData?.lembreteDiasAntes ?? 3,
  servidores: props.initialData?.servidores ?? [],
})

watch(() => props.initialData, (val) => { if (val) Object.assign(form.value, val) })

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

function adicionarServidor(servidorId: number, categoriaId: number | null, teamId: number | null) {
  if (isSelected(servidorId)) return
  const ehMusica = musicaId.value != null && categoriaId === musicaId.value
  const firstInstrument = ehMusica
    ? props.servidores.find((s) => s.id === servidorId)?.instruments[0]?.instrumentId ?? null
    : null
  form.value.servidores.push({ servidorId, instrumentId: firstInstrument, teamId, categoriaId, funcaoLiturgica: null })
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

// Estado do controle de "adicionar servidor" de cada categoria -- criado sob demanda,
// já que a lista de categorias vem por prop.
const novoPorCategoria = reactive<Record<number, { servidorId: number | null; teamId: number | null }>>({})
function getNovoState(categoriaId: number) {
  if (!novoPorCategoria[categoriaId]) {
    novoPorCategoria[categoriaId] = { servidorId: null, teamId: null }
  }
  return novoPorCategoria[categoriaId]
}

function adicionarNaCategoria(categoriaId: number) {
  const state = getNovoState(categoriaId)
  if (!state.servidorId) return
  // Ministério fica sempre opcional -- nem todo servidor de uma categoria integra um
  // ministério formal, então nunca escolhemos um automaticamente.
  adicionarServidor(state.servidorId, categoriaId, state.teamId)
  novoPorCategoria[categoriaId] = { servidorId: null, teamId: null }
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

// Sugestão não sabe em qual categoria a pessoa vai servir (não depende mais de um ministério
// da escala) -- entra em "sem função definida" e o coordenador aloca na seção certa se quiser.
function adicionarSugerido(s: Suggestion) {
  adicionarServidor(s.servidorId, null, null)
  suggestions.value = suggestions.value.filter((sug) => sug.servidorId !== s.servidorId)
}
</script>

<template>
  <form @submit.prevent="emit('submit', form)" class="space-y-6">
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div>
        <InputLabel value="Data" :required="true" />
        <TextInput v-model="form.dataCelebracao" type="date" class="mt-1" />
      </div>
      <div>
        <InputLabel value="Horário" :required="true" />
        <TextInput v-model="form.horario" type="time" class="mt-1" />
      </div>
      <div class="sm:col-span-2">
        <InputLabel value="Celebração" :required="true" />
        <TextInput v-model="form.celebracao" class="mt-1" />
      </div>
      <div>
        <InputLabel value="Comunidade" :required="true" />
        <select v-model="form.comunidadeId" class="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full">
          <option v-for="c in comunidades" :key="c.id" :value="c.id">{{ c.nome }}</option>
        </select>
      </div>
      <div>
        <InputLabel value="Celebrante" />
        <select v-model="form.celebranteId" class="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full">
          <option :value="null">Nenhum</option>
          <option v-for="c in celebrantes" :key="c.id" :value="c.id">{{ c.nome }}</option>
        </select>
      </div>
      <div>
        <InputLabel value="Status" />
        <select v-model="form.status" class="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full">
          <option value="rascunho">Rascunho</option>
          <option value="confirmada">Confirmada</option>
        </select>
      </div>
      <div>
        <InputLabel value="Lembrar quem não confirmou (dias antes)" />
        <TextInput
          :model-value="form.lembreteDiasAntes"
          @update:model-value="(v) => (form.lembreteDiasAntes = Number(v))"
          type="number" min="0" class="mt-1"
        />
        <p class="mt-1 text-xs text-gray-500">0 desativa o lembrete automático para esta escala.</p>
      </div>
      <div class="sm:col-span-2">
        <InputLabel value="Observações" />
        <textarea v-model="form.observacoes" rows="3" class="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full" />
      </div>
    </div>

    <div>
      <div class="flex items-center justify-between">
        <InputLabel value="Sugeridos" />
        <SecondaryButton type="button" :disabled="loadingSuggestions" @click="buscarSugestoes" class="!py-1.5 !px-3 text-xs">
          {{ loadingSuggestions ? 'Buscando...' : 'Buscar sugestões' }}
        </SecondaryButton>
      </div>
      <p v-if="suggestionsError" class="mt-2 text-sm text-red-600">{{ suggestionsError }}</p>
      <div v-if="suggestions.length" class="mt-2 space-y-2">
        <div v-for="s in suggestions" :key="s.servidorId" class="flex items-center justify-between gap-3 p-3 border rounded-md border-gray-200 dark:border-gray-600">
          <div class="min-w-0">
            <span class="text-sm font-medium">{{ s.nome }}</span>
            <p class="text-xs text-gray-500 truncate">{{ s.motivo }}</p>
          </div>
          <SecondaryButton type="button" @click="adicionarSugerido(s)" class="!py-1.5 !px-3 text-xs shrink-0">Adicionar</SecondaryButton>
        </div>
      </div>
    </div>

    <div>
      <InputLabel value="Equipe da celebração" />
      <p class="mt-1 mb-3 text-xs text-gray-500">
        Organizada por categoria de função, já que numa celebração normalmente todas as funções
        servem ao mesmo tempo. Nem toda celebração precisa de todas as categorias -- adicione só o
        que se aplica.
      </p>

      <div
        v-for="cat in categoriasOrdenadas"
        :key="cat.id"
        class="border rounded-md p-4 mb-3"
        :class="entriesDaCategoria(cat.id).length === 0 ? 'border-amber-200 bg-amber-50/40' : 'border-gray-200'"
      >
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-medium text-sm text-gray-800">{{ cat.nome }}</h4>
          <span class="text-xs font-semibold" :class="entriesDaCategoria(cat.id).length === 0 ? 'text-amber-600' : 'text-gray-400'">
            {{ entriesDaCategoria(cat.id).length === 0 ? 'Ninguém escalado' : `${entriesDaCategoria(cat.id).length} escalado(s)` }}
          </span>
        </div>

        <div v-if="entriesDaCategoria(cat.id).length" class="space-y-2 mb-3">
          <div v-for="entry in entriesDaCategoria(cat.id)" :key="entry.servidorId" class="flex flex-wrap items-center gap-2 p-2 bg-white border border-gray-100 rounded">
            <span class="flex-1 min-w-[8rem] text-sm font-medium">{{ servidorNome(entry.servidorId) }}</span>
            <select
              v-if="cat.id === musicaId && instrumentosDe(entry.servidorId).length"
              :value="entry.instrumentId"
              @change="setInstrument(entry.servidorId, Number(($event.target as HTMLSelectElement).value))"
              class="text-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md"
            >
              <option v-for="i in instrumentosDe(entry.servidorId)" :key="i.instrumentId" :value="i.instrumentId">{{ i.instrument.nome }}</option>
            </select>
            <select
              v-if="teamsDaCategoria(cat.id).length > 0"
              :value="entry.teamId"
              @change="setServidorTeam(entry.servidorId, ($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null)"
              class="text-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md"
            >
              <option :value="null">Sem ministério</option>
              <option v-for="t in teamsDaCategoria(cat.id)" :key="t.id" :value="t.id">{{ t.nome }}</option>
            </select>
            <select
              v-if="cat.id === acolitosId"
              :value="entry.funcaoLiturgica"
              @change="setFuncaoLiturgica(entry.servidorId, ($event.target as HTMLSelectElement).value || null)"
              class="text-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md"
            >
              <option value="">Sem função litúrgica</option>
              <option v-for="(label, value) in FUNCAO_LITURGICA_LABELS" :key="value" :value="value">{{ label }}</option>
            </select>
            <button type="button" @click="removerServidor(entry.servidorId)" class="text-red-600 hover:text-red-800 text-xs">Remover</button>
          </div>
        </div>

        <p v-if="servidoresDaCategoria(cat.id).length === 0" class="text-xs text-gray-400">
          Nenhum servidor com a função "{{ cat.nome }}" cadastrado ainda.
        </p>
        <div v-else class="flex flex-wrap items-center gap-2">
          <select v-model="getNovoState(cat.id).servidorId" class="text-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md flex-1 min-w-[10rem]">
            <option :value="null">Adicionar servidor...</option>
            <option v-for="s in servidoresDaCategoria(cat.id)" :key="s.id" :value="s.id">{{ s.nome }}</option>
          </select>
          <select v-if="teamsDaCategoria(cat.id).length > 0" v-model="getNovoState(cat.id).teamId" class="text-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md">
            <option :value="null">Sem ministério</option>
            <option v-for="t in teamsDaCategoria(cat.id)" :key="t.id" :value="t.id">{{ t.nome }}</option>
          </select>
          <SecondaryButton type="button" :disabled="!getNovoState(cat.id).servidorId" @click="adicionarNaCategoria(cat.id)" class="!py-1.5 !px-3 text-xs">
            Adicionar
          </SecondaryButton>
        </div>

        <div v-if="teamsDaCategoria(cat.id).length > 1" class="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
          <span class="text-xs text-gray-500">Adicionar equipe inteira:</span>
          <select v-model="equipeParaAdicionar[cat.id]" class="text-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md">
            <option :value="null">Selecione o ministério</option>
            <option v-for="t in teamsDaCategoria(cat.id)" :key="t.id" :value="t.id">{{ t.nome }}</option>
          </select>
          <SecondaryButton
            type="button"
            :disabled="!equipeParaAdicionar[cat.id] || addingEquipe === cat.id"
            @click="adicionarEquipeInteira(cat.id)"
            class="!py-1.5 !px-3 text-xs"
          >
            {{ addingEquipe === cat.id ? 'Adicionando...' : 'Adicionar todos' }}
          </SecondaryButton>
        </div>
        <div v-else-if="teamsDaCategoria(cat.id).length === 1" class="mt-3 pt-3 border-t border-gray-100">
          <SecondaryButton
            type="button"
            :disabled="addingEquipe === cat.id"
            @click="adicionarEquipeInteira(cat.id, teamsDaCategoria(cat.id)[0].id)"
            class="!py-1.5 !px-3 text-xs"
          >
            {{ addingEquipe === cat.id ? 'Adicionando...' : `Adicionar toda a equipe de ${teamsDaCategoria(cat.id)[0].nome}` }}
          </SecondaryButton>
        </div>
        <p v-else class="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
          Nenhum ministério cadastrado nesta categoria ainda -- dá pra escalar servidores mesmo assim.
        </p>
      </div>

      <div class="border border-gray-200 rounded-md p-4">
        <h4 class="font-medium text-sm text-gray-800 mb-3">Outras pessoas (sem função definida)</h4>
        <div v-if="entriesSemCategoria.length" class="space-y-2 mb-3">
          <div v-for="entry in entriesSemCategoria" :key="entry.servidorId" class="flex flex-wrap items-center gap-2 p-2 bg-white border border-gray-100 rounded">
            <span class="flex-1 min-w-[8rem] text-sm font-medium">{{ servidorNome(entry.servidorId) }}</span>
            <button type="button" @click="removerServidor(entry.servidorId)" class="text-red-600 hover:text-red-800 text-xs">Remover</button>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <select v-model="novoSemCategoria" class="text-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md flex-1 min-w-[10rem]">
            <option :value="null">Adicionar servidor...</option>
            <option v-for="s in servidoresDisponiveis" :key="s.id" :value="s.id">{{ s.nome }}</option>
          </select>
          <SecondaryButton type="button" :disabled="!novoSemCategoria" @click="adicionarSemCategoria" class="!py-1.5 !px-3 text-xs">
            Adicionar
          </SecondaryButton>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <PrimaryButton :disabled="loading">{{ loading ? 'Salvando...' : 'Salvar' }}</PrimaryButton>
      <RouterLink to="/escalas"><SecondaryButton type="button">Cancelar</SecondaryButton></RouterLink>
    </div>
  </form>
</template>
