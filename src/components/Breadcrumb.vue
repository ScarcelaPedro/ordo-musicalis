<script setup lang="ts">
// Critério de uso já definido na Etapa 2 (SPEC-002 §19): só fluxos administrativos complexos,
// nunca em toda tela -- este componente só define a aparência, não decide onde é usado.
import { ChevronRightIcon } from '@heroicons/vue/20/solid'

defineProps<{ items: { label: string; to?: string }[] }>()
</script>

<template>
  <nav aria-label="Breadcrumb" class="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
    <template v-for="(item, idx) in items" :key="idx">
      <ChevronRightIcon v-if="idx > 0" class="h-3.5 w-3.5 shrink-0 text-gray-300 dark:text-gray-600" aria-hidden="true" />
      <RouterLink
        v-if="item.to && idx < items.length - 1"
        :to="item.to"
        class="hover:text-gray-700 dark:hover:text-gray-200"
      >
        {{ item.label }}
      </RouterLink>
      <span
        v-else
        class="font-medium text-gray-700 dark:text-gray-200"
        :aria-current="idx === items.length - 1 ? 'page' : undefined"
      >
        {{ item.label }}
      </span>
    </template>
  </nav>
</template>
