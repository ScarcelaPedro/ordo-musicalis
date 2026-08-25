<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Badge from '@/components/Badge.vue'
import Card from '@/components/Card.vue'
import Avatar from '@/components/Avatar.vue'
import Skeleton from '@/components/Skeleton.vue'
import Dropdown from '@/components/Dropdown.vue'
import Modal from '@/components/Modal.vue'
import TertiaryButton from '@/components/TertiaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'
import DangerButton from '@/components/DangerButton.vue'

const auth = useAuthStore()
const servidores = ref<any[]>([])
const search = ref('')
const loading = ref(true)

async function load() {
  loading.value = true
  const { data } = await client.get('/servidores', { params: { search: search.value || undefined } })
  servidores.value = data
  loading.value = false
}

onMounted(load)

// Busca com debounce (TASK-0049, docs/tasks/0012-*.md): antes disparava uma requisição por
// tecla; agora espera 300ms sem digitação antes de buscar -- mesma chamada GET /servidores,
// só menos frequente.
let debounceTimer: ReturnType<typeof setTimeout> | undefined
function onSearchInput() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(load, 300)
}
onBeforeUnmount(() => clearTimeout(debounceTimer))

// Exclusão via Modal (TASK-0049), substituindo o confirm() nativo -- mesma chamada
// DELETE /servidores/:id, só disparada ao confirmar no modal, nunca ao abri-lo.
const paraExcluir = ref<{ id: number; nome: string } | null>(null)
const excluindo = ref(false)

function pedirExclusao(s: { id: number; nome: string }) {
  paraExcluir.value = s
}

async function confirmarExclusao() {
  if (!paraExcluir.value) return
  excluindo.value = true
  try {
    await client.delete(`/servidores/${paraExcluir.value.id}`)
    servidores.value = servidores.value.filter((s) => s.id !== paraExcluir.value!.id)
    paraExcluir.value = null
  } finally {
    excluindo.value = false
  }
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
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-100">Servidores</h2>
        <div v-if="auth.isStaff" class="flex gap-2">
          <RouterLink to="/servidores/intensidade"
            class="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-transparent bg-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 transition duration-150 ease-in-out hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800">
            Intensidade
          </RouterLink>
          <RouterLink to="/servidores/criar"
            class="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-transparent bg-primary-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-primary-700 focus:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:bg-primary-800 dark:focus:ring-offset-gray-800">
            Novo Servidor
          </RouterLink>
        </div>
      </div>
    </template>

    <Card :bordered="false" class="!p-0 overflow-hidden">
      <div class="p-4 border-b border-gray-100 dark:border-gray-700">
        <input
          v-model="search"
          @input="onSearchInput"
          type="text"
          placeholder="Buscar por nome..."
          class="border-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm w-full sm:w-80 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />
      </div>

      <div v-if="loading" class="space-y-2 p-4">
        <Skeleton v-for="i in 5" :key="i" height="h-14" rounded="rounded-lg" />
      </div>

      <template v-else>
        <!-- Desktop: tabela mantida (achado da auditoria: o problema é só no mobile). -->
        <div class="hidden md:block">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900/40">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Nome</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Função(ões)</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Nível</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Status</th>
                <th v-if="auth.isStaff" class="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              <tr v-for="s in servidores" :key="s.id">
                <td class="px-6 py-4">
                  <RouterLink :to="`/servidores/${s.id}`" class="text-primary-600 hover:text-primary-900 font-medium dark:text-primary-400 dark:hover:text-primary-300">
                    {{ s.nome }}
                  </RouterLink>
                  <div class="text-sm text-gray-600 dark:text-gray-400">{{ s.email }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1">
                    <Badge v-for="c in s.categorias" :key="c.id" color="purple">{{ c.categoria.nome }}</Badge>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <Badge color="blue">{{ NIVEL_LABELS[s.nivel] ?? s.nivel }}</Badge>
                </td>
                <td class="px-6 py-4">
                  <Badge :color="s.ativo ? 'green' : 'gray'">{{ s.ativo ? 'Ativo' : 'Inativo' }}</Badge>
                </td>
                <td v-if="auth.isStaff" class="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                  <RouterLink :to="`/servidores/${s.id}/editar`" class="text-primary-600 hover:text-primary-900 text-sm dark:text-primary-400 dark:hover:text-primary-300">Editar</RouterLink>
                  <button type="button" @click="pedirExclusao(s)" class="text-danger-600 hover:text-danger-900 text-sm dark:text-danger-400 dark:hover:text-danger-300">Excluir</button>
                </td>
              </tr>
              <tr v-if="servidores.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-600 dark:text-gray-400">Nenhum servidor encontrado.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile (TASK-0049, docs/tasks/0012-*.md §10.1): card por registro, "Mais" agrupa
             Editar/Excluir num Dropdown -- resolve a área de toque pequena de antes (Editar/
             Excluir como texto adjacente). -->
        <div class="divide-y divide-gray-100 md:hidden dark:divide-gray-700">
          <div v-for="s in servidores" :key="s.id" class="space-y-3 p-4">
            <div class="flex items-center gap-3">
              <Avatar :name="s.nome" size="sm" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{{ s.nome }}</p>
                <p class="truncate text-xs text-gray-600 dark:text-gray-400">{{ s.email }}</p>
              </div>
            </div>
            <div class="flex flex-wrap gap-1">
              <Badge v-for="c in s.categorias" :key="c.id" color="purple">{{ c.categoria.nome }}</Badge>
              <Badge color="blue">{{ NIVEL_LABELS[s.nivel] ?? s.nivel }}</Badge>
              <Badge :color="s.ativo ? 'green' : 'gray'">{{ s.ativo ? 'Ativo' : 'Inativo' }}</Badge>
            </div>
            <div class="flex items-center gap-2">
              <RouterLink :to="`/servidores/${s.id}`"
                class="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                Ver
              </RouterLink>
              <Dropdown v-if="auth.isStaff">
                <template #trigger>
                  <TertiaryButton type="button">Mais</TertiaryButton>
                </template>
                <template #items>
                  <RouterLink :to="`/servidores/${s.id}/editar`" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700">Editar</RouterLink>
                  <button type="button" @click="pedirExclusao(s)" class="block w-full px-4 py-2 text-left text-sm text-danger-600 hover:bg-gray-50 dark:hover:bg-gray-700">Excluir</button>
                </template>
              </Dropdown>
            </div>
          </div>
          <p v-if="servidores.length === 0" class="p-8 text-center text-body-sm text-gray-600 dark:text-gray-400">Nenhum servidor encontrado.</p>
        </div>
      </template>
    </Card>

    <Modal :modelValue="!!paraExcluir" @update:modelValue="(v) => { if (!v) paraExcluir = null }" title="Excluir servidor" maxWidth="max-w-sm">
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
