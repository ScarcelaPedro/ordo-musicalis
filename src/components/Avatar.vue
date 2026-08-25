<script setup lang="ts">
// Cor neutra fixa (não variável por pessoa) -- decisão da TASK-0023: não competir com a
// paleta semântica de estado, manter a sobriedade pedida pela SPEC-003 §2.
import { computed } from 'vue'

const props = withDefaults(defineProps<{ name: string; size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' })

const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
})
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center rounded-full bg-secondary-200 font-semibold text-secondary-700 dark:bg-secondary-700 dark:text-secondary-100"
    :class="{
      'h-7 w-7 text-xs': size === 'sm',
      'h-9 w-9 text-sm': size === 'md',
      'h-11 w-11 text-base': size === 'lg',
    }"
    :title="name"
  >
    {{ initials }}
  </span>
</template>
