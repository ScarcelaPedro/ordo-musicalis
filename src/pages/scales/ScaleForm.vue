<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import InputLabel from '@/components/InputLabel.vue'
import TextInput from '@/components/TextInput.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'
import client from '@/api/client'

interface Musician {
  id: number
  nome: string
  instruments: { instrumentId: number; instrument: { id: number; nome: string } }[]
  teams: { teamId: number }[]
}
interface Team { id: number; nome: string }

interface ScaleMusician { musicianId: number; instrumentId: number | null }

interface FormData {
  dataCelebracao: string
  horario: string
  celebracao: string
  teamId: number | null
  observacoes: string
  status: 'rascunho' | 'confirmada'
  musicians: ScaleMusician[]
}

const props = defineProps<{
  initialData?: Partial<FormData>
  musicians: Musician[]
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
  musicians: props.initialData?.musicians ?? [],
})

watch(() => props.initialData, (val) => { if (val) Object.assign(form.value, val) })

const filteredMusicians = computed(() => {
  if (!form.value.teamId) return props.musicians
  return props.musicians.filter((m) => m.teams.some((t) => t.teamId === form.value.teamId))
})

watch(() => form.value.teamId, () => {
  const validIds = new Set(filteredMusicians.value.map((m) => m.id))
  form.value.musicians = form.value.musicians.filter((m) => validIds.has(m.musicianId))
})

function isSelected(musicianId: number) {
  return form.value.musicians.some((m) => m.musicianId === musicianId)
}

function getInstrument(musicianId: number) {
  return form.value.musicians.find((m) => m.musicianId === musicianId)?.instrumentId ?? null
}

function toggleMusician(musician: Musician) {
  const idx = form.value.musicians.findIndex((m) => m.musicianId === musician.id)
  if (idx >= 0) {
    form.value.musicians.splice(idx, 1)
  } else {
    const firstInstrument = musician.instruments[0]?.instrumentId ?? null
    form.value.musicians.push({ musicianId: musician.id, instrumentId: firstInstrument })
  }
}

function setInstrument(musicianId: number, instrumentId: number) {
  const entry = form.value.musicians.find((m) => m.musicianId === musicianId)
  if (entry) entry.instrumentId = instrumentId
}

interface Suggestion { musicianId: number; nome: string; nivel: string; score: number; motivo: string }

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
    const excludeIds = form.value.musicians.map((m) => m.musicianId)
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
  if (isSelected(s.musicianId)) return
  const musician = props.musicians.find((m) => m.id === s.musicianId)
  const firstInstrument = musician?.instruments[0]?.instrumentId ?? null
  form.value.musicians.push({ musicianId: s.musicianId, instrumentId: firstInstrument })
  suggestions.value = suggestions.value.filter((sug) => sug.musicianId !== s.musicianId)
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
        <div v-for="s in suggestions" :key="s.musicianId" class="flex items-center justify-between gap-3 p-3 border rounded-md border-gray-200 dark:border-gray-600">
          <div class="min-w-0">
            <span class="text-sm font-medium">{{ s.nome }}</span>
            <p class="text-xs text-gray-500 truncate">{{ s.motivo }}</p>
          </div>
          <SecondaryButton type="button" @click="adicionarSugerido(s)" class="!py-1.5 !px-3 text-xs shrink-0">Adicionar</SecondaryButton>
        </div>
      </div>
    </div>

    <div>
      <InputLabel value="Músicos da escala" />
      <div class="mt-2 space-y-2">
        <p v-if="form.teamId && filteredMusicians.length === 0" class="text-sm text-gray-500">Nenhum músico cadastrado neste ministério.</p>
        <div v-for="m in filteredMusicians" :key="m.id" class="flex items-center gap-3 p-3 border rounded-md" :class="isSelected(m.id) ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'">
          <input
            type="checkbox"
            :checked="isSelected(m.id)"
            @change="toggleMusician(m)"
            class="rounded border-gray-300 text-indigo-600"
          />
          <span class="flex-1 text-sm font-medium">{{ m.nome }}</span>
          <select
            v-if="isSelected(m.id) && m.instruments.length"
            :value="getInstrument(m.id)"
            @change="setInstrument(m.id, Number(($event.target as HTMLSelectElement).value))"
            class="text-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md"
          >
            <option v-for="i in m.instruments" :key="i.instrumentId" :value="i.instrumentId">
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
