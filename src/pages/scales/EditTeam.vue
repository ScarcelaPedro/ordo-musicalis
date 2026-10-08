<script setup lang="ts">
// Team-only edit (TASK-0133, ADR-0009): for community coordinators, who may change who serves in
// a celebration of their community but nothing else about it. Reuses the scale form in 'team'
// mode and saves through PUT /scales/:id/servidores -- the API decides access by the scale's stored
// community; this page only avoids showing a form that would be refused.
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Card from '@/components/Card.vue'
import Skeleton from '@/components/Skeleton.vue'
import ScaleForm from './ScaleForm.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const flash = useFlashStore()

const scale = ref<any>(null)
const servidores = ref([])
const teams = ref([])
const comunidades = ref([])
const categorias = ref([])
const loading = ref(false)

const scaleUrl = computed(() => `/escalas/${route.params.id}`)

const initialData = computed(() => scale.value ? {
  dataCelebracao: scale.value.dataCelebracao.slice(0, 10),
  horario: scale.value.horario,
  celebracao: scale.value.celebracao,
  comunidadeId: scale.value.comunidadeId ?? null,
  celebranteId: scale.value.celebranteId ?? null,
  observacoes: scale.value.observacoes ?? '',
  status: scale.value.status,
  lembreteDiasAntes: scale.value.lembreteDiasAntes,
  // Send every assignment back, replaced ones included (same as Edit.vue): the PUT syncs by the
  // list, so leaving a replaced row out would delete it -- and with it the substitution history.
  servidores: scale.value.servidores
    .map((s: any) => ({
      servidorId: s.servidorId,
      instrumentId: s.instrumentId,
      teamId: s.teamId ?? null,
      categoriaId: s.categoriaId ?? null,
      funcaoLiturgica: s.funcaoLiturgica ?? null,
    })),
} : undefined)

onMounted(async () => {
  const [s, sv, t, c, cat] = await Promise.all([
    client.get(`/scales/${route.params.id}`),
    client.get('/servidores'),
    client.get('/teams'),
    client.get('/comunidades'),
    client.get('/categorias'),
  ])
  if (!auth.isStaff && !auth.coordinatesCommunity(s.data.comunidadeId)) {
    flash.set('warning', 'Você só pode editar a equipe das celebrações das comunidades que coordena.')
    router.replace(scaleUrl.value)
    return
  }
  scale.value = s.data
  servidores.value = sv.data
  teams.value = t.data
  comunidades.value = c.data
  categorias.value = cat.data
})

async function submit(data: { servidores: any[] }) {
  if (loading.value) return // TASK-0075: synchronous guard against double submit
  loading.value = true
  try {
    await client.put(`/scales/${route.params.id}/servidores`, {
      servidores: data.servidores.map((s) => ({
        servidorId: s.servidorId,
        instrumentId: s.instrumentId ?? null,
        teamId: s.teamId ?? null,
        categoriaId: s.categoriaId ?? null,
        funcaoLiturgica: s.funcaoLiturgica ?? null,
      })),
    })
    flash.set('success', 'Equipe atualizada!')
    router.push(scaleUrl.value)
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao salvar a equipe')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="text-h3 text-gray-900 dark:text-gray-50">Editar equipe</h2>
    </template>
    <Card>
      <ScaleForm
        v-if="scale"
        mode="team"
        :cancel-to="scaleUrl"
        :initial-data="initialData"
        :servidores="servidores"
        :teams="teams"
        :comunidades="comunidades"
        :celebrantes="[]"
        :categorias="categorias"
        :loading="loading"
        @submit="submit"
      />
      <div v-else class="space-y-3">
        <Skeleton width="w-1/2" height="h-5" />
        <Skeleton height="h-24" rounded="rounded-lg" />
      </div>
    </Card>
  </AuthenticatedLayout>
</template>
