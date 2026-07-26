<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Badge from '@/components/Badge.vue'
import { recorrenciaLabel } from '@/utils/recurrence'

const route = useRoute()
const auth = useAuthStore()
const team = ref<any>(null)

onMounted(async () => {
  const { data } = await client.get(`/teams/${route.params.id}`)
  team.value = data
})
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex flex-wrap justify-between items-center gap-3">
        <h2 class="font-semibold text-xl text-gray-800 min-w-0 truncate">{{ team?.nome ?? '...' }}</h2>
        <RouterLink v-if="auth.isStaff && team" :to="`/equipes/${team.id}/editar`"
          class="inline-flex items-center px-4 py-2 bg-gray-800 text-white text-xs font-semibold uppercase rounded-md hover:bg-gray-700">
          Editar
        </RouterLink>
      </div>
    </template>

    <div v-if="team" class="space-y-6">
      <div class="bg-white shadow-sm rounded-lg p-6">
        <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div v-if="team.descricao" class="sm:col-span-2">
            <dt class="text-sm font-medium text-gray-500">Descrição</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ team.descricao }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Responsável</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ team.responsavel?.nome ?? '—' }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Status</dt>
            <dd class="mt-1"><Badge :color="team.ativo ? 'green' : 'gray'">{{ team.ativo ? 'Ativo' : 'Inativo' }}</Badge></dd>
          </div>
        </dl>
      </div>

      <div class="bg-white shadow-sm rounded-lg p-6">
        <h3 class="font-semibold text-gray-800 mb-4">Horários recorrentes</h3>
        <div v-if="team.scaleTemplates.length" class="space-y-2">
          <div v-for="t in team.scaleTemplates" :key="t.id" class="flex justify-between items-center text-sm py-2 border-b last:border-0">
            <span class="font-medium text-gray-900">{{ t.celebracao }}</span>
            <span class="text-gray-500">{{ recorrenciaLabel(t) }} · {{ t.horario }}</span>
          </div>
        </div>
        <p v-else class="text-sm text-gray-500">Nenhum horário recorrente cadastrado para este ministério.</p>
      </div>

      <div class="bg-white shadow-sm rounded-lg p-6">
        <h3 class="font-semibold text-gray-800 mb-4">Membros ({{ team.musicians.length }})</h3>
        <div v-if="team.musicians.length" class="space-y-2">
          <div v-for="m in team.musicians" :key="m.id" class="flex justify-between items-center text-sm py-2 border-b last:border-0">
            <RouterLink :to="`/musicos/${m.musician.id}`" class="text-indigo-600 hover:underline">{{ m.musician.nome }}</RouterLink>
            <span v-if="m.funcao" class="text-gray-500">{{ m.funcao }}</span>
          </div>
        </div>
        <p v-else class="text-sm text-gray-500">Nenhum músico neste ministério.</p>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
