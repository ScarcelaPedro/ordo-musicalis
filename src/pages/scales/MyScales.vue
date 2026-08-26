<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'
import Skeleton from '@/components/Skeleton.vue'
import ErrorState from '@/components/ErrorState.vue'
import ScaleCard from '@/components/scale/ScaleCard.vue'
import { parseDateOnly } from '@/utils/date'

// Mesmo mapa já usado em ScaleForm.vue/scales/Show.vue -- ainda não centralizado num util
// compartilhado (não é escopo desta task criar esse util, só reaproveitar o dado já disponível
// no pivot de GET /scales?mine=true).
const FUNCAO_LITURGICA_LABELS: Record<string, string> = {
  cerimoniario_1: 'Cerimoniário 1',
  cerimoniario_2: 'Cerimoniário 2',
  librifero: 'Librífero',
  cruciferario: 'Cruciferário',
  ceroferario: 'Ceroferário',
  turiferario: 'Turiferário',
  naveteiro: 'Naveteiro',
}

const auth = useAuthStore()
const flash = useFlashStore()
const scales = ref<any[]>([])
const loading = ref(true)
const error = ref(false)
const confirmingId = ref<number | null>(null)
const recusandoId = ref<number | null>(null)
const motivoAbertoId = ref<number | null>(null)
const motivo = ref('')

// TASK-0076 (correção): antes, uma falha de rede/API deixava a tela presa no Skeleton pra
// sempre, sem nenhuma indicação de erro -- catch adicionado + ErrorState com "Tentar novamente".
async function load() {
  loading.value = true
  error.value = false
  try {
    const { data } = await client.get('/scales', { params: { mine: 'true' } })
    scales.value = data
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(load)

function myPivot(scale: any) {
  return scale.servidores.find((s: any) => s.servidorId === auth.user?.servidorId)
}

// Função/instrumento da pessoa (TASK-0048) -- confirmado que GET /scales?mine=true já retorna
// esses campos no pivot (instrument via include; funcaoLiturgica é coluna escalar, sempre vem),
// nenhum dado novo consultado.
function detalheMinha(scale: any): string | null {
  const pivot = myPivot(scale)
  const parts: string[] = []
  if (pivot?.instrument) parts.push(pivot.instrument.nome)
  if (pivot?.funcaoLiturgica) parts.push(FUNCAO_LITURGICA_LABELS[pivot.funcaoLiturgica] ?? pivot.funcaoLiturgica)
  // Ministério da escala (legado, distinto do teamId do pivot) -- já aparecia na linha de
  // metadados antes; ScaleCard não tem um 4º campo pra isso na subtitle, então entra aqui.
  if (scale.team) parts.push(scale.team.nome)
  return parts.length ? parts.join(' · ') : null
}

function formatDate(d: string) {
  return parseDateOnly(d)!.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

const todayStr = new Date().toISOString().slice(0, 10)
const proximas = computed(() => scales.value.filter((s) => s.dataCelebracao.slice(0, 10) >= todayStr))
const passadas = computed(() =>
  scales.value.filter((s) => s.dataCelebracao.slice(0, 10) < todayStr).slice().reverse()
)

async function confirmar(id: number) {
  confirmingId.value = id
  try {
    await client.patch(`/scales/${id}/confirmar`)
    await load()
    flash.set('success', 'Presença confirmada!')
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao confirmar')
  } finally {
    confirmingId.value = null
  }
}

async function recusar(id: number) {
  recusandoId.value = id
  try {
    await client.patch(`/scales/${id}/recusar`, { motivo: motivo.value || undefined })
    motivoAbertoId.value = null
    motivo.value = ''
    await load()
    flash.set('success', 'Recusa registrada. O coordenador foi avisado para buscar substituto.')
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao recusar')
  } finally {
    recusandoId.value = null
  }
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800">Minha Escala</h2>
    </template>

    <div v-if="loading" class="space-y-6">
      <div class="bg-white shadow-sm rounded-lg p-6 space-y-2 dark:bg-gray-800">
        <Skeleton width="w-40" height="h-4" />
        <Skeleton height="h-16" rounded="rounded-xl" />
        <Skeleton height="h-16" rounded="rounded-xl" />
      </div>
    </div>

    <ErrorState v-else-if="error" title="Não foi possível carregar sua escala."
      description="Verifique sua conexão e tente novamente.">
      <template #action><SecondaryButton type="button" @click="load">Tentar novamente</SecondaryButton></template>
    </ErrorState>

    <div v-else class="space-y-6">
      <div class="bg-white shadow-sm rounded-lg p-6 dark:bg-gray-800">
        <h3 class="font-semibold text-gray-800 mb-4 dark:text-gray-100">Próximas celebrações</h3>
        <div v-if="proximas.length" class="space-y-2">
          <ScaleCard
            v-for="s in proximas" :key="s.id"
            :celebracao="s.celebracao"
            :dataFormatada="formatDate(s.dataCelebracao)"
            :horario="s.horario"
            :comunidade="s.comunidade?.nome"
            :detalhe="detalheMinha(s)"
            :minhaConfirmacao="myPivot(s)?.status"
            :vinculoFixo="myPivot(s)?.origem === 'fixo'"
            :to="`/escalas/${s.id}`"
          >
            <template v-if="myPivot(s)?.status === 'convidado'" #actions>
              <div class="flex flex-wrap items-center gap-2">
                <PrimaryButton :disabled="confirmingId === s.id" @click="confirmar(s.id)" class="!py-1.5 !px-3 text-xs">
                  {{ confirmingId === s.id ? 'Confirmando...' : 'Confirmar' }}
                </PrimaryButton>
                <SecondaryButton v-if="motivoAbertoId !== s.id" @click="motivoAbertoId = s.id" class="!py-1.5 !px-3 text-xs">
                  Não posso ir
                </SecondaryButton>
              </div>
              <div v-if="motivoAbertoId === s.id" class="mt-3 space-y-2">
                <textarea v-model="motivo" rows="2" placeholder="Motivo (opcional)"
                  class="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
                <div class="flex gap-2">
                  <PrimaryButton :disabled="recusandoId === s.id" @click="recusar(s.id)" class="!py-1.5 !px-3 text-xs">
                    {{ recusandoId === s.id ? 'Enviando...' : 'Confirmar recusa' }}
                  </PrimaryButton>
                  <SecondaryButton @click="motivoAbertoId = null; motivo = ''" class="!py-1.5 !px-3 text-xs">Cancelar</SecondaryButton>
                </div>
              </div>
            </template>
          </ScaleCard>
        </div>
        <p v-else class="text-sm text-gray-600 dark:text-gray-400">Nenhuma celebração futura na sua escala.</p>
      </div>

      <div class="bg-white shadow-sm rounded-lg p-6 dark:bg-gray-800">
        <h3 class="font-semibold text-gray-800 mb-4 dark:text-gray-100">Histórico</h3>
        <div v-if="passadas.length" class="space-y-2">
          <ScaleCard
            v-for="s in passadas" :key="s.id"
            :celebracao="s.celebracao"
            :dataFormatada="formatDate(s.dataCelebracao)"
            :horario="s.horario"
            :comunidade="s.comunidade?.nome"
            :detalhe="detalheMinha(s)"
            :minhaConfirmacao="myPivot(s)?.status"
            :vinculoFixo="myPivot(s)?.origem === 'fixo'"
            :to="`/escalas/${s.id}`"
          />
        </div>
        <p v-else class="text-sm text-gray-600 dark:text-gray-400">Nenhuma celebração no histórico.</p>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
