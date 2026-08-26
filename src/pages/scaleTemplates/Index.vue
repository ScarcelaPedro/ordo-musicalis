<script setup lang="ts">
import { ref, onMounted } from 'vue'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Badge from '@/components/Badge.vue'
import Card from '@/components/Card.vue'
import Skeleton from '@/components/Skeleton.vue'
import ErrorState from '@/components/ErrorState.vue'
import Dropdown from '@/components/Dropdown.vue'
import Modal from '@/components/Modal.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import TertiaryButton from '@/components/TertiaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'
import DangerButton from '@/components/DangerButton.vue'
import { recorrenciaLabel } from '@/utils/recurrence'

const auth = useAuthStore()
const flash = useFlashStore()
const templates = ref<any[]>([])
const loading = ref(true)
const error = ref(false)
const generating = ref(false)
const mesGerar = ref(new Date().toISOString().slice(0, 7))

// TASK-0076 (correção): antes, uma falha de rede/API deixava a tela presa no Skeleton pra
// sempre, sem nenhuma indicação de erro -- catch adicionado + ErrorState com "Tentar novamente".
async function load() {
  loading.value = true
  error.value = false
  try {
    const { data } = await client.get('/scale-templates')
    templates.value = data
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(load)

// Exclusão via Modal (TASK-0050), substituindo o confirm() nativo -- mesma chamada
// DELETE /scale-templates/:id, só disparada ao confirmar no modal.
const paraExcluir = ref<{ id: number; celebracao: string } | null>(null)
const excluindo = ref(false)

function pedirExclusao(t: { id: number; celebracao: string }) {
  paraExcluir.value = t
}

async function confirmarExclusao() {
  if (!paraExcluir.value) return
  excluindo.value = true
  try {
    await client.delete(`/scale-templates/${paraExcluir.value.id}`)
    templates.value = templates.value.filter((t) => t.id !== paraExcluir.value!.id)
    paraExcluir.value = null
  } finally {
    excluindo.value = false
  }
}

async function gerar() {
  generating.value = true
  try {
    const { data } = await client.post('/scale-templates/generate', { mes: mesGerar.value })
    flash.set('success', `${data.criadas} escala(s) criada(s), ${data.puladas} já existiam.`)
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao gerar escalas')
  } finally {
    generating.value = false
  }
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex flex-wrap justify-between items-center gap-3">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-100">Escalas Recorrentes</h2>
        <RouterLink v-if="auth.isStaff" to="/escalas-recorrentes/criar" class="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-xs font-semibold uppercase rounded-md hover:bg-primary-700">
          Nova Recorrência
        </RouterLink>
      </div>
    </template>

    <div class="space-y-6">
      <div class="bg-white shadow-sm rounded-lg p-4 flex flex-wrap items-end gap-4 dark:bg-gray-800">
        <div>
          <label for="mes-gerar" class="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Gerar escalas do mês</label>
          <input id="mes-gerar" v-model="mesGerar" type="month" class="border-gray-300 rounded-md shadow-sm text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
        </div>
        <PrimaryButton :disabled="generating" @click="gerar">
          {{ generating ? 'Gerando...' : 'Gerar escalas' }}
        </PrimaryButton>
        <p class="text-sm text-gray-500 w-full dark:text-gray-400">
          Cria as celebrações do mês escolhido a partir das recorrências ativas abaixo. Não duplica escalas que já existirem na mesma data/horário.
        </p>
      </div>

      <Card :bordered="false" class="!p-0 overflow-hidden">
        <div v-if="loading" class="space-y-2 p-4">
          <Skeleton v-for="i in 5" :key="i" height="h-14" rounded="rounded-lg" />
        </div>

        <ErrorState v-else-if="error" title="Não foi possível carregar as recorrências."
          description="Verifique sua conexão e tente novamente.">
          <template #action><SecondaryButton type="button" @click="load">Tentar novamente</SecondaryButton></template>
        </ErrorState>

        <template v-else>
          <div class="hidden md:block">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Celebração</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Recorrência</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Horário</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Ministério</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Status</th>
                  <th v-if="auth.isStaff" class="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                <tr v-for="t in templates" :key="t.id">
                  <td class="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{{ t.celebracao }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ recorrenciaLabel(t) }}</td>
                  <td class="px-6 py-4 text-sm text-gray-500 font-mono dark:text-gray-400">{{ t.horario }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ t.team?.nome ?? '—' }}</td>
                  <td class="px-6 py-4"><Badge :color="t.ativo ? 'green' : 'gray'">{{ t.ativo ? 'Ativa' : 'Inativa' }}</Badge></td>
                  <td v-if="auth.isStaff" class="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                    <RouterLink :to="`/escalas-recorrentes/${t.id}/editar`" class="text-primary-600 hover:text-primary-900 text-sm dark:text-primary-400 dark:hover:text-primary-300">Editar</RouterLink>
                    <button type="button" @click="pedirExclusao(t)" class="text-danger-600 hover:text-danger-900 text-sm dark:text-danger-400 dark:hover:text-danger-300">Excluir</button>
                  </td>
                </tr>
                <tr v-if="templates.length === 0">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-600 dark:text-gray-400">Nenhuma recorrência cadastrada.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="divide-y divide-gray-100 md:hidden dark:divide-gray-700">
            <div v-for="t in templates" :key="t.id" class="space-y-3 p-4">
              <div>
                <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ t.celebracao }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                  {{ recorrenciaLabel(t) }} · {{ t.horario }}
                  <span v-if="t.team"> · {{ t.team.nome }}</span>
                </p>
              </div>
              <div class="flex flex-wrap gap-1">
                <Badge :color="t.ativo ? 'green' : 'gray'">{{ t.ativo ? 'Ativa' : 'Inativa' }}</Badge>
              </div>
              <Dropdown v-if="auth.isStaff">
                <template #trigger>
                  <TertiaryButton type="button">Mais</TertiaryButton>
                </template>
                <template #items>
                  <RouterLink :to="`/escalas-recorrentes/${t.id}/editar`" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700">Editar</RouterLink>
                  <button type="button" @click="pedirExclusao(t)" class="block w-full px-4 py-2 text-left text-sm text-danger-600 hover:bg-gray-50 dark:hover:bg-gray-700">Excluir</button>
                </template>
              </Dropdown>
            </div>
            <p v-if="templates.length === 0" class="p-8 text-center text-body-sm text-gray-600 dark:text-gray-400">Nenhuma recorrência cadastrada.</p>
          </div>
        </template>
      </Card>
    </div>

    <Modal :modelValue="!!paraExcluir" @update:modelValue="(v) => { if (!v) paraExcluir = null }" title="Excluir recorrência" maxWidth="max-w-sm">
      <p class="text-body-sm text-gray-600 dark:text-gray-300">
        Confirma a exclusão de <strong>{{ paraExcluir?.celebracao }}</strong>? Essa ação não pode ser desfeita.
      </p>
      <div class="mt-4 flex justify-end gap-2">
        <SecondaryButton type="button" @click="paraExcluir = null">Cancelar</SecondaryButton>
        <DangerButton type="button" :loading="excluindo" @click="confirmarExclusao">Excluir</DangerButton>
      </div>
    </Modal>
  </AuthenticatedLayout>
</template>
