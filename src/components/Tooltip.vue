<script setup lang="ts">
// Reforço visual, não a fonte primária de nome acessível: o elemento disparador (slot) deve
// ter seu próprio aria-label/title quando for só-ícone (ver IconButton.vue) -- o Tooltip
// aparece em hover E em foco de teclado (group-focus-within), nunca só em mouseover.
withDefaults(defineProps<{ text: string; position?: 'top' | 'bottom' }>(), { position: 'top' })
</script>

<template>
  <span class="group relative inline-flex">
    <slot />
    <span
      role="tooltip"
      class="pointer-events-none invisible absolute z-50 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 dark:bg-gray-700"
      :class="position === 'top' ? 'bottom-full left-1/2 mb-1.5 -translate-x-1/2' : 'top-full left-1/2 mt-1.5 -translate-x-1/2'"
    >
      {{ text }}
    </span>
  </span>
</template>
