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
import { computed } from 'vue'
import IconButton from './IconButton.vue'
import Spinner from './Spinner.vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

const props = withDefaults(
  defineProps<{
    month: number // 0-11
    year: number
    loading?: boolean
    cellBackground?: (dateKey: string) => string
    hasEvents?: (dateKey: string) => boolean
  }>(),
  {
    loading: false,
    cellBackground: () => 'bg-white dark:bg-gray-800',
    hasEvents: () => false,
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

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const today = new Date()

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
function isSunday(day: number) { return new Date(props.year, props.month, day).getDay() === 0 }
function isSaturday(day: number) { return new Date(props.year, props.month, day).getDay() === 6 }
</script>

<template>
  <div>
    <div class="flex items-center justify-between border-b border-gray-100 bg-gray-50/60 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/60">
      <IconButton :ariaLabel="'Mês anterior'" @click="prevMonth">
        <ChevronLeftIcon class="h-5 w-5" />
      </IconButton>
      <h3 class="text-h4 tracking-wide text-gray-700 dark:text-gray-200">{{ MONTH_NAMES[month] }} {{ year }}</h3>
      <IconButton :ariaLabel="'Próximo mês'" @click="nextMonth">
        <ChevronRightIcon class="h-5 w-5" />
      </IconButton>
    </div>

    <!-- Desktop: grade completa (§6.2 da SPEC-002 permite manter grid no desktop) -->
    <div class="hidden md:block">
      <div class="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700">
        <div
          v-for="(name, i) in DAY_NAMES" :key="name"
          class="py-2.5 text-center text-xs font-bold uppercase tracking-widest"
          :class="i === 0 ? 'text-rose-600 dark:text-rose-400' : i === 6 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'"
        >
          {{ name }}
        </div>
      </div>
      <div v-if="!loading" class="grid grid-cols-7 divide-x divide-y divide-gray-100 dark:divide-gray-700">
        <div
          v-for="(day, idx) in cells" :key="idx"
          class="min-h-[90px] p-1.5 sm:min-h-[108px]"
          :class="[
            day ? cellBackground(dateKey(day)) : 'bg-gray-50/80 dark:bg-gray-900/40',
            day && isToday(day) ? 'ring-2 ring-inset ring-primary-400' : '',
          ]"
        >
          <div v-if="day" class="mb-1">
            <span
              class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
              :class="[
                isToday(day) ? 'bg-primary-600 text-white shadow-sm' : '',
                !isToday(day) && isSunday(day) ? 'text-rose-600 dark:text-rose-400' : '',
                !isToday(day) && isSaturday(day) ? 'text-primary-600 dark:text-primary-400' : '',
                !isToday(day) && !isSunday(day) && !isSaturday(day) ? 'text-gray-600 dark:text-gray-300' : '',
              ]"
            >{{ day }}</span>
          </div>
          <slot v-if="day" name="day" :day="day" :date-key="dateKey(day)" :is-today="isToday(day)" />
        </div>
      </div>
      <div v-else class="flex flex-col items-center justify-center py-24 text-gray-600 dark:text-gray-400">
        <Spinner size="mb-3 h-8 w-8 text-primary-400" />
        <p class="text-sm">Carregando calendário...</p>
      </div>
    </div>

    <!-- Mobile: grade compacta (sem texto em célula) + lista, decisão da TASK-0008 (§31) -->
    <div class="md:hidden">
      <div class="grid grid-cols-7 gap-1 px-3 py-2">
        <button
          v-for="(day, idx) in cells" :key="idx"
          type="button"
          :disabled="!day"
          class="flex h-9 flex-col items-center justify-center gap-0.5 rounded-md text-xs disabled:opacity-0"
          :class="[
            day ? cellBackground(dateKey(day)) : '',
            day && isToday(day) ? 'font-bold ring-2 ring-inset ring-primary-400' : 'text-gray-600 dark:text-gray-300',
          ]"
          @click="day && $emit('select-day', dateKey(day))"
        >
          <span>{{ day }}</span>
          <span v-if="day && hasEvents(dateKey(day))" class="h-1 w-1 rounded-full bg-primary-500" aria-hidden="true" />
        </button>
      </div>
      <div class="divide-y divide-gray-100 dark:divide-gray-700">
        <template v-for="(day, idx) in cells" :key="idx">
          <div v-if="day && hasEvents(dateKey(day))" class="px-4 py-3">
            <slot name="list-item" :day="day" :date-key="dateKey(day)" :is-today="isToday(day)" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
