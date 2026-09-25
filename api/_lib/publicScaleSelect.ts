// Fields exposed by the anonymous public calendar (GET /api/public/scales).
//
// This is a privacy contract: everything here is visible to anyone, without login. Kept in its
// own module so it can be unit-tested (api/_lib/publicScaleSelect.test.ts) and reviewed in one
// place. TASK-0109 added the assignment's ministry (category name, with the team's category as
// fallback) and liturgical function, approved by the project owner -- never add contact data
// (email, phone) or internal notes of servers here.

export const publicScaleSelect = {
  id: true,
  dataCelebracao: true,
  horario: true,
  celebracao: true,
  observacoes: true,
  team: { select: { id: true, nome: true } },
  comunidade: { select: { id: true, nome: true } },
  servidores: {
    select: {
      status: true,
      funcaoLiturgica: true,
      servidor: { select: { nome: true } },
      instrument: { select: { nome: true } },
      categoria: { select: { nome: true } },
      team: { select: { categoria: { select: { nome: true } } } },
    },
  },
} as const
