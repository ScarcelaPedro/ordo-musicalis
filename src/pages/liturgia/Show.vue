<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'
import { parseDateOnly } from '@/utils/date'

interface Leitura {
  referencia?: string
  titulo?: string
  refrao?: string
  texto?: string
}

const route = useRoute()
const auth = useAuthStore()
const flash = useFlashStore()

const scale = ref<any>(null)
const liturgia = ref<any>(null)
const carregando = ref(true)
const editando = ref(false)
const salvando = ref(false)
const form = ref<Record<string, any>>({})

const CORES = ['Verde', 'Roxo', 'Branco', 'Vermelho', 'Rosa']

const CORES_CLASSES: Record<string, string> = {
  Verde: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Roxo: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Branco: 'bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-500',
  Vermelho: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Rosa: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
}

async function carregar() {
  carregando.value = true
  try {
    const { data: s } = await client.get(`/scales/${route.params.id}`)
    scale.value = s
    const data = s.dataCelebracao.slice(0, 10)
    try {
      const { data: l } = await client.get(`/liturgia`, { params: { data } })
      liturgia.value = l
    } catch {
      liturgia.value = null
    }
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)

function iniciarEdicao() {
  form.value = {
    liturgia: liturgia.value?.liturgia ?? '',
    cor: liturgia.value?.cor ?? 'Verde',
    temGloria: liturgia.value?.temGloria ?? false,
    temCredo: liturgia.value?.temCredo ?? false,
    antifonaEntrada: liturgia.value?.antifonaEntrada ?? '',
    coleta: liturgia.value?.coleta ?? '',
    oferendas: liturgia.value?.oferendas ?? '',
    antifonaComunhao: liturgia.value?.antifonaComunhao ?? '',
    oracaoComunhao: liturgia.value?.oracaoComunhao ?? '',
  }
  editando.value = true
}

async function salvar() {
  salvando.value = true
  try {
    const data = scale.value.dataCelebracao.slice(0, 10)
    const { data: atualizada } = await client.patch(`/liturgia/${data}`, form.value)
    liturgia.value = atualizada
    editando.value = false
    flash.set('success', 'Liturgia corrigida com sucesso!')
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao salvar correção')
  } finally {
    salvando.value = false
  }
}

function leituras(campo: Leitura[] | null | undefined): Leitura[] {
  return campo ?? []
}
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex flex-wrap justify-between items-center gap-3">
        <div class="min-w-0">
          <h2 class="font-semibold text-xl text-gray-800">Liturgia</h2>
          <p v-if="scale" class="text-sm text-gray-500">{{ scale.celebracao }} — {{ parseDateOnly(scale.dataCelebracao)!.toLocaleDateString('pt-BR') }}</p>
        </div>
        <button v-if="auth.isStaff && liturgia && !editando" @click="iniciarEdicao"
          class="px-4 py-2 bg-gray-800 text-white text-xs font-semibold uppercase rounded-md hover:bg-gray-700">
          Corrigir
        </button>
      </div>
    </template>

    <div v-if="carregando" class="text-sm text-gray-500">Carregando...</div>

    <div v-else-if="!liturgia" class="bg-white shadow-sm rounded-lg p-6 text-center text-gray-500">
      Liturgia ainda não disponível para esta data.
    </div>

    <!-- Formulário de correção manual -->
    <div v-else-if="editando" class="bg-white shadow-sm rounded-lg p-6 space-y-4">
      <h3 class="font-semibold text-gray-800">Corrigir liturgia do dia</h3>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tempo litúrgico</label>
        <input v-model="form.liturgia" type="text" class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Cor</label>
          <select v-model="form.cor" class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
            <option v-for="c in CORES" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <label class="flex items-center gap-2 mt-6">
          <input v-model="form.temGloria" type="checkbox" class="rounded border-gray-300" />
          <span class="text-sm text-gray-700">Tem Glória</span>
        </label>
        <label class="flex items-center gap-2 mt-6">
          <input v-model="form.temCredo" type="checkbox" class="rounded border-gray-300" />
          <span class="text-sm text-gray-700">Tem Credo</span>
        </label>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Antífona de Entrada</label>
        <textarea v-model="form.antifonaEntrada" rows="2" class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Coleta</label>
        <textarea v-model="form.coleta" rows="3" class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Oferendas</label>
        <textarea v-model="form.oferendas" rows="2" class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Antífona de Comunhão</label>
        <textarea v-model="form.antifonaComunhao" rows="2" class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Oração Pós-Comunhão</label>
        <textarea v-model="form.oracaoComunhao" rows="2" class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
      </div>
      <p class="text-xs text-gray-500">As leituras (1ª leitura, salmo, 2ª leitura, evangelho) vêm direto da fonte automática e não são editadas aqui.</p>
      <div class="flex gap-2">
        <PrimaryButton :disabled="salvando" @click="salvar">{{ salvando ? 'Salvando...' : 'Salvar correção' }}</PrimaryButton>
        <SecondaryButton @click="editando = false">Cancelar</SecondaryButton>
      </div>
    </div>

    <!-- Visualização -->
    <div v-else class="space-y-6">
      <div class="bg-white shadow-sm rounded-lg p-6">
        <div class="flex flex-wrap items-center gap-2 mb-2">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="CORES_CLASSES[liturgia.cor] ?? CORES_CLASSES.Verde">{{ liturgia.cor }}</span>
          <span v-if="liturgia.temGloria" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">Tem Glória</span>
          <span v-if="liturgia.temCredo" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">Tem Credo</span>
          <span v-if="liturgia.editadoManualmente" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Corrigido manualmente</span>
        </div>
        <h3 class="font-semibold text-lg text-gray-900">{{ liturgia.liturgia }}</h3>
      </div>

      <div v-if="liturgia.antifonaEntrada" class="bg-white shadow-sm rounded-lg p-6">
        <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Antífona de Entrada</h4>
        <p class="text-sm text-gray-800 whitespace-pre-line">{{ liturgia.antifonaEntrada }}</p>
      </div>

      <div v-if="liturgia.coleta" class="bg-white shadow-sm rounded-lg p-6">
        <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Oração da Coleta</h4>
        <p class="text-sm text-gray-800 whitespace-pre-line">{{ liturgia.coleta }}</p>
      </div>

      <div v-for="l in leituras(liturgia.primeiraLeitura)" :key="'1L-' + l.referencia" class="bg-white shadow-sm rounded-lg p-6">
        <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Primeira Leitura</h4>
        <p v-if="l.titulo" class="text-sm font-medium text-gray-900">{{ l.titulo }}</p>
        <p v-if="l.referencia" class="text-xs text-gray-500 mb-3">{{ l.referencia }}</p>
        <p class="text-sm text-gray-800 whitespace-pre-line">{{ l.texto }}</p>
        <p class="text-sm text-gray-500 italic mt-3">— Palavra do Senhor.<br>— Graças a Deus.</p>
      </div>

      <div v-for="l in leituras(liturgia.salmo)" :key="'salmo-' + l.referencia" class="bg-white shadow-sm rounded-lg p-6">
        <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Salmo Responsorial</h4>
        <p v-if="l.referencia" class="text-xs text-gray-500 mb-1">{{ l.referencia }}</p>
        <p v-if="l.refrao" class="text-sm font-medium text-gray-900 mb-3">{{ l.refrao }}</p>
        <p class="text-sm text-gray-800 whitespace-pre-line">{{ l.texto }}</p>
      </div>

      <div v-for="l in leituras(liturgia.segundaLeitura)" :key="'2L-' + l.referencia" class="bg-white shadow-sm rounded-lg p-6">
        <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Segunda Leitura</h4>
        <p v-if="l.titulo" class="text-sm font-medium text-gray-900">{{ l.titulo }}</p>
        <p v-if="l.referencia" class="text-xs text-gray-500 mb-3">{{ l.referencia }}</p>
        <p class="text-sm text-gray-800 whitespace-pre-line">{{ l.texto }}</p>
        <p class="text-sm text-gray-500 italic mt-3">— Palavra do Senhor.<br>— Graças a Deus.</p>
      </div>

      <div v-for="l in leituras(liturgia.evangelho)" :key="'ev-' + l.referencia" class="bg-white shadow-sm rounded-lg p-6">
        <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Evangelho</h4>
        <p class="text-sm text-gray-500 italic mb-2">℣. O Senhor esteja convosco.<br>℟. Ele está no meio de nós.</p>
        <p v-if="l.titulo" class="text-sm font-medium text-gray-900">{{ l.titulo }}</p>
        <p v-if="l.referencia" class="text-xs text-gray-500 mb-3">{{ l.referencia }}</p>
        <p class="text-sm text-gray-800 whitespace-pre-line">{{ l.texto }}</p>
        <p class="text-sm text-gray-500 italic mt-3">— Palavra da Salvação.<br>— Glória a vós, Senhor.</p>
      </div>

      <div v-if="liturgia.oferendas" class="bg-white shadow-sm rounded-lg p-6">
        <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Oração sobre as Oferendas</h4>
        <p class="text-sm text-gray-800 whitespace-pre-line">{{ liturgia.oferendas }}</p>
      </div>

      <div v-if="liturgia.antifonaComunhao" class="bg-white shadow-sm rounded-lg p-6">
        <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Antífona de Comunhão</h4>
        <p class="text-sm text-gray-800 whitespace-pre-line">{{ liturgia.antifonaComunhao }}</p>
      </div>

      <div v-if="liturgia.oracaoComunhao" class="bg-white shadow-sm rounded-lg p-6">
        <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Oração Pós-Comunhão</h4>
        <p class="text-sm text-gray-800 whitespace-pre-line">{{ liturgia.oracaoComunhao }}</p>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
