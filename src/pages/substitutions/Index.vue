<script setup lang="ts">
import { ref, onMounted } from 'vue'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Badge from '@/components/Badge.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'
import { parseDateOnly } from '@/utils/date'

const flash = useFlashStore()
const substituicoes = ref<any[]>([])
const loading = ref(true)
const sugestoesAbertoId = ref<number | null>(null)
const sugestoes = ref<any[]>([])
const loadingSugestoes = ref(false)
const processingId = ref<number | null>(null)

async function load() {
  loading.value = true
  const { data } = await client.get('/substituicoes')
  substituicoes.value = data
  loading.value = false
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

async function aprovar(id: number, substitutoId: number) {
  processingId.value = id
  try {
    await client.patch(`/substituicoes/${id}/aprovar`, { substitutoId })
    sugestoesAbertoId.value = null
    await load()
    flash.set('success', 'Substituição aprovada!')
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao aprovar')
  } finally {
    processingId.value = null
  }
}

async function rejeitar(id: number) {
  if (!confirm('Rejeitar este pedido de substituição?')) return
  processingId.value = id
  try {
    await client.patch(`/substituicoes/${id}/rejeitar`)
    await load()
    flash.set('success', 'Pedido rejeitado.')
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao rejeitar')
  } finally {
    processingId.value = null
  }
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800">Substituições Pendentes</h2>
    </template>

    <div v-if="loading" class="p-8 text-center text-gray-500">Carregando...</div>

    <div v-else class="bg-white shadow-sm rounded-lg p-6">
      <div v-if="substituicoes.length" class="space-y-4">
        <div v-for="s in substituicoes" :key="s.id" class="border rounded-lg p-4 border-gray-200 dark:border-gray-600">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <RouterLink :to="`/escalas/${s.scaleMusician.scale.id}`" class="text-indigo-600 hover:underline font-medium">
                {{ s.scaleMusician.scale.celebracao }}
              </RouterLink>
              <p class="text-sm text-gray-500">
                {{ formatDate(s.scaleMusician.scale.dataCelebracao) }} · {{ s.scaleMusician.scale.horario }}
                <span v-if="s.scaleMusician.scale.team"> · {{ s.scaleMusician.scale.team.nome }}</span>
              </p>
              <p class="text-sm mt-1">
                <span class="text-gray-500">Titular:</span>
                <span class="font-medium">{{ s.scaleMusician.musician.nome }}</span>
                <span v-if="s.scaleMusician.instrument" class="text-gray-500"> · {{ s.scaleMusician.instrument.nome }}</span>
              </p>
              <p v-if="s.motivo" class="text-sm text-gray-500 mt-1">Motivo: {{ s.motivo }}</p>
            </div>
            <div class="flex items-center gap-2">
              <Badge color="yellow">Pendente</Badge>
              <SecondaryButton :disabled="processingId === s.id" @click="verSugestoes(s.id)" class="!py-1.5 !px-3 text-xs">
                {{ sugestoesAbertoId === s.id ? 'Fechar' : 'Ver sugestões' }}
              </SecondaryButton>
              <SecondaryButton :disabled="processingId === s.id" @click="rejeitar(s.id)" class="!py-1.5 !px-3 text-xs">
                Rejeitar
              </SecondaryButton>
            </div>
          </div>

          <div v-if="sugestoesAbertoId === s.id" class="mt-4 border-t pt-4 border-gray-100 dark:border-gray-700">
            <div v-if="loadingSugestoes" class="text-sm text-gray-500">Buscando sugestões...</div>
            <div v-else-if="!sugestoes.length" class="text-sm text-gray-500">Nenhum substituto sugerido para esse dia/horário.</div>
            <div v-else class="space-y-2">
              <div v-for="sug in sugestoes" :key="sug.musicianId" class="flex items-center justify-between gap-3 p-3 border rounded-md border-gray-200 dark:border-gray-600">
                <div class="min-w-0">
                  <span class="text-sm font-medium">{{ sug.nome }}</span>
                  <p class="text-xs text-gray-500 truncate">{{ sug.motivo }}</p>
                </div>
                <SecondaryButton :disabled="processingId === s.id" @click="aprovar(s.id, sug.musicianId)" class="!py-1.5 !px-3 text-xs shrink-0">
                  Aprovar com este
                </SecondaryButton>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-sm text-gray-500">Nenhuma substituição pendente 🎉</p>
    </div>
  </AuthenticatedLayout>
</template>
