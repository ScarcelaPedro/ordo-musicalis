<script setup lang="ts">
// Generaliza o padrão pill-toggle já usado em reports/Index.vue (único uso real hoje,
// confirmado em docs/tasks/0023-*.md) -- mesma estrutura visual, formalizada como componente.
defineProps<{ tabs: { value: string; label: string }[]; modelValue: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="flex flex-wrap gap-2" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      role="tab"
      :aria-selected="modelValue === tab.value"
      class="min-h-11 rounded-full px-3 py-1.5 text-xs font-semibold uppercase transition"
      :class="modelValue === tab.value
        ? 'bg-primary-600 text-white'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'"
      @click="$emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
