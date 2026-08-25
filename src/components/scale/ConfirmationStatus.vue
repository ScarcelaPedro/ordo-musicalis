<script setup lang="ts">
// Wrapper fino de Badge -- mantém STATUS_LABELS/STATUS_COLORS (src/utils/status.ts) como
// única fonte, sem duplicar o mapeamento aqui.
import Badge from '../Badge.vue'
import { STATUS_LABELS, STATUS_COLORS } from '@/utils/status'

defineProps<{ status: string }>()
</script>

<template>
  <Badge :color="STATUS_COLORS[status]">{{ STATUS_LABELS[status] ?? status }}</Badge>
</template>
