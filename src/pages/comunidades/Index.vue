<script setup lang="ts">
import { ref, onMounted } from 'vue'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Badge from '@/components/Badge.vue'
import Card from '@/components/Card.vue'
import Skeleton from '@/components/Skeleton.vue'
import Dropdown from '@/components/Dropdown.vue'
import Modal from '@/components/Modal.vue'
import TertiaryButton from '@/components/TertiaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'
import DangerButton from '@/components/DangerButton.vue'

const auth = useAuthStore()
const flash = useFlashStore()
const comunidades = ref<any[]>([])
const loading = ref(true)

async function load() {
  loading.value = true
  const { data } = await client.get('/comunidades')
  comunidades.value = data
  loading.value = false
}

onMounted(load)

// Exclusão via Modal (TASK-0050), substituindo o confirm() nativo -- mesma chamada
// DELETE /comunidades/:id, só disparada ao confirmar no modal.
const paraExcluir = ref<{ id: number; nome: string } | null>(null)
const excluindo = ref(false)

function pedirExclusao(c: { id: number; nome: string }) {
  paraExcluir.value = c
}

async function confirmarExclusao() {
  if (!paraExcluir.value) return
  excluindo.value = true
  try {
    await client.delete(`/comunidades/${paraExcluir.value.id}`)
    comunidades.value = comunidades.value.filter((c) => c.id !== paraExcluir.value!.id)
    flash.set('success', 'Comunidade excluída.')
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
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-100">Comunidades</h2>
        <RouterLink v-if="auth.isStaff" to="/comunidades/criar" class="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-xs font-semibold uppercase rounded-md hover:bg-primary-700">
          Nova Comunidade
        </RouterLink>
      </div>
    </template>

    <Card :bordered="false" class="!p-0 overflow-hidden">
      <div v-if="loading" class="space-y-2 p-4">
        <Skeleton v-for="i in 5" :key="i" height="h-14" rounded="rounded-lg" />
      </div>

      <template v-else>
        <div class="hidden md:block">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900/40">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Nome</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Endereço</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Status</th>
                <th v-if="auth.isStaff" class="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              <tr v-for="c in comunidades" :key="c.id">
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{{ c.nome }}</td>
                <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ c.endereco ?? '—' }}</td>
                <td class="px-6 py-4"><Badge :color="c.ativo ? 'green' : 'gray'">{{ c.ativo ? 'Ativa' : 'Inativa' }}</Badge></td>
                <td v-if="auth.isStaff" class="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                  <RouterLink :to="`/comunidades/${c.id}/editar`" class="text-primary-600 hover:text-primary-900 text-sm dark:text-primary-400 dark:hover:text-primary-300">Editar</RouterLink>
                  <button type="button" @click="pedirExclusao(c)" class="text-danger-600 hover:text-danger-900 text-sm dark:text-danger-400 dark:hover:text-danger-300">Excluir</button>
                </td>
              </tr>
              <tr v-if="comunidades.length === 0">
                <td colspan="4" class="px-6 py-8 text-center text-gray-600 dark:text-gray-400">Nenhuma comunidade cadastrada.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Sem tela de detalhe separada -- o card já mostra tudo, então só "Mais"
             (docs/tasks/0012-*.md). -->
        <div class="divide-y divide-gray-100 md:hidden dark:divide-gray-700">
          <div v-for="c in comunidades" :key="c.id" class="space-y-3 p-4">
            <div>
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ c.nome }}</p>
              <p v-if="c.endereco" class="text-xs text-gray-600 dark:text-gray-400">{{ c.endereco }}</p>
            </div>
            <div class="flex flex-wrap gap-1">
              <Badge :color="c.ativo ? 'green' : 'gray'">{{ c.ativo ? 'Ativa' : 'Inativa' }}</Badge>
            </div>
            <Dropdown v-if="auth.isStaff">
              <template #trigger>
                <TertiaryButton type="button">Mais</TertiaryButton>
              </template>
              <template #items>
                <RouterLink :to="`/comunidades/${c.id}/editar`" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700">Editar</RouterLink>
                <button type="button" @click="pedirExclusao(c)" class="block w-full px-4 py-2 text-left text-sm text-danger-600 hover:bg-gray-50 dark:hover:bg-gray-700">Excluir</button>
              </template>
            </Dropdown>
          </div>
          <p v-if="comunidades.length === 0" class="p-8 text-center text-body-sm text-gray-600 dark:text-gray-400">Nenhuma comunidade cadastrada.</p>
        </div>
      </template>
    </Card>

    <Modal :modelValue="!!paraExcluir" @update:modelValue="(v) => { if (!v) paraExcluir = null }" title="Excluir comunidade" maxWidth="max-w-sm">
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
