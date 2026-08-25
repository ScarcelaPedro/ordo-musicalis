<script setup lang="ts">
// Diferente do Toast: fica no fluxo do conteúdo, sem auto-dismiss -- para mensagens que
// precisam continuar visíveis enquanto o usuário trabalha (docs/tasks/0022-*.md).
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/vue/20/solid'

withDefaults(defineProps<{ type?: 'info' | 'success' | 'warning' | 'error' }>(), { type: 'info' })

const ICONS = {
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
}
</script>

<template>
  <div
    role="alert"
    class="flex items-start gap-3 rounded-md px-4 py-3 text-sm"
    :class="{
      'bg-success-50 text-success-800 dark:bg-success-900/40 dark:text-success-200': type === 'success',
      'bg-warning-50 text-warning-800 dark:bg-warning-900/40 dark:text-warning-200': type === 'warning',
      'bg-danger-50 text-danger-800 dark:bg-danger-900/40 dark:text-danger-200': type === 'error',
      'bg-info-50 text-info-800 dark:bg-info-900/40 dark:text-info-200': type === 'info',
    }"
  >
    <component :is="ICONS[type]" class="h-5 w-5 shrink-0" aria-hidden="true" />
    <div class="min-w-0">
      <slot />
    </div>
  </div>
</template>
