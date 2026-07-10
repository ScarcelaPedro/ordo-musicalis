import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import client from '@/api/client'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: 'admin' | 'coordenador' | 'musico'
  musicianId: number | null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isCoordenador = computed(() => user.value?.role === 'coordenador')
  const isStaff = computed(() => user.value?.role === 'admin' || user.value?.role === 'coordenador')
  const isMusico = computed(() => user.value?.role === 'musico')

  async function login(email: string, password: string) {
    const { data } = await client.post('/auth/login', { email, password })
    token.value = data.token
    user.value = data.user
    localStorage.setItem('auth_token', data.token)
  }

  async function register(name: string, email: string, password: string) {
    const { data } = await client.post('/auth/register', { name, email, password })
    token.value = data.token
    user.value = data.user
    localStorage.setItem('auth_token', data.token)
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      const { data } = await client.get('/auth/me')
      user.value = data
    } catch {
      logout()
    }
  }

  return { user, token, isAuthenticated, isAdmin, isCoordenador, isStaff, isMusico, login, register, logout, fetchMe }
})
