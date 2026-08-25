<script setup lang="ts">
// Aceita os 3 tipos já definidos em docs/tasks/0009-*.md, mesmo sem nenhum dado real de
// conflito disponível ainda (detecção não existe em nenhum endpoint hoje -- pendência
// registrada, não resolvida aqui). "Função incompatível" já é prevenida estruturalmente pelo
// filtro de categoria no ScaleForm, então normalmente não chega a ser renderizada -- o tipo
// existe aqui só para completude da spec.
import Alert from '../Alert.vue'

defineProps<{
  type: 'indisponivel' | 'ja-escalado' | 'incompativel'
  detail?: string
}>()

const TITLES: Record<string, string> = {
  indisponivel: 'Servidor indisponível',
  'ja-escalado': 'Conflito de horário',
  incompativel: 'Função incompatível',
}
</script>

<template>
  <Alert type="warning">
    <p class="font-medium">{{ TITLES[type] }}</p>
    <p v-if="detail" class="mt-0.5 text-xs opacity-90">{{ detail }}</p>
    <div v-if="$slots.action" class="mt-2">
      <slot name="action" />
    </div>
  </Alert>
</template>
