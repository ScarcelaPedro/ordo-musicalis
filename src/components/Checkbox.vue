<script setup lang="ts">
// Mantém o <input type="checkbox"> nativo, só estilizado — mesma lógica do Select.vue.
// O <label> envolvendo o input pareia label/controle implicitamente, sem precisar de
// for/id combinados manualmente. `ariaLabel` cobre o caso sem texto visível (ex. célula de
// grade onde cabeçalho de linha/coluna já dá o contexto) -- sem ele, um checkbox sem `label`
// nem slot padrão ficaria sem nome acessível algum (achado corrigido na TASK-0052, primeiro uso
// real desse caso).
defineProps<{
  modelValue?: boolean
  label?: string
  ariaLabel?: string
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
      :checked="modelValue"
      :disabled="disabled"
      :aria-label="!label && !$slots.default ? ariaLabel : undefined"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      class="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
      v-bind="$attrs"
    />
    <span v-if="label || $slots.default" class="text-sm text-gray-700 dark:text-gray-300">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>
