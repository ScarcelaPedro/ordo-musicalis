<script setup lang="ts">
import { ref, onMounted } from 'vue'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Badge from '@/components/Badge.vue'

const auth = useAuthStore()
const musicians = ref<any[]>([])
const search = ref('')
const loading = ref(true)

async function load() {
  loading.value = true
  const { data } = await client.get('/musicians', { params: { search: search.value || undefined } })
  musicians.value = data
  loading.value = false
}

onMounted(load)

async function destroy(id: number) {
  if (!confirm('Confirma a exclusão deste músico?')) return
  await client.delete(`/musicians/${id}`)
  musicians.value = musicians.value.filter((m) => m.id !== id)
}

const NIVEL_LABELS: Record<string, string> = {
  em_formacao: 'Em formação',
  apto: 'Apto',
  lider: 'Líder',
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex flex-wrap justify-between items-center gap-3">
        <h2 class="font-semibold text-xl text-gray-800">Músicos</h2>
        <RouterLink v-if="auth.isStaff" to="/musicos/criar" class="inline-flex items-center px-4 py-2 bg-gray-800 text-white text-xs font-semibold uppercase rounded-md hover:bg-gray-700">
          Novo Músico
        </RouterLink>
      </div>
    </template>

    <div class="bg-white shadow-sm rounded-lg">
      <div class="p-4 border-b">
        <input
          v-model="search"
          @input="load"
          type="text"
          placeholder="Buscar por nome..."
          class="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full sm:w-80"
        />
      </div>

      <div v-if="loading" class="p-8 text-center text-gray-500">Carregando...</div>

      <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instrumentos</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nível</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th v-if="auth.isStaff" class="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="m in musicians" :key="m.id">
            <td class="px-6 py-4">
              <RouterLink :to="`/musicos/${m.id}`" class="text-indigo-600 hover:text-indigo-900 font-medium">
                {{ m.nome }}
              </RouterLink>
              <div class="text-sm text-gray-500">{{ m.email }}</div>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-wrap gap-1">
                <Badge v-for="i in m.instruments" :key="i.id" color="blue">{{ i.instrument.nome }}</Badge>
              </div>
            </td>
            <td class="px-6 py-4">
              <Badge color="blue">{{ NIVEL_LABELS[m.nivel] ?? m.nivel }}</Badge>
            </td>
            <td class="px-6 py-4">
              <Badge :color="m.ativo ? 'green' : 'gray'">{{ m.ativo ? 'Ativo' : 'Inativo' }}</Badge>
            </td>
            <td v-if="auth.isStaff" class="px-6 py-4 text-right space-x-3 whitespace-nowrap">
              <RouterLink :to="`/musicos/${m.id}/editar`" class="text-indigo-600 hover:text-indigo-900 text-sm">Editar</RouterLink>
              <button @click="destroy(m.id)" class="text-red-600 hover:text-red-900 text-sm">Excluir</button>
            </td>
          </tr>
          <tr v-if="musicians.length === 0">
            <td colspan="5" class="px-6 py-8 text-center text-gray-500">Nenhum músico encontrado.</td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
