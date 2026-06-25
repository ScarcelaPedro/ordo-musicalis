<script setup lang="ts">
defineProps<{ value?: string; required?: boolean }>()
</script>

<template>
  <label class="block font-medium text-sm text-gray-700">
    <slot>{{ value }}</slot>
    <span v-if="required" class="text-red-500 ml-1">*</span>
  </label>
</template>
