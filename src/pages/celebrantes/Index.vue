<script setup lang="ts">
import { ref, onMounted } from 'vue'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Badge from '@/components/Badge.vue'
import Card from '@/components/Card.vue'
import Avatar from '@/components/Avatar.vue'
import Skeleton from '@/components/Skeleton.vue'
import ErrorState from '@/components/ErrorState.vue'
import Dropdown from '@/components/Dropdown.vue'
import Modal from '@/components/Modal.vue'
import TertiaryButton from '@/components/TertiaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'
import DangerButton from '@/components/DangerButton.vue'

const auth = useAuthStore()
const flash = useFlashStore()
const celebrantes = ref<any[]>([])
const loading = ref(true)
const error = ref(false)

// TASK-0076 (correção): antes, uma falha de rede/API deixava a tela presa no Skeleton pra
// sempre, sem nenhuma indicação de erro -- catch adicionado + ErrorState com "Tentar novamente".
async function load() {
  loading.value = true
  error.value = false
  try {
    const { data } = await client.get('/celebrantes')
    celebrantes.value = data
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(load)

// Exclusão via Modal (TASK-0050), substituindo o confirm() nativo -- mesma chamada
// DELETE /celebrantes/:id, só disparada ao confirmar no modal.
const paraExcluir = ref<{ id: number; nome: string } | null>(null)
const excluindo = ref(false)

function pedirExclusao(c: { id: number; nome: string }) {
  paraExcluir.value = c
}

async function confirmarExclusao() {
  if (!paraExcluir.value) return
  excluindo.value = true
  try {
    await client.delete(`/celebrantes/${paraExcluir.value.id}`)
    celebrantes.value = celebrantes.value.filter((c) => c.id !== paraExcluir.value!.id)
    flash.set('success', 'Celebrante excluído.')
    paraExcluir.value = null
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao excluir')
  } finally {
    excluindo.value = false
  }
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex flex-wrap justify-between items-center gap-3">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-100">Celebrantes</h2>
        <RouterLink v-if="auth.isStaff" to="/celebrantes/criar" class="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-xs font-semibold uppercase rounded-md hover:bg-primary-700">
          Novo Celebrante
        </RouterLink>
      </div>
    </template>

    <Card :bordered="false" class="!p-0 overflow-hidden">
      <div v-if="loading" class="space-y-2 p-4">
        <Skeleton v-for="i in 5" :key="i" height="h-14" rounded="rounded-lg" />
      </div>

      <ErrorState v-else-if="error" title="Não foi possível carregar os celebrantes."
        description="Verifique sua conexão e tente novamente.">
        <template #action><SecondaryButton type="button" @click="load">Tentar novamente</SecondaryButton></template>
      </ErrorState>

      <template v-else>
        <div class="hidden md:block">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900/40">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Nome</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Contato</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Status</th>
                <th v-if="auth.isStaff" class="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              <tr v-for="c in celebrantes" :key="c.id">
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{{ c.nome }}</td>
                <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ c.telefone ?? c.email ?? '—' }}</td>
                <td class="px-6 py-4"><Badge :color="c.ativo ? 'green' : 'gray'">{{ c.ativo ? 'Ativo' : 'Inativo' }}</Badge></td>
                <td v-if="auth.isStaff" class="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                  <RouterLink :to="`/celebrantes/${c.id}/editar`" class="text-primary-600 hover:text-primary-900 text-sm dark:text-primary-400 dark:hover:text-primary-300">Editar</RouterLink>
                  <button type="button" @click="pedirExclusao(c)" class="text-danger-600 hover:text-danger-900 text-sm dark:text-danger-400 dark:hover:text-danger-300">Excluir</button>
                </td>
              </tr>
              <tr v-if="celebrantes.length === 0">
                <td colspan="4" class="px-6 py-8 text-center text-gray-600 dark:text-gray-400">Nenhum celebrante cadastrado.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="divide-y divide-gray-100 md:hidden dark:divide-gray-700">
          <div v-for="c in celebrantes" :key="c.id" class="space-y-3 p-4">
            <div class="flex items-center gap-3">
              <Avatar :name="c.nome" size="sm" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{{ c.nome }}</p>
                <p v-if="c.telefone ?? c.email" class="truncate text-xs text-gray-600 dark:text-gray-400">{{ c.telefone ?? c.email }}</p>
              </div>
            </div>
            <div class="flex flex-wrap gap-1">
              <Badge :color="c.ativo ? 'green' : 'gray'">{{ c.ativo ? 'Ativo' : 'Inativo' }}</Badge>
            </div>
            <Dropdown v-if="auth.isStaff">
              <template #trigger>
                <TertiaryButton type="button">Mais</TertiaryButton>
              </template>
              <template #items>
                <RouterLink :to="`/celebrantes/${c.id}/editar`" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700">Editar</RouterLink>
                <button type="button" @click="pedirExclusao(c)" class="block w-full px-4 py-2 text-left text-sm text-danger-600 hover:bg-gray-50 dark:hover:bg-gray-700">Excluir</button>
              </template>
            </Dropdown>
          </div>
          <p v-if="celebrantes.length === 0" class="p-8 text-center text-body-sm text-gray-600 dark:text-gray-400">Nenhum celebrante cadastrado.</p>
        </div>
      </template>
    </Card>

    <Modal :modelValue="!!paraExcluir" @update:modelValue="(v) => { if (!v) paraExcluir = null }" title="Excluir celebrante" maxWidth="max-w-sm">
      <p class="text-body-sm text-gray-600 dark:text-gray-300">
        Confirma a exclusão de <strong>{{ paraExcluir?.nome }}</strong>? Essa ação não pode ser desfeita.
      </p>
      <div class="mt-4 flex justify-end gap-2">
        <SecondaryButton type="button" @click="paraExcluir = null">Cancelar</SecondaryButton>
        <DangerButton type="button" :loading="excluindo" @click="confirmarExclusao">Excluir</DangerButton>
      </div>
    </Modal>
  </AuthenticatedLayout>
</template>
