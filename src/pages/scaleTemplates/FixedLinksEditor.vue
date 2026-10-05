<script setup lang="ts">
// Fixed links of a recurrence (TASK-0117, ADR-0006): any function can have fixed people, not
// only Música. Same flow as the manual scale form -- function first, then only the people who
// have that function in their profile; instrument (optional) only for Música, liturgical role
// only for Acólitos. Picking a ministry adds all of its members at once (TASK-0120) instead of a
// single person. Shared by scaleTemplates/Create.vue and Edit.vue.
import { ref, computed, onMounted, watch } from 'vue'
import { TrashIcon } from '@heroicons/vue/24/outline'
import client from '@/api/client'
import { useFlashStore } from '@/stores/flash'
import { FUNCAO_LITURGICA_LABELS, assignmentRole } from '@/utils/scaleRole'
import { teamMembersForFixedLinks } from '@/utils/recurrence'
import Avatar from '@/components/Avatar.vue'
import Badge from '@/components/Badge.vue'
import InputLabel from '@/components/InputLabel.vue'
import Select from '@/components/Select.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'
import Skeleton from '@/components/Skeleton.vue'

interface Categoria { id: number; nome: string; ordem: number; ativo?: boolean }
interface Team { id: number; nome: string; categoria: { id: number } }
interface Servidor {
  id: number
  nome: string
  ativo?: boolean
  instruments: { instrumentId: number; instrument: { id: number; nome: string } }[]
  categorias: { categoriaId: number }[]
  teams: { teamId: number }[]
}
interface FixedLink {
  id: number
  servidor: { id: number; nome: string }
  categoria: Categoria | null
  team: { id: number; nome: string } | null
  instrument: { id: number; nome: string } | null
  funcaoLiturgica: string | null
}

const props = defineProps<{ scaleTemplateId: number }>()
const flash = useFlashStore()

const links = ref<FixedLink[]>([])
const servidores = ref<Servidor[]>([])
const categorias = ref<Categoria[]>([])
const teams = ref<Team[]>([])
const loading = ref(true)
const adding = ref(false)

const emptyDraft = () => ({
  categoriaId: null as number | null,
  servidorId: null as number | null,
  instrumentId: null as number | null,
  teamId: null as number | null,
  funcaoLiturgica: null as string | null,
})
const draft = ref(emptyDraft())
// Optional instrument per ministry member, keyed by servidor id (Música only).
const memberInstruments = ref<Record<number, number | null>>({})

onMounted(async () => {
  try {
    const [l, s, c, t] = await Promise.all([
      client.get('/vinculos-fixos', { params: { scaleTemplateId: props.scaleTemplateId } }),
      client.get('/servidores'),
      client.get('/categorias'),
      client.get('/teams'),
    ])
    links.value = l.data
    servidores.value = s.data
    categorias.value = c.data
    teams.value = t.data
  } finally {
    loading.value = false
  }
})

const categoriasOrdenadas = computed(() =>
  [...categorias.value].filter((c) => c.ativo !== false).sort((a, b) => a.ordem - b.ordem),
)
const musicaId = computed(() => categorias.value.find((c) => c.nome === 'Música')?.id ?? null)
const acolitosId = computed(() => categorias.value.find((c) => c.nome === 'Acólitos e Ancilas')?.id ?? null)

const linkedIds = computed(() => new Set(links.value.map((l) => l.servidor.id)))

const eligibleServidores = computed(() => {
  const categoriaId = draft.value.categoriaId
  if (!categoriaId) return []
  return servidores.value.filter(
    (s) => s.ativo !== false && !linkedIds.value.has(s.id) && s.categorias.some((c) => c.categoriaId === categoriaId),
  )
})

const selectedServidor = computed(() => servidores.value.find((s) => s.id === draft.value.servidorId) ?? null)
const draftTeams = computed(() => teams.value.filter((t) => t.categoria.id === draft.value.categoriaId))
const isMusica = computed(() => draft.value.categoriaId === musicaId.value)
const showInstrument = computed(() => isMusica.value && !!selectedServidor.value?.instruments.length)
const showFuncaoLiturgica = computed(() => draft.value.categoriaId === acolitosId.value)

watch(() => draft.value.categoriaId, (categoriaId) => {
  draft.value = { ...emptyDraft(), categoriaId }
})

watch(() => draft.value.servidorId, () => {
  // Instrument is optional: starts empty, picked only when it matters.
  draft.value.instrumentId = null
})

watch(() => draft.value.teamId, () => {
  draft.value.servidorId = null
  draft.value.instrumentId = null
  draft.value.funcaoLiturgica = null
  memberInstruments.value = {}
})

const teamMembers = computed(() =>
  draft.value.teamId && draft.value.categoriaId
    ? teamMembersForFixedLinks(servidores.value, draft.value.teamId, draft.value.categoriaId, linkedIds.value)
    : { eligible: [], missingFunction: [] },
)

