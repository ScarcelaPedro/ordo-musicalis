<script setup lang="ts">
import ThemeToggle from '@/components/ThemeToggle.vue'
import brasaoUrl from '@/assets/images/brasao-paroquia.png'
</script>

<template>
  <div class="relative min-h-screen flex flex-col sm:justify-center items-center px-4 pt-10 pb-8 sm:pt-0 bg-canvas">
    <ThemeToggle class="absolute top-4 right-4" />
    <!-- Parish identity on every auth screen (login, register, password reset) -- same coat of
         arms used in the sidebar and dashboard (TASK-0113). -->
    <div class="flex flex-col items-center text-center">
      <img :src="brasaoUrl" alt="Brasão da Paróquia São João Batista" class="h-28 w-auto sm:h-32" width="104" height="120" />
      <p class="mt-4 text-label uppercase text-accent-700 dark:text-accent-300">Paróquia São João Batista</p>
      <h1 class="mt-1 text-h1 text-gray-900 dark:text-gray-50">Ordo Musicalis</h1>
    </div>
    <div class="w-full sm:max-w-md mt-8 px-6 py-8 bg-white shadow-card overflow-hidden rounded-xl dark:bg-gray-800 dark:shadow-none">
      <slot />
    </div>
  </div>
</template>
