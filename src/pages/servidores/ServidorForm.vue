<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import InputLabel from '@/components/InputLabel.vue'
import TextInput from '@/components/TextInput.vue'
import InputError from '@/components/InputError.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'

interface Instrument { id: number; nome: string }
interface Team { id: number; nome: string }
interface Categoria { id: number; nome: string; ordem: number }

type Nivel = 'em_formacao' | 'apto' | 'lider'

interface ServidorMinisterio { teamId: number; funcao: string }

interface FormData {
  nome: string
  telefone: string
  email: string
  ativo: boolean
  nivel: Nivel
  observacoes: string
  categorias: number[]
  instruments: number[]
  teams: ServidorMinisterio[]
}

const NIVEL_LABELS: Record<Nivel, string> = {
  em_formacao: 'Em formação',
  apto: 'Apto',
  lider: 'Líder/Responsável',
}

const props = defineProps<{
  initialData?: Partial<FormData>
  instruments: Instrument[]
  teams: Team[]
  categorias: Categoria[]
  errors?: Record<string, string>
  loading?: boolean
}>()

const emit = defineEmits<{ submit: [data: FormData] }>()

const form = ref<FormData>({
  nome: props.initialData?.nome ?? '',
  telefone: props.initialData?.telefone ?? '',
  email: props.initialData?.email ?? '',
  ativo: props.initialData?.ativo ?? true,
  nivel: props.initialData?.nivel ?? 'apto',
  observacoes: props.initialData?.observacoes ?? '',
  categorias: props.initialData?.categorias ?? [],
  instruments: props.initialData?.instruments ?? [],
  teams: props.initialData?.teams ?? [],
})

watch(() => props.initialData, (val) => {
  if (val) Object.assign(form.value, val)
})

const categoriasOrdenadas = computed(() => [...props.categorias].sort((a, b) => a.ordem - b.ordem))

// Instrumentos e Ministério só fazem sentido pra quem tem a função "Música" -- outras
// funções (Acólito, Leitor...) não têm esses campos.
const musicaId = computed(() => props.categorias.find((c) => c.nome === 'Música')?.id ?? null)
const isMusica = computed(() => musicaId.value != null && form.value.categorias.includes(musicaId.value))

watch(isMusica, (agora) => {
  if (!agora) {
    form.value.instruments = []
    form.value.teams = []
  }
})

function toggleCategoria(id: number) {
  const idx = form.value.categorias.indexOf(id)
  if (idx >= 0) form.value.categorias.splice(idx, 1)
  else form.value.categorias.push(id)
}

function toggleInstrument(id: number) {
  const idx = form.value.instruments.indexOf(id)
  if (idx >= 0) form.value.instruments.splice(idx, 1)
  else form.value.instruments.push(id)
}

function toggleTeam(id: number) {
  const idx = form.value.teams.findIndex((t) => t.teamId === id)
  if (idx >= 0) form.value.teams.splice(idx, 1)
  else form.value.teams.push({ teamId: id, funcao: '' })
}

function teamNome(id: number) {
  return props.teams.find((t) => t.id === id)?.nome ?? ''
}
</script>

<template>
  <form @submit.prevent="emit('submit', form)" class="space-y-6">
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div>
        <InputLabel value="Nome" :required="true" />
        <TextInput v-model="form.nome" class="mt-1" />
        <InputError :message="errors?.nome" />
      </div>
      <div>
        <InputLabel value="Telefone" />
        <TextInput v-model="form.telefone" type="tel" class="mt-1" />
      </div>
      <div>
        <InputLabel value="Email" />
        <TextInput v-model="form.email" type="email" class="mt-1" />
      </div>
      <div>
        <InputLabel value="Nível" />
        <select v-model="form.nivel" class="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full">
          <option v-for="(label, value) in NIVEL_LABELS" :key="value" :value="value">{{ label }}</option>
        </select>
      </div>
      <div class="flex items-center gap-3 mt-6">
        <input id="ativo" v-model="form.ativo" type="checkbox" class="rounded border-gray-300 text-indigo-600" />
        <InputLabel value="Ativo" />
      </div>
    </div>

    <div>
      <InputLabel value="Observações" />
      <textarea
        v-model="form.observacoes"
        rows="3"
        class="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full"
      />
    </div>

    <div>
      <InputLabel value="Função(ões)" :required="true" />
      <InputError :message="errors?.categorias" />
      <p class="mt-1 text-xs text-gray-500">Uma pessoa pode ter mais de uma função (ex: é Músico e também Acólito).</p>
      <div class="mt-2 flex flex-wrap gap-2">
        <button
          v-for="cat in categoriasOrdenadas"
          :key="cat.id"
          type="button"
          @click="toggleCategoria(cat.id)"
          class="px-3 py-1.5 rounded-full text-sm border transition"
          :class="form.categorias.includes(cat.id)
            ? 'bg-purple-600 text-white border-purple-600'
            : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'"
        >
          {{ cat.nome }}
        </button>
      </div>
    </div>

    <template v-if="isMusica">
      <div>
        <InputLabel value="Instrumentos" :required="true" />
        <InputError :message="errors?.instruments" />
        <div class="mt-2 flex flex-wrap gap-2">
          <button
            v-for="inst in instruments"
            :key="inst.id"
            type="button"
            @click="toggleInstrument(inst.id)"
            class="px-3 py-1.5 rounded-full text-sm border transition"
            :class="form.instruments.includes(inst.id)
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'"
          >
            {{ inst.nome }}
          </button>
        </div>
      </div>

      <div>
        <InputLabel value="Ministérios" />
        <div class="mt-2 flex flex-wrap gap-2">
          <button
            v-for="team in teams"
            :key="team.id"
            type="button"
            @click="toggleTeam(team.id)"
            class="px-3 py-1.5 rounded-full text-sm border transition"
            :class="form.teams.some((t) => t.teamId === team.id)
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'"
          >
            {{ team.nome }}
          </button>
        </div>
        <div v-if="form.teams.length" class="mt-3 space-y-2">
          <div v-for="t in form.teams" :key="t.teamId" class="flex items-center gap-2">
            <span class="text-sm text-gray-500 w-40 shrink-0 truncate">{{ teamNome(t.teamId) }}</span>
            <TextInput v-model="t.funcao" placeholder="Função (opcional)" class="text-sm" />
          </div>
        </div>
      </div>
    </template>

    <div class="flex items-center gap-4">
      <PrimaryButton :disabled="loading">
        {{ loading ? 'Salvando...' : 'Salvar' }}
      </PrimaryButton>
      <RouterLink to="/servidores">
        <SecondaryButton type="button">Cancelar</SecondaryButton>
      </RouterLink>
    </div>
  </form>
</template>
