<script setup lang="ts">
// A tela de Liturgia (liturgia/Show.vue) é rica -- 10 seções (antífonas, coleta, leituras,
// evangelho...), lidas por completo nesta task. Este componente NÃO tenta reproduzir a página
// inteira: é a prévia compacta (tempo litúrgico + cor) que a TASK-0010 deixou como decisão em
// aberto para a tela de Detalhes da Escala, no mesmo espírito da prévia já existente de
// Repertório -- não um substituto da página de Liturgia completa.
//
// Mapeamento de cor é o mesmo já usado como badge em liturgia/Show.vue (`CORES_CLASSES`) --
// deliberadamente diferente do mapeamento de fundo de célula do calendário
// (`CORES_LITURGICAS_CLASSES`, Dashboard.vue): mesmas 5 cores, mas aplicadas a propósitos
// visuais distintos (badge vs. fundo), não uma duplicação a fundir.
const CORES_BADGE: Record<string, string> = {
  Verde: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Roxo: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Branco: 'bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-500',
  Vermelho: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Rosa: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
}

defineProps<{ liturgia: string; cor?: string | null }>()
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <span
      v-if="cor"
      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      :class="CORES_BADGE[cor] ?? CORES_BADGE.Branco"
    >
      {{ cor }}
    </span>
    <span class="font-serif text-body text-gray-800 dark:text-gray-200">{{ liturgia }}</span>
  </div>
</template>
