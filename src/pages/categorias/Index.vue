<script setup lang="ts">
import { ref, onMounted } from 'vue'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Badge from '@/components/Badge.vue'

const auth = useAuthStore()
const flash = useFlashStore()
const categorias = ref<any[]>([])
const loading = ref(true)

async function load() {
  loading.value = true
  const { data } = await client.get('/categorias')
  categorias.value = data
  loading.value = false
}

onMounted(load)

async function destroy(id: number) {
  if (!confirm('Confirma a exclusão desta categoria?')) return
  try {
    await client.delete(`/categorias/${id}`)
    categorias.value = categorias.value.filter((c) => c.id !== id)
    flash.set('success', 'Categoria excluída.')
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao excluir')
  }
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex flex-wrap justify-between items-center gap-3">
        <h2 class="font-semibold text-xl text-gray-800">Categorias de Função</h2>
        <RouterLink v-if="auth.isStaff" to="/categorias/criar" class="inline-flex items-center px-4 py-2 bg-gray-800 text-white text-xs font-semibold uppercase rounded-md hover:bg-gray-700">
          Nova Categoria
        </RouterLink>
      </div>
    </template>

    <div v-if="loading" class="p-8 text-center text-gray-500">Carregando...</div>

    <div v-else class="bg-white shadow-sm rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ordem</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th v-if="auth.isStaff" class="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="c in categorias" :key="c.id">
            <td class="px-6 py-4 font-medium text-gray-900">{{ c.nome }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ c.ordem }}</td>
            <td class="px-6 py-4"><Badge :color="c.ativo ? 'green' : 'gray'">{{ c.ativo ? 'Ativa' : 'Inativa' }}</Badge></td>
            <td v-if="auth.isStaff" class="px-6 py-4 text-right space-x-3 whitespace-nowrap">
              <RouterLink :to="`/categorias/${c.id}/editar`" class="text-indigo-600 hover:text-indigo-900 text-sm">Editar</RouterLink>
              <button @click="destroy(c.id)" class="text-red-600 hover:text-red-900 text-sm">Excluir</button>
            </td>
          </tr>
          <tr v-if="categorias.length === 0">
            <td colspan="4" class="px-6 py-8 text-center text-gray-500">Nenhuma categoria cadastrada.</td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
