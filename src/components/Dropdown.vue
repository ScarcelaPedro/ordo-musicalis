<script setup lang="ts">
// Abre ao clicar no slot #trigger, fecha ao clicar fora (listener global com cleanup) ou ao
// clicar em qualquer item do slot #items (docs/tasks/0023-*.md). Elevation 2 (shadow-md).
import { ref, onMounted, onBeforeUnmount } from 'vue'

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const triggerWrapper = ref<HTMLElement | null>(null)
const itemsWrapper = ref<HTMLElement | null>(null)

function toggle() {
  open.value = !open.value
}

// TASK-0074 (correção): quando um item (ex. "Excluir") dispara a abertura de um Modal, o
// consumidor (ex. servidores/Index.vue) muda um estado reativo no mesmo clique -- isso agenda o
// watcher assíncrono do Modal (que decide pra onde o foco vai a seguir) antes mesmo de o clique
// terminar de "borbulhar" até o listener de fechamento do Dropdown (`@click` normal, fase de
// bubble, roda por último). Resultado: quando o Dropdown finalmente tentaria devolver o foco pro
// próprio trigger, o Modal já tinha assumido o foco (ou o item já não era mais o elemento focado
// por outro motivo) -- a correção chega tarde demais pra evitar a perda.
//
// A correção real: mover o foco pro trigger na FASE DE CAPTURA (`@click.capture`), que roda
// ANTES do próprio handler do item (fase de bubble) -- inclusive antes do que abre o Modal.
// `click.capture` dispara tanto para clique de mouse quanto para Enter/Space num botão focado
// (o navegador sintetiza um `click` real nos dois casos, passando pelas mesmas duas fases).
function onItemsClickCapture() {
  if (!itemsWrapper.value?.contains(document.activeElement)) return
  const focavel = triggerWrapper.value?.querySelector<HTMLElement>('button, a, [tabindex]')
  focavel?.focus()
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
    <div ref="triggerWrapper" @click="toggle">
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
        ref="itemsWrapper"
        role="menu"
        class="absolute right-0 z-40 mt-2 min-w-[10rem] rounded-md bg-white py-1 shadow-md dark:bg-gray-800"
        @click.capture="onItemsClickCapture"
        @click="close"
      >
        <slot name="items" />
      </div>
    </Transition>
  </div>
</template>
