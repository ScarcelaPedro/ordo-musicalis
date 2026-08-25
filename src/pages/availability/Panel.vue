<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Badge from '@/components/Badge.vue'
import Card from '@/components/Card.vue'
import Skeleton from '@/components/Skeleton.vue'
import Modal from '@/components/Modal.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'
import DangerButton from '@/components/DangerButton.vue'
import { parseDateOnly } from '@/utils/date'

const flash = useFlashStore()
const availabilities = ref<any[]>([])
const windows = ref<any[]>([])
const pendentes = ref<any[]>([])
// Universo de servidores ativos (TASK-0051) -- reaproveita o endpoint /servidores já existente
// (mesmo usado em servidores/Index.vue, ScaleForm.vue etc.) só para calcular o complemento de
// "quem já respondeu" a partir de "quem ainda não respondeu" (já retornado pelo endpoint de
// pendentes) -- nenhum endpoint novo, nenhuma regra de disponibilidade nova.
const servidoresAtivos = ref<any[]>([])
const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const periodoLabel: Record<string, string> = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' }
const periodoLabelCurto: Record<string, string> = { manha: 'Man', tarde: 'Tar', noite: 'Noi' }
const periodos = ['manha', 'tarde', 'noite'] as const

const novaJanela = ref({ mes: new Date().toISOString().slice(0, 7), prazo: '' })
const creating = ref(false)
// Não existia estado de loading neste componente (achado confirmado em docs/tasks/0013-*.md) --
// corrigido nesta task.
const loading = ref(true)
const busca = ref('')

async function load() {
  loading.value = true
  const [avail, wins, svs] = await Promise.all([
    client.get('/availability/panel'),
    client.get('/availability-windows'),
    client.get('/servidores'),
  ])
  availabilities.value = avail.data
  windows.value = wins.data
  servidoresAtivos.value = (svs.data as any[]).filter((s) => s.ativo)
  await loadPendentes()
  loading.value = false
}

async function loadPendentes() {
  const atual = windows.value.find((w) => w.ativo)
  if (!atual) { pendentes.value = []; return }
  const { data } = await client.get(`/availability-windows/${atual.id}/pendentes`)
  pendentes.value = data
}

onMounted(load)

const janelaAtiva = computed(() => windows.value.find((w) => w.ativo))

// Seção simétrica "Já responderam" (TASK-0051, docs/tasks/0013-*.md): complemento de
// `pendentes` sobre o universo de servidores ativos -- só faz sentido com uma janela ativa
// (sem janela, "pendentes" fica vazio por definição, não porque todo mundo respondeu).
const respondidos = computed(() => {
  if (!janelaAtiva.value) return []
  const pendentesIds = new Set(pendentes.value.map((p: any) => p.id))
  return servidoresAtivos.value.filter((s) => !pendentesIds.has(s.id))
})

function formatMes(mes: string) {
  const [ano, m] = mes.split('-')
  const nomes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
  return `${nomes[Number(m) - 1]}/${ano}`
}

async function criarJanela() {
  if (!novaJanela.value.prazo) {
    flash.set('error', 'Informe o prazo')
    return
  }
  creating.value = true
  try {
    await client.post('/availability-windows', novaJanela.value)
    flash.set('success', 'Janela de coleta aberta!')
    novaJanela.value.prazo = ''
    await load()
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao abrir janela')
  } finally {
    creating.value = false
  }
}

// "Fechar janela" via Modal (TASK-0051), substituindo o confirm() nativo -- mesma chamada
// PATCH /availability-windows/:id, só disparada ao confirmar no modal.
const confirmandoFechar = ref(false)
const fechando = ref(false)

async function confirmarFecharJanela() {
  if (!janelaAtiva.value) return
  fechando.value = true
  try {
    await client.patch(`/availability-windows/${janelaAtiva.value.id}`, { ativo: false })
    confirmandoFechar.value = false
    await load()
  } finally {
    fechando.value = false
  }
}

