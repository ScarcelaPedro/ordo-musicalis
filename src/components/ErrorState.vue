<script setup lang="ts">
// Mensagem humana + próximo passo (SPEC-004 §40) -- nunca mostrar erro cru da API aqui; quem
// consome este componente já deve traduzir a mensagem antes de passar como `title`/`description`.
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

defineProps<{ title: string; description?: string }>()
</script>

<template>
  <div class="flex flex-col items-center gap-2 py-10 text-center">
    <ExclamationTriangleIcon class="h-8 w-8 text-danger-500" aria-hidden="true" />
    <p class="text-h4 text-gray-700 dark:text-gray-200">{{ title }}</p>
    <p v-if="description" class="text-body-sm text-gray-600 dark:text-gray-400">{{ description }}</p>
    <div v-if="$slots.action" class="mt-2">
      <slot name="action" />
    </div>
  </div>
</template>
