<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import client from '@/api/client'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'

const availabilities = ref<any[]>([])
const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const periodoLabel: Record<string, string> = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' }

onMounted(async () => {
  const { data } = await client.get('/availability/panel')
  availabilities.value = data
})

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

    <div class="bg-white shadow-sm rounded-lg overflow-hidden">
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
  </AuthenticatedLayout>
</template>