// Grouped by function in category order, like the generated scale will show them.
const groups = computed(() => {
  const byCategoria = new Map<number | null, FixedLink[]>()
  for (const l of links.value) {
    const key = l.categoria?.id ?? null
    byCategoria.set(key, [...(byCategoria.get(key) ?? []), l])
  }
  return [...byCategoria.entries()]
    .map(([id, items]) => ({
      id,
      nome: items[0].categoria?.nome ?? 'Sem função definida',
      ordem: items[0].categoria?.ordem ?? Number.MAX_SAFE_INTEGER,
      items,
    }))
    .sort((a, b) => a.ordem - b.ordem)
})

function linkDetail(l: FixedLink) {
  const parts = assignmentRole(l).details
  if (l.team) parts.push(l.team.nome)
  return parts.join(' · ')
}

async function addLink() {
  if (!draft.value.categoriaId || !draft.value.servidorId) {
    flash.set('error', 'Selecione a função e o servidor')
    return
  }
  adding.value = true
  try {
    const { data } = await client.post('/vinculos-fixos', { scaleTemplateId: props.scaleTemplateId, ...draft.value })
    links.value.push(data)
    draft.value = { ...emptyDraft(), categoriaId: draft.value.categoriaId }
    flash.set('success', 'Vínculo fixo adicionado!')
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao adicionar vínculo')
  } finally {
    adding.value = false
  }
}

async function addTeamMembers() {
  const { categoriaId, teamId } = draft.value
  const members = teamMembers.value.eligible
  if (!categoriaId || !teamId || !members.length) return
  adding.value = true
  try {
    const results = await Promise.allSettled(
      members.map((m) =>
        client.post('/vinculos-fixos', {
          scaleTemplateId: props.scaleTemplateId,
          servidorId: m.id,
          categoriaId,
          teamId,
          instrumentId: isMusica.value ? memberInstruments.value[m.id] ?? null : null,
        }),
      ),
    )
    const created = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value.data as FixedLink] : []))
    links.value.push(...created)
    const failed = results.length - created.length
    if (failed) flash.set('error', `${created.length} vínculo(s) adicionado(s), ${failed} não puderam ser adicionados.`)
    else flash.set('success', `${created.length} vínculo(s) fixo(s) adicionado(s)!`)
    draft.value = { ...emptyDraft(), categoriaId }
  } finally {
    adding.value = false
  }
}

async function removeLink(l: FixedLink) {
  if (!confirm(`Remover o vínculo fixo de ${l.servidor.nome}?`)) return
  try {
    await client.delete(`/vinculos-fixos/${l.id}`)
    links.value = links.value.filter((v) => v.id !== l.id)
  } catch (e: any) {
    flash.set('error', e.response?.data?.message ?? 'Erro ao remover vínculo')
  }
}
</script>

