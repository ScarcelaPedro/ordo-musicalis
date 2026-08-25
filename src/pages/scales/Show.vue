<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Badge from '@/components/Badge.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'
import CelebrationHeader from '@/components/scale/CelebrationHeader.vue'
import ScaleRole from '@/components/scale/ScaleRole.vue'
import ScaleMember from '@/components/scale/ScaleMember.vue'
import EmptyRole from '@/components/scale/EmptyRole.vue'
import ConflictAlert from '@/components/scale/ConflictAlert.vue'
import { parseDateOnly } from '@/utils/date'
import { STATUS_LABELS, STATUS_COLORS } from '@/utils/status'

const route = useRoute()
const auth = useAuthStore()
const flash = useFlashStore()
const scale = ref<any>(null)
const confirming = ref(false)
const recusando = ref(false)
const mostrarMotivo = ref(false)
const motivo = ref('')
// Lista completa de categorias cadastradas (mesmo endpoint /categorias que ScaleForm.vue já
// usa) -- necessária pra "Equipe da celebração" mostrar também categoria sem ninguém escalado
// (TASK-0041). Sem isso, `gruposPorCategoria` só enxergaria categorias presentes em
// scale.servidores, e uma categoria vazia simplesmente não apareceria (achado da TASK-0010).
const categorias = ref<{ id: number; nome: string; ordem: number }[]>([])

onMounted(async () => {
  const [{ data }, categoriasRes] = await Promise.all([
    client.get(`/scales/${route.params.id}`),
    client.get('/categorias').catch(() => ({ data: [] })),
  ])
  scale.value = data
  categorias.value = categoriasRes.data
})

