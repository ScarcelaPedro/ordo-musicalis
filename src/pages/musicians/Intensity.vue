<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import client from '@/api/client'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Badge from '@/components/Badge.vue'

interface Row { musicianId: number; nome: string; total: number; ultimaVez: string | null }

const rows = ref<Row[]>([])
const loading = ref(true)
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

async function load() {
  loading.value = true
  const { inicio, fim } = rangeFor(periodo.value)
  const { data } = await client.get('/musicians/intensidade', {
    params: { inicio: toISODate(inicio), fim: toISODate(fim) },
  })
  rows.value = data
  loading.value = false
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
    ? Math.floor((Date.now() - new Date(row.ultimaVez).getTime()) / 86400000)
    : null
  if (row.total === 0 && (diasSemServir === null || diasSemServir > 60)) {
    return { label: 'Possível ociosidade', color: 'blue' }
  }
  return null
}

function formatData(d: string | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : 'Nunca'
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800">Intensidade de Serviço</h2>
    </template>

    <div class="bg-white shadow-sm rounded-lg overflow-hidden">
      <div class="p-4 border-b flex flex-wrap items-center gap-4">
        <select v-model="periodo" @change="load" class="border-gray-300 rounded-md shadow-sm text-sm">
          <option value="mes">Este mês</option>
          <option value="trimestre">Últimos 3 meses</option>
          <option value="ano">Este ano</option>
        </select>
        <p class="text-sm text-gray-500">
          Contagem de vezes escalado no período selecionado. Destaques são só um indicativo, não uma regra automática.
        </p>
      </div>

      <div v-if="loading" class="p-8 text-center text-gray-500">Carregando...</div>

      <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Músico</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vezes escalado</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Última vez que serviu</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="r in rows" :key="r.musicianId">
            <td class="px-6 py-4 font-medium text-gray-900">{{ r.nome }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">{{ r.total }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ formatData(r.ultimaVez) }}</td>
            <td class="px-6 py-4">
              <Badge v-if="statusFor(r)" :color="statusFor(r)!.color">{{ statusFor(r)!.label }}</Badge>
              <span v-else class="text-gray-300 text-sm">—</span>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td colspan="4" class="px-6 py-8 text-center text-gray-500">Nenhum músico ativo encontrado.</td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
