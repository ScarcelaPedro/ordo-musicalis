<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ThemeToggle from '@/components/ThemeToggle.vue'
import Drawer from '@/components/Drawer.vue'
import IconButton from '@/components/IconButton.vue'
import {
  HomeIcon, CalendarDaysIcon, UsersIcon, ChartBarIcon, Cog6ToothIcon, ChevronDownIcon,
  ClockIcon, PlusIcon, EllipsisHorizontalIcon, Bars3Icon, XMarkIcon,
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
const moreOpen = ref(false)

interface NavChild { to: string; label: string; active: boolean }
interface NavGroup {
  key: string
  label: string
  icon: typeof HomeIcon
  iconActive: typeof HomeIcon
  active: boolean
  children: NavChild[]
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
          { to: '/escalas', label: 'Escalas', active: path.startsWith('/escalas') },
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
      { to: '/escalas', label: 'Escalas', icon: CalendarDaysIcon, iconActive: CalendarDaysIconSolid, active: path.startsWith('/escalas') },
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
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <nav class="bg-white border-b border-gray-100 dark:bg-gray-800 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="hidden md:block mr-1">
              <IconButton @click="sidebarOpen = true" :ariaLabel="'Abrir menu'">
                <Bars3Icon class="h-6 w-6" aria-hidden="true" />
              </IconButton>
            </div>
            <div class="flex-shrink-0 flex items-center">
              <RouterLink to="/dashboard" class="text-h3 text-gray-800 dark:text-gray-100">
                Ordo Musicalis
              </RouterLink>
            </div>
          </div>

          <div class="hidden md:flex md:items-center md:ml-4 gap-4">
            <ThemeToggle />
            <span class="text-body-sm text-gray-600 dark:text-gray-300 hidden lg:inline">{{ auth.user?.name }}</span>
            <RouterLink to="/profile" class="text-body-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">Perfil</RouterLink>
            <button @click="logout" class="text-body-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">Sair</button>
          </div>

          <div class="flex items-center gap-2 md:hidden">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>

    <!-- Menu lateral (desktop): substitui o menu horizontal quando não cabe mais na tela -->
    <div class="hidden md:block">
      <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="sidebarOpen" class="fixed inset-0 bg-black/30 z-40" @click="sidebarOpen = false"></div>
      </Transition>
      <Transition enter-active-class="transition-transform duration-200" enter-from-class="-translate-x-full" enter-to-class="translate-x-0"
        leave-active-class="transition-transform duration-150" leave-from-class="translate-x-0" leave-to-class="-translate-x-full">
        <aside v-if="sidebarOpen" class="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-xl z-50 flex flex-col">
          <div class="flex items-center justify-between h-16 px-4 border-b border-gray-100 dark:border-gray-700">
            <span class="text-h4 text-gray-800 dark:text-gray-100">Menu</span>
            <IconButton @click="sidebarOpen = false" :ariaLabel="'Fechar menu'">
              <XMarkIcon class="h-5 w-5" aria-hidden="true" />
            </IconButton>
          </div>
          <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            <RouterLink
              to="/dashboard"
              @click="sidebarOpen = false"
              class="flex items-center gap-2.5 rounded-md border-l-4 px-2.5 py-2 text-sm transition"
              :class="$route.path.startsWith('/dashboard')
                ? 'border-primary-500 bg-primary-50 font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-200'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'"
            >
              <component :is="$route.path.startsWith('/dashboard') ? HomeIconSolid : HomeIcon" class="h-5 w-5 shrink-0" aria-hidden="true" />
              Dashboard
            </RouterLink>

            <div v-for="group in navGroups" :key="group.key">
              <button
                type="button"
                @click="toggleGroup(group.key)"
                class="flex w-full items-center gap-2.5 rounded-md border-l-4 px-2.5 py-2 text-sm transition"
                :class="group.active
                  ? 'border-primary-500 bg-primary-50 font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-200'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'"
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
              <div v-show="openGroup === group.key" class="mt-1 space-y-1 pl-9">
                <RouterLink
                  v-for="child in group.children"
                  :key="child.to"
                  :to="child.to"
                  @click="sidebarOpen = false"
                  class="block rounded-md border-l-4 px-2.5 py-1.5 text-sm transition"
                  :class="child.active
                    ? 'border-primary-500 bg-primary-50 font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-200'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'"
                >
                  {{ child.label }}
                </RouterLink>
              </div>
            </div>
          </nav>
        </aside>
      </Transition>
    </div>

    <header v-if="$slots.header" class="bg-white shadow dark:bg-gray-800 dark:shadow-gray-900/50">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <slot name="header" />
      </div>
    </header>

    <main>
      <div class="py-12 pb-24 md:pb-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <slot />
        </div>
      </div>
    </main>

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
