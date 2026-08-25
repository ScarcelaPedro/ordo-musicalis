<script setup lang="ts">
// Envolve o <select> nativo do navegador só com estilo — não substitui por combobox
// customizado (SPEC-003 §24 / SPEC-004 §62): a auditoria já classifica o select nativo como
// um acerto de acessibilidade e comportamento previsível para usuários pouco técnicos.
//
// A ligação usa `v-model` de verdade (não `:value`/`@change` manuais) para que o Vue aplique a
// mesma coerção de tipo que um `<select v-model>` nativo já tem: se as `<option :value>` forem
// number/objeto, o valor devolvido preserva esse tipo, em vez de virar sempre string (que é o
// que `event.target.value` devolveria). Importa porque a maioria dos selects do sistema é ligada
// a um ID numérico (ex. `comunidadeId`).
import { computed } from 'vue'

const props = defineProps<{
  modelValue?: string | number | null
  error?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>()

const value = computed({
  get: () => props.modelValue ?? '',
  set: (v: string | number) => emit('update:modelValue', v),
})
</script>

<template>
  <select
    v-model="value"
    class="rounded-md shadow-sm w-full min-h-11 dark:bg-gray-700 dark:text-gray-100"
    :class="error
      ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500 dark:border-danger-500'
      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600'"
    v-bind="$attrs"
  >
    <slot />
  </select>
</template>
