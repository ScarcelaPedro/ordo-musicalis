import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Auth
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/auth/Login.vue'),
      meta: { guest: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/pages/auth/ForgotPassword.vue'),
      meta: { guest: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/pages/auth/ResetPassword.vue'),
      meta: { guest: true },
    },

    // Autenticado
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/pages/dashboard/Dashboard.vue'),
      meta: { auth: true },
    },

    // Músicos
    {
      path: '/musicos',
      name: 'musicians.index',
      component: () => import('@/pages/musicians/Index.vue'),
      meta: { auth: true },
    },
    {
      path: '/musicos/criar',
      name: 'musicians.create',
      component: () => import('@/pages/musicians/Create.vue'),
      meta: { auth: true, roles: ['admin', 'coordenador'] },
    },
    {
      path: '/musicos/:id',
      name: 'musicians.show',
      component: () => import('@/pages/musicians/Show.vue'),
      meta: { auth: true },
    },
    {
      path: '/musicos/:id/editar',
      name: 'musicians.edit',
      component: () => import('@/pages/musicians/Edit.vue'),
      meta: { auth: true, roles: ['admin', 'coordenador'] },
    },

    // Equipes
    {
      path: '/equipes',
      name: 'teams.index',
      component: () => import('@/pages/teams/Index.vue'),
      meta: { auth: true },
    },
    {
      path: '/equipes/criar',
      name: 'teams.create',
      component: () => import('@/pages/teams/Create.vue'),
      meta: { auth: true, roles: ['admin', 'coordenador'] },
    },
    {
      path: '/equipes/:id/editar',
      name: 'teams.edit',
      component: () => import('@/pages/teams/Edit.vue'),
      meta: { auth: true, roles: ['admin', 'coordenador'] },
    },

    // Escalas
    {
      path: '/escalas',
      name: 'scales.index',
      component: () => import('@/pages/scales/Index.vue'),
      meta: { auth: true },
    },
    {
      path: '/escalas/criar',
      name: 'scales.create',
      component: () => import('@/pages/scales/Create.vue'),
      meta: { auth: true, roles: ['admin', 'coordenador'] },
    },
    {
      path: '/escalas/:id',
      name: 'scales.show',
      component: () => import('@/pages/scales/Show.vue'),
      meta: { auth: true },
    },
    {
      path: '/escalas/:id/editar',
      name: 'scales.edit',
      component: () => import('@/pages/scales/Edit.vue'),
      meta: { auth: true, roles: ['admin', 'coordenador'] },
    },

    // Repertório
    {
      path: '/escalas/:id/repertorio',
      name: 'repertoire.show',
      component: () => import('@/pages/repertoire/Show.vue'),
      meta: { auth: true },
    },
    {
      path: '/escalas/:id/repertorio/editar',
      name: 'repertoire.edit',
      component: () => import('@/pages/repertoire/Edit.vue'),
      meta: { auth: true, roles: ['admin', 'coordenador'] },
    },

    // Disponibilidade
    {
      path: '/disponibilidade',
      name: 'availability.form',
      component: () => import('@/pages/availability/Form.vue'),
      meta: { auth: true, roles: ['musico'] },
    },
    {
      path: '/disponibilidade/painel',
      name: 'availability.panel',
      component: () => import('@/pages/availability/Panel.vue'),
      meta: { auth: true, roles: ['admin', 'coordenador'] },
    },

    // Perfil
    {
      path: '/profile',
      name: 'profile.edit',
      component: () => import('@/pages/profile/Edit.vue'),
      meta: { auth: true },
    },

    // 404
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard',
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.user && auth.token) {
    await auth.fetchMe()
  }

  if (to.meta.auth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guest && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  const roles = to.meta.roles as string[] | undefined
  if (roles && auth.user && !roles.includes(auth.user.role)) {
    return { name: 'dashboard' }
  }
})

export default router
