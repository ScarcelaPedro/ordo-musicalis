<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ThemeToggle from '@/components/ThemeToggle.vue'
import Drawer from '@/components/Drawer.vue'
import IconButton from '@/components/IconButton.vue'
import Avatar from '@/components/Avatar.vue'
import { longDate } from '@/utils/greeting'
import {
  HomeIcon, CalendarDaysIcon, UsersIcon, ChartBarIcon, Cog6ToothIcon, ChevronDownIcon,
  ClockIcon, PlusIcon, EllipsisHorizontalIcon, Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/outline'
import {
  HomeIcon as HomeIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  UsersIcon as UsersIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  ClockIcon as ClockIconSolid,
} from '@heroicons/vue/24/solid'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(false)
const sidebarCloseButton = ref<HTMLButtonElement | null>(null)
const sidebarOpenButton = ref<HTMLElement | null>(null)
const sidebarPanel = ref<HTMLElement | null>(null)

// Tablet drawer keyboard handling (TASK-0110): Esc closes; Tab/Shift+Tab cycle inside the
// drawer instead of escaping to the page behind the overlay (same approach as Drawer.vue).
// Only while it is an overlay -- from lg up the sidebar is fixed and must not trap focus.
function onSidebarKeydown(event: KeyboardEvent) {
  if (!sidebarOpen.value || window.innerWidth >= 1024) return
  if (event.key === 'Escape') {
    sidebarOpen.value = false
    return
  }
  if (event.key !== 'Tab' || !sidebarPanel.value) return
  // Visible elements only: collapsed accordion groups are v-show (display: none).
  const items = Array.from(
    sidebarPanel.value.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
  ).filter((el) => el.offsetParent !== null)
  if (!items.length) return
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

// Tablet drawer (below lg): move focus into it when opened and back to the trigger when closed,
// so keyboard users are not left behind the overlay.
watch(sidebarOpen, async (open) => {
  await nextTick()
  if (open) sidebarCloseButton.value?.focus()
  else if (window.innerWidth < 1024 && (document.activeElement === document.body || document.activeElement?.closest('aside'))) {
    sidebarOpenButton.value?.querySelector('button')?.focus()
  }
})
const moreOpen = ref(false)
const todayLabel = longDate(new Date())

interface NavChild { to: string; label: string; active: boolean }
interface NavGroup {
  key: string
  label: string
  icon: typeof HomeIcon
  iconActive: typeof HomeIcon
  active: boolean
  children: NavChild[]
}

// `/escalas-recorrentes` shares the `/escalas` prefix but is its own menu item (Recorrências).
function isScalesRoute(path: string) {
  return path === '/escalas' || path.startsWith('/escalas/')
}

// Hierarquia de domínios definida na Etapa 1 (docs/arquitetura-interface.md) -- antes uma
// lista achatada, sem agrupamento (achado da auditoria/TASK-0002). "Conteúdo"
// (Repertórios/Liturgia) fica de fora: só existe acesso contextual hoje, sem rota de listagem
// própria (lacuna já registrada na TASK-0002, não inventada aqui).
//
// O dropdown mobile abaixo continua com sua própria lista hardcoded por enquanto -- unificar
// as duas fontes é escopo da TASK-0035 (bottom nav), não desta task.
const navGroups = computed<NavGroup[]>(() => {
  const path = route.path
  if (auth.isStaff) {
    return [
      {
        key: 'escalas',
        label: 'Escalas',
        icon: CalendarDaysIcon,
        iconActive: CalendarDaysIconSolid,
        active: path.startsWith('/escalas') || path.startsWith('/substituicoes') || path.startsWith('/disponibilidade/painel'),
        children: [
          { to: '/escalas', label: 'Escalas', active: isScalesRoute(path) },
          { to: '/substituicoes', label: 'Substituições', active: path.startsWith('/substituicoes') },
          { to: '/escalas-recorrentes', label: 'Recorrências', active: path.startsWith('/escalas-recorrentes') },
          { to: '/disponibilidade/painel', label: 'Disponibilidade', active: path.startsWith('/disponibilidade/painel') },
        ],
      },
      {
        key: 'pessoas',
        label: 'Pessoas',
        icon: UsersIcon,
        iconActive: UsersIconSolid,
        active: path.startsWith('/servidores'),
        children: [
          { to: '/servidores', label: 'Servidores', active: path.startsWith('/servidores') && !path.startsWith('/servidores/intensidade') },
          { to: '/servidores/intensidade', label: 'Intensidade de Serviço', active: path.startsWith('/servidores/intensidade') },
        ],
      },
      {
        key: 'analises',
        label: 'Análises',
        icon: ChartBarIcon,
        iconActive: ChartBarIconSolid,
        active: path.startsWith('/relatorios'),
        children: [
          { to: '/relatorios', label: 'Relatórios', active: path.startsWith('/relatorios') },
        ],
      },
      {
        key: 'configuracoes',
        label: 'Configurações',
        icon: Cog6ToothIcon,
        iconActive: Cog6ToothIconSolid,
        active: ['/equipes', '/categorias', '/comunidades', '/celebrantes'].some((p) => path.startsWith(p)),
        children: [
          { to: '/equipes', label: 'Ministérios', active: path.startsWith('/equipes') },
          { to: '/categorias', label: 'Categorias', active: path.startsWith('/categorias') },
          { to: '/comunidades', label: 'Comunidades', active: path.startsWith('/comunidades') },
          { to: '/celebrantes', label: 'Celebrantes', active: path.startsWith('/celebrantes') },
        ],
      },
    ]
  }
  return [
    {
      key: 'escalas',
      label: 'Escalas',
      icon: CalendarDaysIcon,
      iconActive: CalendarDaysIconSolid,
      active: path === '/minha-escala' || path === '/disponibilidade',
      children: [
        { to: '/minha-escala', label: 'Minha Escala', active: path === '/minha-escala' },
        { to: '/disponibilidade', label: 'Disponibilidade', active: path === '/disponibilidade' },
      ],
    },
  ]
})

// Só o domínio da rota atual fica expandido por padrão (accordion) -- evita listar todos os
// sub-itens de todos os domínios ao mesmo tempo (docs/tasks/0024-*.md).
const openGroup = ref<string | null>(null)
watch(
  navGroups,
  (groups) => {
    const activeGroup = groups.find((g) => g.active)
    if (activeGroup) openGroup.value = activeGroup.key
  },
  { immediate: true },
)

// Sidebar item states on the dark surface (TASK-0098). Active = filled pill (reference);
// a group that only contains the active route gets a lighter tint so the pill stays unique.
const navItemActive = 'bg-primary-700 font-semibold text-white'
const navGroupActive = 'font-semibold text-white'
const navItemIdle = 'text-primary-100 hover:bg-white/5 hover:text-white'

function toggleGroup(key: string) {
  openGroup.value = openGroup.value === key ? null : key
}

// Bottom nav mobile (TASK-0035) -- itens principais exatos já decididos na TASK-0004, sem
// inventar nenhum novo. "Mais" não mantém lista própria: deriva de `navGroups` (mesma fonte da
// sidebar) filtrando o que já aparece na barra principal, eliminando a duplicação manual que o
// dropdown antigo tinha (AuthenticatedLayout.vue, comentário removido nesta task).
interface BottomNavItem { to: string; label: string; icon: typeof HomeIcon; iconActive: typeof HomeIcon; active: boolean }

const bottomNavPrimary = computed<BottomNavItem[]>(() => {
  const path = route.path
  const inicio: BottomNavItem = { to: '/dashboard', label: 'Início', icon: HomeIcon, iconActive: HomeIconSolid, active: path.startsWith('/dashboard') }
  if (auth.isStaff) {
    return [
      inicio,
      { to: '/escalas', label: 'Escalas', icon: CalendarDaysIcon, iconActive: CalendarDaysIconSolid, active: isScalesRoute(path) },
    ]
  }
  return [
    inicio,
    { to: '/minha-escala', label: 'Minha Escala', icon: CalendarDaysIcon, iconActive: CalendarDaysIconSolid, active: path === '/minha-escala' },
    { to: '/disponibilidade', label: 'Disponibilidade', icon: ClockIcon, iconActive: ClockIconSolid, active: path === '/disponibilidade' },
  ]
})

const moreNavGroups = computed(() => {
  const primaryPaths = new Set(bottomNavPrimary.value.map((i) => i.to))
  return navGroups.value
    .map((g) => ({ ...g, children: g.children.filter((c) => !primaryPaths.has(c.to)) }))
    .filter((g) => g.children.length > 0)
})

const moreNavActive = computed(() => moreNavGroups.value.some((g) => g.active) || route.path === '/profile')

async function logout() {
  moreOpen.value = false
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-canvas">
    <!-- Sidebar (SPEC-003.1 §4, TASK-0098, ADR-0004): fixed from lg up, off-canvas drawer on
         md (tablet), absent on mobile (bottom nav below). Same navGroups, same order -- only the
         presentation changed. -->
    <div class="hidden md:block">
      <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="sidebarOpen" class="fixed inset-0 z-40 bg-black/30 lg:hidden" @click="sidebarOpen = false"></div>
      </Transition>
      <aside
        class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-primary-900 text-primary-100 shadow-xl transition-transform duration-200 dark:bg-primary-950 lg:z-30 lg:translate-x-0 lg:shadow-none"
        :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full invisible lg:visible'"
        aria-label="Menu lateral"
        ref="sidebarPanel"
        @keydown="onSidebarKeydown"
      >
        <div class="flex h-20 items-center justify-between gap-2 border-b border-white/10 px-4">
          <RouterLink
            to="/dashboard"
            @click="sidebarOpen = false"
            class="flex min-w-0 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-300"
          >
            <!-- Discreet liturgical mark (SPEC-003.1 §20): a simple cross in the accent color. -->
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-accent-300" aria-hidden="true">
              <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
                <path d="M12 3v18M7 8h10" />
              </svg>
            </span>
            <span class="min-w-0">
              <span class="block truncate text-body font-semibold text-white">Ordo Musicalis</span>
              <span class="block truncate text-caption text-primary-300">Escalas da paróquia</span>
            </span>
          </RouterLink>
          <button
            ref="sidebarCloseButton"
            type="button"
            @click="sidebarOpen = false"
            class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-primary-200 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-300 lg:hidden"
            aria-label="Fechar menu"
          >
            <XMarkIcon class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <RouterLink
            to="/dashboard"
            @click="sidebarOpen = false"
            class="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-body-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-300"
            :class="$route.path.startsWith('/dashboard') ? navItemActive : navItemIdle"
            :aria-current="$route.path.startsWith('/dashboard') ? 'page' : undefined"
          >
            <component :is="$route.path.startsWith('/dashboard') ? HomeIconSolid : HomeIcon" class="h-5 w-5 shrink-0" aria-hidden="true" />
            Dashboard
          </RouterLink>

          <div v-for="group in navGroups" :key="group.key">
            <button
              type="button"
              @click="toggleGroup(group.key)"
              class="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-body-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-300"
              :class="group.active ? navGroupActive : navItemIdle"
              :aria-expanded="openGroup === group.key"
            >
              <component :is="group.active ? group.iconActive : group.icon" class="h-5 w-5 shrink-0" aria-hidden="true" />
              <span class="flex-1 text-left">{{ group.label }}</span>
              <ChevronDownIcon
                class="h-4 w-4 shrink-0 transition-transform"
                :class="openGroup === group.key ? 'rotate-180' : ''"
                aria-hidden="true"
              />
            </button>
            <div v-show="openGroup === group.key" class="mt-1 space-y-0.5 border-l border-white/10 ml-5 pl-4">
              <RouterLink
                v-for="child in group.children"
                :key="child.to"
                :to="child.to"
                @click="sidebarOpen = false"
                class="flex min-h-10 items-center rounded-md px-3 py-1.5 text-body-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-300"
                :class="child.active ? navItemActive : navItemIdle"
                :aria-current="child.active ? 'page' : undefined"
              >
                {{ child.label }}
              </RouterLink>
            </div>
          </div>
        </nav>

        <!-- Signed-in user (reference footer), with the profile/logout actions that used to
             live only in the topbar. -->
        <div class="border-t border-white/10 p-3">
          <RouterLink
            to="/profile"
            @click="sidebarOpen = false"
            class="flex items-center gap-3 rounded-lg px-2 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-300"
            :class="$route.path === '/profile' ? 'bg-white/10' : 'hover:bg-white/5'"
            :aria-current="$route.path === '/profile' ? 'page' : undefined"
          >
            <Avatar :name="auth.user?.name ?? '?'" size="md" />
            <span class="min-w-0 flex-1">
              <span class="block truncate text-body-sm font-semibold text-white">{{ auth.user?.name }}</span>
              <span class="block truncate text-caption text-primary-300">{{ auth.user?.email }}</span>
            </span>
          </RouterLink>
          <button
            type="button"
            @click="logout"
            class="mt-1 flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-body-sm text-primary-200 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-300"
          >
            <ArrowRightOnRectangleIcon class="h-5 w-5 shrink-0" aria-hidden="true" />
            Sair
          </button>
        </div>
      </aside>
    </div>

    <div class="lg:pl-64">
      <nav class="bg-white border-b border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <div ref="sidebarOpenButton" class="hidden md:block lg:hidden mr-1">
                <IconButton @click="sidebarOpen = true" :ariaLabel="'Abrir menu'">
                  <Bars3Icon class="h-6 w-6" aria-hidden="true" />
                </IconButton>
              </div>
              <!-- From lg up the brand lives in the fixed sidebar. -->
              <div class="flex-shrink-0 flex items-center lg:hidden">
                <RouterLink to="/dashboard" class="text-h3 text-gray-800 dark:text-gray-100">
                  Ordo Musicalis
                </RouterLink>
              </div>
            </div>

            <div class="hidden md:flex md:items-center md:ml-4 gap-4">
              <!-- Today's date as plain text (TASK-0099): the reference shows it as a dropdown,
                   but there is nothing to pick, so it stays static. -->
              <span class="text-body-sm text-gray-600 dark:text-gray-300">{{ todayLabel }}</span>
              <ThemeToggle />
            </div>

            <div class="flex items-center gap-2 md:hidden">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <header v-if="$slots.header" class="bg-white shadow dark:bg-gray-800 dark:shadow-gray-900/50">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <slot name="header" />
        </div>
      </header>

      <main>
        <div class="py-12 pb-24 md:pb-12">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <slot />
          </div>
        </div>
      </main>
    </div>

    <!-- Bottom nav (mobile): substitui o dropdown mobile antigo -- itens principais por perfil
         já decididos na TASK-0004, "Mais" abre o Drawer com o restante (TASK-0031). Some a
         partir de md (sidebar assume). -->
    <nav
      class="fixed inset-x-0 bottom-0 z-30 flex h-16 items-stretch justify-around border-t border-gray-100 bg-white pb-[env(safe-area-inset-bottom)] dark:border-gray-700 dark:bg-gray-800 md:hidden"
      aria-label="Navegação principal"
    >
      <RouterLink
        v-for="item in bottomNavPrimary"
        :key="item.to"
        :to="item.to"
        class="flex flex-1 flex-col items-center justify-center gap-0.5 text-xs transition"
        :class="item.active ? 'font-semibold text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'"
      >
        <component :is="item.active ? item.iconActive : item.icon" class="h-6 w-6" aria-hidden="true" />
        {{ item.label }}
      </RouterLink>

      <RouterLink
        v-if="auth.isStaff"
        to="/escalas/criar"
        class="relative flex flex-1 flex-col items-center justify-center gap-0.5 text-xs text-gray-600 dark:text-gray-400"
      >
        <span
          class="-mt-6 flex h-11 w-11 items-center justify-center rounded-full bg-primary-600 text-white shadow-md"
          :class="$route.path === '/escalas/criar' ? 'ring-2 ring-primary-300 dark:ring-primary-700' : ''"
        >
          <PlusIcon class="h-6 w-6" aria-hidden="true" />
        </span>
        Nova escala
      </RouterLink>

      <button
        type="button"
        @click="moreOpen = true"
        class="flex flex-1 flex-col items-center justify-center gap-0.5 text-xs transition"
        :class="moreNavActive ? 'font-semibold text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'"
        :aria-expanded="moreOpen"
      >
        <EllipsisHorizontalIcon class="h-6 w-6" aria-hidden="true" />
        Mais
      </button>
    </nav>

    <Drawer v-model="moreOpen" title="Mais" side="bottom">
      <div class="space-y-5">
        <div v-for="group in moreNavGroups" :key="group.key">
          <p class="mb-1.5 text-caption font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">{{ group.label }}</p>
          <div class="space-y-0.5">
            <RouterLink
              v-for="child in group.children"
              :key="child.to"
              :to="child.to"
              @click="moreOpen = false"
              class="block rounded-md px-2.5 py-2 text-sm transition"
              :class="child.active
                ? 'bg-primary-50 font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-200'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'"
            >
              {{ child.label }}
            </RouterLink>
          </div>
        </div>
        <div>
          <p class="mb-1.5 text-caption font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Perfil</p>
          <div class="space-y-0.5">
            <RouterLink
              to="/profile"
              @click="moreOpen = false"
              class="block rounded-md px-2.5 py-2 text-sm transition"
              :class="$route.path === '/profile'
                ? 'bg-primary-50 font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-200'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'"
            >
              Perfil
            </RouterLink>
            <button
              type="button"
              @click="logout"
              class="block w-full rounded-md px-2.5 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </Drawer>
  </div>
</template>
