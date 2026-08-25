<script setup lang="ts">
// Generaliza o mecanismo de slide-in já implementado no menu lateral de
// AuthenticatedLayout.vue (translate + overlay + shadow-xl, 200ms) -- não é um padrão novo,
// só a extração de um que já funciona. A integração do menu lateral com este componente fica
// para docs/tasks/0034-*.md, não nesta task.
import { ref, watch, onBeforeUnmount, nextTick, computed } from 'vue'
import IconButton from './IconButton.vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  side?: 'left' | 'right' | 'bottom'
}>(), { side: 'right' })

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const panel = ref<HTMLElement | null>(null)
let previouslyFocused: HTMLElement | null = null

function close() {
  emit('update:modelValue', false)
}

function focusableElements(): HTMLElement[] {
  if (!panel.value) return []
  return Array.from(
    panel.value.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    ),
  )
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
    return
  }
  if (event.key !== 'Tab') return
  const items = focusableElements()
  if (items.length === 0) return
  const first = items[0]
  const last = items[items.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      previouslyFocused = document.activeElement as HTMLElement
      document.addEventListener('keydown', onKeydown)
      await nextTick()
      focusableElements()[0]?.focus()
    } else {
      document.removeEventListener('keydown', onKeydown)
      previouslyFocused?.focus()
    }
  },
)

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))

// Strings completas (não concatenadas em runtime) para o scanner do Tailwind conseguir
// detectar as classes -- ver nota em docs/tasks/0022-*.md sobre esse cuidado.
const SIDE = {
  left: { position: 'inset-y-0 left-0', hidden: '-translate-x-full', size: 'w-full max-w-sm' },
  right: { position: 'inset-y-0 right-0', hidden: 'translate-x-full', size: 'w-full max-w-sm' },
  bottom: { position: 'inset-x-0 bottom-0', hidden: 'translate-y-full', size: 'max-h-[80vh]' },
}
const current = computed(() => SIDE[props.side])
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="modelValue" class="fixed inset-0 z-50 bg-black/30" @click="close" />
    </Transition>
    <Transition
      enter-active-class="transition-transform duration-200"
      :enter-from-class="current.hidden"
      enter-to-class="translate-x-0 translate-y-0"
      leave-active-class="transition-transform duration-150"
      leave-from-class="translate-x-0 translate-y-0"
      :leave-to-class="current.hidden"
    >
      <div
        v-if="modelValue"
        ref="panel"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        class="fixed z-50 flex flex-col bg-white shadow-xl dark:bg-gray-800"
        :class="[current.position, current.size]"
      >
        <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <h2 v-if="title" class="text-h4 text-gray-900 dark:text-gray-100">{{ title }}</h2>
          <IconButton :ariaLabel="'Fechar'" @click="close">
            <XMarkIcon class="h-5 w-5" />
          </IconButton>
        </div>
        <div class="flex-1 overflow-y-auto p-4">
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
