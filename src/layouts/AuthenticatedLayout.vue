<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import FlashMessage from '@/components/FlashMessage.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const mobileMenuOpen = ref(false)
const sidebarOpen = ref(false)

interface NavItem { to: string; label: string; active: boolean }

// Fonte única dos links pro menu lateral (desktop) -- o dropdown mobile mantém sua própria
// lista à parte, já que continua funcionando bem como está.
const navItems = computed<NavItem[]>(() => {
  const path = route.path
  const base: NavItem[] = [
    { to: '/dashboard', label: 'Dashboard', active: path.startsWith('/dashboard') },
    { to: '/escalas', label: 'Escalas', active: path.startsWith('/escalas') },
  ]
  if (auth.isStaff) {
    return [
      ...base,
      { to: '/servidores', label: 'Servidores', active: path.startsWith('/servidores') },
      { to: '/equipes', label: 'Ministérios', active: path.startsWith('/equipes') },
      { to: '/disponibilidade/painel', label: 'Disponibilidade', active: path.startsWith('/disponibilidade/painel') },
      { to: '/comunidades', label: 'Comunidades', active: path.startsWith('/comunidades') },
      { to: '/categorias', label: 'Categorias', active: path.startsWith('/categorias') },
      { to: '/celebrantes', label: 'Celebrantes', active: path.startsWith('/celebrantes') },
    ]
  }
  return [
    ...base,
    { to: '/minha-escala', label: 'Minha Escala', active: path === '/minha-escala' },
    { to: '/disponibilidade', label: 'Disponibilidade', active: path === '/disponibilidade' },
  ]
})

async function logout() {
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
            <button
              @click="sidebarOpen = true"
              class="hidden md:inline-flex items-center justify-center p-2 mr-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700"
              aria-label="Abrir menu"
            >
              <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div class="flex-shrink-0 flex items-center">
              <RouterLink to="/dashboard" class="text-xl font-bold text-gray-800 dark:text-gray-100">
                Ordo Musicalis
              </RouterLink>
            </div>
          </div>

          <div class="hidden md:flex md:items-center md:ml-4 gap-4">
            <ThemeToggle />
            <span class="text-sm text-gray-600 dark:text-gray-300 hidden lg:inline">{{ auth.user?.name }}</span>
            <RouterLink to="/profile" class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Perfil</RouterLink>
            <button @click="logout" class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Sair</button>
          </div>

          <div class="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700"
            >
              <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-show="mobileMenuOpen" class="md:hidden">
        <div class="pt-2 pb-3 space-y-1">
          <RouterLink to="/dashboard" class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300">Dashboard</RouterLink>
          <RouterLink to="/escalas" class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300">Escalas</RouterLink>
          <template v-if="auth.isStaff">
            <RouterLink to="/servidores" class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300">Servidores</RouterLink>
            <RouterLink to="/equipes" class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300">Ministérios</RouterLink>
            <RouterLink to="/disponibilidade/painel" class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300">Disponibilidade</RouterLink>
            <RouterLink to="/comunidades" class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300">Comunidades</RouterLink>
            <RouterLink to="/categorias" class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300">Categorias</RouterLink>
            <RouterLink to="/celebrantes" class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300">Celebrantes</RouterLink>
          </template>
          <template v-else>
            <RouterLink to="/minha-escala" class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300">Minha Escala</RouterLink>
            <RouterLink to="/disponibilidade" class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300">Disponibilidade</RouterLink>
          </template>
          <RouterLink to="/profile" class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300">Perfil</RouterLink>
          <button @click="logout" class="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300">Sair</button>
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
            <span class="text-lg font-bold text-gray-800 dark:text-gray-100">Menu</span>
            <button @click="sidebarOpen = false" class="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700" aria-label="Fechar menu">
              <svg class="h-5 w-5" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            <RouterLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              @click="sidebarOpen = false"
              class="block px-3 py-2 rounded-md text-sm font-medium transition"
              :class="item.active
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'"
            >
              {{ item.label }}
            </RouterLink>
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
      <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <FlashMessage />
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>
