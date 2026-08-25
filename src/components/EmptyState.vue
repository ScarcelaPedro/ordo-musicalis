<script setup lang="ts">
// Estrutura já validada na Etapa 2 (docs/tasks/0007-*.md, §14.1): título + por que pode estar
// vazio + ação, quando aplicável.
defineProps<{ title: string; description?: string }>()
</script>

<template>
  <div class="flex flex-col items-center gap-2 py-10 text-center">
    <p class="text-h4 text-gray-700 dark:text-gray-200">{{ title }}</p>
    <p v-if="description" class="text-body-sm text-gray-600 dark:text-gray-400">{{ description }}</p>
    <div v-if="$slots.action" class="mt-2">
      <slot name="action" />
    </div>
  </div>
</template>
