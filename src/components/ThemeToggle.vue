<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'

const theme = useThemeStore()

const order = ['system', 'light', 'dark'] as const
const labels: Record<(typeof order)[number], string> = {
  system: 'Tema: sistema',
  light: 'Tema: claro',
  dark: 'Tema: escuro',
}

function cycle() {
  const next = order[(order.indexOf(theme.preference) + 1) % order.length]
  theme.setPreference(next)
}
</script>

<template>
  <button
    type="button"
    @click="cycle"
    :title="labels[theme.preference]"
    :aria-label="labels[theme.preference]"
    class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700"
  >
    <svg v-if="theme.preference === 'light'" class="h-5 w-5" stroke="currentColor" fill="none" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
    <svg v-else-if="theme.preference === 'dark'" class="h-5 w-5" stroke="currentColor" fill="none" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
    <svg v-else class="h-5 w-5" stroke="currentColor" fill="none" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  </button>
</template>
