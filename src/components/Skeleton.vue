<script setup lang="ts">
// Primitivo composável: cada instância é um bloco pulsante; a tela que consome monta o
// formato esperado (linha de lista, retângulo de card) empilhando/combinando instâncias --
// não tenta prever cada layout possível dentro do próprio componente (SPEC-004 §47).
withDefaults(
  defineProps<{ width?: string; height?: string; rounded?: string }>(),
  { width: 'w-full', height: 'h-4', rounded: 'rounded' },
)
</script>

<template>
  <div class="animate-pulse bg-gray-200 dark:bg-gray-700" :class="[width, height, rounded]" aria-hidden="true" />
</template>
