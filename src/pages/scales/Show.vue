<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Badge from '@/components/Badge.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'
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

onMounted(async () => {
  const { data } = await client.get(`/scales/${route.params.id}`)
  scale.value = data
})

function formatDate(d: string) {
  return parseDateOnly(d)!.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

const myPivot = () => auth.user?.musicianId
  ? scale.value?.musicians.find((m: any) => m.musicianId === auth.user!.musicianId)
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

function imprimir() {
  window.print()
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex justify-between items-center flex-wrap gap-2">
        <h2 class="font-semibold text-xl text-gray-800">{{ scale?.celebracao ?? '...' }}</h2>
        <div class="flex gap-2 no-print">
          <button v-if="scale" @click="imprimir"
            class="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-semibold uppercase rounded-md hover:bg-gray-300">
            Imprimir
          </button>
          <RouterLink v-if="auth.isStaff && scale" :to="`/escalas/${scale.id}/editar`"
            class="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-semibold uppercase rounded-md hover:bg-gray-300">
            Editar
          </RouterLink>
          <RouterLink v-if="auth.isStaff && scale" :to="`/escalas/${scale.id}/repertorio`"
            class="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold uppercase rounded-md hover:bg-indigo-700">
            Repertório
          </RouterLink>
        </div>
      </div>
    </template>

    <div v-if="scale" class="space-y-6">
      <div class="bg-white shadow-sm rounded-lg p-6">
        <dl class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <dt class="text-sm font-medium text-gray-500">Data</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ formatDate(scale.dataCelebracao) }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Horário</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ scale.horario }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Status</dt>
            <dd class="mt-1"><Badge :color="scale.status === 'confirmada' ? 'green' : 'yellow'">{{ scale.status }}</Badge></dd>
          </div>
          <div v-if="scale.team">
            <dt class="text-sm font-medium text-gray-500">Ministério</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ scale.team.nome }}</dd>
          </div>
          <div v-if="scale.observacoes" class="sm:col-span-2">
            <dt class="text-sm font-medium text-gray-500">Observações</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ scale.observacoes }}</dd>
          </div>
        </dl>
      </div>

      <!-- Confirmação para músico -->
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

      <!-- Músicos -->
      <div class="bg-white shadow-sm rounded-lg p-6">
        <h3 class="font-semibold text-gray-800 mb-4">Músicos ({{ scale.musicians.length }})</h3>
        <div class="space-y-2">
          <div v-for="m in scale.musicians" :key="m.id" class="flex justify-between items-center py-2 border-b last:border-0">
            <div>
              <span class="text-sm font-medium text-gray-900">{{ m.musician.nome }}</span>
              <span v-if="m.instrument" class="text-xs text-gray-500 ml-2">· {{ m.instrument.nome }}</span>
            </div>
            <Badge :color="STATUS_COLORS[m.status]">{{ STATUS_LABELS[m.status] ?? m.status }}</Badge>
          </div>
          <p v-if="!scale.musicians.length" class="text-sm text-gray-500">Nenhum músico na escala.</p>
        </div>
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
