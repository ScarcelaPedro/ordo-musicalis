<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  modelValue?: string | number | null
  type?: string
  autofocus?: boolean
  error?: boolean
  success?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const input = ref<HTMLInputElement | null>(null)

onMounted(() => { if (props.autofocus) input.value?.focus() })
</script>

<template>
  <input
    ref="input"
    :type="type ?? 'text'"
    :value="modelValue ?? ''"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    class="rounded-md shadow-sm w-full dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
    :class="error
      ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500 dark:border-danger-500'
      : success
        ? 'border-success-500 focus:border-success-500 focus:ring-success-500 dark:border-success-500'
        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600'"
    v-bind="$attrs"
  />
</template>
