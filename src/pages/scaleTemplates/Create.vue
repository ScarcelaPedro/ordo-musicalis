<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Card from '@/components/Card.vue'
import ScaleTemplateForm from './ScaleTemplateForm.vue'
import InputLabel from '@/components/InputLabel.vue'
import Select from '@/components/Select.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'

const router = useRouter()
const flash = useFlashStore()
const teams = ref([])
const loading = ref(false)
const errors = ref<Record<string, string>>({})

// TASK-0086 (correção): abordagem (b) recomendada no texto da task -- sem mudar o contrato da
// API (POST /scale-templates continua idêntico), só libera a seção de vínculos fixos nesta
// mesma tela assim que a recorrência criada tiver um id, em vez de exigir criar → salvar →
// voltar e editar depois. Lógica de vínculos espelha scaleTemplates/Edit.vue exatamente (a
// referência de implementação indicada pela própria task).
const criado = ref<any>(null)

onMounted(async () => {
  const { data } = await client.get('/teams')
  teams.value = data
})

async function submit(data: object) {
  if (loading.value) return // TASK-0075: guarda síncrona contra duplo clique
  loading.value = true
  try {
    const { data: template } = await client.post('/scale-templates', data)
    criado.value = template
    flash.set('success', 'Recorrência criada com sucesso!')
    await loadServidoresInstruments()
  } catch (e: any) {
    errors.value = e.response?.data?.errors ?? {}
    flash.set('error', e.response?.data?.message ?? 'Erro ao criar recorrência')
  } finally {
    loading.value = false
  }
}

// Vínculos fixos
const vinculos = ref<any[]>([])
const allServidores = ref<{ id: number; nome: string }[]>([])
const allInstruments = ref<{ id: number; nome: string }[]>([])
const novoVinculo = ref<{ servidorId: number | null; instrumentId: number | null }>({ servidorId: null, instrumentId: null })
const addingVinculo = ref(false)

async function loadServidoresInstruments() {
  const [s, i] = await Promise.all([client.get('/servidores'), client.get('/instruments')])
  allServidores.value = s.data
  allInstruments.value = i.data
}

async function loadVinculos() {
  const { data } = await client.get('/vinculos-fixos', { params: { scaleTemplateId: criado.value.id } })
  vinculos.value = data
}

async function addVinculo() {
  if (!novoVinculo.value.servidorId) {
    flash.set('error', 'Selecione um servidor')
    return
  }
  addingVinculo.value = true
  try {
    await client.post('/vinculos-fixos', {
      scaleTemplateId: criado.value.id,
      servidorId: novoVinculo.value.servidorId,
      instrumentId: novoVinculo.value.instrumentId,
    })
    novoVinculo.value = { servidorId: null, instrumentId: null }
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

function concluir() {
  router.push('/escalas-recorrentes')
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-100">Nova Recorrência de Celebração</h2>
    </template>

    <div class="space-y-6">
      <Card v-if="!criado">
        <ScaleTemplateForm :teams="teams" :errors="errors" :loading="loading" @submit="submit" />
      </Card>

      <template v-else>
        <Card class="border border-success-200 dark:border-success-900/40">
          <p class="text-sm font-medium text-success-700 dark:text-success-400">
            Recorrência "{{ criado.celebracao }}" criada com sucesso. Configure abaixo os servidores que devem ser escalados automaticamente, se houver, ou conclua sem nenhum.
          </p>
        </Card>

        <Card>
          <h3 class="font-medium text-gray-800 mb-1 dark:text-gray-100">Vínculos fixos</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Servidores escalados automaticamente sempre que essa recorrência gerar uma nova celebração.
          </p>

          <div v-if="vinculos.length" class="space-y-2 mb-4">
            <div v-for="v in vinculos" :key="v.id" class="flex items-center justify-between py-2 border-b last:border-0 dark:border-gray-700">
              <div class="text-sm">
                <span class="font-medium text-gray-900 dark:text-gray-100">{{ v.servidor.nome }}</span>
                <span v-if="v.instrument" class="text-gray-600 dark:text-gray-400"> · {{ v.instrument.nome }}</span>
              </div>
              <button @click="removeVinculo(v.id)" class="text-red-600 hover:text-red-800 text-sm dark:text-red-400 dark:hover:text-red-300">Remover</button>
            </div>
          </div>
          <p v-else class="text-sm text-gray-600 dark:text-gray-400 mb-4">Nenhum vínculo fixo ainda.</p>

          <div class="flex flex-wrap items-end gap-3 pt-3 border-t dark:border-gray-700">
            <div>
              <InputLabel value="Servidor" for="input-vinculo-servidor" />
              <Select id="input-vinculo-servidor" v-model="novoVinculo.servidorId" class="mt-1 text-sm">
                <option :value="null">Selecione</option>
                <option v-for="s in allServidores" :key="s.id" :value="s.id">{{ s.nome }}</option>
              </Select>
            </div>
            <div>
              <InputLabel value="Instrumento (opcional)" for="input-vinculo-instrument" />
              <Select id="input-vinculo-instrument" v-model="novoVinculo.instrumentId" class="mt-1 text-sm">
                <option :value="null">Nenhum</option>
                <option v-for="i in allInstruments" :key="i.id" :value="i.id">{{ i.nome }}</option>
              </Select>
            </div>
            <SecondaryButton type="button" :disabled="addingVinculo" @click="addVinculo">
              {{ addingVinculo ? 'Adicionando...' : 'Adicionar vínculo' }}
            </SecondaryButton>
          </div>
        </Card>

        <div class="flex justify-end">
          <PrimaryButton type="button" @click="concluir">Concluir</PrimaryButton>
        </div>
      </template>
    </div>
  </AuthenticatedLayout>
</template>
