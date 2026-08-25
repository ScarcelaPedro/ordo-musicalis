<script setup lang="ts">
// API (prop `color`, valores aceitos) preservada exatamente igual -- só a implementação
// interna passa a referenciar os tokens semânticos (docs/decisions/0001-*.md) em vez de
// classes Tailwind literais. Como success=green/warning=yellow/danger=red/info=blue são
// aliases diretos das mesmas famílias, o CSS gerado é idêntico -- migração sem risco visual.
defineProps<{ color?: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'gray' }>()
</script>

<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    :class="{
      'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200': color === 'green',
      'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200': color === 'yellow',
      'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200': color === 'red',
      'bg-info-100 text-info-800 dark:bg-info-900 dark:text-info-200': color === 'blue',
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200': color === 'purple',
      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200': !color || color === 'gray',
    }"
  >
    <slot />
  </span>
</template>
