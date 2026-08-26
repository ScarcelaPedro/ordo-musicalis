<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Card from '@/components/Card.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import RepertoireItem from '@/components/scale/RepertoireItem.vue'
import { parseDateOnly } from '@/utils/date'

const route = useRoute()
const auth = useAuthStore()
const repertoire = ref<any>(null)
const scale = ref<any>(null)

onMounted(async () => {
  const [r, s] = await Promise.all([
    client.get(`/scales/${route.params.id}/repertoire`),
    client.get(`/scales/${route.params.id}`),
  ])
  repertoire.value = r.data
  scale.value = s.data
})
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex flex-wrap justify-between items-center gap-3">
        <div class="min-w-0">
          <Breadcrumb :items="[
            { label: 'Escalas', to: '/escalas' },
            { label: scale?.celebracao ?? '...', to: `/escalas/${route.params.id}` },
            { label: 'Repertório' },
          ]" class="mb-1" />
          <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-100">Repertório</h2>
          <p v-if="scale" class="text-sm text-gray-600 dark:text-gray-400">{{ scale.celebracao }} — {{ parseDateOnly(scale.dataCelebracao)!.toLocaleDateString('pt-BR') }}</p>
        </div>
        <RouterLink v-if="auth.isStaff" :to="`/escalas/${route.params.id}/repertorio/editar`"
          class="px-4 py-2 bg-gray-800 text-white text-xs font-semibold uppercase rounded-md hover:bg-gray-700">
          Editar
        </RouterLink>
      </div>
    </template>

    <Card v-if="repertoire">
      <h3 class="font-semibold text-lg text-gray-800 mb-1 dark:text-gray-100">{{ repertoire.titulo }}</h3>
      <p v-if="repertoire.observacoes" class="text-sm text-gray-600 mb-6 dark:text-gray-400">{{ repertoire.observacoes }}</p>

      <ol class="space-y-3">
        <RepertoireItem v-for="item in repertoire.items" :key="item.id" :ordem="item.ordem" :tituloMusica="item.tituloMusica" :tom="item.tom">
          <template #actions>
            <a v-if="item.arquivoPdfPath" :href="`/api/scales/${route.params.id}/repertoire/items/${item.id}/download`" target="_blank"
              class="text-xs text-red-600 hover:text-red-800 border border-red-200 px-2 py-1 rounded">PDF</a>
            <a v-if="item.linkExterno" :href="item.linkExterno" target="_blank"
              class="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 px-2 py-1 rounded">Link</a>
          </template>
        </RepertoireItem>
      </ol>
      <p v-if="!repertoire.items.length" class="text-sm text-gray-600 dark:text-gray-400">Nenhum item no repertório.</p>
    </Card>

    <Card v-else class="text-center text-gray-600 dark:text-gray-400">
      Nenhum repertório cadastrado para esta escala.
    </Card>
  </AuthenticatedLayout>
</template>
