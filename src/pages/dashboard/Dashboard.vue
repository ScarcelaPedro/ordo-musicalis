<script setup lang="ts">
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>
    </template>

    <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
      <p class="text-gray-600 mb-6">Bem-vindo, <strong>{{ auth.user?.name }}</strong>!</p>

      <!-- Staff -->
      <div v-if="auth.isStaff" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <RouterLink to="/musicos" class="block p-6 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition">
          <h3 class="font-semibold text-indigo-700 text-lg">Músicos</h3>
          <p class="text-sm text-gray-600 mt-1">Gerenciar cadastro de músicos</p>
        </RouterLink>
        <RouterLink to="/equipes" class="block p-6 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition">
          <h3 class="font-semibold text-indigo-700 text-lg">Equipes</h3>
          <p class="text-sm text-gray-600 mt-1">Gerenciar equipes</p>
        </RouterLink>
        <RouterLink to="/escalas/criar" class="block p-6 bg-green-50 rounded-lg hover:bg-green-100 transition">
          <h3 class="font-semibold text-green-700 text-lg">Nova Escala</h3>
          <p class="text-sm text-gray-600 mt-1">Criar escala de celebração</p>
        </RouterLink>
        <RouterLink to="/escalas" class="block p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
          <h3 class="font-semibold text-gray-700 text-lg">Escalas</h3>
          <p class="text-sm text-gray-600 mt-1">Ver todas as escalas</p>
        </RouterLink>
        <RouterLink to="/disponibilidade/painel" class="block p-6 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition">
          <h3 class="font-semibold text-yellow-700 text-lg">Disponibilidade</h3>
          <p class="text-sm text-gray-600 mt-1">Painel de disponibilidade dos músicos</p>
        </RouterLink>
      </div>

      <!-- Músico -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <RouterLink to="/escalas" class="block p-6 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition">
          <h3 class="font-semibold text-indigo-700 text-lg">Minhas Escalas</h3>
          <p class="text-sm text-gray-600 mt-1">Ver escalas em que estou incluído</p>
        </RouterLink>
        <RouterLink to="/disponibilidade" class="block p-6 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition">
          <h3 class="font-semibold text-yellow-700 text-lg">Disponibilidade</h3>
          <p class="text-sm text-gray-600 mt-1">Informar minha disponibilidade semanal</p>
        </RouterLink>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
