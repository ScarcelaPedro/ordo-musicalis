<script setup lang="ts">
import { ref, onMounted } from 'vue'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Badge from '@/components/Badge.vue'

const auth = useAuthStore()
const flash = useFlashStore()
const teams = ref<any[]>([])

onMounted(async () => {
  const { data } = await client.get('/teams')
  teams.value = data
})

async function destroy(id: number) {
  if (!confirm('Confirma a exclusão deste ministério?')) return
  await client.delete(`/teams/${id}`)
  teams.value = teams.value.filter((t) => t.id !== id)
  flash.set('success', 'Ministério excluído.')
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex flex-wrap justify-between items-center gap-3">
        <h2 class="font-semibold text-xl text-gray-800">Ministérios</h2>
        <RouterLink v-if="auth.isStaff" to="/equipes/criar" class="inline-flex items-center px-4 py-2 bg-gray-800 text-white text-xs font-semibold uppercase rounded-md hover:bg-gray-700">
          Novo Ministério
        </RouterLink>
      </div>
    </template>

    <div class="bg-white shadow-sm rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Músicos</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th v-if="auth.isStaff" class="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="t in teams" :key="t.id">
            <td class="px-6 py-4 font-medium text-gray-900">{{ t.nome }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ t._count.musicians }}</td>
            <td class="px-6 py-4"><Badge :color="t.ativo ? 'green' : 'gray'">{{ t.ativo ? 'Ativo' : 'Inativo' }}</Badge></td>
            <td v-if="auth.isStaff" class="px-6 py-4 text-right space-x-3 whitespace-nowrap">
              <RouterLink :to="`/equipes/${t.id}/editar`" class="text-indigo-600 hover:text-indigo-900 text-sm">Editar</RouterLink>
              <button @click="destroy(t.id)" class="text-red-600 hover:text-red-900 text-sm">Excluir</button>
            </td>
          </tr>
          <tr v-if="teams.length === 0">
            <td colspan="4" class="px-6 py-8 text-center text-gray-500">Nenhum ministério cadastrado.</td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
