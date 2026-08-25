<script setup lang="ts">
// Não existe hoje um STATUS_COLORS equivalente para disponibilidade (só confirmação de
// presença) -- mapeamento local de 2 valores, pequeno o bastante para não justificar um
// arquivo de util próprio ainda.
import Badge from '../Badge.vue'

defineProps<{ available: boolean }>()
</script>

<template>
  <Badge :color="available ? 'green' : 'gray'">{{ available ? 'Disponível' : 'Indisponível' }}</Badge>
</template>
