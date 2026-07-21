<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import ScaleTemplateForm from './ScaleTemplateForm.vue'
import InputLabel from '@/components/InputLabel.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'

const route = useRoute()
const router = useRouter()
const flash = useFlashStore()
const template = ref<any>(null)
const teams = ref([])
const loading = ref(false)
const errors = ref<Record<string, string>>({})

const initialData = computed(() => template.value ? {
  celebracao: template.value.celebracao,
  horario: template.value.horario,
  diaSemana: template.value.diaSemana,
  tipoRecorrencia: template.value.tipoRecorrencia,
  ordinal: template.value.ordinal ?? 1,
  teamId: template.value.teamId,
  observacoes: template.value.observacoes ?? '',
  ativo: template.value.ativo,
} : undefined)

onMounted(async () => {
  const [t, tm] = await Promise.all([
    client.get(`/scale-templates/${route.params.id}`),
    client.get('/teams'),
  ])
  template.value = t.data
  teams.value = tm.data
  await loadVinculos()
  await loadMusiciansInstruments()
})

async function submit(data: object) {
  loading.value = true
  try {
    await client.patch(`/scale-templates/${route.params.id}`, data)
    flash.set('success', 'Recorrência atualizada!')
    router.push('/escalas-recorrentes')
  } catch (e: any) {
    errors.value = e.response?.data?.errors ?? {}
    flash.set('error', e.response?.data?.message ?? 'Erro ao atualizar')
  } finally {
    loading.value = false
  }
}

// Vínculos fixos
const vinculos = ref<any[]>([])
const allMusicians = ref<{ id: number; nome: string }[]>([])
const allInstruments = ref<{ id: number; nome: string }[]>([])
const novoVinculo = ref<{ musicianId: number | null; instrumentId: number | null }>({ musicianId: null, instrumentId: null })
const addingVinculo = ref(false)

async function loadVinculos() {
  const { data } = await client.get('/vinculos-fixos', { params: { scaleTemplateId: route.params.id } })
  vinculos.value = data
}

async function loadMusiciansInstruments() {
  const [m, i] = await Promise.all([client.get('/musicians'), client.get('/instruments')])
  allMusicians.value = m.data
  allInstruments.value = i.data
}

async function addVinculo() {
  if (!novoVinculo.value.musicianId) {
    flash.set('error', 'Selecione um músico')
    return
  }
  addingVinculo.value = true
  try {
    await client.post('/vinculos-fixos', {
      scaleTemplateId: Number(route.params.id),
      musicianId: novoVinculo.value.musicianId,
      instrumentId: novoVinculo.value.instrumentId,
    })
    novoVinculo.value = { musicianId: null, instrumentId: null }
    await loadVinculos()
    flash.set('success', 'Vínculo fixo adicionado!')
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao adicionar vínculo')
  } finally {
    addingVinculo.value = false
  }
}

async function removeVinculo(id: number) {
  if (!confirm('Remover este vínculo fixo?')) return
  await client.delete(`/vinculos-fixos/${id}`)
  vinculos.value = vinculos.value.filter((v) => v.id !== id)
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800">Editar Recorrência</h2>
    </template>
    <div class="space-y-6">
      <div class="bg-white shadow-sm rounded-lg p-6">
        <ScaleTemplateForm v-if="template" :initial-data="initialData" :teams="teams" :errors="errors" :loading="loading" @submit="submit" />
      </div>

      <div class="bg-white shadow-sm rounded-lg p-6">
        <h3 class="font-medium text-gray-800 mb-1">Vínculos fixos</h3>
        <p class="text-sm text-gray-500 mb-4">
          Músicos escalados automaticamente sempre que essa recorrência gerar uma nova celebração.
        </p>

        <div v-if="vinculos.length" class="space-y-2 mb-4">
          <div v-for="v in vinculos" :key="v.id" class="flex items-center justify-between py-2 border-b last:border-0">
            <div class="text-sm">
              <span class="font-medium text-gray-900">{{ v.musician.nome }}</span>
              <span v-if="v.instrument" class="text-gray-500"> · {{ v.instrument.nome }}</span>
            </div>
            <button @click="removeVinculo(v.id)" class="text-red-600 hover:text-red-800 text-sm">Remover</button>
          </div>
        </div>
        <p v-else class="text-sm text-gray-400 mb-4">Nenhum vínculo fixo ainda.</p>

        <div class="flex flex-wrap items-end gap-3 pt-3 border-t">
          <div>
            <InputLabel value="Músico" />
            <select v-model="novoVinculo.musicianId" class="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm">
              <option :value="null">Selecione</option>
              <option v-for="m in allMusicians" :key="m.id" :value="m.id">{{ m.nome }}</option>
            </select>
          </div>
          <div>
            <InputLabel value="Instrumento (opcional)" />
            <select v-model="novoVinculo.instrumentId" class="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm">
              <option :value="null">Nenhum</option>
              <option v-for="i in allInstruments" :key="i.id" :value="i.id">{{ i.nome }}</option>
            </select>
          </div>
          <SecondaryButton type="button" :disabled="addingVinculo" @click="addVinculo">
            {{ addingVinculo ? 'Adicionando...' : 'Adicionar vínculo' }}
          </SecondaryButton>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
