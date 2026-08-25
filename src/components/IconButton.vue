<script setup lang="ts">
import Spinner from './Spinner.vue'

// ariaLabel é obrigatório de propósito: um botão só-ícone sem rótulo acessível é
// inutilizável por leitor de tela (SPEC-003 §45/§48, achado da auditoria: hoje só 2 de N
// controles ícone-apenas têm aria-label).
defineProps<{
  ariaLabel: string
  disabled?: boolean
  loading?: boolean
  type?: string
}>()
</script>

<template>
  <button
    :type="(type ?? 'button') as 'submit' | 'button' | 'reset'"
    :disabled="disabled || loading"
    :aria-label="ariaLabel"
    :title="ariaLabel"
    class="inline-flex h-11 w-11 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 dark:focus:ring-offset-gray-800"
  >
    <Spinner v-if="loading" size="h-4 w-4" />
    <slot v-else />
  </button>
</template>
