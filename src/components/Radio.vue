<script setup lang="ts">
// Nenhum uso de radio existe hoje no sistema (confirmado em docs/tasks/0021-*.md) — padrão
// definido preventivamente, para quando a necessidade real aparecer.
defineProps<{
  modelValue?: string | number | null
  value: string | number
  name: string
  label?: string
  disabled?: boolean
}>()

defineEmits<{ 'update:modelValue': [value: string | number] }>()
</script>

<template>
  <label
    class="inline-flex min-h-11 cursor-pointer items-center gap-2"
    :class="disabled ? 'cursor-not-allowed opacity-50' : ''"
  >
    <input
      type="radio"
      :name="name"
      :value="value"
      :checked="modelValue === value"
      :disabled="disabled"
      @change="$emit('update:modelValue', value)"
      class="border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
    />
    <span v-if="label || $slots.default" class="text-sm text-gray-700 dark:text-gray-300">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>
