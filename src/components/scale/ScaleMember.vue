<script setup lang="ts">
// Reproduz o exemplo conceitual da SPEC-003 §36: avatar + nome + função/instrumento + status.
// `detalhe` já vem resolvido pelo consumidor (ex. "Violão", "Cerimoniário 1") -- este
// componente não conhece a regra de qual campo mostrar por categoria, só apresenta.
// `editable` controla se ações (remover, trocar instrumento/função) aparecem -- mesmo
// componente serve ScaleForm (edição) e Show.vue (visualização).
import Avatar from '../Avatar.vue'
import Badge from '../Badge.vue'
import ConfirmationStatus from './ConfirmationStatus.vue'

withDefaults(
  defineProps<{
    nome: string
    detalhe?: string | null
    status?: string | null
    vinculoFixo?: boolean
    editable?: boolean
  }>(),
  { editable: false },
)
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 rounded border border-gray-100 bg-white p-2 dark:border-gray-700 dark:bg-gray-800">
    <Avatar :name="nome" size="sm" />
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{{ nome }}</p>
      <p v-if="detalhe" class="truncate text-body-sm text-gray-600 dark:text-gray-400">{{ detalhe }}</p>
    </div>
    <Badge v-if="vinculoFixo" color="purple">Vínculo fixo</Badge>
    <ConfirmationStatus v-if="status" :status="status" />
    <div v-if="editable && $slots.actions" class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
