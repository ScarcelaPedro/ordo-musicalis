<script setup lang="ts">
// `for` opcional (TASK-0055): sem ele, o <label> fica só visualmente perto do campo, sem
// associação programática nenhuma -- leitor de tela não anuncia o rótulo ao focar o input.
// Aditivo/retrocompatível: quem já usa InputLabel sem passar `for` continua funcionando
// exatamente como antes (mesmo achado, mesmo comportamento visual).
defineProps<{ value?: string; required?: boolean; for?: string }>()
</script>

<template>
  <label :for="$props.for" class="block font-medium text-sm text-gray-700 dark:text-gray-300">
    <slot>{{ value }}</slot>
    <span v-if="required" class="text-red-500 ml-1">*</span>
  </label>
</template>
