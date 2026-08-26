<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import client from '@/api/client'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Card from '@/components/Card.vue'
import Select from '@/components/Select.vue'
import Badge from '@/components/Badge.vue'
import ErrorState from '@/components/ErrorState.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'
import { parseDateOnly } from '@/utils/date'

interface Row { servidorId: number; nome: string; total: number; ultimaVez: string | null }

const rows = ref<Row[]>([])
const loading = ref(true)
const error = ref(false)
const periodo = ref<'mes' | 'trimestre' | 'ano'>('mes')

function rangeFor(p: typeof periodo.value) {
  const hoje = new Date()
  if (p === 'mes') {
    return {
      inicio: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
      fim: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0),
    }
  }
  if (p === 'trimestre') {
    return {
      inicio: new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1),
      fim: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0),
    }
  }
  return {
    inicio: new Date(hoje.getFullYear(), 0, 1),
    fim: new Date(hoje.getFullYear(), 11, 31),
  }
}

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10)
}

// TASK-0076 (correção): antes, uma falha de rede/API deixava a tela presa em "Carregando..." pra
// sempre, sem nenhuma indicação de erro -- catch adicionado + ErrorState com "Tentar novamente".
async function load() {
  loading.value = true
  error.value = false
  const { inicio, fim } = rangeFor(periodo.value)
  try {
    const { data } = await client.get('/servidores/intensidade', {
      params: { inicio: toISODate(inicio), fim: toISODate(fim) },
    })
    rows.value = data
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(load)

const media = computed(() => {
  const comServico = rows.value.filter((r) => r.total > 0)
  if (!comServico.length) return 0
  return comServico.reduce((sum, r) => sum + r.total, 0) / comServico.length
})

function statusFor(row: Row): { label: string; color: 'red' | 'blue' | 'gray' } | null {
  if (media.value > 0 && row.total >= media.value * 1.5 && row.total >= 2) {
    return { label: 'Possível sobrecarga', color: 'red' }
  }
  const diasSemServir = row.ultimaVez
    ? Math.floor((Date.now() - parseDateOnly(row.ultimaVez)!.getTime()) / 86400000)
    : null
  if (row.total === 0 && (diasSemServir === null || diasSemServir > 60)) {
    return { label: 'Possível ociosidade', color: 'blue' }
  }
  return null
}

function formatData(d: string | null) {
  return d ? parseDateOnly(d)!.toLocaleDateString('pt-BR') : 'Nunca'
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-100">Intensidade de Serviço</h2>
    </template>

    <Card :bordered="false" class="!p-0 overflow-hidden">
      <div class="p-4 border-b flex flex-wrap items-center gap-4 dark:border-gray-700">
        <Select v-model="periodo" @change="load" aria-label="Período" class="!w-auto text-sm">
          <option value="mes">Este mês</option>
          <option value="trimestre">Últimos 3 meses</option>
          <option value="ano">Este ano</option>
        </Select>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Contagem de vezes escalado no período selecionado. Destaques são só um indicativo, não uma regra automática.
        </p>
      </div>

      <div v-if="loading" class="p-8 text-center text-gray-600 dark:text-gray-400">Carregando...</div>

      <ErrorState v-else-if="error" title="Não foi possível carregar a intensidade de serviço."
        description="Verifique sua conexão e tente novamente.">
        <template #action><SecondaryButton type="button" @click="load">Tentar novamente</SecondaryButton></template>
      </ErrorState>

      <template v-else>
        <div class="hidden md:block overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900/40">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Servidor</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Vezes escalado</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Última vez que serviu</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            <tr v-for="r in rows" :key="r.servidorId">
              <td class="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{{ r.nome }}</td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ r.total }}</td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ formatData(r.ultimaVez) }}</td>
              <td class="px-6 py-4">
                <Badge v-if="statusFor(r)" :color="statusFor(r)!.color">{{ statusFor(r)!.label }}</Badge>
                <span v-else class="text-gray-300 text-sm dark:text-gray-600">—</span>
              </td>
            </tr>
            <tr v-if="rows.length === 0">
              <td colspan="4" class="px-6 py-8 text-center text-gray-600 dark:text-gray-400">Nenhum servidor ativo encontrado.</td>
            </tr>
          </tbody>
        </table>
        </div>

        <div class="divide-y divide-gray-100 md:hidden dark:divide-gray-700">
          <div v-for="r in rows" :key="r.servidorId" class="space-y-1 p-4">
            <div class="flex items-center justify-between gap-2">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ r.nome }}</p>
              <Badge v-if="statusFor(r)" :color="statusFor(r)!.color">{{ statusFor(r)!.label }}</Badge>
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ r.total }} vez(es) escalado · última vez: {{ formatData(r.ultimaVez) }}
            </p>
          </div>
          <p v-if="rows.length === 0" class="p-8 text-center text-sm text-gray-600 dark:text-gray-400">Nenhum servidor ativo encontrado.</p>
        </div>
      </template>
    </Card>
  </AuthenticatedLayout>
</template>
