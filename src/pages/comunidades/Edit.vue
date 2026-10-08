<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Card from '@/components/Card.vue'
import InputLabel from '@/components/InputLabel.vue'
import TextInput from '@/components/TextInput.vue'
import Checkbox from '@/components/Checkbox.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'
import Select from '@/components/Select.vue'
import { useAuthStore } from '@/stores/auth'
import { XMarkIcon } from '@heroicons/vue/20/solid'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const flash = useFlashStore()
const form = ref({ nome: '', endereco: '', ativo: true })
const loading = ref(false)
const loaded = ref(false)

onMounted(async () => {
  const { data } = await client.get(`/comunidades/${route.params.id}`)
  form.value.nome = data.nome
  form.value.endereco = data.endereco ?? ''
  form.value.ativo = data.ativo
  loaded.value = true
  if (auth.isAdmin) loadCoordinators()
})

// Community coordinators (TASK-0132, ADR-0009) -- admin only. Each add/remove saves the whole list
// right away (PUT replaces the set), so there is no separate "save" step to forget.
interface Coordinator { id: number; nome: string; userId: number | null }
const coordinators = ref<Coordinator[]>([])
const servidores = ref<Coordinator[]>([])
const newCoordinatorId = ref<number | ''>('')
const savingCoordinators = ref(false)

async function loadCoordinators() {
  const [c, s] = await Promise.all([
    client.get<Coordinator[]>(`/comunidades/${route.params.id}/coordenadores`),
    client.get<Coordinator[]>('/servidores'),
  ])
  coordinators.value = c.data
  servidores.value = s.data
}

// Only servers with a login can coordinate (the API enforces it too).
const eligibleServidores = computed(() => {
  const taken = new Set(coordinators.value.map((c) => c.id))
  return servidores.value.filter((s) => s.userId != null && !taken.has(s.id))
})

async function saveCoordinators(ids: number[], successMessage: string) {
  if (savingCoordinators.value) return
  savingCoordinators.value = true
  try {
    const { data } = await client.put<Coordinator[]>(`/comunidades/${route.params.id}/coordenadores`, { servidorIds: ids })
    coordinators.value = data
    newCoordinatorId.value = ''
    flash.set('success', successMessage)
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao salvar coordenadores')
  } finally {
    savingCoordinators.value = false
  }
}

function addCoordinator() {
  if (!newCoordinatorId.value) return
  saveCoordinators([...coordinators.value.map((c) => c.id), Number(newCoordinatorId.value)], 'Coordenador adicionado.')
}

function removeCoordinator(id: number) {
  saveCoordinators(coordinators.value.filter((c) => c.id !== id).map((c) => c.id), 'Coordenador removido.')
}

async function submit() {
  if (loading.value) return // TASK-0075: guarda síncrona contra duplo clique
  loading.value = true
  try {
    await client.patch(`/comunidades/${route.params.id}`, form.value)
    flash.set('success', 'Comunidade atualizada com sucesso!')
    router.push('/comunidades')
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao atualizar')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header><h2 class="font-semibold text-xl text-gray-800 dark:text-gray-100">Editar Comunidade</h2></template>
    <Card>
      <form v-if="loaded" @submit.prevent="submit" class="space-y-6">
        <div>
          <InputLabel value="Nome" :required="true" for="input-nome" />
          <TextInput id="input-nome" v-model="form.nome" class="mt-1" />
        </div>
        <div>
          <InputLabel value="Endereço" for="input-endereco" />
          <TextInput id="input-endereco" v-model="form.endereco" class="mt-1" />
        </div>
        <Checkbox v-model="form.ativo" label="Comunidade ativa" />

        <div class="flex items-center gap-4">
          <PrimaryButton :disabled="loading">{{ loading ? 'Salvando...' : 'Salvar' }}</PrimaryButton>
          <RouterLink to="/comunidades"><SecondaryButton type="button">Cancelar</SecondaryButton></RouterLink>
        </div>
      </form>
    </Card>

    <Card v-if="auth.isAdmin && loaded" class="mt-6">
      <h3 class="text-h4 text-gray-800 dark:text-gray-100">Coordenadores da comunidade</h3>
      <p class="mt-1 text-body-sm text-gray-600 dark:text-gray-400">
        Podem editar os servidores das celebrações desta comunidade e aprovar substituições — apenas aqui.
        Só aparecem servidores com acesso ao sistema.
      </p>

      <ul v-if="coordinators.length" class="mt-4 flex flex-wrap gap-2">
        <li v-for="c in coordinators" :key="c.id"
          class="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 py-1 pl-3 pr-1 text-body-sm text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
          {{ c.nome }}
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-danger-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-danger-300"
            :aria-label="`Remover ${c.nome} da coordenação`"
            :disabled="savingCoordinators"
            @click="removeCoordinator(c.id)"
          >
            <XMarkIcon class="h-4 w-4" aria-hidden="true" />
          </button>
        </li>
      </ul>
      <p v-else class="mt-4 text-body-sm text-gray-600 dark:text-gray-400">Nenhum coordenador definido.</p>

      <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <div class="min-w-0 flex-1">
          <InputLabel value="Adicionar coordenador" for="input-novo-coordenador" />
          <Select id="input-novo-coordenador" v-model="newCoordinatorId" class="mt-1">
            <option value="">Selecione um servidor…</option>
            <option v-for="s in eligibleServidores" :key="s.id" :value="s.id">{{ s.nome }}</option>
          </Select>
        </div>
        <SecondaryButton type="button" :disabled="!newCoordinatorId || savingCoordinators" @click="addCoordinator">Adicionar</SecondaryButton>
      </div>
    </Card>
  </AuthenticatedLayout>
</template>
