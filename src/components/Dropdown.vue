<script setup lang="ts">
// Abre ao clicar no slot #trigger, fecha ao clicar fora (listener global com cleanup) ou ao
// clicar em qualquer item do slot #items (docs/tasks/0023-*.md). Elevation 2 (shadow-md).
import { ref, onMounted, onBeforeUnmount } from 'vue'

const open = ref(false)
const root = ref<HTMLElement | null>(null)

function toggle() {
  open.value = !open.value
}
function close() {
  open.value = false
}
function onClickOutside(event: MouseEvent) {
  if (root.value && !root.value.contains(event.target as Node)) close()
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div ref="root" class="relative inline-block">
    <div @click="toggle">
      <slot name="trigger" :open="open" />
    </div>
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="open"
        role="menu"
        class="absolute right-0 z-40 mt-2 min-w-[10rem] rounded-md bg-white py-1 shadow-md dark:bg-gray-800"
        @click="close"
      >
        <slot name="items" />
      </div>
    </Transition>
  </div>
</template>
