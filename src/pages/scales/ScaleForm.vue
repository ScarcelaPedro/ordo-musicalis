<script setup lang="ts">
import { ref, watch, computed } from 'vue'
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
}
interface Team { id: number; nome: string }
interface Comunidade { id: number; nome: string }

interface ScaleServidor { servidorId: number; instrumentId: number | null; teamId: number | null }

interface FormData {
  dataCelebracao: string
  horario: string
  celebracao: string
  teamId: number | null
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
  loading?: boolean
}>()

const emit = defineEmits<{ submit: [data: FormData] }>()

const form = ref<FormData>({
  dataCelebracao: props.initialData?.dataCelebracao ?? '',
  horario: props.initialData?.horario ?? '',
  celebracao: props.initialData?.celebracao ?? '',
  teamId: props.initialData?.teamId ?? null,
  comunidadeId: props.initialData?.comunidadeId ?? props.comunidades[0]?.id ?? null,
  celebranteId: props.initialData?.celebranteId ?? null,
  observacoes: props.initialData?.observacoes ?? '',
  status: props.initialData?.status ?? 'rascunho',
  lembreteDiasAntes: props.initialData?.lembreteDiasAntes ?? 3,
  servidores: props.initialData?.servidores ?? [],
})

watch(() => props.initialData, (val) => { if (val) Object.assign(form.value, val) })

const busca = ref('')
const servidoresFiltrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  if (!termo) return props.servidores
  return props.servidores.filter((s) => s.nome.toLowerCase().includes(termo))
})

function isSelected(servidorId: number) {
  return form.value.servidores.some((s) => s.servidorId === servidorId)
}

function getEntry(servidorId: number) {
  return form.value.servidores.find((s) => s.servidorId === servidorId)
}

function toggleServidor(servidor: Servidor) {
  const idx = form.value.servidores.findIndex((s) => s.servidorId === servidor.id)
  if (idx >= 0) {
    form.value.servidores.splice(idx, 1)
  } else {
    const firstInstrument = servidor.instruments[0]?.instrumentId ?? null
    form.value.servidores.push({ servidorId: servidor.id, instrumentId: firstInstrument, teamId: form.value.teamId })
  }
}

function setInstrument(servidorId: number, instrumentId: number) {
  const entry = getEntry(servidorId)
  if (entry) entry.instrumentId = instrumentId
}

function setServidorTeam(servidorId: number, teamId: number | null) {
  const entry = getEntry(servidorId)
  if (entry) entry.teamId = teamId
}

// "Adicionar equipe inteira": busca os membros do ministério escolhido e adiciona
// todos de uma vez, já com o teamId de cada um preenchido -- pensado sobretudo pra
// grupos fixos (ex: um "Coral" específico), mas funciona pra qualquer categoria.
const equipeParaAdicionar = ref<number | null>(null)
const addingEquipe = ref(false)

async function adicionarEquipeInteira() {
  if (!equipeParaAdicionar.value) return
  addingEquipe.value = true
  try {
    const { data: team } = await client.get(`/teams/${equipeParaAdicionar.value}`)
    for (const membro of team.servidores as { servidorId: number }[]) {
      if (isSelected(membro.servidorId)) continue
      const servidor = props.servidores.find((s) => s.id === membro.servidorId)
      const firstInstrument = servidor?.instruments[0]?.instrumentId ?? null
      form.value.servidores.push({ servidorId: membro.servidorId, instrumentId: firstInstrument, teamId: team.id })
    }
  } finally {
    addingEquipe.value = false
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
        teamId: form.value.teamId ?? undefined,
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

function adicionarSugerido(s: Suggestion) {
  if (isSelected(s.servidorId)) return
  const servidor = props.servidores.find((sv) => sv.id === s.servidorId)
  const firstInstrument = servidor?.instruments[0]?.instrumentId ?? null
  form.value.servidores.push({ servidorId: s.servidorId, instrumentId: firstInstrument, teamId: form.value.teamId })
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
          <option v-for="s in servidores" :key="s.id" :value="s.id">{{ s.nome }}</option>
        </select>
      </div>
      <div>
        <InputLabel value="Ministério responsável" />
        <select v-model="form.teamId" class="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full">
          <option :value="null">Nenhum</option>
          <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.nome }}</option>
        </select>
        <p class="mt-1 text-xs text-gray-500">Quem coordena esta escala e recebe as pendências dela -- não limita quais servidores podem ser escalados.</p>
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
      <InputLabel value="Adicionar equipe inteira" />
      <div class="mt-2 flex flex-wrap items-center gap-2">
        <select v-model="equipeParaAdicionar" class="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm">
          <option :value="null">Selecione um ministério</option>
          <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.nome }}</option>
        </select>
        <SecondaryButton type="button" :disabled="!equipeParaAdicionar || addingEquipe" @click="adicionarEquipeInteira" class="!py-1.5 !px-3 text-xs">
          {{ addingEquipe ? 'Adicionando...' : 'Adicionar todos os membros' }}
        </SecondaryButton>
      </div>
      <p class="mt-1 text-xs text-gray-500">Adiciona todos os membros do ministério de uma vez, já com o ministério de cada um preenchido. Útil pra grupos fixos (ex: um coral específico).</p>
    </div>

    <div>
      <InputLabel value="Servidores da escala" />
      <TextInput v-model="busca" placeholder="Buscar servidor por nome..." class="mt-2 w-full sm:w-80" />
      <div class="mt-2 space-y-2 max-h-96 overflow-y-auto">
        <p v-if="servidoresFiltrados.length === 0" class="text-sm text-gray-500">Nenhum servidor encontrado.</p>
        <div v-for="s in servidoresFiltrados" :key="s.id" class="flex flex-wrap items-center gap-3 p-3 border rounded-md" :class="isSelected(s.id) ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'">
          <input
            type="checkbox"
            :checked="isSelected(s.id)"
            @change="toggleServidor(s)"
            class="rounded border-gray-300 text-indigo-600"
          />
          <span class="flex-1 min-w-[8rem] text-sm font-medium">{{ s.nome }}</span>
          <template v-if="isSelected(s.id)">
            <select
              v-if="s.instruments.length"
              :value="getEntry(s.id)?.instrumentId"
              @change="setInstrument(s.id, Number(($event.target as HTMLSelectElement).value))"
              class="text-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md"
            >
              <option v-for="i in s.instruments" :key="i.instrumentId" :value="i.instrumentId">
                {{ i.instrument.nome }}
              </option>
            </select>
            <select
              :value="getEntry(s.id)?.teamId"
              @change="setServidorTeam(s.id, ($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null)"
              class="text-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md"
            >
              <option :value="null">Sem ministério</option>
              <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.nome }}</option>
            </select>
          </template>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <PrimaryButton :disabled="loading">{{ loading ? 'Salvando...' : 'Salvar' }}</PrimaryButton>
      <RouterLink to="/escalas"><SecondaryButton type="button">Cancelar</SecondaryButton></RouterLink>
    </div>
  </form>
</template>
