<script setup lang="ts">
import { ref, onMounted } from 'vue'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Card from '@/components/Card.vue'
import Skeleton from '@/components/Skeleton.vue'
import Checkbox from '@/components/Checkbox.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'
import { parseDateOnly } from '@/utils/date'

const flash = useFlashStore()
const loading = ref(false)
// Não existia estado de loading na carga inicial (achado confirmado em docs/tasks/0028-*.md,
// mesmo padrão de gap já visto no Painel do coordenador) -- corrigido nesta task.
const loadingInicial = ref(true)

const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const periodos = [
  { value: 'manha', label: 'Manhã' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noite', label: 'Noite' },
]

// Matriz: [diaSemana][periodo] = boolean
const matrix = ref<Record<number, Record<string, boolean>>>({})

dias.forEach((_, idx) => {
  matrix.value[idx] = { manha: false, tarde: false, noite: false }
})

interface Especifica { data: string; periodo: string; disponivel: boolean }
const especificas = ref<Especifica[]>([])

const janela = ref<{ id: number; mes: string; prazo: string } | null>(null)

function addEspecifica() {
  especificas.value.push({ data: '', periodo: 'manha', disponivel: false })
}
function removeEspecifica(idx: number) {
  especificas.value.splice(idx, 1)
}

function formatMes(mes: string) {
  const [ano, m] = mes.split('-')
  const nomes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
  return `${nomes[Number(m) - 1]}/${ano}`
}

onMounted(async () => {
  loadingInicial.value = true
  const [{ data }, janelaRes] = await Promise.all([
    client.get('/availability'),
    client.get('/availability-windows/atual'),
  ])
  data.forEach((a: any) => {
    if (a.diaSemana !== null) {
      matrix.value[a.diaSemana][a.periodo] = a.disponivel
    } else if (a.data) {
      especificas.value.push({ data: a.data.slice(0, 10), periodo: a.periodo, disponivel: a.disponivel })
    }
  })
  janela.value = janelaRes.data
  loadingInicial.value = false
})

async function submit() {
  loading.value = true
  const availabilities: { diaSemana: number; periodo: string; disponivel: boolean }[] = []

  Object.entries(matrix.value).forEach(([dia, periodoMap]) => {
    Object.entries(periodoMap).forEach(([periodo, disponivel]) => {
      if (disponivel) {
        availabilities.push({ diaSemana: Number(dia), periodo, disponivel: true })
      }
    })
  })

  const especificasValidas = especificas.value.filter((e) => e.data)

  try {
    await client.post('/availability', { availabilities, especificas: especificasValidas })
    flash.set('success', 'Disponibilidade salva com sucesso!')
  } catch {
    flash.set('error', 'Erro ao salvar disponibilidade')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-100">Minha Disponibilidade</h2>
    </template>

    <div v-if="loadingInicial" class="space-y-6">
      <Card :bordered="false" class="space-y-3">
        <Skeleton width="w-64" height="h-4" />
        <Skeleton height="h-40" rounded="rounded-lg" />
      </Card>
    </div>

    <div v-else class="space-y-6">
      <div v-if="janela" class="bg-primary-50 border border-primary-200 rounded-lg p-4 text-sm text-primary-800 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-200">
        Coleta de disponibilidade de <strong>{{ formatMes(janela.mes) }}</strong> aberta —
        responda até <strong>{{ parseDateOnly(janela.prazo)!.toLocaleDateString('pt-BR') }}</strong>.
      </div>

      <Card>
        <!-- Semântica do checkbox desmarcado (TASK-0052, achado da auditoria #13/#19) --
             explicitada só com texto, sem mudar o dado enviado ao salvar. -->
        <p class="text-sm text-gray-600 mb-6 dark:text-gray-300">
          Marque os períodos em que você pode servir. Períodos não marcados são tratados como
          indisponíveis.
        </p>

        <!-- Desktop: tabela 4 colunas (já cabe bem, sem o problema de largura do Painel do
             coordenador). -->
        <div class="hidden md:block">
          <table class="min-w-full text-sm">
            <thead>
              <tr>
                <th class="text-left font-medium text-gray-500 pb-3 pr-4 dark:text-gray-400">Dia</th>
                <th v-for="p in periodos" :key="p.value" class="text-center font-medium text-gray-500 pb-3 px-4 dark:text-gray-400">{{ p.label }}</th>
              </tr>
            </thead>
            <tbody class="divide-y dark:divide-gray-700">
              <tr v-for="(dia, idx) in dias" :key="idx">
                <td class="py-3 pr-4 font-medium text-gray-700 dark:text-gray-300">{{ dia }}</td>
                <td v-for="p in periodos" :key="p.value" class="py-3 px-4 text-center">
                  <Checkbox v-model="matrix[idx][p.value]" :ariaLabel="`${dia} · ${p.label}`" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile (TASK-0052, docs/tasks/0028-*.md): lista de 7 blocos (um por dia), com os 3
             períodos lado a lado -- elimina a tabela/overflow-x-auto, mesmo sendo uma grade
             pequena. -->
        <div class="space-y-4 md:hidden">
          <div v-for="(dia, idx) in dias" :key="idx" class="rounded-md border border-gray-200 p-3 dark:border-gray-700">
            <p class="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">{{ dia }}</p>
            <div class="flex flex-wrap gap-x-5 gap-y-2">
              <Checkbox v-for="p in periodos" :key="p.value" v-model="matrix[idx][p.value]" :label="p.label" />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="font-medium text-gray-800 dark:text-gray-100">Exceções pontuais</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Datas específicas em que você foge do seu padrão semanal (ex: disponível num sábado
              que normalmente não estaria, ou indisponível numa data específica).
            </p>
          </div>
          <SecondaryButton type="button" @click="addEspecifica">Adicionar</SecondaryButton>
        </div>

        <div v-if="especificas.length" class="space-y-2">
          <!-- Desktop: linha única (já cabe bem em 4 controles). -->
          <div v-for="(e, idx) in especificas" :key="idx" class="hidden md:flex flex-wrap items-center gap-3 py-2 border-b last:border-0 dark:border-gray-700">
            <input v-model="e.data" type="date" class="border-gray-300 rounded-md shadow-sm text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
            <select v-model="e.periodo" class="border-gray-300 rounded-md shadow-sm text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
              <option v-for="p in periodos" :key="p.value" :value="p.value">{{ p.label }}</option>
            </select>
            <Checkbox v-model="e.disponivel" label="Disponível" />
            <button type="button" @click="removeEspecifica(idx)" class="text-danger-600 hover:text-danger-800 text-sm ml-auto dark:text-danger-400 dark:hover:text-danger-300">Remover</button>
          </div>

          <!-- Mobile (TASK-0052): mini-card empilhado, em vez de linha com flex-wrap apertado. -->
          <div v-for="(e, idx) in especificas" :key="`m-${idx}`" class="space-y-2 rounded-md border border-gray-200 p-3 md:hidden dark:border-gray-700">
            <input v-model="e.data" type="date" class="w-full border-gray-300 rounded-md shadow-sm text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
            <select v-model="e.periodo" class="w-full border-gray-300 rounded-md shadow-sm text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
              <option v-for="p in periodos" :key="p.value" :value="p.value">{{ p.label }}</option>
            </select>
            <div class="flex items-center justify-between">
              <Checkbox v-model="e.disponivel" label="Disponível" />
              <button type="button" @click="removeEspecifica(idx)" class="text-danger-600 hover:text-danger-800 text-sm dark:text-danger-400 dark:hover:text-danger-300">Remover</button>
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-gray-600 dark:text-gray-400">Nenhuma exceção adicionada.</p>
      </Card>

      <PrimaryButton :disabled="loading" @click="submit">
        {{ loading ? 'Salvando...' : 'Salvar disponibilidade' }}
      </PrimaryButton>
    </div>
  </AuthenticatedLayout>
</template>