function formatDate(d: string) {
  return parseDateOnly(d)!.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

const myPivot = () => auth.user?.servidorId
  ? scale.value?.servidores.find((s: any) => s.servidorId === auth.user!.servidorId)
  : null

async function confirmar() {
  confirming.value = true
  try {
    await client.patch(`/scales/${route.params.id}/confirmar`)
    const { data } = await client.get(`/scales/${route.params.id}`)
    scale.value = data
    flash.set('success', 'Presença confirmada!')
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao confirmar')
  } finally {
    confirming.value = false
  }
}

async function recusar() {
  recusando.value = true
  try {
    await client.patch(`/scales/${route.params.id}/recusar`, { motivo: motivo.value || undefined })
    const { data } = await client.get(`/scales/${route.params.id}`)
    scale.value = data
    mostrarMotivo.value = false
    motivo.value = ''
    flash.set('success', 'Recusa registrada. O coordenador foi avisado para buscar substituto.')
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao recusar')
  } finally {
    recusando.value = false
  }
}

const isFuture = () => scale.value && scale.value.dataCelebracao.slice(0, 10) >= new Date().toISOString().slice(0, 10)

const SEM_CATEGORIA = { id: -1, nome: 'Sem função definida', ordem: 999 }

const FUNCAO_LITURGICA_LABELS: Record<string, string> = {
  cerimoniario_1: 'Cerimoniário 1',
  cerimoniario_2: 'Cerimoniário 2',
  librifero: 'Librífero',
  cruciferario: 'Cruciferário',
  ceroferario: 'Ceroferário',
  turiferario: 'Turiferário',
  naveteiro: 'Naveteiro',
}

// Só a categoria Acólitos e Ancilas quebra em duas colunas (pode ter bastante gente:
// Cerimoniários, Ceroferários...), e só quando tem 6+ servidores. As outras categorias
// ficam na lista simples de sempre.
function deveDividir(grupo: { categoria: { nome: string }; servidores: any[] }) {
  return grupo.categoria.nome === 'Acólitos e Ancilas' && grupo.servidores.length >= 6
}

// Preenche a primeira coluna de cima pra baixo, depois a segunda, em vez de ziguezaguear
// linha por linha como o grid faz por padrão.
function colunas(servidores: any[]): any[][] {
  const meio = Math.ceil(servidores.length / 2)
  return [servidores.slice(0, meio), servidores.slice(meio)]
}

const gruposPorCategoria = computed(() => {
  if (!scale.value) return []
  const grupos = new Map<number, { categoria: { id: number; nome: string; ordem: number }; servidores: any[] }>()

  // Começa pela lista completa de categorias cadastradas -- garante que uma categoria sem
  // ninguém escalado ainda apareça (EmptyRole), em vez de simplesmente sumir da tela.
  for (const c of categorias.value) grupos.set(c.id, { categoria: c, servidores: [] })

  for (const s of scale.value.servidores) {
    // "substituido": o registro antigo é só histórico -- o substituto já entra como um novo
    // ScaleServidor ativo (api/_routes/substituicoes.ts), então não conta como presença nem
    // deixa a categoria com vaga.
    if (s.status === 'substituido') continue
    const categoria = s.categoria ?? s.team?.categoria ?? SEM_CATEGORIA
    if (!grupos.has(categoria.id)) grupos.set(categoria.id, { categoria, servidores: [] })
    grupos.get(categoria.id)!.servidores.push(s)
  }
  return Array.from(grupos.values()).sort((a, b) => a.categoria.ordem - b.categoria.ordem)
})

function detalheServidor(s: any): string | null {
  const parts: string[] = []
  if (s.instrument) parts.push(s.instrument.nome)
  if (s.funcaoLiturgica) parts.push(FUNCAO_LITURGICA_LABELS[s.funcaoLiturgica] ?? s.funcaoLiturgica)
  return parts.length ? parts.join(' · ') : null
}

// Faixa-resumo de situação (TASK-0041) -- calculada client-side a partir de
// scale.servidores[].status já carregado, nenhuma nova consulta de API.
const activeServidores = computed(() => (scale.value?.servidores ?? []).filter((s: any) => s.status !== 'substituido'))
const confirmadosCount = computed(() => activeServidores.value.filter((s: any) => s.status === 'confirmado').length)
const pendentesCount   = computed(() => activeServidores.value.filter((s: any) => s.status === 'convidado').length)
const recusadosCount   = computed(() => activeServidores.value.filter((s: any) => s.status === 'recusado').length)
const vagasCount       = computed(() => gruposPorCategoria.value.filter((g) => g.servidores.length === 0).length)

// Alteração recente (TASK-0042, SPEC-004 §32) -- usa só createdAt/updatedAt, já retornados por
// GET /scales/:id hoje (campos escalares do model Scale, confirmado em api/prisma/schema.prisma
// -- não exigiu nenhuma mudança de API). Sem um limiar definido pela spec ("a refinar na
// implementação"), 5 minutos é o suficiente pra distinguir uma edição real do instante da
// própria criação (createdAt/updatedAt nascem praticamente iguais nesse momento).
const LIMIAR_ALTERACAO_MS = 5 * 60 * 1000
const alteradaRecentemente = computed(() => {
  if (!scale.value?.createdAt || !scale.value?.updatedAt) return false
  const criada = new Date(scale.value.createdAt).getTime()
  const atualizada = new Date(scale.value.updatedAt).getTime()
  return atualizada - criada > LIMIAR_ALTERACAO_MS
})

// Conflitos (TASK-0042, SPEC-004 §22) -- nenhum endpoint retorna esse dado hoje (confirmado em
// docs/tasks/0009-*.md: não existe detecção de conflito em lugar nenhum do backend). Este
// computed só lê um campo (`scale.conflitos`) que a API nunca preenche hoje -- nenhuma lógica de
// detecção implementada aqui. Fica pronto para o dia em que o backend passar a retornar esse
// dado; até lá, a lista é sempre vazia e o bloco correspondente no template não renderiza nada.
const conflitos = computed<{ type: 'indisponivel' | 'ja-escalado' | 'incompativel'; detail?: string }[]>(
  () => scale.value?.conflitos ?? [],
)

function imprimir() {
  window.print()
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex justify-between items-center flex-wrap gap-2">
        <h2 class="font-semibold text-xl text-gray-800">{{ scale?.celebracao ?? '...' }}</h2>
        <div class="flex flex-wrap gap-2 no-print">
          <button v-if="scale" @click="imprimir"
            class="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-semibold uppercase rounded-md hover:bg-gray-300">
            Imprimir
          </button>
          <RouterLink v-if="auth.isStaff && scale" :to="`/escalas/${scale.id}/repertorio`"
            class="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-semibold uppercase rounded-md hover:bg-gray-300">
            Repertório
          </RouterLink>
          <RouterLink v-if="auth.isStaff && scale" :to="`/escalas/${scale.id}/editar`"
            class="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-semibold uppercase rounded-md hover:bg-gray-300">
            Editar
          </RouterLink>
          <RouterLink v-if="scale" :to="`/escalas/${scale.id}/liturgia`"
            class="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold uppercase rounded-md hover:bg-indigo-700">
            Liturgia
          </RouterLink>
        </div>
      </div>
    </template>

    <div v-if="scale" class="space-y-6">
      <div class="bg-white shadow-sm rounded-lg p-6 space-y-4 dark:bg-gray-800">
        <CelebrationHeader
          :celebracao="scale.celebracao"
          :dataFormatada="formatDate(scale.dataCelebracao)"
          :horario="scale.horario"
          :comunidade="scale.comunidade?.nome"
          :celebrante="scale.celebrante?.nome"
        />

        <p v-if="alteradaRecentemente" class="-mt-2 inline-flex items-center gap-1.5 text-body-sm font-medium text-warning-700 dark:text-warning-300">
          <span class="h-1.5 w-1.5 rounded-full bg-warning-500" aria-hidden="true"></span>
          Escala atualizada
        </p>

        <!-- Informações secundárias -- Data/Horário/Comunidade já aparecem no subtítulo do
             CelebrationHeader acima; nada foi removido, só reorganizado por hierarquia
             (TASK-0040). Ministério/Observações ficam aqui, rebaixados visualmente, até a
             TASK-0041 desenhar a seção "Situação da equipe" completa. -->
        <dl class="grid grid-cols-1 gap-3 border-t border-gray-100 pt-4 text-body-sm sm:grid-cols-3 dark:border-gray-700">
          <div>
            <dt class="text-gray-600 dark:text-gray-400">Status</dt>
            <dd class="mt-1"><Badge :color="scale.status === 'confirmada' ? 'green' : 'yellow'">{{ scale.status }}</Badge></dd>
          </div>
          <div v-if="scale.team">
            <dt class="text-gray-600 dark:text-gray-400">Ministério responsável</dt>
            <dd class="mt-1 text-gray-700 dark:text-gray-200">{{ scale.team.nome }}</dd>
          </div>
          <div v-if="scale.observacoes" class="sm:col-span-3">
            <dt class="text-gray-600 dark:text-gray-400">Observações</dt>
            <dd class="mt-1 text-gray-700 dark:text-gray-200">{{ scale.observacoes }}</dd>
          </div>
        </dl>
      </div>

      <!-- Conflitos (TASK-0042) -- só renderiza se `scale.conflitos` vier preenchido pela API;
           hoje esse campo não existe em nenhum endpoint (pendência registrada, ver notas de
           progresso), então este bloco fica pronto mas normalmente invisível. -->
      <div v-if="conflitos.length" class="space-y-2">
        <ConflictAlert v-for="(c, idx) in conflitos" :key="idx" :type="c.type" :detail="c.detail" />
      </div>

      <!-- Confirmação para servidor -->
      <div v-if="auth.isMusico && myPivot()" class="bg-white shadow-sm rounded-lg p-6">
        <h3 class="font-semibold text-gray-800 mb-3">Minha confirmação</h3>
        <div class="flex items-center gap-4 flex-wrap">
          <Badge :color="STATUS_COLORS[myPivot()?.status]">{{ STATUS_LABELS[myPivot()?.status] ?? myPivot()?.status }}</Badge>
          <template v-if="isFuture() && ['convidado'].includes(myPivot()?.status)">
            <PrimaryButton :disabled="confirming" @click="confirmar">
              {{ confirming ? 'Confirmando...' : 'Confirmar presença' }}
            </PrimaryButton>
            <SecondaryButton v-if="!mostrarMotivo" @click="mostrarMotivo = true">Não posso ir</SecondaryButton>
          </template>
        </div>
        <div v-if="mostrarMotivo" class="mt-4 space-y-2">
          <textarea v-model="motivo" rows="2" placeholder="Motivo (opcional)"
            class="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
          <div class="flex gap-2">
            <PrimaryButton :disabled="recusando" @click="recusar">{{ recusando ? 'Enviando...' : 'Confirmar recusa' }}</PrimaryButton>
            <SecondaryButton @click="mostrarMotivo = false; motivo = ''">Cancelar</SecondaryButton>
          </div>
        </div>
      </div>

      <!-- Servidores, agrupados por categoria de função -->
      <div class="bg-white shadow-sm rounded-lg p-6 dark:bg-gray-800">
        <h3 class="font-semibold text-gray-800 mb-4 dark:text-gray-100">Equipe da celebração ({{ activeServidores.length }})</h3>

        <!-- Faixa-resumo (TASK-0041) -- contagem calculada de scale.servidores[].status, sem
             nova consulta de API. -->
        <div class="mb-4 flex flex-wrap gap-x-5 gap-y-2 border-b border-gray-100 pb-4 text-body-sm dark:border-gray-700">
          <span class="flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full bg-success-500" aria-hidden="true"></span>
            <span class="font-semibold text-gray-800 dark:text-gray-100">{{ confirmadosCount }}</span>
            <span class="text-gray-600 dark:text-gray-400">confirmados</span>
          </span>
          <span class="flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full bg-warning-500" aria-hidden="true"></span>
            <span class="font-semibold text-gray-800 dark:text-gray-100">{{ pendentesCount }}</span>
            <span class="text-gray-600 dark:text-gray-400">pendentes</span>
          </span>
          <span class="flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full bg-danger-500" aria-hidden="true"></span>
            <span class="font-semibold text-gray-800 dark:text-gray-100">{{ recusadosCount }}</span>
            <span class="text-gray-600 dark:text-gray-400">recusados</span>
          </span>
          <span class="flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" aria-hidden="true"></span>
            <span class="font-semibold text-gray-800 dark:text-gray-100">{{ vagasCount }}</span>
            <span class="text-gray-600 dark:text-gray-400">vagas</span>
          </span>
        </div>

        <div v-if="gruposPorCategoria.length" class="space-y-5">
          <ScaleRole v-for="grupo in gruposPorCategoria" :key="grupo.categoria.id" :nome="grupo.categoria.nome" :count="grupo.servidores.length">
            <EmptyRole v-if="!grupo.servidores.length">
              <template v-if="auth.isStaff" #action>
                <RouterLink :to="`/escalas/${scale.id}/editar`" class="text-body-sm font-semibold text-primary-600 hover:underline dark:text-primary-400">
                  Resolver
                </RouterLink>
              </template>
            </EmptyRole>

            <div v-else-if="deveDividir(grupo)" class="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              <div v-for="(coluna, ci) in colunas(grupo.servidores)" :key="ci" class="space-y-2">
                <ScaleMember
                  v-for="s in coluna" :key="s.id"
                  :nome="s.servidor.nome"
                  :detalhe="detalheServidor(s)"
                  :status="s.status"
                  :vinculoFixo="s.origem === 'fixo'"
                />
              </div>
            </div>

            <template v-else>
              <ScaleMember
                v-for="s in grupo.servidores" :key="s.id"
                :nome="s.servidor.nome"
                :detalhe="detalheServidor(s)"
                :status="s.status"
                :vinculoFixo="s.origem === 'fixo'"
              />
            </template>
          </ScaleRole>
        </div>
        <p v-else class="text-sm text-gray-600 dark:text-gray-400">Nenhuma categoria cadastrada nem servidor na escala.</p>
      </div>

      <!-- Repertório -->
      <div v-if="scale.repertoire" class="bg-white shadow-sm rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-semibold text-gray-800">Repertório: {{ scale.repertoire.titulo }}</h3>
          <RouterLink :to="`/escalas/${scale.id}/repertorio`" class="text-sm text-indigo-600 hover:underline">Ver completo</RouterLink>
        </div>
        <ol class="space-y-1">
          <li v-for="item in scale.repertoire.items" :key="item.id" class="flex items-center gap-3 text-sm py-1.5 border-b last:border-0">
            <span class="text-gray-400 w-5 text-right">{{ item.ordem }}.</span>
            <span class="flex-1">{{ item.tituloMusica }}</span>
            <span v-if="item.tom" class="text-xs bg-gray-100 px-2 py-0.5 rounded">{{ item.tom }}</span>
          </li>
        </ol>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
