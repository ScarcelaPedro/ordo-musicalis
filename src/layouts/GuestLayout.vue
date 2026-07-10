<script setup lang="ts">
import ThemeToggle from '@/components/ThemeToggle.vue'
</script>

<template>
  <div class="relative min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100 dark:bg-gray-900">
    <ThemeToggle class="absolute top-4 right-4" />
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100">Ordo Musicalis</h1>
    </div>
    <div class="w-full sm:max-w-md mt-6 px-6 py-8 bg-white shadow-md overflow-hidden sm:rounded-lg dark:bg-gray-800">
      <slot />
    </div>
  </div>
</template>
