<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Badge from '@/components/Badge.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import { parseDateOnly } from '@/utils/date'

const auth = useAuthStore()
const flash = useFlashStore()
const scales = ref<any[]>([])
const loading = ref(true)
const confirmingId = ref<number | null>(null)

async function load() {
  loading.value = true
  const { data } = await client.get('/scales', { params: { mine: 'true' } })
  scales.value = data
  loading.value = false
}

onMounted(load)

function myPivot(scale: any) {
  return scale.musicians.find((m: any) => m.musicianId === auth.user?.musicianId)
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
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800">Minha Escala</h2>
    </template>

    <div v-if="loading" class="p-8 text-center text-gray-500">Carregando...</div>

    <div v-else class="space-y-6">
      <div class="bg-white shadow-sm rounded-lg p-6">
        <h3 class="font-semibold text-gray-800 mb-4">Próximas celebrações</h3>
        <div v-if="proximas.length" class="space-y-2">
          <div v-for="s in proximas" :key="s.id" class="flex flex-wrap items-center justify-between gap-3 py-3 border-b last:border-0">
            <div>
              <RouterLink :to="`/escalas/${s.id}`" class="text-indigo-600 hover:underline font-medium">{{ s.celebracao }}</RouterLink>
              <p class="text-sm text-gray-500">
                {{ formatDate(s.dataCelebracao) }} · {{ s.horario }}
                <span v-if="s.team"> · {{ s.team.nome }}</span>
              </p>
            </div>
            <div class="flex items-center gap-3">
              <Badge :color="myPivot(s)?.confirmado ? 'green' : 'yellow'">
                {{ myPivot(s)?.confirmado ? 'Confirmado' : 'Pendente' }}
              </Badge>
              <PrimaryButton v-if="!myPivot(s)?.confirmado" :disabled="confirmingId === s.id" @click="confirmar(s.id)" class="!py-1.5 !px-3 text-xs">
                {{ confirmingId === s.id ? 'Confirmando...' : 'Confirmar' }}
              </PrimaryButton>
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-gray-500">Nenhuma celebração futura na sua escala.</p>
      </div>

      <div class="bg-white shadow-sm rounded-lg p-6">
        <h3 class="font-semibold text-gray-800 mb-4">Histórico</h3>
        <div v-if="passadas.length" class="space-y-2">
          <div v-for="s in passadas" :key="s.id" class="flex flex-wrap items-center justify-between gap-3 py-3 border-b last:border-0">
            <div>
              <RouterLink :to="`/escalas/${s.id}`" class="text-indigo-600 hover:underline font-medium">{{ s.celebracao }}</RouterLink>
              <p class="text-sm text-gray-500">
                {{ formatDate(s.dataCelebracao) }} · {{ s.horario }}
                <span v-if="s.team"> · {{ s.team.nome }}</span>
              </p>
            </div>
            <Badge :color="myPivot(s)?.confirmado ? 'green' : 'yellow'">
              {{ myPivot(s)?.confirmado ? 'Confirmado' : 'Pendente' }}
            </Badge>
          </div>
        </div>
        <p v-else class="text-sm text-gray-500">Nenhuma celebração no histórico.</p>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
