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

interface ScaleServidor { servidorId: number; instrumentId: number | null }

interface FormData {
  dataCelebracao: string
  horario: string
  celebracao: string
  teamId: number | null
  observacoes: string
  status: 'rascunho' | 'confirmada'
  lembreteDiasAntes: number
  servidores: ScaleServidor[]
}

const props = defineProps<{
  initialData?: Partial<FormData>
  servidores: Servidor[]
  teams: Team[]
  loading?: boolean
}>()

const emit = defineEmits<{ submit: [data: FormData] }>()

const form = ref<FormData>({
  dataCelebracao: props.initialData?.dataCelebracao ?? '',
  horario: props.initialData?.horario ?? '',
  celebracao: props.initialData?.celebracao ?? '',
  teamId: props.initialData?.teamId ?? null,
  observacoes: props.initialData?.observacoes ?? '',
  status: props.initialData?.status ?? 'rascunho',
  lembreteDiasAntes: props.initialData?.lembreteDiasAntes ?? 3,
  servidores: props.initialData?.servidores ?? [],
})

watch(() => props.initialData, (val) => { if (val) Object.assign(form.value, val) })

const filteredServidores = computed(() => {
  if (!form.value.teamId) return props.servidores
  return props.servidores.filter((s) => s.teams.some((t) => t.teamId === form.value.teamId))
})

watch(() => form.value.teamId, () => {
  const validIds = new Set(filteredServidores.value.map((s) => s.id))
  form.value.servidores = form.value.servidores.filter((s) => validIds.has(s.servidorId))
})

function isSelected(servidorId: number) {
  return form.value.servidores.some((s) => s.servidorId === servidorId)
}

function getInstrument(servidorId: number) {
  return form.value.servidores.find((s) => s.servidorId === servidorId)?.instrumentId ?? null
}

function toggleServidor(servidor: Servidor) {
  const idx = form.value.servidores.findIndex((s) => s.servidorId === servidor.id)
  if (idx >= 0) {
    form.value.servidores.splice(idx, 1)
  } else {
    const firstInstrument = servidor.instruments[0]?.instrumentId ?? null
    form.value.servidores.push({ servidorId: servidor.id, instrumentId: firstInstrument })
  }
}

function setInstrument(servidorId: number, instrumentId: number) {
  const entry = form.value.servidores.find((s) => s.servidorId === servidorId)
  if (entry) entry.instrumentId = instrumentId
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
  form.value.servidores.push({ servidorId: s.servidorId, instrumentId: firstInstrument })
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
        <InputLabel value="Ministério" />
        <select v-model="form.teamId" class="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full">
          <option :value="null">Nenhum</option>
          <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.nome }}</option>
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
      <InputLabel value="Servidores da escala" />
      <div class="mt-2 space-y-2">
        <p v-if="form.teamId && filteredServidores.length === 0" class="text-sm text-gray-500">Nenhum servidor cadastrado neste ministério.</p>
        <div v-for="s in filteredServidores" :key="s.id" class="flex items-center gap-3 p-3 border rounded-md" :class="isSelected(s.id) ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'">
          <input
            type="checkbox"
            :checked="isSelected(s.id)"
            @change="toggleServidor(s)"
            class="rounded border-gray-300 text-indigo-600"
          />
          <span class="flex-1 text-sm font-medium">{{ s.nome }}</span>
          <select
            v-if="isSelected(s.id) && s.instruments.length"
            :value="getInstrument(s.id)"
            @change="setInstrument(s.id, Number(($event.target as HTMLSelectElement).value))"
            class="text-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md"
          >
            <option v-for="i in s.instruments" :key="i.instrumentId" :value="i.instrumentId">
              {{ i.instrument.nome }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <PrimaryButton :disabled="loading">{{ loading ? 'Salvando...' : 'Salvar' }}</PrimaryButton>
      <RouterLink to="/escalas"><SecondaryButton type="button">Cancelar</SecondaryButton></RouterLink>
    </div>
  </form>
</template>
