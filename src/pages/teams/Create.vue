<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import Card from '@/components/Card.vue'
import InputLabel from '@/components/InputLabel.vue'
import TextInput from '@/components/TextInput.vue'
import Select from '@/components/Select.vue'
import Textarea from '@/components/Textarea.vue'
import Checkbox from '@/components/Checkbox.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'

interface TeamServidor { servidorId: number; funcao: string }

const router = useRouter()
const flash = useFlashStore()
const form = ref({ nome: '', descricao: '', ativo: true, responsavelId: null as number | null, categoriaId: null as number | null, servidores: [] as TeamServidor[] })
const allServidores = ref<{ id: number; nome: string }[]>([])
const categorias = ref<{ id: number; nome: string }[]>([])
const loading = ref(false)

onMounted(async () => {
  const [s, c] = await Promise.all([client.get('/servidores'), client.get('/categorias')])
  allServidores.value = s.data
  categorias.value = c.data
})

function toggleServidor(id: number) {
  const idx = form.value.servidores.findIndex((s) => s.servidorId === id)
  if (idx >= 0) form.value.servidores.splice(idx, 1)
  else form.value.servidores.push({ servidorId: id, funcao: '' })
}

function servidorNome(id: number) {
  return allServidores.value.find((s) => s.id === id)?.nome ?? ''
}

async function submit() {
  if (loading.value) return // TASK-0075: guarda síncrona contra duplo clique
  loading.value = true
  try {
    await client.post('/teams', form.value)
    flash.set('success', 'Ministério criado com sucesso!')
    router.push('/equipes')
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao criar ministério')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header><h2 class="font-semibold text-xl text-gray-800 dark:text-gray-100">Novo Ministério</h2></template>
    <Card>
      <form @submit.prevent="submit" class="space-y-6">
        <div>
          <InputLabel value="Nome" :required="true" for="input-nome" />
          <TextInput id="input-nome" v-model="form.nome" class="mt-1" autofocus />
        </div>
        <div>
          <InputLabel value="Descrição" for="input-descricao" />
          <Textarea id="input-descricao" v-model="form.descricao" :rows="3" class="mt-1" />
        </div>
        <div>
          <InputLabel value="Categoria de função" :required="true" for="input-categoria" />
          <Select id="input-categoria" v-model="form.categoriaId" class="mt-1">
            <option :value="null">Selecione</option>
            <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nome }}</option>
          </Select>
        </div>
        <div>
          <InputLabel value="Responsável/coordenador" for="input-responsavel" />
          <Select id="input-responsavel" v-model="form.responsavelId" class="mt-1">
            <option :value="null">Nenhum</option>
            <option v-for="s in allServidores" :key="s.id" :value="s.id">{{ s.nome }}</option>
          </Select>
        </div>
        <Checkbox v-model="form.ativo" label="Ministério ativo" />

        <div>
          <InputLabel value="Servidores" />
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              v-for="s in allServidores"
              :key="s.id"
              type="button"
              @click="toggleServidor(s.id)"
              class="px-3 py-1.5 rounded-full text-sm border transition"
              :class="form.servidores.some((fs) => fs.servidorId === s.id)
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:border-indigo-500'"
            >
              {{ s.nome }}
            </button>
          </div>
          <p v-if="allServidores.length === 0" class="mt-2 text-sm text-gray-600 dark:text-gray-400">Nenhum servidor cadastrado.</p>
          <div v-if="form.servidores.length" class="mt-3 space-y-2">
            <div v-for="fs in form.servidores" :key="fs.servidorId" class="flex items-center gap-2">
              <span class="text-sm text-gray-600 dark:text-gray-400 w-40 shrink-0 truncate">{{ servidorNome(fs.servidorId) }}</span>
              <TextInput v-model="fs.funcao" placeholder="Função (opcional)" class="text-sm" />
            </div>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <PrimaryButton :disabled="loading">{{ loading ? 'Salvando...' : 'Salvar' }}</PrimaryButton>
          <RouterLink to="/equipes"><SecondaryButton type="button">Cancelar</SecondaryButton></RouterLink>
        </div>
      </form>
    </Card>
  </AuthenticatedLayout>
</template>
