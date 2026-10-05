<script setup lang="ts">
// Card whose body can be collapsed from its header (TASK-0122). The `actions` slot (e.g. a
// "Ver todas" link) stays visible while collapsed. With `storageKey`, the open/closed state is
// remembered per browser.
import { ref } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import { browserStorage, loadCollapsed, saveCollapsed } from '@/utils/collapsedState'

const props = defineProps<{ titleId: string; storageKey?: string }>()

const contentId = `${props.titleId}-content`
const collapsed = ref(props.storageKey ? loadCollapsed(browserStorage(), props.storageKey) : false)

function toggle() {
  collapsed.value = !collapsed.value
  if (props.storageKey) saveCollapsed(browserStorage(), props.storageKey, collapsed.value)
}
</script>

<template>
  <section class="rounded-xl bg-white p-5 shadow-card dark:bg-gray-800 dark:shadow-none" :aria-labelledby="titleId">
    <div class="flex items-center justify-between gap-2">
      <h3 :id="titleId" class="min-w-0 flex-1 text-body font-semibold text-gray-800 dark:text-gray-100">
        <button
          type="button"
          class="-mx-1 flex min-h-11 w-full items-center gap-2 rounded-md px-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          :aria-expanded="!collapsed"
          :aria-controls="contentId"
          @click="toggle"
        >
          <ChevronDownIcon
            class="h-4 w-4 shrink-0 text-gray-500 transition-transform dark:text-gray-400"
            :class="collapsed ? '-rotate-90' : ''"
            aria-hidden="true"
          />
          <span class="min-w-0"><slot name="title" /></span>
        </button>
      </h3>
      <slot name="actions" />
    </div>
    <div v-show="!collapsed" :id="contentId" class="mt-3">
      <slot />
    </div>
  </section>
</template>
