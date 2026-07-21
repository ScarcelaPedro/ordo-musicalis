<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Badge from '@/components/Badge.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import { parseDateOnly } from '@/utils/date'

const flash = useFlashStore()
const availabilities = ref<any[]>([])
const windows = ref<any[]>([])
const pendentes = ref<any[]>([])
const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const periodoLabel: Record<string, string> = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' }

const novaJanela = ref({ mes: new Date().toISOString().slice(0, 7), prazo: '' })
const creating = ref(false)

async function load() {
  const [avail, wins] = await Promise.all([
    client.get('/availability/panel'),
    client.get('/availability-windows'),
  ])
  availabilities.value = avail.data
  windows.value = wins.data
  await loadPendentes()
}

async function loadPendentes() {
  const atual = windows.value.find((w) => w.ativo)
  if (!atual) { pendentes.value = []; return }
  const { data } = await client.get(`/availability-windows/${atual.id}/pendentes`)
  pendentes.value = data
}

onMounted(load)

const janelaAtiva = computed(() => windows.value.find((w) => w.ativo))

function formatMes(mes: string) {
  const [ano, m] = mes.split('-')
  const nomes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
  return `${nomes[Number(m) - 1]}/${ano}`
}

async function criarJanela() {
  if (!novaJanela.value.prazo) {
    flash.set('error', 'Informe o prazo')
    return
  }
  creating.value = true
  try {
    await client.post('/availability-windows', novaJanela.value)
    flash.set('success', 'Janela de coleta aberta!')
    novaJanela.value.prazo = ''
    await load()
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao abrir janela')
  } finally {
    creating.value = false
  }
}

async function fecharJanela(id: number) {
  if (!confirm('Fechar esta janela de coleta?')) return
  await client.patch(`/availability-windows/${id}`, { ativo: false })
  await load()
}

const byMusician = computed(() => {
  const map: Record<string, any> = {}
  availabilities.value.forEach((a) => {
    const key = a.musician.nome
    if (!map[key]) map[key] = { nome: key, slots: [] }
    if (a.diaSemana !== null) {
      map[key].slots.push({ dia: a.diaSemana, periodo: a.periodo })
    }
  })
  return Object.values(map)
})
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800">Painel de Disponibilidade</h2>
    </template>

    <div class="space-y-6">
      <!-- Janela de coleta -->
      <div class="bg-white shadow-sm rounded-lg p-6">
        <h3 class="font-medium text-gray-800 mb-3">Janela de coleta</h3>

        <div v-if="janelaAtiva" class="flex flex-wrap items-center justify-between gap-3 bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
          <p class="text-sm text-indigo-800">
            Aberta para <strong>{{ formatMes(janelaAtiva.mes) }}</strong> — prazo
            <strong>{{ parseDateOnly(janelaAtiva.prazo)!.toLocaleDateString('pt-BR') }}</strong>
          </p>
          <button @click="fecharJanela(janelaAtiva.id)" class="text-sm text-red-600 hover:text-red-800">Fechar janela</button>
        </div>

        <div v-if="!janelaAtiva" class="flex flex-wrap items-end gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mês</label>
            <input v-model="novaJanela.mes" type="month" class="border-gray-300 rounded-md shadow-sm text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Prazo pra responder</label>
            <input v-model="novaJanela.prazo" type="date" class="border-gray-300 rounded-md shadow-sm text-sm" />
          </div>
          <PrimaryButton :disabled="creating" @click="criarJanela">
            {{ creating ? 'Abrindo...' : 'Abrir janela' }}
          </PrimaryButton>
        </div>

        <div v-if="janelaAtiva" class="mt-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Ainda não responderam ({{ pendentes.length }})</h4>
          <div v-if="pendentes.length" class="flex flex-wrap gap-2">
            <Badge v-for="p in pendentes" :key="p.id" color="yellow">{{ p.nome }}</Badge>
          </div>
          <p v-else class="text-sm text-gray-500">Todo mundo já respondeu 🎉</p>
        </div>
      </div>

      <!-- Grade de disponibilidade -->
      <div class="bg-white shadow-sm rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
        <table class="min-w-full text-sm divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Músico</th>
              <th v-for="(dia, idx) in dias" :key="idx" class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">{{ dia }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="m in byMusician" :key="m.nome">
              <td class="px-6 py-4 font-medium text-gray-900">{{ m.nome }}</td>
              <td v-for="(_, idx) in dias" :key="idx" class="px-3 py-4 text-center">
                <div class="flex flex-col gap-0.5 items-center">
                  <span
                    v-for="slot in m.slots.filter((s: any) => s.dia === idx)"
                    :key="slot.periodo"
                    class="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded"
                  >
                    {{ periodoLabel[slot.periodo] }}
                  </span>
                </div>
              </td>
            </tr>
            <tr v-if="byMusician.length === 0">
              <td :colspan="dias.length + 1" class="px-6 py-8 text-center text-gray-500">Nenhuma disponibilidade registrada.</td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
