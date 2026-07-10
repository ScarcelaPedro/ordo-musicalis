<script setup lang="ts">
defineProps<{ color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray' }>()
</script>

<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    :class="{
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': color === 'green',
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': color === 'yellow',
      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': color === 'red',
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': color === 'blue',
      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200': !color || color === 'gray',
    }"
  >
    <slot />
  </span>
</template>
