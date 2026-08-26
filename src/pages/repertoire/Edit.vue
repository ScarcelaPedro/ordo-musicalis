<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Card from '@/components/Card.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import RepertoireItem from '@/components/scale/RepertoireItem.vue'
import InputLabel from '@/components/InputLabel.vue'
import TextInput from '@/components/TextInput.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import DangerButton from '@/components/DangerButton.vue'
import { parseDateOnly } from '@/utils/date'

const route = useRoute()
const flash = useFlashStore()
const scale = ref<any>(null)
const repertoire = ref<any>(null)
const titulo = ref('')
const observacoes = ref('')
const saving = ref(false)

// Novo item
const newItem = ref({ tituloMusica: '', tom: '', linkExterno: '', pdf: null as File | null })
const addingItem = ref(false)

onMounted(async () => {
  // TASK-0083 (correção): a escala de origem nunca era buscada aqui -- só o repertório --
  // então esta tela não tinha como mostrar a qual celebração pertence nem linkar de volta.
  const [{ data }, scaleRes] = await Promise.all([
    client.get(`/scales/${route.params.id}/repertoire`),
    client.get(`/scales/${route.params.id}`),
  ])
  if (data) {
    repertoire.value = data
    titulo.value = data.titulo
    observacoes.value = data.observacoes ?? ''
  }
  scale.value = scaleRes.data
})

async function saveRepertoire() {
  saving.value = true
  try {
    const { data } = await client.put(`/scales/${route.params.id}/repertoire`, { titulo: titulo.value, observacoes: observacoes.value })
    repertoire.value = data
    flash.set('success', 'Repertório salvo!')
  } catch {
    flash.set('error', 'Erro ao salvar repertório')
  } finally {
    saving.value = false
  }
}

async function addItem() {
  addingItem.value = true
  try {
    const fd = new FormData()
    fd.append('tituloMusica', newItem.value.tituloMusica)
    if (newItem.value.tom) fd.append('tom', newItem.value.tom)
    if (newItem.value.linkExterno) fd.append('linkExterno', newItem.value.linkExterno)
    if (newItem.value.pdf) fd.append('pdf', newItem.value.pdf)

    const { data } = await client.post(`/scales/${route.params.id}/repertoire/items`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    repertoire.value.items.push(data)
    newItem.value = { tituloMusica: '', tom: '', linkExterno: '', pdf: null }
    flash.set('success', 'Música adicionada!')
  } catch {
    flash.set('error', 'Erro ao adicionar música')
  } finally {
    addingItem.value = false
  }
}

async function removeItem(id: number) {
  if (!confirm('Remover esta música?')) return
  await client.delete(`/scales/${route.params.id}/repertoire/items/${id}`)
  repertoire.value.items = repertoire.value.items.filter((i: any) => i.id !== id)
  flash.set('success', 'Música removida.')
}

function onPdfChange(e: Event) {
  newItem.value.pdf = (e.target as HTMLInputElement).files?.[0] ?? null
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <Breadcrumb :items="[
        { label: 'Escalas', to: '/escalas' },
        { label: scale?.celebracao ?? '...', to: `/escalas/${route.params.id}` },
        { label: 'Editar Repertório' },
      ]" class="mb-1" />
      <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-100">Editar Repertório</h2>
      <p v-if="scale" class="text-sm text-gray-600 dark:text-gray-400">{{ scale.celebracao }} — {{ parseDateOnly(scale.dataCelebracao)!.toLocaleDateString('pt-BR') }}</p>
    </template>

    <div class="space-y-6">
      <!-- Cabeçalho do repertório -->
      <Card>
        <h3 class="font-medium text-gray-700 mb-4 dark:text-gray-300">Dados do Repertório</h3>
        <div class="space-y-4">
          <div>
            <InputLabel value="Título" :required="true" for="input-titulo" />
            <TextInput id="input-titulo" v-model="titulo" class="mt-1" />
          </div>
          <div>
            <InputLabel value="Observações" for="input-observacoes-repertorio" />
            <textarea id="input-observacoes-repertorio" v-model="observacoes" rows="2" class="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
          </div>
          <PrimaryButton :disabled="saving" @click="saveRepertoire">{{ saving ? 'Salvando...' : 'Salvar Repertório' }}</PrimaryButton>
        </div>
      </Card>

      <!-- Lista de itens -->
      <Card v-if="repertoire">
        <h3 class="font-medium text-gray-700 mb-4 dark:text-gray-300">Músicas ({{ repertoire.items.length }})</h3>

        <ol v-if="repertoire.items.length" class="space-y-2 mb-6">
          <RepertoireItem v-for="item in repertoire.items" :key="item.id" :ordem="item.ordem" :tituloMusica="item.tituloMusica" :tom="item.tom">
            <template #actions>
              <a v-if="item.arquivoPdfPath" :href="item.arquivoPdfPath" target="_blank" class="text-xs text-red-600 dark:text-red-400">PDF</a>
              <a v-if="item.linkExterno" :href="item.linkExterno" target="_blank" class="text-xs text-blue-600 dark:text-blue-400">Link</a>
              <DangerButton @click="removeItem(item.id)" class="!py-1 !px-2 text-xs">Remover</DangerButton>
            </template>
          </RepertoireItem>
        </ol>
        <p v-else class="text-sm text-gray-600 mb-6 dark:text-gray-400">Nenhuma música ainda.</p>

        <!-- Adicionar item -->
        <div class="border-t pt-4 dark:border-gray-700">
          <h4 class="text-sm font-medium text-gray-700 mb-3 dark:text-gray-300">Adicionar Música</h4>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <InputLabel value="Título da Música" :required="true" for="input-titulo-musica" />
              <TextInput id="input-titulo-musica" v-model="newItem.tituloMusica" class="mt-1" />
            </div>
            <div>
              <InputLabel value="Tom" for="input-tom" />
              <TextInput id="input-tom" v-model="newItem.tom" class="mt-1" placeholder="Ex: Dó maior" />
            </div>
            <div>
              <InputLabel value="Link externo" for="input-link-externo" />
              <TextInput id="input-link-externo" v-model="newItem.linkExterno" type="url" class="mt-1" />
            </div>
            <div>
              <InputLabel value="PDF (partitura)" for="input-pdf" />
              <input id="input-pdf" type="file" accept="application/pdf" @change="onPdfChange" class="mt-1 text-sm text-gray-700 dark:text-gray-300" />
            </div>
          </div>
          <PrimaryButton class="mt-3" :disabled="addingItem || !newItem.tituloMusica" @click="addItem">
            {{ addingItem ? 'Adicionando...' : 'Adicionar' }}
          </PrimaryButton>
        </div>
      </Card>
    </div>
  </AuthenticatedLayout>
</template>
