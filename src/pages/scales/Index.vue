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
import TertiaryButton from '@/components/TertiaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'
import DangerButton from '@/components/DangerButton.vue'
import { parseDateOnly, toMonthValue } from '@/utils/date'

const auth = useAuthStore()
const flash = useFlashStore()
const scales = ref<any[]>([])
const comunidades = ref<any[]>([])
// Opens on the current month so the list isn't flooded with every scale ever created.
const filterMes = ref(toMonthValue())
const filterComunidade = ref('')
// Não existia estado de loading nesta tela (achado confirmado em docs/tasks/0012-*.md) --
// corrigido nesta task.
const loading = ref(true)
const error = ref(false)

// TASK-0076 (correção): antes, uma falha de rede/API deixava a tela presa no Skeleton pra
// sempre, sem nenhuma indicação de erro -- catch adicionado + ErrorState com "Tentar novamente".
async function load() {
  loading.value = true
  error.value = false
  const params: Record<string, string> = {}
  if (filterMes.value) params.mes = filterMes.value
  if (filterComunidade.value) params.comunidadeId = filterComunidade.value
  try {
    const { data } = await client.get('/scales', { params })
    scales.value = data
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const [, cm, cel] = await Promise.all([
    load(),
    client.get('/comunidades'),
    auth.isStaff ? client.get('/celebrantes') : Promise.resolve({ data: [] }),
  ])
  comunidades.value = cm.data
  celebrantes.value = cel.data
})

// Quick celebrant assignment straight from the list: a single-field PATCH instead of opening
// and saving the whole scale form.
const celebrantes = ref<{ id: number; nome: string }[]>([])
const savingCelebrante = ref<number | null>(null)

async function setCelebrante(s: any, value: string) {
  const celebranteId = value ? Number(value) : null
  const previous = { celebranteId: s.celebranteId, celebrante: s.celebrante, celebracao: s.celebracao }
  s.celebranteId = celebranteId
  s.celebrante = celebrantes.value.find((c) => c.id === celebranteId) ?? null
  savingCelebrante.value = s.id
  try {
    const { data } = await client.patch(`/scales/${s.id}`, { celebranteId })
    // The API may rename the celebration (deacon → "Celebração da Palavra", ADR-0008).
    s.celebracao = data.celebracao
    if (data.celebracao !== previous.celebracao) flash.set('success', `Celebrante definido. A celebração passou a ser "${data.celebracao}".`)
    else flash.set('success', celebranteId ? 'Celebrante definido.' : 'Celebrante removido.')
  } catch (e: any) {
    Object.assign(s, previous)
    flash.set('error', e.response?.data?.message ?? 'Erro ao salvar celebrante')
  } finally {
    savingCelebrante.value = null
  }
}