<template>
  <section aria-labelledby="fixed-links-title">
    <h3 id="fixed-links-title" class="text-body font-semibold text-gray-800 dark:text-gray-100">Vínculos fixos</h3>
    <p class="mt-1 mb-4 text-caption text-gray-600 dark:text-gray-400">
      Servidores de qualquer função escalados automaticamente sempre que essa recorrência gerar uma nova celebração.
    </p>

    <div v-if="loading" class="space-y-2">
      <Skeleton height="h-12" rounded="rounded-lg" />
      <Skeleton height="h-12" rounded="rounded-lg" />
    </div>

    <template v-else>
      <div v-if="groups.length" class="mb-5 space-y-4">
        <div v-for="g in groups" :key="g.id ?? 'none'">
          <div class="mb-2 flex items-center gap-2">
            <h4 class="text-body-sm font-semibold text-gray-800 dark:text-gray-100">{{ g.nome }}</h4>
            <Badge color="gray">{{ g.items.length }}</Badge>
          </div>
          <ul class="space-y-2">
            <li
              v-for="l in g.items" :key="l.id"
              class="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-gray-50/70 p-2.5 dark:border-gray-700 dark:bg-gray-900/40"
            >
              <Avatar :name="l.servidor.nome" size="sm" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-body-sm font-semibold text-gray-800 dark:text-gray-100">{{ l.servidor.nome }}</p>
                <p v-if="linkDetail(l)" class="truncate text-caption text-gray-600 dark:text-gray-400">{{ linkDetail(l) }}</p>
              </div>
              <button
                type="button"
                @click="removeLink(l)"
                :aria-label="`Remover vínculo de ${l.servidor.nome}`"
                title="Remover"
                class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-500 transition hover:bg-danger-50 hover:text-danger-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-gray-400 dark:hover:bg-danger-900/30 dark:hover:text-danger-300"
              >
                <TrashIcon class="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          </ul>
        </div>
      </div>
      <p v-else class="mb-5 text-body-sm text-gray-600 dark:text-gray-400">Nenhum vínculo fixo ainda.</p>

      <div class="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
        <p class="mb-3 text-body-sm font-semibold text-gray-800 dark:text-gray-100">Adicionar vínculo</p>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <InputLabel value="Função" for="input-vinculo-categoria" :required="true" />
            <Select id="input-vinculo-categoria" v-model="draft.categoriaId" class="mt-1">
              <option value="">Selecione a função</option>
              <option v-for="c in categoriasOrdenadas" :key="c.id" :value="c.id">{{ c.nome }}</option>
            </Select>
          </div>
          <div v-if="draftTeams.length">
            <InputLabel value="Ministério (opcional)" for="input-vinculo-team" />
            <Select id="input-vinculo-team" v-model="draft.teamId" class="mt-1">
              <option value="">Nenhum (escolher um servidor)</option>
              <option v-for="t in draftTeams" :key="t.id" :value="t.id">{{ t.nome }}</option>
            </Select>
          </div>

          <template v-if="!draft.teamId">
            <div>
              <InputLabel value="Servidor" for="input-vinculo-servidor" :required="true" />
              <Select
                id="input-vinculo-servidor" v-model="draft.servidorId" class="mt-1"
                :disabled="!draft.categoriaId || !eligibleServidores.length"
              >
                <option value="">
                  {{ !draft.categoriaId ? 'Escolha a função primeiro' : eligibleServidores.length ? 'Selecione' : 'Ninguém disponível nesta função' }}
                </option>
                <option v-for="s in eligibleServidores" :key="s.id" :value="s.id">{{ s.nome }}</option>
              </Select>
            </div>
            <div v-if="showInstrument">
              <InputLabel value="Instrumento (opcional)" for="input-vinculo-instrument" />
              <Select id="input-vinculo-instrument" v-model="draft.instrumentId" class="mt-1">
                <option value="">Sem instrumento</option>
                <option v-for="i in selectedServidor!.instruments" :key="i.instrumentId" :value="i.instrumentId">{{ i.instrument.nome }}</option>
              </Select>
            </div>
            <div v-if="showFuncaoLiturgica">
              <InputLabel value="Função litúrgica (opcional)" for="input-vinculo-funcao" />
              <Select id="input-vinculo-funcao" v-model="draft.funcaoLiturgica" class="mt-1">
                <option value="">Sem função litúrgica</option>
                <option v-for="(label, value) in FUNCAO_LITURGICA_LABELS" :key="value" :value="value">{{ label }}</option>
              </Select>
            </div>
          </template>
        </div>

        <template v-if="draft.teamId">
          <p class="mt-4 text-caption text-gray-600 dark:text-gray-400">
            Todos os servidores deste ministério serão adicionados como vínculo fixo.
          </p>
          <ul v-if="teamMembers.eligible.length" class="mt-2 space-y-2">
            <li
              v-for="m in teamMembers.eligible" :key="m.id"
              class="flex flex-wrap items-center gap-2.5 rounded-lg border border-gray-100 bg-gray-50/70 p-2.5 dark:border-gray-700 dark:bg-gray-900/40"
            >
              <Avatar :name="m.nome" size="sm" />
              <p class="min-w-0 flex-1 truncate text-body-sm font-semibold text-gray-800 dark:text-gray-100">{{ m.nome }}</p>
              <div v-if="isMusica && m.instruments.length" class="w-full sm:w-48">
                <Select
                  :model-value="memberInstruments[m.id] ?? ''"
                  @update:model-value="(v) => (memberInstruments[m.id] = v ? Number(v) : null)"
                  :aria-label="`Instrumento de ${m.nome} (opcional)`"
                >
                  <option value="">Sem instrumento</option>
                  <option v-for="i in m.instruments" :key="i.instrumentId" :value="i.instrumentId">{{ i.instrument.nome }}</option>
                </Select>
              </div>
            </li>
          </ul>
          <p v-else class="mt-2 text-body-sm text-gray-600 dark:text-gray-400">
            Nenhum servidor deste ministério para adicionar: todos já têm vínculo nesta recorrência ou estão inativos.
          </p>
          <p v-if="teamMembers.missingFunction.length" class="mt-2 text-caption text-gray-500 dark:text-gray-400">
            Não serão adicionados por não terem essa função marcada no cadastro:
            {{ teamMembers.missingFunction.map((s) => s.nome).join(', ') }}.
          </p>
          <SecondaryButton
            type="button" class="mt-4" :loading="adding"
            :disabled="!teamMembers.eligible.length" @click="addTeamMembers"
          >
            {{ adding ? 'Adicionando...' : `Adicionar todos (${teamMembers.eligible.length})` }}
          </SecondaryButton>
        </template>

        <template v-else>
          <p v-if="draft.categoriaId && !eligibleServidores.length" class="mt-3 text-caption text-gray-500 dark:text-gray-400">
            Só aparecem servidores com essa função marcada no cadastro e que ainda não têm vínculo nesta recorrência.
          </p>
          <SecondaryButton type="button" class="mt-4" :loading="adding" :disabled="!draft.servidorId" @click="addLink">
            {{ adding ? 'Adicionando...' : 'Adicionar vínculo' }}
          </SecondaryButton>
        </template>
      </div>
    </template>
  </section>
</template>
