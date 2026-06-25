<script setup lang="ts">
defineProps<{ color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray' }>()
</script>

<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    :class="{
      'bg-green-100 text-green-800': color === 'green',
      'bg-yellow-100 text-yellow-800': color === 'yellow',
      'bg-red-100 text-red-800': color === 'red',
      'bg-blue-100 text-blue-800': color === 'blue',
      'bg-gray-100 text-gray-800': !color || color === 'gray',
    }"
  >
    <slot />
  </span>
</template>
