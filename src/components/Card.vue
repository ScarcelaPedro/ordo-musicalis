<script setup lang="ts">
// Elevation 1 (surface, com sombra) é o padrão -- mesma aparência do "cartão branco com
// sombra suave" já usado em quase toda tela hoje (achado quantificado em docs/tasks/0019-*.md,
// 114 ocorrências de shadow-sm). `bordered` é Elevation 0: sem sombra, só borda -- para
// conteúdo secundário que não precisa "flutuar" (docs/tasks/0023-*.md).
withDefaults(defineProps<{ bordered?: boolean }>(), { bordered: false })
</script>

<template>
  <div
    class="rounded-lg bg-white p-6 dark:bg-gray-800"
    :class="bordered ? 'border border-gray-200 dark:border-gray-700' : 'shadow-sm'"
  >
    <slot />
  </div>
</template>
