<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Badge from '@/components/Badge.vue'
import { parseDateOnly } from '@/utils/date'
import { STATUS_LABELS, STATUS_COLORS } from '@/utils/status'

const route = useRoute()
const auth = useAuthStore()
const musician = ref<any>(null)

onMounted(async () => {
  const { data } = await client.get(`/musicians/${route.params.id}`)
  musician.value = data
})

function formatDate(d: string) {
  return parseDateOnly(d)!.toLocaleDateString('pt-BR')
}

const NIVEL_LABELS: Record<string, string> = {
  em_formacao: 'Em formação',
  apto: 'Apto',
  lider: 'Líder/Responsável',
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex flex-wrap justify-between items-center gap-3">
        <h2 class="font-semibold text-xl text-gray-800 min-w-0 truncate">{{ musician?.nome ?? '...' }}</h2>
        <RouterLink v-if="auth.isStaff && musician" :to="`/musicos/${musician.id}/editar`"
          class="inline-flex items-center px-4 py-2 bg-gray-800 text-white text-xs font-semibold uppercase rounded-md hover:bg-gray-700">
          Editar
        </RouterLink>
      </div>
    </template>

    <div v-if="musician" class="space-y-6">
      <div class="bg-white shadow-sm rounded-lg p-6">
        <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-sm font-medium text-gray-500">Email</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ musician.email ?? '—' }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Telefone</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ musician.telefone ?? '—' }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Status</dt>
            <dd class="mt-1"><Badge :color="musician.ativo ? 'green' : 'gray'">{{ musician.ativo ? 'Ativo' : 'Inativo' }}</Badge></dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Nível</dt>
            <dd class="mt-1"><Badge color="blue">{{ NIVEL_LABELS[musician.nivel] ?? musician.nivel }}</Badge></dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Instrumentos</dt>
            <dd class="mt-1 flex flex-wrap gap-1">
              <Badge v-for="i in musician.instruments" :key="i.id" color="blue">{{ i.instrument.nome }}</Badge>
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Ministérios</dt>
            <dd class="mt-1 flex flex-wrap gap-1">
              <Badge v-for="t in musician.teams" :key="t.id" color="green">{{ t.team.nome }}</Badge>
              <span v-if="!musician.teams.length" class="text-sm text-gray-400">Nenhum</span>
            </dd>
          </div>
          <div v-if="musician.observacoes">
            <dt class="text-sm font-medium text-gray-500">Observações</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ musician.observacoes }}</dd>
          </div>
        </dl>
      </div>

      <div class="bg-white shadow-sm rounded-lg p-6">
        <h3 class="font-semibold text-gray-800 mb-4">Histórico de Escalas</h3>
        <div v-if="musician.scales.length" class="space-y-2">
          <div v-for="s in musician.scales" :key="s.id" class="flex justify-between items-center text-sm py-2 border-b">
            <RouterLink :to="`/escalas/${s.scale.id}`" class="text-indigo-600 hover:underline">
              {{ s.scale.celebracao }}
            </RouterLink>
            <div class="flex items-center gap-3">
              <span class="text-gray-500">{{ formatDate(s.scale.dataCelebracao) }}</span>
              <Badge :color="STATUS_COLORS[s.status]">{{ STATUS_LABELS[s.status] ?? s.status }}</Badge>
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-gray-500">Nenhuma escala registrada.</p>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
