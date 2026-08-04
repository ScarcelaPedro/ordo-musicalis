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
      path: '/register',
      name: 'register',
      component: () => import('@/pages/auth/Register.vue'),
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

    // Servidores
    {
      path: '/servidores',
      name: 'servidores.index',
      component: () => import('@/pages/servidores/Index.vue'),
      meta: { auth: true },
    },
    {
      path: '/servidores/criar',
      name: 'servidores.create',
      component: () => import('@/pages/servidores/Create.vue'),
      meta: { auth: true, roles: ['admin', 'coordenador'] },
    },
    {
      path: '/servidores/:id',
      name: 'servidores.show',
      component: () => import('@/pages/servidores/Show.vue'),
      meta: { auth: true },
    },
    {
      path: '/servidores/:id/editar',
      name: 'servidores.edit',
      component: () => import('@/pages/servidores/Edit.vue'),
      meta: { auth: true, roles: ['admin', 'coordenador'] },
    },
    {
      path: '/servidores/intensidade',
      name: 'servidores.intensity',
      component: () => import('@/pages/servidores/Intensity.vue'),
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
      path: '/equipes/:id',
      name: 'teams.show',
      component: () => import('@/pages/teams/Show.vue'),
      meta: { auth: true },
    },
    {
      path: '/equipes/:id/editar',
      name: 'teams.edit',
      component: () => import('@/pages/teams/Edit.vue'),
      meta: { auth: true, roles: ['admin', 'coordenador'] },
    },

    // Comunidades
    {
      path: '/comunidades',
      name: 'comunidades.index',
      component: () => import('@/pages/comunidades/Index.vue'),
      meta: { auth: true, roles: ['admin', 'coordenador'] },
    },
    {
      path: '/comunidades/criar',
      name: 'comunidades.create',
      component: () => import('@/pages/comunidades/Create.vue'),
      meta: { auth: true, roles: ['admin', 'coordenador'] },
    },
    {
      path: '/comunidades/:id/editar',
      name: 'comunidades.edit',
      component: () => import('@/pages/comunidades/Edit.vue'),
      meta: { auth: true, roles: ['admin', 'coordenador'] },
    },

    // Categorias de função
    {
      path: '/categorias',
      name: 'categorias.index',
      component: () => import('@/pages/categorias/Index.vue'),
      meta: { auth: true, roles: ['admin', 'coordenador'] },
    },
    {
      path: '/categorias/criar',
      name: 'categorias.create',
      component: () => import('@/pages/categorias/Create.vue'),
      meta: { auth: true, roles: ['admin', 'coordenador'] },
    },
    {
      path: '/categorias/:id/editar',
      name: 'categorias.edit',
      component: () => import('@/pages/categorias/Edit.vue'),
      meta: { auth: true, roles: ['admin', 'coordenador'] },
    },

    // Celebrantes
    {
      path: '/celebrantes',
      name: 'celebrantes.index',
      component: () => import('@/pages/celebrantes/Index.vue'),
      meta: { auth: true, roles: ['admin', 'coordenador'] },
    },
    {
      path: '/celebrantes/criar',
      name: 'celebrantes.create',
      component: () => import('@/pages/celebrantes/Create.vue'),
      meta: { auth: true, roles: ['admin', 'coordenador'] },
    },
    {
      path: '/celebrantes/:id/editar',
      name: 'celebrantes.edit',
      component: () => import('@/pages/celebrantes/Edit.vue'),
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
    {
      path: '/minha-escala',
      name: 'scales.mine',
      component: () => import('@/pages/scales/MyScales.vue'),
      meta: { auth: true },
    },

    // Escalas Recorrentes
    {
      path: '/escalas-recorrentes',
      name: 'scaleTemplates.index',
      component: () => import('@/pages/scaleTemplates/Index.vue'),
      meta: { auth: true, roles: ['admin', 'coordenador'] },
    },
    {
      path: '/escalas-recorrentes/criar',
      name: 'scaleTemplates.create',
      component: () => import('@/pages/scaleTemplates/Create.vue'),
      meta: { auth: true, roles: ['admin', 'coordenador'] },
    },
    {
      path: '/escalas-recorrentes/:id/editar',
      name: 'scaleTemplates.edit',
      component: () => import('@/pages/scaleTemplates/Edit.vue'),
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

    // Liturgia
    {
      path: '/escalas/:id/liturgia',
      name: 'liturgia.show',
      component: () => import('@/pages/liturgia/Show.vue'),
      meta: { auth: true },
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

    // Substituições
    {
      path: '/substituicoes',
      name: 'substitutions.index',
      component: () => import('@/pages/substitutions/Index.vue'),
      meta: { auth: true, roles: ['admin', 'coordenador'] },
    },

    // Relatórios
    {
      path: '/relatorios',
      name: 'reports.index',
      component: () => import('@/pages/reports/Index.vue'),
      meta: { auth: true, roles: ['admin', 'coordenador'] },
    },

    // Público
    {
      path: '/publico',
      name: 'public.calendar',
      component: () => import('@/pages/public/Calendar.vue'),
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
