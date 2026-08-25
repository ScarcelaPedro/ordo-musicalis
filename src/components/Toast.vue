<script setup lang="ts">
// Reaproveita a store `flash.ts` como está (auto-dismiss de 4s já implementado ali,
// docs/tasks/0022-*.md) -- essa é literalmente a especificação de Toast do Design System.
// Não substitui FlashMessage.vue nesta task (mudar o consumo é tarefa de layout,
// docs/tasks/0034-*.md); os dois convivem até essa migração acontecer.
import { useFlashStore } from '@/stores/flash'
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/vue/20/solid'

const flash = useFlashStore()

const ICONS = {
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="flash.flash"
        role="status"
        aria-live="polite"
        class="fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-md px-4 py-3 text-sm font-medium shadow-lg"
        :class="{
          'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200': flash.flash.type === 'success',
          'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200': flash.flash.type === 'warning',
          'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200': flash.flash.type === 'error',
          'bg-info-100 text-info-800 dark:bg-info-900 dark:text-info-200': flash.flash.type === 'info',
        }"
      >
        <component :is="ICONS[flash.flash.type]" class="h-5 w-5 shrink-0" aria-hidden="true" />
        <span>{{ flash.flash.message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>
