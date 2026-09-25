<script setup lang="ts">
// Elevation 1 (surface, com sombra) é o padrão -- mesma aparência do "cartão branco com
// sombra suave" já usado em quase toda tela hoje (achado quantificado em docs/tasks/0019-*.md,
// 114 ocorrências de shadow-sm). `bordered` é Elevation 0: sem sombra, só borda -- para
// conteúdo secundário que não precisa "flutuar" (docs/tasks/0023-*.md).
// SPEC-003.1 (TASK-0097): elevation 1 now uses the `shadow-card` token and `rounded-xl`, from
// the reference; in dark mode the surface contrast already separates the card, so no shadow.
withDefaults(defineProps<{ bordered?: boolean }>(), { bordered: false })
</script>

<template>
  <div
    class="rounded-xl bg-white p-6 dark:bg-gray-800"
    :class="bordered ? 'border border-gray-200 dark:border-gray-700' : 'shadow-card dark:shadow-none'"
  >
    <slot />
  </div>
</template>
