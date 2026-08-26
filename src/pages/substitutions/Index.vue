<script setup lang="ts">
import { ref, onMounted } from 'vue'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Badge from '@/components/Badge.vue'
import Alert from '@/components/Alert.vue'
import ErrorState from '@/components/ErrorState.vue'
import Modal from '@/components/Modal.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import DangerButton from '@/components/DangerButton.vue'
import { parseDateOnly } from '@/utils/date'

const flash = useFlashStore()
const substituicoes = ref<any[]>([])
const loading = ref(true)
const error = ref(false)
const sugestoesAbertoId = ref<number | null>(null)
const sugestoes = ref<any[]>([])
const loadingSugestoes = ref(false)

// TASK-0076 (correção): antes, uma falha de rede/API deixava a tela presa em "Carregando..." pra
// sempre, sem nenhuma indicação de erro -- catch adicionado + ErrorState com "Tentar novamente".
async function load() {
  loading.value = true
  error.value = false
  try {
    const { data } = await client.get('/substituicoes')
    substituicoes.value = data
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(load)

function formatDate(d: string) {
  return parseDateOnly(d)!.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
}

async function verSugestoes(id: number) {
  if (sugestoesAbertoId.value === id) {
    sugestoesAbertoId.value = null
    return
  }
  sugestoesAbertoId.value = id
  loadingSugestoes.value = true
  try {
    const { data } = await client.get(`/substituicoes/${id}/sugestoes`)
    sugestoes.value = data
  } finally {
    loadingSugestoes.value = false
  }
}

// "Aprovar com este" e "Rejeitar" passam a abrir Modal de confirmação (TASK-0053,
// docs/tasks/0014-*.md, passo "Confirmar" do Fluxo C, antes inexistente) -- mesmos endpoints de
// sempre, só um passo a mais na interação antes de chamá-los.
interface ConfirmacaoAprovar {
  substituicaoId: number
  substitutoId: number
  substitutoNome: string
  titularNome: string
  celebracao: string
  data: string
}
const confirmandoAprovar = ref<ConfirmacaoAprovar | null>(null)
const aprovando = ref(false)

function pedirAprovar(s: any, sug: { servidorId: number; nome: string }) {
  confirmandoAprovar.value = {
    substituicaoId: s.id,
    substitutoId: sug.servidorId,
    substitutoNome: sug.nome,
    titularNome: s.scaleServidor.servidor.nome,
    celebracao: s.scaleServidor.scale.celebracao,
    data: formatDate(s.scaleServidor.scale.dataCelebracao),
  }
}

async function confirmarAprovar() {
  if (!confirmandoAprovar.value) return
  const { substituicaoId, substitutoId } = confirmandoAprovar.value
  aprovando.value = true
  try {
    await client.patch(`/substituicoes/${substituicaoId}/aprovar`, { substitutoId })
    sugestoesAbertoId.value = null
    confirmandoAprovar.value = null
    await load()
    flash.set('success', 'Substituição aprovada!')
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao aprovar')
  } finally {
    aprovando.value = false
  }
}

interface ConfirmacaoRejeitar { id: number; celebracao: string }
const confirmandoRejeitar = ref<ConfirmacaoRejeitar | null>(null)
const rejeitando = ref(false)

function pedirRejeitar(s: any) {
  confirmandoRejeitar.value = { id: s.id, celebracao: s.scaleServidor.scale.celebracao }
}

async function confirmarRejeitar() {
  if (!confirmandoRejeitar.value) return
  rejeitando.value = true
  try {
    await client.patch(`/substituicoes/${confirmandoRejeitar.value.id}/rejeitar`)
    confirmandoRejeitar.value = null
    await load()
    flash.set('success', 'Pedido rejeitado.')
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao rejeitar')
  } finally {
    rejeitando.value = false
  }
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-100">Substituições Pendentes</h2>
    </template>

    <div v-if="loading" class="p-8 text-center text-gray-600 dark:text-gray-400">Carregando...</div>

    <ErrorState v-else-if="error" title="Não foi possível carregar as substituições."
      description="Verifique sua conexão e tente novamente.">
      <template #action><SecondaryButton type="button" @click="load">Tentar novamente</SecondaryButton></template>
    </ErrorState>

    <div v-else class="bg-white shadow-sm rounded-lg p-6 dark:bg-gray-800">
      <div v-if="substituicoes.length" class="space-y-4">
        <div v-for="s in substituicoes" :key="s.id" class="border rounded-lg p-4 border-gray-200 dark:border-gray-600">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <RouterLink :to="`/escalas/${s.scaleServidor.scale.id}`" class="text-primary-600 hover:underline font-medium dark:text-primary-400">
                {{ s.scaleServidor.scale.celebracao }}
              </RouterLink>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ formatDate(s.scaleServidor.scale.dataCelebracao) }} · {{ s.scaleServidor.scale.horario }}
                <span v-if="s.scaleServidor.scale.team"> · {{ s.scaleServidor.scale.team.nome }}</span>
              </p>
              <p class="text-sm mt-1 dark:text-gray-200">
                <span class="text-gray-600 dark:text-gray-400">Titular:</span>
                <span class="font-medium">{{ s.scaleServidor.servidor.nome }}</span>
                <span v-if="s.scaleServidor.instrument" class="text-gray-600 dark:text-gray-400"> · {{ s.scaleServidor.instrument.nome }}</span>
              </p>
              <p v-if="s.motivo" class="text-sm text-gray-500 mt-1 dark:text-gray-400">Motivo: {{ s.motivo }}</p>
            </div>
            <div class="flex items-center gap-2">
              <Badge color="yellow">Pendente</Badge>
              <SecondaryButton @click="verSugestoes(s.id)" class="!py-1.5 !px-3 text-xs">
                {{ sugestoesAbertoId === s.id ? 'Fechar' : 'Ver sugestões' }}
              </SecondaryButton>
              <SecondaryButton @click="pedirRejeitar(s)" class="!py-1.5 !px-3 text-xs">
                Rejeitar
              </SecondaryButton>
            </div>
          </div>

          <!-- "Ver sugestões" continua como expansão inline -- contexto pequeno, não justifica
               Drawer (mesma lógica já aplicada às categorias do ScaleForm, TASK-0009). -->
          <div v-if="sugestoesAbertoId === s.id" class="mt-4 border-t pt-4 border-gray-100 dark:border-gray-700">
            <div v-if="loadingSugestoes" class="text-sm text-gray-600 dark:text-gray-400">Buscando sugestões...</div>
            <!-- "Nenhum substituto sugerido" sem motivo explicado: a API não retorna por que
                 alguém foi excluído (mesma lacuna já registrada em docs/tasks/0009-*.md/
                 0014-*.md, confirmado nesta task contra api/_routes/substituicoes.ts -- usa a
                 mesma suggestServidores() do ScaleForm, sem dado de exclusão). Mensagem
                 genérica mantida, não inventado um motivo. -->
            <Alert v-else-if="!sugestoes.length" type="info">
              Nenhum substituto sugerido para esse dia/horário.
            </Alert>
            <div v-else class="space-y-2">
              <div v-for="sug in sugestoes" :key="sug.servidorId" class="flex items-center justify-between gap-3 p-3 border rounded-md border-gray-200 dark:border-gray-600">
                <div class="min-w-0">
                  <span class="text-sm font-medium dark:text-gray-100">{{ sug.nome }}</span>
                  <p class="text-xs text-gray-500 truncate dark:text-gray-400">{{ sug.motivo }}</p>
                </div>
                <SecondaryButton @click="pedirAprovar(s, sug)" class="!py-1.5 !px-3 text-xs shrink-0">
                  Aprovar com este
                </SecondaryButton>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-sm text-gray-600 dark:text-gray-400">Nenhuma substituição pendente 🎉</p>
    </div>

    <Modal :modelValue="!!confirmandoAprovar" @update:modelValue="(v) => { if (!v) confirmandoAprovar = null }" title="Aprovar substituição" maxWidth="max-w-sm">
      <p v-if="confirmandoAprovar" class="text-body-sm text-gray-600 dark:text-gray-300">
        <strong>{{ confirmandoAprovar.substitutoNome }}</strong> vai substituir
        <strong>{{ confirmandoAprovar.titularNome }}</strong> em
        <strong>{{ confirmandoAprovar.celebracao }}</strong>, {{ confirmandoAprovar.data }}.
      </p>
      <div class="mt-4 flex justify-end gap-2">
        <SecondaryButton type="button" @click="confirmandoAprovar = null">Cancelar</SecondaryButton>
        <PrimaryButton type="button" :loading="aprovando" @click="confirmarAprovar">Aprovar</PrimaryButton>
      </div>
    </Modal>

    <Modal :modelValue="!!confirmandoRejeitar" @update:modelValue="(v) => { if (!v) confirmandoRejeitar = null }" title="Rejeitar pedido" maxWidth="max-w-sm">
      <p class="text-body-sm text-gray-600 dark:text-gray-300">
        Rejeitar o pedido de substituição<span v-if="confirmandoRejeitar"> em <strong>{{ confirmandoRejeitar.celebracao }}</strong></span>?
      </p>
      <div class="mt-4 flex justify-end gap-2">
        <SecondaryButton type="button" @click="confirmandoRejeitar = null">Cancelar</SecondaryButton>
        <DangerButton type="button" :loading="rejeitando" @click="confirmarRejeitar">Rejeitar</DangerButton>
      </div>
    </Modal>
  </AuthenticatedLayout>
</template>
