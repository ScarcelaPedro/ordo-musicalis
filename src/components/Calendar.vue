<script setup lang="ts">
// Extraído da grade real de dashboard/Dashboard.vue (calendarCells/prevMonth/nextMonth).
//
// Correção a um achado da auditoria/TASK-0023: `public/Calendar.vue` NÃO tem uma grade --
// é uma lista por mês (navegação + lista de celebrações), sem células de dia. A duplicação
// real entre as duas telas é só a navegação de mês (prevMonth/nextMonth/MONTH_NAMES), não uma
// "grade quase idêntica". Este componente extrai a grade completa (o que só Dashboard.vue
// precisa, por ser o único com o problema de largura no mobile); Public Calendar não precisa
// adotá-lo, já que nunca teve grade nem o problema que ela causa.
//
// Sem acoplamento a "escala": eventos/eventos importantes/cor de fundo por dia entram via
// props de função + slots, para o componente continuar genérico (SPEC-004 §46/§47 -- Calendar
// é componente base, não de domínio).
//
// SPEC-003.1 visual language (TASK-0101): desktop cells are separate white tiles; when
// `cellMarker` is given, the day's meaning (e.g. liturgical season) is a small dot in the
// corner instead of a full-cell tint, so the tile stays readable. The compact mobile grid keeps
// its own logic (TASK-0008 §31): tinted cell (`cellBackground`) + event dot + list below.
import { computed } from 'vue'
import IconButton from './IconButton.vue'
import Spinner from './Spinner.vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

const props = withDefaults(
  defineProps<{
    month: number // 0-11
    year: number
    loading?: boolean
    /** Heading shown before the month name, e.g. "Calendário Litúrgico". */
    title?: string
    cellBackground?: (dateKey: string) => string
    /** Classes of a corner dot for the desktop tile; when set, desktop tiles stay neutral. */
    cellMarker?: (dateKey: string) => string | null
    hasEvents?: (dateKey: string) => boolean
    // Optional accessible description of what the cell color means (e.g. the liturgical
    // season) -- color must never be the only carrier of information (SPEC-003.1 §25).
    cellLabel?: (dateKey: string) => string | null
  }>(),
  {
    loading: false,
    title: '',
    cellBackground: () => 'bg-white dark:bg-gray-800',
    cellMarker: undefined,
    hasEvents: () => false,
    cellLabel: () => null,
  },
)

const emit = defineEmits<{
  'update:month': [month: number]
  'update:year': [year: number]
  'select-day': [dateKey: string]
}>()

function prevMonth() {
  if (props.month === 0) {
    emit('update:month', 11)
    emit('update:year', props.year - 1)
  } else {
    emit('update:month', props.month - 1)
  }
}

function nextMonth() {
  if (props.month === 11) {
    emit('update:month', 0)
    emit('update:year', props.year + 1)
  } else {
    emit('update:month', props.month + 1)
  }
}

const today = new Date()

const isCurrentMonth = computed(() => props.month === today.getMonth() && props.year === today.getFullYear())

