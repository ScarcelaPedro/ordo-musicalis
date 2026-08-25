<script setup lang="ts">
import Spinner from './Spinner.vue'

defineProps<{ disabled?: boolean; loading?: boolean; type?: string }>()
</script>

<template>
  <button
    :type="(type ?? 'button') as 'submit' | 'button' | 'reset'"
    :disabled="disabled || loading"
    class="inline-flex min-h-11 items-center justify-center gap-2 px-4 py-2 bg-danger-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-danger-500 active:bg-danger-700 focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
  >
    <Spinner v-if="loading" size="h-3.5 w-3.5" />
    <slot />
  </button>
</template>