// A grade só mostra disponibilidade recorrente semanal (diaSemana !== null) -- exceções
// pontuais cadastradas em /disponibilidade não aparecem aqui. Lacuna de dado já registrada em
// docs/tasks/0013-*.md, não resolvida nesta task (fora do escopo desta etapa).
const byServidor = computed(() => {
  const map: Record<string, any> = {}
  availabilities.value.forEach((a) => {
    const key = a.servidor.nome
    if (!map[key]) map[key] = { nome: key, slots: [] }
    if (a.diaSemana !== null) {
      map[key].slots.push({ dia: a.diaSemana, periodo: a.periodo })
    }
  })
  return Object.values(map)
})

// Busca por nome (TASK-0051, docs/tasks/0013-*.md) -- filtro client-side sobre dado já
// carregado, sem nova chamada de API (mesmo padrão de busca das listagens administrativas,
// só que sem debounce, já que não dispara requisição nenhuma).
const byServidorFiltrado = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  if (!termo) return byServidor.value
  return byServidor.value.filter((sv: any) => sv.nome.toLowerCase().includes(termo))
})

function temSlot(sv: any, dia: number, periodo: string) {
  return sv.slots.some((s: any) => s.dia === dia && s.periodo === periodo)
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-100">Painel de Disponibilidade</h2>
    </template>

    <div class="space-y-6">
      <!-- Janela de coleta -->
      <Card>
        <h3 class="font-medium text-gray-800 mb-3 dark:text-gray-100">Janela de coleta</h3>

        <div v-if="janelaAtiva" class="flex flex-wrap items-center justify-between gap-3 bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4 dark:bg-primary-900/20 dark:border-primary-800">
          <p class="text-sm text-primary-800 dark:text-primary-200">
            Aberta para <strong>{{ formatMes(janelaAtiva.mes) }}</strong> — prazo
            <strong>{{ parseDateOnly(janelaAtiva.prazo)!.toLocaleDateString('pt-BR') }}</strong>
          </p>
          <button type="button" @click="confirmandoFechar = true" class="text-sm text-danger-600 hover:text-danger-800 dark:text-danger-400 dark:hover:text-danger-300">Fechar janela</button>
        </div>

        <div v-if="!janelaAtiva" class="flex flex-wrap items-end gap-4">
          <div>
            <label for="janela-mes" class="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Mês</label>
            <input id="janela-mes" v-model="novaJanela.mes" type="month" class="border-gray-300 rounded-md shadow-sm text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
          </div>
          <div>
            <label for="janela-prazo" class="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Prazo pra responder</label>
            <input id="janela-prazo" v-model="novaJanela.prazo" type="date" class="border-gray-300 rounded-md shadow-sm text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
          </div>
          <PrimaryButton :disabled="creating" @click="criarJanela">
            {{ creating ? 'Abrindo...' : 'Abrir janela' }}
          </PrimaryButton>
        </div>

        <!-- Seção simétrica "Já responderam"/"Ainda não responderam" (TASK-0051) -- antes só a
             segunda existia. -->
        <div v-if="janelaAtiva" class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Já responderam ({{ respondidos.length }})</h4>
            <div v-if="respondidos.length" class="flex flex-wrap gap-2">
              <Badge v-for="s in respondidos" :key="s.id" color="green">{{ s.nome }}</Badge>
            </div>
            <p v-else class="text-sm text-gray-600 dark:text-gray-400">Ninguém respondeu ainda.</p>
          </div>
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Ainda não responderam ({{ pendentes.length }})</h4>
            <div v-if="pendentes.length" class="flex flex-wrap gap-2">
              <Badge v-for="p in pendentes" :key="p.id" color="yellow">{{ p.nome }}</Badge>
            </div>
            <p v-else class="text-sm text-gray-600 dark:text-gray-400">Todo mundo já respondeu 🎉</p>
          </div>
        </div>
      </Card>

      <!-- Grade de disponibilidade -->
      <Card :bordered="false" class="!p-0 overflow-hidden">
        <div class="p-4 border-b border-gray-100 dark:border-gray-700">
          <input
            v-model="busca"
            type="text"
            placeholder="Buscar servidor por nome..."
            class="border-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm w-full sm:w-80 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        <div v-if="loading" class="space-y-2 p-4">
          <Skeleton v-for="i in 5" :key="i" height="h-14" rounded="rounded-lg" />
        </div>

        <template v-else>
          <!-- Desktop: grade Servidor × 7 dias mantida (favorece comparação, §11.1). -->
          <div class="hidden md:block">
            <table class="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Servidor</th>
                  <th v-for="(dia, idx) in dias" :key="idx" class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{{ dia }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="sv in byServidorFiltrado" :key="sv.nome">
                  <td class="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{{ sv.nome }}</td>
                  <td v-for="(_, idx) in dias" :key="idx" class="px-3 py-4 text-center">
                    <div class="flex flex-col gap-0.5 items-center">
                      <span
                        v-for="slot in sv.slots.filter((s: any) => s.dia === idx)"
                        :key="slot.periodo"
                        class="text-xs bg-success-100 text-success-700 px-1.5 py-0.5 rounded dark:bg-success-900 dark:text-success-200"
                      >
                        {{ periodoLabel[slot.periodo] }}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr v-if="byServidorFiltrado.length === 0">
                  <td :colspan="dias.length + 1" class="px-6 py-8 text-center text-gray-600 dark:text-gray-400">Nenhuma disponibilidade registrada.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile (TASK-0051, docs/tasks/0013-*.md §11.2): card por servidor com mini-grade
               compacta 7×3, em vez do mockup literal linha-a-linha (geraria até 21 linhas por
               pessoa). Legenda ✓/— pra não depender só de cor. -->
          <div class="md:hidden">
            <p class="px-4 pt-3 text-xs text-gray-600 dark:text-gray-400">✓ disponível nesse período · — indisponível/não informado</p>
            <div class="divide-y divide-gray-100 dark:divide-gray-700">
              <div v-for="sv in byServidorFiltrado" :key="sv.nome" class="p-4">
                <p class="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{{ sv.nome }}</p>
                <div class="grid grid-cols-[3rem_repeat(7,1fr)] items-center gap-x-1 gap-y-1 text-center text-[11px]">
                  <span></span>
                  <span v-for="(dia, idx) in dias" :key="idx" class="font-semibold text-gray-600 dark:text-gray-400">{{ dia }}</span>
                  <template v-for="periodo in periodos" :key="periodo">
                    <span class="text-left text-gray-600 dark:text-gray-400">{{ periodoLabelCurto[periodo] }}</span>
                    <span
                      v-for="(_, idx) in dias" :key="idx"
                      :class="temSlot(sv, idx, periodo) ? 'text-success-600 dark:text-success-400 font-semibold' : 'text-gray-300 dark:text-gray-600'"
                    >
                      {{ temSlot(sv, idx, periodo) ? '✓' : '—' }}
                    </span>
                  </template>
                </div>
              </div>
              <p v-if="byServidorFiltrado.length === 0" class="p-8 text-center text-body-sm text-gray-600 dark:text-gray-400">Nenhuma disponibilidade registrada.</p>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <Modal v-model="confirmandoFechar" title="Fechar janela de coleta" maxWidth="max-w-sm">
      <p class="text-body-sm text-gray-600 dark:text-gray-300">
        Fechar a coleta de disponibilidade<span v-if="janelaAtiva"> de <strong>{{ formatMes(janelaAtiva.mes) }}</strong></span>?
        Servidores não poderão mais responder.
      </p>
      <div class="mt-4 flex justify-end gap-2">
        <SecondaryButton type="button" @click="confirmandoFechar = false">Cancelar</SecondaryButton>
        <DangerButton type="button" :loading="fechando" @click="confirmarFecharJanela">Fechar janela</DangerButton>
      </div>
    </Modal>
  </AuthenticatedLayout>
</template>
