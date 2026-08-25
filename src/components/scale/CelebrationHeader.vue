<script setup lang="ts">
// Dá ao celebrante um bloco próprio (usa o token Accent -- dourado discreto, TASK-0017),
// resolvendo o achado central da TASK-0010: hoje o celebrante fica no mesmo <dl> plano que
// qualquer outro metadado (scales/Show.vue:151-158), apesar de ser requisito de negócio
// documentado.
import Avatar from '../Avatar.vue'

defineProps<{
  celebracao: string
  dataFormatada: string
  horario: string
  comunidade?: string | null
  celebrante?: string | null
}>()
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-h2 text-gray-900 dark:text-gray-100">{{ celebracao }}</h1>
      <p class="text-body-sm text-gray-600 dark:text-gray-400">
        {{ dataFormatada }} · {{ horario }}
        <span v-if="comunidade"> · {{ comunidade }}</span>
      </p>
    </div>
    <div v-if="celebrante" class="flex items-center gap-3 rounded-md bg-accent-50 p-3 dark:bg-accent-900/10">
      <Avatar :name="celebrante" size="md" />
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-accent-700 dark:text-accent-300">Celebrante</p>
        <p class="text-h4 text-gray-900 dark:text-gray-100">{{ celebrante }}</p>
      </div>
    </div>
  </div>
</template>