function formatDate(d: string) {
  return parseDateOnly(d)!.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Exclusão via Modal (TASK-0050), substituindo o confirm() nativo -- mesma chamada
// DELETE /scales/:id, só disparada ao confirmar no modal.
const paraExcluir = ref<{ id: number; celebracao: string } | null>(null)
const excluindo = ref(false)

function pedirExclusao(s: { id: number; celebracao: string }) {
  paraExcluir.value = s
}

async function confirmarExclusao() {
  if (!paraExcluir.value) return
  excluindo.value = true
  try {
    await client.delete(`/scales/${paraExcluir.value.id}`)
    scales.value = scales.value.filter((s) => s.id !== paraExcluir.value!.id)
    flash.set('success', 'Escala excluída.')
    paraExcluir.value = null
  } finally {
    excluindo.value = false
  }
}

async function copiarLinkPublico() {
  const url = `${window.location.origin}/publico`
  await navigator.clipboard.writeText(url)
  flash.set('success', 'Link público copiado!')
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex flex-wrap justify-between items-center gap-3">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-100">Escalas</h2>
        <div v-if="auth.isStaff" class="flex flex-wrap gap-2">
          <button type="button" @click="copiarLinkPublico" class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 text-xs font-semibold uppercase rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
            Copiar link público
          </button>
          <RouterLink to="/escalas-recorrentes" class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 text-xs font-semibold uppercase rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
            Recorrências
          </RouterLink>
          <RouterLink to="/escalas/criar" class="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-xs font-semibold uppercase rounded-md hover:bg-primary-700">
            Nova Escala
          </RouterLink>
        </div>
      </div>
    </template>

    <Card :bordered="false" class="!p-0 overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex flex-wrap gap-4 dark:border-gray-700">
        <input v-model="filterMes" @change="load" type="month" aria-label="Filtrar por mês" class="border-gray-300 rounded-md shadow-sm text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
        <select v-if="comunidades.length > 1" v-model="filterComunidade" @change="load" aria-label="Filtrar por comunidade" class="border-gray-300 rounded-md shadow-sm text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
          <option value="">Todas as comunidades</option>
          <option v-for="c in comunidades" :key="c.id" :value="c.id">{{ c.nome }}</option>
        </select>
      </div>

      <div v-if="loading" class="space-y-2 p-4">
        <Skeleton v-for="i in 5" :key="i" height="h-14" rounded="rounded-lg" />
      </div>

      <ErrorState v-else-if="error" title="Não foi possível carregar as escalas."
        description="Verifique sua conexão e tente novamente.">
        <template #action><SecondaryButton type="button" @click="load">Tentar novamente</SecondaryButton></template>
      </ErrorState>

      <template v-else>
        <div class="hidden md:block">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900/40">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Data</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Celebração</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Comunidade</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Celebrante</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Status</th>
                <th class="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              <tr v-for="s in scales" :key="s.id">
                <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-gray-100">{{ formatDate(s.dataCelebracao) }}</td>
                <td class="px-6 py-4">
                  <RouterLink :to="`/escalas/${s.id}`" class="text-primary-600 hover:text-primary-900 font-medium dark:text-primary-400 dark:hover:text-primary-300">
                    {{ s.celebracao }}
                  </RouterLink>
                  <div class="text-xs text-gray-600 dark:text-gray-400">{{ s.horario }}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ s.comunidade?.nome ?? '—' }}</td>
                <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  <select v-if="auth.isStaff" :value="s.celebranteId ?? ''" :disabled="savingCelebrante === s.id"
                    @change="setCelebrante(s, ($event.target as HTMLSelectElement).value)"
                    :aria-label="`Celebrante de ${s.celebracao}`"
                    class="w-full min-w-40 border-gray-300 rounded-md shadow-sm text-sm disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                    <option value="">— Sem celebrante —</option>
                    <option v-for="c in celebrantes" :key="c.id" :value="c.id">{{ c.nome }}</option>
                  </select>
                  <template v-else>{{ s.celebrante?.nome ?? '—' }}</template>
                </td>
                <td class="px-6 py-4">
                  <Badge :color="s.status === 'confirmada' ? 'green' : 'yellow'">{{ s.status }}</Badge>
                </td>
                <td class="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                  <RouterLink :to="`/escalas/${s.id}`" class="text-gray-600 hover:text-gray-900 text-sm dark:text-gray-300 dark:hover:text-gray-100">Ver</RouterLink>
                  <template v-if="auth.isStaff">
                    <RouterLink :to="`/escalas/${s.id}/editar`" class="text-primary-600 hover:text-primary-900 text-sm dark:text-primary-400 dark:hover:text-primary-300">Editar</RouterLink>
                    <button type="button" @click="pedirExclusao(s)" class="text-danger-600 hover:text-danger-900 text-sm dark:text-danger-400 dark:hover:text-danger-300">Excluir</button>
                  </template>
                </td>
              </tr>
              <tr v-if="scales.length === 0">
                <td colspan="6"class="px-6 py-8 text-center text-gray-600 dark:text-gray-400">Nenhuma escala encontrada.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="divide-y divide-gray-100 md:hidden dark:divide-gray-700">
          <div v-for="s in scales" :key="s.id" class="space-y-3 p-4">
            <div>
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ s.celebracao }}</p>
              <p class="text-xs text-gray-600 dark:text-gray-400">
                {{ formatDate(s.dataCelebracao) }} · {{ s.horario }}
                <span v-if="s.comunidade"> · {{ s.comunidade.nome }}</span>
              </p>
            </div>
            <select v-if="auth.isStaff" :value="s.celebranteId ?? ''" :disabled="savingCelebrante === s.id"
              @change="setCelebrante(s, ($event.target as HTMLSelectElement).value)"
              :aria-label="`Celebrante de ${s.celebracao}`"
              class="w-full min-h-11 border-gray-300 rounded-md shadow-sm text-sm disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
              <option value="">— Sem celebrante —</option>
              <option v-for="c in celebrantes" :key="c.id" :value="c.id">{{ c.nome }}</option>
            </select>
            <p v-else-if="s.celebrante" class="text-xs text-gray-600 dark:text-gray-400">Celebrante: {{ s.celebrante.nome }}</p>
            <div class="flex flex-wrap gap-1">
              <Badge :color="s.status === 'confirmada' ? 'green' : 'yellow'">{{ s.status }}</Badge>
            </div>
            <div class="flex items-center gap-2">
              <RouterLink :to="`/escalas/${s.id}`"
                class="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                Ver
              </RouterLink>
              <Dropdown v-if="auth.isStaff">
                <template #trigger>
                  <TertiaryButton type="button">Mais</TertiaryButton>
                </template>
                <template #items>
                  <RouterLink :to="`/escalas/${s.id}/editar`" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700">Editar</RouterLink>
                  <button type="button" @click="pedirExclusao(s)" class="block w-full px-4 py-2 text-left text-sm text-danger-600 hover:bg-gray-50 dark:hover:bg-gray-700">Excluir</button>
                </template>
              </Dropdown>
            </div>
          </div>
          <p v-if="scales.length === 0" class="p-8 text-center text-body-sm text-gray-600 dark:text-gray-400">Nenhuma escala encontrada.</p>
        </div>
      </template>
    </Card>

    <Modal :modelValue="!!paraExcluir" @update:modelValue="(v) => { if (!v) paraExcluir = null }" title="Excluir escala" maxWidth="max-w-sm">
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
