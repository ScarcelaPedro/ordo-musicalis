<script setup lang="ts">
import { ref, onMounted } from 'vue'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Badge from '@/components/Badge.vue'
import { parseDateOnly } from '@/utils/date'

const auth = useAuthStore()
const flash = useFlashStore()
const scales = ref<any[]>([])
const teams = ref<any[]>([])
const filterMes = ref('')
const filterTeam = ref('')

async function load() {
  const params: Record<string, string> = {}
  if (filterMes.value) params.mes = filterMes.value
  if (filterTeam.value) params.teamId = filterTeam.value
  const { data } = await client.get('/scales', { params })
  scales.value = data
}

onMounted(async () => {
  const [, tm] = await Promise.all([load(), client.get('/teams')])
  teams.value = tm.data
})

function formatDate(d: string) {
  return parseDateOnly(d)!.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function destroy(id: number) {
  if (!confirm('Confirma a exclusão desta escala?')) return
  await client.delete(`/scales/${id}`)
  scales.value = scales.value.filter((s) => s.id !== id)
  flash.set('success', 'Escala excluída.')
}

async function copiarLinkPublico() {
  const url = `${window.location.origin}/publico`
  await navigator.clipboard.writeText(url)
  flash.set('success', 'Link público copiado!')
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex flex-wrap justify-between items-center gap-3">
        <h2 class="font-semibold text-xl text-gray-800">Escalas</h2>
        <div v-if="auth.isStaff" class="flex flex-wrap gap-2">
          <button @click="copiarLinkPublico" class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 text-xs font-semibold uppercase rounded-md hover:bg-gray-300">
            Copiar link público
          </button>
          <RouterLink to="/escalas-recorrentes" class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 text-xs font-semibold uppercase rounded-md hover:bg-gray-300">
            Recorrências
          </RouterLink>
          <RouterLink to="/escalas/criar" class="inline-flex items-center px-4 py-2 bg-gray-800 text-white text-xs font-semibold uppercase rounded-md hover:bg-gray-700">
            Nova Escala
          </RouterLink>
        </div>
      </div>
    </template>

    <div class="bg-white shadow-sm rounded-lg">
      <div class="p-4 border-b flex flex-wrap gap-4">
        <input v-model="filterMes" @change="load" type="month" class="border-gray-300 rounded-md shadow-sm text-sm" />
        <select v-model="filterTeam" @change="load" class="border-gray-300 rounded-md shadow-sm text-sm">
          <option value="">Todos os ministérios</option>
          <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.nome }}</option>
        </select>
      </div>

      <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Celebração</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ministério</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="s in scales" :key="s.id">
            <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{{ formatDate(s.dataCelebracao) }}</td>
            <td class="px-6 py-4">
              <RouterLink :to="`/escalas/${s.id}`" class="text-indigo-600 hover:text-indigo-900 font-medium">
                {{ s.celebracao }}
              </RouterLink>
              <div class="text-xs text-gray-500">{{ s.horario }}</div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ s.team?.nome ?? '—' }}</td>
            <td class="px-6 py-4">
              <Badge :color="s.status === 'confirmada' ? 'green' : 'yellow'">{{ s.status }}</Badge>
            </td>
            <td class="px-6 py-4 text-right space-x-3 whitespace-nowrap">
              <RouterLink :to="`/escalas/${s.id}`" class="text-gray-600 hover:text-gray-900 text-sm">Ver</RouterLink>
              <template v-if="auth.isStaff">
                <RouterLink :to="`/escalas/${s.id}/editar`" class="text-indigo-600 hover:text-indigo-900 text-sm">Editar</RouterLink>
                <button @click="destroy(s.id)" class="text-red-600 hover:text-red-900 text-sm">Excluir</button>
              </template>
            </td>
          </tr>
          <tr v-if="scales.length === 0">
            <td colspan="5" class="px-6 py-8 text-center text-gray-500">Nenhuma escala encontrada.</td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
