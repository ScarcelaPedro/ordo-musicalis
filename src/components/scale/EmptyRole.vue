<script setup lang="ts">
// Decisão registrada em docs/tasks/0025-*.md: tratamento discreto (borda tracejada +
// warning), não o Alert cheio -- uma escala pode ter várias categorias vazias ao mesmo tempo,
// e um Alert saturado repetido várias vezes pesaria demais visualmente.
defineProps<{ message?: string }>()
</script>

<template>
  <div class="flex flex-col items-start gap-2 rounded-md border border-dashed border-warning-300 bg-warning-50/40 p-3 dark:border-warning-800 dark:bg-warning-900/10">
    <p class="text-sm text-warning-700 dark:text-warning-300">⚠ {{ message ?? 'Nenhum servidor' }}</p>
    <slot name="action" />
  </div>
</template>
