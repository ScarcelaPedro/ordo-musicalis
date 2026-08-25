<script setup lang="ts">
// Unifica 3 lugares que hoje mostram a mesma informação de escala de formas ligeiramente
// diferentes: "Minhas próximas escalas" do Dashboard, MyScales.vue e a listagem de Escalas
// (docs/tasks/0025-*.md). Chevron reaproveita o mesmo afetivo de tappability já usado no
// Dashboard hoje (Dashboard.vue:278-287), em vez de inventar um botão "Ver detalhes" novo.
//
// `detalhe`/`vinculoFixo`/slot `actions` adicionados na TASK-0048, ao adotar este componente em
// MyScales.vue: a região superior (título + metadados) continua sendo o link tapável de sempre;
// o slot `actions` (Confirmar/Recusar, com motivo) fica FORA do link, numa área própria abaixo,
// pra não conflitar clique-no-botão com clique-no-card. Sem slot, o comportamento de antes
// (Dashboard) fica idêntico -- a `<div>` extra do slot só existe quando ele é usado.
import { ChevronRightIcon } from '@heroicons/vue/20/solid'
import Badge from '../Badge.vue'
import ConfirmationStatus from './ConfirmationStatus.vue'

defineProps<{
  celebracao: string
  dataFormatada: string
  horario: string
  comunidade?: string | null
  detalhe?: string | null
  status?: 'rascunho' | 'confirmada' | null
  minhaConfirmacao?: string | null
  vinculoFixo?: boolean
  to?: string
}>()
</script>

<template>
  <div
    class="rounded-xl transition"
    :class="to
      ? 'bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/30'
      : 'bg-gray-50 dark:bg-gray-800'"
  >
    <component :is="to ? 'RouterLink' : 'div'" :to="to" class="flex items-center justify-between gap-3 p-3">
      <div class="min-w-0">
        <p class="truncate text-sm font-semibold text-primary-800 dark:text-primary-200">{{ celebracao }}</p>
        <p class="text-xs text-primary-500 dark:text-primary-400">
          {{ dataFormatada }} · {{ horario }}
          <span v-if="comunidade"> · {{ comunidade }}</span>
        </p>
        <p v-if="detalhe" class="text-xs text-primary-500 dark:text-primary-400">{{ detalhe }}</p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <Badge v-if="vinculoFixo" color="purple">Vínculo fixo</Badge>
        <Badge v-if="status" :color="status === 'confirmada' ? 'green' : 'yellow'">{{ status }}</Badge>
        <ConfirmationStatus v-if="minhaConfirmacao" :status="minhaConfirmacao" />
        <ChevronRightIcon v-if="to" class="h-4 w-4 text-primary-300 dark:text-primary-500" aria-hidden="true" />
      </div>
    </component>
    <div v-if="$slots.actions" class="px-3 pb-3">
      <slot name="actions" />
    </div>
  </div>
</template>
