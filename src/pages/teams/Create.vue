<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import InputLabel from '@/components/InputLabel.vue'
import TextInput from '@/components/TextInput.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'

const router = useRouter()
const flash = useFlashStore()
const form = ref({ nome: '', descricao: '', ativo: true, musicians: [] as number[] })
const allMusicians = ref<{ id: number; nome: string }[]>([])
const loading = ref(false)

onMounted(async () => {
  const { data } = await client.get('/musicians')
  allMusicians.value = data
})

function toggleMusician(id: number) {
  const idx = form.value.musicians.indexOf(id)
  if (idx >= 0) form.value.musicians.splice(idx, 1)
  else form.value.musicians.push(id)
}

async function submit() {
  loading.value = true
  try {
    await client.post('/teams', form.value)
    flash.set('success', 'Equipe criada com sucesso!')
    router.push('/equipes')
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao criar equipe')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header><h2 class="font-semibold text-xl text-gray-800">Nova Equipe</h2></template>
    <div class="bg-white shadow-sm rounded-lg p-6">
      <form @submit.prevent="submit" class="space-y-6">
        <div>
          <InputLabel value="Nome" :required="true" />
          <TextInput v-model="form.nome" class="mt-1" autofocus />
        </div>
        <div>
          <InputLabel value="Descrição" />
          <textarea v-model="form.descricao" rows="3" class="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full" />
        </div>
        <div class="flex items-center gap-3">
          <input id="ativo" v-model="form.ativo" type="checkbox" class="rounded border-gray-300 text-indigo-600" />
          <InputLabel value="Equipe ativa" />
        </div>

        <div>
          <InputLabel value="Músicos" />
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              v-for="m in allMusicians"
              :key="m.id"
              type="button"
              @click="toggleMusician(m.id)"
              class="px-3 py-1.5 rounded-full text-sm border transition"
              :class="form.musicians.includes(m.id)
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'"
            >
              {{ m.nome }}
            </button>
          </div>
          <p v-if="allMusicians.length === 0" class="mt-2 text-sm text-gray-500">Nenhum músico cadastrado.</p>
        </div>

        <div class="flex items-center gap-4">
          <PrimaryButton :disabled="loading">{{ loading ? 'Salvando...' : 'Salvar' }}</PrimaryButton>
          <RouterLink to="/equipes"><SecondaryButton type="button">Cancelar</SecondaryButton></RouterLink>
        </div>
      </form>
    </div>
  </AuthenticatedLayout>
</template>
