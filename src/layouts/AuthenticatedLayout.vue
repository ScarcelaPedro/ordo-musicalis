<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import FlashMessage from '@/components/FlashMessage.vue'

const auth = useAuthStore()
const router = useRouter()
const mobileMenuOpen = ref(false)

async function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <RouterLink to="/dashboard" class="text-xl font-bold text-gray-800">
                Ordo Musicalis
              </RouterLink>
            </div>
            <div class="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
              <RouterLink
                to="/dashboard"
                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out"
                :class="$route.path.startsWith('/dashboard')
                  ? 'border-indigo-400 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              >
                Dashboard
              </RouterLink>
              <RouterLink
                to="/escalas"
                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition"
                :class="$route.path.startsWith('/escalas')
                  ? 'border-indigo-400 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              >
                Escalas
              </RouterLink>
              <template v-if="auth.isStaff">
                <RouterLink
                  to="/musicos"
                  class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition"
                  :class="$route.path.startsWith('/musicos')
                    ? 'border-indigo-400 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                >
                  Músicos
                </RouterLink>
                <RouterLink
                  to="/equipes"
                  class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition"
                  :class="$route.path.startsWith('/equipes')
                    ? 'border-indigo-400 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                >
                  Equipes
                </RouterLink>
                <RouterLink
                  to="/disponibilidade/painel"
                  class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition"
                  :class="$route.path.startsWith('/disponibilidade/painel')
                    ? 'border-indigo-400 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                >
                  Disponibilidade
                </RouterLink>
              </template>
              <template v-else>
                <RouterLink
                  to="/disponibilidade"
                  class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition"
                  :class="$route.path === '/disponibilidade'
                    ? 'border-indigo-400 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                >
                  Disponibilidade
                </RouterLink>
              </template>
            </div>
          </div>

          <div class="hidden sm:flex sm:items-center sm:ml-6 gap-4">
            <span class="text-sm text-gray-600">{{ auth.user?.name }}</span>
            <RouterLink to="/profile" class="text-sm text-gray-500 hover:text-gray-700">Perfil</RouterLink>
            <button @click="logout" class="text-sm text-gray-500 hover:text-gray-700">Sair</button>
          </div>

          <div class="flex items-center sm:hidden">
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-show="mobileMenuOpen" class="sm:hidden">
        <div class="pt-2 pb-3 space-y-1">
          <RouterLink to="/dashboard" class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700">Dashboard</RouterLink>
          <RouterLink to="/escalas" class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700">Escalas</RouterLink>
          <template v-if="auth.isStaff">
            <RouterLink to="/musicos" class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700">Músicos</RouterLink>
            <RouterLink to="/equipes" class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700">Equipes</RouterLink>
            <RouterLink to="/disponibilidade/painel" class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700">Disponibilidade</RouterLink>
          </template>
          <template v-else>
            <RouterLink to="/disponibilidade" class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700">Disponibilidade</RouterLink>
          </template>
          <RouterLink to="/profile" class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700">Perfil</RouterLink>
          <button @click="logout" class="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-700">Sair</button>
        </div>
      </div>
    </nav>

    <header v-if="$slots.header" class="bg-white shadow">
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
