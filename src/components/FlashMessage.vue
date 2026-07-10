<script setup lang="ts">
import { useFlashStore } from '@/stores/flash'
const flash = useFlashStore()
</script>

<template>
  <Transition name="fade">
    <div
      v-if="flash.flash"
      class="mb-4 px-4 py-3 rounded-md text-sm font-medium"
      :class="{
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': flash.flash.type === 'success',
        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': flash.flash.type === 'error',
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': flash.flash.type === 'info',
      }"
    >
      {{ flash.flash.message }}
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
