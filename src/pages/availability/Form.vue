<script setup lang="ts">
import { ref, onMounted } from 'vue'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'

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

onMounted(async () => {
  const { data } = await client.get('/availability')
  data.forEach((a: any) => {
    if (a.diaSemana !== null) {
      matrix.value[a.diaSemana][a.periodo] = a.disponivel
    }
  })
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

  try {
    await client.post('/availability', { availabilities })
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

      <div class="mt-6">
        <PrimaryButton :disabled="loading" @click="submit">
          {{ loading ? 'Salvando...' : 'Salvar disponibilidade' }}
        </PrimaryButton>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
