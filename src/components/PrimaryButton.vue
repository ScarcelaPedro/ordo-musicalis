<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Spinner from './Spinner.vue'

// `to` renders the same visual as a RouterLink, for navigation actions styled as buttons
// (e.g. "Nova escala" in page headers -- TASK-0099). Without `to` it is a regular <button>.
defineProps<{ disabled?: boolean; loading?: boolean; type?: string; to?: string }>()
</script>

<template>
  <component
    :is="to ? RouterLink : 'button'"
    :to="to"
    :type="to ? undefined : ((type ?? 'submit') as 'submit' | 'button' | 'reset')"
    :disabled="to ? undefined : disabled || loading"
    class="inline-flex min-h-11 items-center justify-center gap-2 px-4 py-2 bg-primary-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-primary-700 focus:bg-primary-700 active:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
  >
    <Spinner v-if="loading" size="h-3.5 w-3.5" />
    <slot />
  </component>
</template>
