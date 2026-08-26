import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

const client = axios.create({
  baseURL: '/api',
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore().logout()
      router.push('/login')
    }

    // TASK-0082 (correção): sem `error.response`, a requisição não recebeu resposta nenhuma do
    // servidor (rede fora do ar, timeout, CORS) -- todo catch do sistema já lê
    // `e.response?.data?.message ?? 'mensagem genérica'`, então sintetizar essa mesma forma aqui
    // corrige a mensagem em toda tela de uma vez só, sem repetir a lógica em cada formulário.
    if (!error.response) {
      error.response = {
        data: { message: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.' },
      }
    }

    return Promise.reject(error)
  },
)

export default client