function goToCurrentMonth() {
  emit('update:month', today.getMonth())
  emit('update:year', today.getFullYear())
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const cells = computed<(number | null)[]>(() => {
  const firstDow = new Date(props.year, props.month, 1).getDay()
  const daysInMonth = new Date(props.year, props.month + 1, 0).getDate()
  const result: (number | null)[] = Array(firstDow).fill(null)
  for (let d = 1; d <= daysInMonth; d++) result.push(d)
  while (result.length % 7 !== 0) result.push(null)
  return result
})

function dateKey(day: number) {
  return `${props.year}-${String(props.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function isToday(day: number) {
  return today.getFullYear() === props.year && today.getMonth() === props.month && today.getDate() === day
}

// The compact mobile cell only shows the number, so its label carries the rest.
function compactDayLabel(day: number) {
  const key = dateKey(day)
  return [`Dia ${day}`, isToday(day) ? 'hoje' : null, props.hasEvents(key) ? 'com celebrações' : null, props.cellLabel(key)]
    .filter(Boolean)
    .join(', ')
}

function desktopTileClass(day: number) {
  if (isToday(day)) return 'border-primary-300 bg-primary-50/70 dark:border-primary-600 dark:bg-primary-900/30'
  if (props.cellMarker) return 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
  return ['border-gray-200 dark:border-gray-700', props.cellBackground(dateKey(day))]
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
      <h3 class="text-h4 text-gray-800 dark:text-gray-100">
        <template v-if="title">{{ title }} — </template>{{ MONTH_NAMES[month] }} {{ year }}
      </h3>
      <div class="flex items-center gap-1.5">
        <IconButton :ariaLabel="'Mês anterior'" @click="prevMonth">
          <ChevronLeftIcon class="h-5 w-5" />
        </IconButton>
        <button
          type="button"
          class="min-h-11 rounded-lg border border-gray-200 px-3 text-body-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          :disabled="isCurrentMonth"
          @click="goToCurrentMonth"
        >
          Mês atual
        </button>
        <IconButton :ariaLabel="'Próximo mês'" @click="nextMonth">
          <ChevronRightIcon class="h-5 w-5" />
        </IconButton>
      </div>
    </div>

    <!-- Desktop: grade completa (§6.2 da SPEC-002 permite manter grid no desktop) -->
    <div class="hidden px-4 pb-4 md:block sm:px-6">
      <div class="grid grid-cols-7 gap-1.5">
        <div
          v-for="name in DAY_NAMES" :key="name"
          class="pb-1.5 text-center text-caption font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
        >
          {{ name }}
        </div>
      </div>
      <div v-if="!loading" class="grid grid-cols-7 gap-1.5">
        <div
          v-for="(day, idx) in cells" :key="idx"
          class="min-h-[84px] rounded-lg border p-1.5 lg:min-h-[92px]"
          :class="day ? desktopTileClass(day) : 'border-transparent bg-gray-50 dark:bg-gray-900/40'"
          :title="day ? cellLabel(dateKey(day)) ?? undefined : undefined"
        >
          <template v-if="day">
            <div class="mb-1 flex items-start justify-between gap-1">
              <span
                class="flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-caption font-semibold"
                :class="isToday(day) ? 'bg-primary-700 text-white' : 'text-gray-800 dark:text-gray-200'"
              >{{ day }}</span>
              <span
                v-if="cellMarker && cellMarker(dateKey(day))"
                class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                :class="cellMarker(dateKey(day))"
                aria-hidden="true"
              />
            </div>
            <p v-if="isToday(day)" class="mb-1 text-caption font-medium text-primary-700 dark:text-primary-300">Hoje</p>
            <span v-if="cellLabel(dateKey(day))" class="sr-only">{{ cellLabel(dateKey(day)) }}</span>
            <slot name="day" :day="day" :date-key="dateKey(day)" :is-today="isToday(day)" />
          </template>
        </div>
      </div>
      <div v-else class="flex flex-col items-center justify-center py-24 text-gray-600 dark:text-gray-400">
        <Spinner size="mb-3 h-8 w-8 text-primary-400" />
        <p class="text-sm">Carregando calendário...</p>
      </div>
    </div>

    <!-- Mobile: grade compacta (sem texto em célula) + lista, decisão da TASK-0008 (§31) -->
    <div class="md:hidden">
      <div class="grid grid-cols-7 gap-1 px-3 pb-2">
        <div
          v-for="name in DAY_NAMES" :key="name"
          class="pb-1 text-center text-caption font-semibold uppercase text-gray-500 dark:text-gray-400"
          aria-hidden="true"
        >
          {{ name.charAt(0) }}
        </div>
        <button
          v-for="(day, idx) in cells" :key="idx"
          type="button"
          :disabled="!day"
          class="flex h-10 flex-col items-center justify-center gap-0.5 rounded-md text-caption disabled:opacity-0"
          :class="[
            day ? cellBackground(dateKey(day)) : '',
            day && isToday(day) ? 'font-bold text-primary-800 ring-2 ring-inset ring-primary-600 dark:text-primary-200 dark:ring-primary-400' : 'text-gray-700 dark:text-gray-300',
          ]"
          :aria-label="day ? compactDayLabel(day) : undefined"
          @click="day && $emit('select-day', dateKey(day))"
        >
          <span>{{ day }}</span>
          <span v-if="day && hasEvents(dateKey(day))" class="h-1 w-1 rounded-full bg-gray-800 dark:bg-gray-100" aria-hidden="true" />
        </button>
      </div>
      <div class="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-700 dark:border-gray-700">
        <template v-for="(day, idx) in cells" :key="idx">
          <div v-if="day && hasEvents(dateKey(day))" class="px-4 py-3">
            <slot name="list-item" :day="day" :date-key="dateKey(day)" :is-today="isToday(day)" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
