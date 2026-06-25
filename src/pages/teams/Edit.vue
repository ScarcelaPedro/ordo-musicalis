<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import InputLabel from '@/components/InputLabel.vue'
import TextInput from '@/components/TextInput.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'

const route = useRoute()
const router = useRouter()
const flash = useFlashStore()
const form = ref({ nome: '', descricao: '', ativo: true })
const loading = ref(false)

onMounted(async () => {
  const teams = await client.get('/teams')
  const team = teams.data.find((t: any) => t.id === Number(route.params.id))
  if (team) { form.value.nome = team.nome; form.value.descricao = team.descricao ?? ''; form.value.ativo = team.ativo }
})

async function submit() {
  loading.value = true
  try {
    await client.patch(`/teams/${route.params.id}`, form.value)
    flash.set('success', 'Equipe atualizada!')
    router.push('/equipes')
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao atualizar')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header><h2 class="font-semibold text-xl text-gray-800">Editar Equipe</h2></template>
    <div class="bg-white shadow-sm rounded-lg p-6">
      <form @submit.prevent="submit" class="space-y-6">
        <div>
          <InputLabel value="Nome" :required="true" />
          <TextInput v-model="form.nome" class="mt-1" />
        </div>
        <div>
          <InputLabel value="Descrição" />
          <textarea v-model="form.descricao" rows="3" class="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full" />
        </div>
        <div class="flex items-center gap-3">
          <input v-model="form.ativo" type="checkbox" class="rounded border-gray-300 text-indigo-600" />
          <InputLabel value="Equipe ativa" />
        </div>
        <div class="flex items-center gap-4">
          <PrimaryButton :disabled="loading">{{ loading ? 'Salvando...' : 'Salvar' }}</PrimaryButton>
          <RouterLink to="/equipes"><SecondaryButton>Cancelar</SecondaryButton></RouterLink>
        </div>
      </form>
    </div>
  </AuthenticatedLayout>
</template>
