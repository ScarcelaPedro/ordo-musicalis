<script setup lang="ts">
import { ref, onMounted } from 'vue'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Badge from '@/components/Badge.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'

const auth = useAuthStore()
const flash = useFlashStore()
const templates = ref<any[]>([])
const loading = ref(true)
const generating = ref(false)
const mesGerar = ref(new Date().toISOString().slice(0, 7))

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
// Domingo e Sábado são masculinos; os demais dias (segunda-feira etc.) são femininos.
const DIA_MASCULINO = [true, false, false, false, false, false, true]
const ORDINAIS_M = ['1º', '2º', '3º', '4º', '5º']
const ORDINAIS_F = ['1ª', '2ª', '3ª', '4ª', '5ª']

async function load() {
  loading.value = true
  const { data } = await client.get('/scale-templates')
  templates.value = data
  loading.value = false
}

onMounted(load)

function recorrenciaLabel(t: any) {
  const masculino = DIA_MASCULINO[t.diaSemana]
  if (t.tipoRecorrencia === 'mensal_ordinal') {
    const ordinal = (masculino ? ORDINAIS_M : ORDINAIS_F)[t.ordinal - 1]
    return `${ordinal} ${DIAS[t.diaSemana]} do mês`
  }
  return `${masculino ? 'Todo' : 'Toda'} ${DIAS[t.diaSemana]}`
}

async function destroy(id: number) {
  if (!confirm('Confirma a exclusão desta recorrência?')) return
  await client.delete(`/scale-templates/${id}`)
  templates.value = templates.value.filter((t) => t.id !== id)
}

async function gerar() {
  generating.value = true
  try {
    const { data } = await client.post('/scale-templates/generate', { mes: mesGerar.value })
    flash.set('success', `${data.criadas} escala(s) criada(s), ${data.puladas} já existiam.`)
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao gerar escalas')
  } finally {
    generating.value = false
  }
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex flex-wrap justify-between items-center gap-3">
        <h2 class="font-semibold text-xl text-gray-800">Escalas Recorrentes</h2>
        <RouterLink v-if="auth.isStaff" to="/escalas-recorrentes/criar" class="inline-flex items-center px-4 py-2 bg-gray-800 text-white text-xs font-semibold uppercase rounded-md hover:bg-gray-700">
          Nova Recorrência
        </RouterLink>
      </div>
    </template>

    <div class="space-y-6">
      <div class="bg-white shadow-sm rounded-lg p-4 flex flex-wrap items-end gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Gerar escalas do mês</label>
          <input v-model="mesGerar" type="month" class="border-gray-300 rounded-md shadow-sm text-sm" />
        </div>
        <PrimaryButton :disabled="generating" @click="gerar">
          {{ generating ? 'Gerando...' : 'Gerar escalas' }}
        </PrimaryButton>
        <p class="text-sm text-gray-500 w-full">
          Cria as celebrações do mês escolhido a partir das recorrências ativas abaixo. Não duplica escalas que já existirem na mesma data/horário.
        </p>
      </div>

      <div class="bg-white shadow-sm rounded-lg overflow-hidden">
        <div v-if="loading" class="p-8 text-center text-gray-500">Carregando...</div>
        <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Celebração</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recorrência</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horário</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ministério</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th v-if="auth.isStaff" class="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="t in templates" :key="t.id">
              <td class="px-6 py-4 font-medium text-gray-900">{{ t.celebracao }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ recorrenciaLabel(t) }}</td>
              <td class="px-6 py-4 text-sm text-gray-500 font-mono">{{ t.horario }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ t.team?.nome ?? '—' }}</td>
              <td class="px-6 py-4"><Badge :color="t.ativo ? 'green' : 'gray'">{{ t.ativo ? 'Ativa' : 'Inativa' }}</Badge></td>
              <td v-if="auth.isStaff" class="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                <RouterLink :to="`/escalas-recorrentes/${t.id}/editar`" class="text-indigo-600 hover:text-indigo-900 text-sm">Editar</RouterLink>
                <button @click="destroy(t.id)" class="text-red-600 hover:text-red-900 text-sm">Excluir</button>
              </td>
            </tr>
            <tr v-if="templates.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">Nenhuma recorrência cadastrada.</td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
