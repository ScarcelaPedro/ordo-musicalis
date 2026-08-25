<script setup lang="ts">
// Bloco de agrupamento por categoria -- mantém a organização já existente e considerada um
// acerto (ScaleForm.vue/Show.vue, achado da TASK-0016). Neutro por padrão; o tratamento de
// "vazio" fica a cargo do conteúdo passado ao slot (EmptyRole.vue), não deste wrapper.
defineProps<{ nome: string; count?: number }>()
</script>

<template>
  <div class="rounded-md border border-gray-200 p-4 dark:border-gray-700">
    <div class="mb-3 flex items-center justify-between">
      <h4 class="text-sm font-medium text-gray-800 dark:text-gray-100">{{ nome }}</h4>
      <span v-if="count" class="text-xs font-semibold text-gray-400">{{ count }} escalado(s)</span>
    </div>
    <div class="space-y-2">
      <slot />
    </div>
  </div>
</template>
