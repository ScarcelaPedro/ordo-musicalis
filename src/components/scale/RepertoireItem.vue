<script setup lang="ts">
// Estrutura já existente em repertoire/Show.vue, confirmada nesta task (campo real é
// `tituloMusica`, não `titulo`). Ações (PDF/link externo) via slot -- a auditoria já apontou
// uma inconsistência de URL entre a prévia em Show.vue e a edição em repertoire/Edit.vue; não
// resolvida aqui (regra de negócio/rota de API, fora do escopo de um componente visual), só
// não é hardcoded neste componente para não repetir/aprofundar essa inconsistência.
defineProps<{ ordem: number; tituloMusica: string; tom?: string | null }>()
</script>

<template>
  <li class="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-gray-100 py-3 last:border-0 dark:border-gray-700">
    <span class="w-6 shrink-0 text-right text-caption text-gray-400">{{ ordem }}.</span>
    <div class="min-w-[50%] flex-1">
      <span class="font-medium text-gray-900 dark:text-gray-100">{{ tituloMusica }}</span>
      <span v-if="tom" class="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">{{ tom }}</span>
    </div>
    <div v-if="$slots.actions" class="ml-auto flex gap-2 sm:ml-0">
      <slot name="actions" />
    </div>
  </li>
</template>
