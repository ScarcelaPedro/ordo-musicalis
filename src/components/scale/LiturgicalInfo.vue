<script setup lang="ts">
// A tela de Liturgia (liturgia/Show.vue) é rica -- 10 seções (antífonas, coleta, leituras,
// evangelho...), lidas por completo nesta task. Este componente NÃO tenta reproduzir a página
// inteira: é a prévia compacta (tempo litúrgico + cor) que a TASK-0010 deixou como decisão em
// aberto para a tela de Detalhes da Escala, no mesmo espírito da prévia já existente de
// Repertório -- não um substituto da página de Liturgia completa.
//
// Color classes and meaning come from the single liturgical color module (TASK-0100).
import { computed } from 'vue'
import { liturgicalColorLabel, liturgicalColorStyle } from '@/utils/liturgicalColors'

const props = defineProps<{ liturgia: string; cor?: string | null }>()

const style = computed(() => liturgicalColorStyle(props.cor))
const label = computed(() => liturgicalColorLabel(props.cor))
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <span
      v-if="cor"
      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      :class="style.badge"
      :title="label ?? undefined"
    >
      {{ cor }}<span v-if="label" class="sr-only"> — {{ style.meaning }}</span>
    </span>
    <span class="font-serif text-body text-gray-800 dark:text-gray-200">{{ liturgia }}</span>
  </div>
</template>
