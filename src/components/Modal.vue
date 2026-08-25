<script setup lang="ts">
// Foco preso implementado à mão (sem dependência nova, SPEC-004 §62) -- ciclo de Tab dentro
// do painel enquanto aberto, foco devolvido ao elemento que abriu o modal ao fechar.
import { ref, watch, onBeforeUnmount, nextTick } from 'vue'
import IconButton from './IconButton.vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  maxWidth?: string
}>(), { maxWidth: 'max-w-md' })

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
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/30" @click="close" />
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="modelValue"
            ref="panel"
            role="dialog"
            aria-modal="true"
            :aria-label="title"
            class="relative w-full rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"
            :class="maxWidth"
          >
            <div class="mb-4 flex items-start justify-between gap-4">
              <h2 v-if="title" class="text-h4 text-gray-900 dark:text-gray-100">{{ title }}</h2>
              <IconButton :ariaLabel="'Fechar'" class="-mr-2 -mt-2 shrink-0" @click="close">
                <XMarkIcon class="h-5 w-5" />
              </IconButton>
            </div>
            <slot />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
