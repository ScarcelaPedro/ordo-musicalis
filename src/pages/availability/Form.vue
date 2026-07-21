<script setup lang="ts">
import { ref, onMounted } from 'vue'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'

const flash = useFlashStore()
const loading = ref(false)

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
      <h2 class="font-semibold text-xl text-gray-800">Minha Disponibilidade</h2>
    </template>

    <div class="space-y-6">
      <div v-if="janela" class="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-sm text-indigo-800">
        Coleta de disponibilidade de <strong>{{ formatMes(janela.mes) }}</strong> aberta —
        responda até <strong>{{ new Date(janela.prazo).toLocaleDateString('pt-BR') }}</strong>.
      </div>

      <div class="bg-white shadow-sm rounded-lg p-6">
        <p class="text-sm text-gray-600 mb-6">Marque os períodos em que você está disponível regularmente.</p>

        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr>
                <th class="text-left font-medium text-gray-500 pb-3 pr-4">Dia</th>
                <th v-for="p in periodos" :key="p.value" class="text-center font-medium text-gray-500 pb-3 px-4">{{ p.label }}</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-for="(dia, idx) in dias" :key="idx">
                <td class="py-3 pr-4 font-medium text-gray-700">{{ dia }}</td>
                <td v-for="p in periodos" :key="p.value" class="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    v-model="matrix[idx][p.value]"
                    class="rounded border-gray-300 text-indigo-600 w-5 h-5"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white shadow-sm rounded-lg p-6">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="font-medium text-gray-800">Exceções pontuais</h3>
            <p class="text-sm text-gray-500">
              Datas específicas em que você foge do seu padrão semanal (ex: disponível num sábado
              que normalmente não estaria, ou indisponível numa data específica).
            </p>
          </div>
          <SecondaryButton type="button" @click="addEspecifica">Adicionar</SecondaryButton>
        </div>

        <div v-if="especificas.length" class="space-y-2">
          <div v-for="(e, idx) in especificas" :key="idx" class="flex flex-wrap items-center gap-3 py-2 border-b last:border-0">
            <input v-model="e.data" type="date" class="border-gray-300 rounded-md shadow-sm text-sm" />
            <select v-model="e.periodo" class="border-gray-300 rounded-md shadow-sm text-sm">
              <option v-for="p in periodos" :key="p.value" :value="p.value">{{ p.label }}</option>
            </select>
            <label class="flex items-center gap-2 text-sm text-gray-600">
              <input v-model="e.disponivel" type="checkbox" class="rounded border-gray-300 text-indigo-600" />
              Disponível
            </label>
            <button type="button" @click="removeEspecifica(idx)" class="text-red-600 hover:text-red-800 text-sm ml-auto">Remover</button>
          </div>
        </div>
        <p v-else class="text-sm text-gray-400">Nenhuma exceção adicionada.</p>
      </div>

      <PrimaryButton :disabled="loading" @click="submit">
        {{ loading ? 'Salvando...' : 'Salvar disponibilidade' }}
      </PrimaryButton>
    </div>
  </AuthenticatedLayout>
</template>
