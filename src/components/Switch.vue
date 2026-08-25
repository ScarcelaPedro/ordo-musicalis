<script setup lang="ts">
// Input real (checkbox) fica sr-only para acessibilidade nativa (teclado, leitor de tela);
// a aparência de trilho+botão é só visual, dirigida pelo estado do input via peer-*.
// Input e trilho são irmãos diretos (não pai/filho) de propósito -- o seletor `peer-*` do
// Tailwind depende de combinador de irmão (~), não funciona atravessando um nível de aninhamento.
defineProps<{
  modelValue?: boolean
  label?: string
  disabled?: boolean
}>()

defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<template>
  <label
    class="inline-flex min-h-11 cursor-pointer items-center gap-2"
    :class="disabled ? 'cursor-not-allowed opacity-50' : ''"
  >
    <input
      type="checkbox"
      role="switch"
      :aria-checked="modelValue"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      class="peer sr-only"
    />
    <span
      class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2"
      :class="modelValue ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'"
    >
      <span
        class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
        :class="modelValue ? 'translate-x-6' : 'translate-x-1'"
      />
    </span>
    <span v-if="label || $slots.default" class="text-sm text-gray-700 dark:text-gray-300">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>
