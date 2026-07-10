<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'

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
          <h2 class="font-semibold text-xl text-gray-800">Repertório</h2>
          <p v-if="scale" class="text-sm text-gray-500">{{ scale.celebracao }} — {{ new Date(scale.dataCelebracao).toLocaleDateString('pt-BR') }}</p>
        </div>
        <RouterLink v-if="auth.isStaff" :to="`/escalas/${route.params.id}/repertorio/editar`"
          class="px-4 py-2 bg-gray-800 text-white text-xs font-semibold uppercase rounded-md hover:bg-gray-700">
          Editar
        </RouterLink>
      </div>
    </template>

    <div v-if="repertoire" class="bg-white shadow-sm rounded-lg p-6">
      <h3 class="font-semibold text-lg text-gray-800 mb-1">{{ repertoire.titulo }}</h3>
      <p v-if="repertoire.observacoes" class="text-sm text-gray-500 mb-6">{{ repertoire.observacoes }}</p>

      <ol class="space-y-3">
        <li v-for="item in repertoire.items" :key="item.id" class="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 border-b last:border-0">
          <span class="text-gray-400 text-sm w-6 text-right flex-shrink-0">{{ item.ordem }}.</span>
          <div class="flex-1 min-w-[50%]">
            <span class="font-medium text-gray-900">{{ item.tituloMusica }}</span>
            <span v-if="item.tom" class="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{{ item.tom }}</span>
          </div>
          <div class="flex gap-2 ml-auto sm:ml-0">
            <a v-if="item.arquivoPdfPath" :href="`/api/scales/${route.params.id}/repertoire/items/${item.id}/download`" target="_blank"
              class="text-xs text-red-600 hover:text-red-800 border border-red-200 px-2 py-1 rounded">PDF</a>
            <a v-if="item.linkExterno" :href="item.linkExterno" target="_blank"
              class="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 px-2 py-1 rounded">Link</a>
          </div>
        </li>
      </ol>
      <p v-if="!repertoire.items.length" class="text-sm text-gray-500">Nenhum item no repertório.</p>
    </div>

    <div v-else class="bg-white shadow-sm rounded-lg p-6 text-center text-gray-500">
      Nenhum repertório cadastrado para esta escala.
    </div>
  </AuthenticatedLayout>
</template>
