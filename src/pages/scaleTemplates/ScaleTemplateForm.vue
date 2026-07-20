<script setup lang="ts">
import { ref, watch } from 'vue'
import InputLabel from '@/components/InputLabel.vue'
import TextInput from '@/components/TextInput.vue'
import InputError from '@/components/InputError.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'

interface Team { id: number; nome: string }

interface FormData {
  celebracao: string
  horario: string
  diaSemana: number
  tipoRecorrencia: 'semanal' | 'mensal_ordinal'
  ordinal: number | null
  teamId: number | null
  observacoes: string
  ativo: boolean
}

const props = defineProps<{
  initialData?: Partial<FormData>
  teams: Team[]
  errors?: Record<string, string>
  loading?: boolean
}>()

const emit = defineEmits<{ submit: [data: FormData] }>()

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const ORDINAIS = ['1ª', '2ª', '3ª', '4ª', '5ª']

const form = ref<FormData>({
  celebracao: props.initialData?.celebracao ?? '',
  horario: props.initialData?.horario ?? '',
  diaSemana: props.initialData?.diaSemana ?? 0,
  tipoRecorrencia: props.initialData?.tipoRecorrencia ?? 'semanal',
  ordinal: props.initialData?.ordinal ?? 1,
  teamId: props.initialData?.teamId ?? null,
  observacoes: props.initialData?.observacoes ?? '',
  ativo: props.initialData?.ativo ?? true,
})

watch(() => props.initialData, (val) => {
  if (val) Object.assign(form.value, val)
})
</script>

<template>
  <form @submit.prevent="emit('submit', form)" class="space-y-6">
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div class="sm:col-span-2">
        <InputLabel value="Celebração" :required="true" />
        <TextInput v-model="form.celebracao" placeholder="Ex: Santa Missa" class="mt-1" />
        <InputError :message="errors?.celebracao" />
      </div>
      <div>
        <InputLabel value="Horário" :required="true" />
        <TextInput v-model="form.horario" type="time" class="mt-1" />
      </div>
      <div>
        <InputLabel value="Dia da semana" :required="true" />
        <select v-model.number="form.diaSemana" class="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full">
          <option v-for="(dia, idx) in DIAS" :key="idx" :value="idx">{{ dia }}</option>
        </select>
      </div>
      <div>
        <InputLabel value="Recorrência" :required="true" />
        <select v-model="form.tipoRecorrencia" class="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full">
          <option value="semanal">Toda semana</option>
          <option value="mensal_ordinal">Uma semana específica do mês</option>
        </select>
      </div>
      <div v-if="form.tipoRecorrencia === 'mensal_ordinal'">
        <InputLabel value="Qual semana do mês" :required="true" />
        <select v-model.number="form.ordinal" class="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full">
          <option v-for="(label, idx) in ORDINAIS" :key="idx" :value="idx + 1">{{ label }}</option>
        </select>
      </div>
      <div>
        <InputLabel value="Ministério esperado" />
        <select v-model="form.teamId" class="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full">
          <option :value="null">Nenhum</option>
          <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.nome }}</option>
        </select>
      </div>
      <div class="flex items-center gap-3 mt-6">
        <input v-model="form.ativo" type="checkbox" class="rounded border-gray-300 text-indigo-600" />
        <InputLabel value="Ativa (gera escalas automaticamente)" />
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

    <div class="flex items-center gap-4">
      <PrimaryButton :disabled="loading">{{ loading ? 'Salvando...' : 'Salvar' }}</PrimaryButton>
      <RouterLink to="/escalas-recorrentes">
        <SecondaryButton type="button">Cancelar</SecondaryButton>
      </RouterLink>
    </div>
  </form>
</template>
