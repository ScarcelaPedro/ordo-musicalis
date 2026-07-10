<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import InputLabel from '@/components/InputLabel.vue'
import TextInput from '@/components/TextInput.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import DangerButton from '@/components/DangerButton.vue'

const route = useRoute()
const flash = useFlashStore()
const repertoire = ref<any>(null)
const titulo = ref('')
const observacoes = ref('')
const saving = ref(false)

// Novo item
const newItem = ref({ tituloMusica: '', tom: '', linkExterno: '', pdf: null as File | null })
const addingItem = ref(false)

onMounted(async () => {
  const { data } = await client.get(`/scales/${route.params.id}/repertoire`)
  if (data) {
    repertoire.value = data
    titulo.value = data.titulo
    observacoes.value = data.observacoes ?? ''
  }
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
      <h2 class="font-semibold text-xl text-gray-800">Editar Repertório</h2>
    </template>

    <div class="space-y-6">
      <!-- Cabeçalho do repertório -->
      <div class="bg-white shadow-sm rounded-lg p-6">
        <h3 class="font-medium text-gray-700 mb-4">Dados do Repertório</h3>
        <div class="space-y-4">
          <div>
            <InputLabel value="Título" :required="true" />
            <TextInput v-model="titulo" class="mt-1" />
          </div>
          <div>
            <InputLabel value="Observações" />
            <textarea v-model="observacoes" rows="2" class="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full" />
          </div>
          <PrimaryButton :disabled="saving" @click="saveRepertoire">{{ saving ? 'Salvando...' : 'Salvar Repertório' }}</PrimaryButton>
        </div>
      </div>

      <!-- Lista de itens -->
      <div v-if="repertoire" class="bg-white shadow-sm rounded-lg p-6">
        <h3 class="font-medium text-gray-700 mb-4">Músicas ({{ repertoire.items.length }})</h3>

        <div class="space-y-2 mb-6">
          <div v-for="item in repertoire.items" :key="item.id" class="flex flex-wrap items-center gap-x-3 gap-y-2 py-2 border-b">
            <span class="text-gray-400 text-sm w-5">{{ item.ordem }}.</span>
            <span class="flex-1 min-w-[40%] text-sm font-medium">{{ item.tituloMusica }}</span>
            <span v-if="item.tom" class="text-xs bg-gray-100 px-2 py-0.5 rounded">{{ item.tom }}</span>
            <a v-if="item.arquivoPdfPath" :href="item.arquivoPdfPath" target="_blank" class="text-xs text-red-600">PDF</a>
            <a v-if="item.linkExterno" :href="item.linkExterno" target="_blank" class="text-xs text-blue-600">Link</a>
            <DangerButton @click="removeItem(item.id)" class="!py-1 !px-2 text-xs ml-auto sm:ml-0">Remover</DangerButton>
          </div>
          <p v-if="!repertoire.items.length" class="text-sm text-gray-500">Nenhuma música ainda.</p>
        </div>

        <!-- Adicionar item -->
        <div class="border-t pt-4">
          <h4 class="text-sm font-medium text-gray-700 mb-3">Adicionar Música</h4>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <InputLabel value="Título da Música" :required="true" />
              <TextInput v-model="newItem.tituloMusica" class="mt-1" />
            </div>
            <div>
              <InputLabel value="Tom" />
              <TextInput v-model="newItem.tom" class="mt-1" placeholder="Ex: Dó maior" />
            </div>
            <div>
              <InputLabel value="Link externo" />
              <TextInput v-model="newItem.linkExterno" type="url" class="mt-1" />
            </div>
            <div>
              <InputLabel value="PDF (partitura)" />
              <input type="file" accept="application/pdf" @change="onPdfChange" class="mt-1 text-sm" />
            </div>
          </div>
          <PrimaryButton class="mt-3" :disabled="addingItem || !newItem.tituloMusica" @click="addItem">
            {{ addingItem ? 'Adicionando...' : 'Adicionar' }}
          </PrimaryButton>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
