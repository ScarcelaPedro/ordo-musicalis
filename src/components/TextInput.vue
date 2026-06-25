<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  modelValue?: string | number | null
  type?: string
  autofocus?: boolean
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
    class="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full"
    v-bind="$attrs"
  />
</template>
