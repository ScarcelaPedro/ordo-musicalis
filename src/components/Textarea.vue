<script setup lang="ts">
defineProps<{
  modelValue?: string | null
  rows?: number
  error?: boolean
}>()

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <textarea
    :value="modelValue ?? ''"
    :rows="rows ?? 3"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    class="rounded-md shadow-sm w-full dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
    :class="error
      ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500 dark:border-danger-500'
      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600'"
    v-bind="$attrs"
  />
</template>
