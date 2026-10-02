import { Router, Response } from 'express'
import { Prisma, PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../_middleware/auth'
import { requireRole } from '../_middleware/roles'
import { requireAnyTeamOwnership } from '../_middleware/teamScope'
import { normalizeFixedLink } from '../_lib/recurrence'
import { resolveTemplateTeamIds } from './scaleTemplates'

const router = Router()
const prisma = new PrismaClient()

const include = {
  servidor: { select: { id: true, nome: true } },
  instrument: { select: { id: true, nome: true } },
  categoria: { select: { id: true, nome: true, ordem: true } },
  team: { select: { id: true, nome: true } },
}

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { scaleTemplateId } = req.query as Record<string, string>
  const vinculos = await prisma.vinculoFixo.findMany({
    where: scaleTemplateId ? { scaleTemplateId: Number(scaleTemplateId) } : undefined,
    include,
    orderBy: { createdAt: 'asc' },
  })
  return res.json(vinculos)
})

// A coordenador may add a link when they coordinate a ministry already in the recurrence, or
// the ministry of the link being added (TASK-0117, ADR-0006).
async function resolveViaScaleTemplateBody(req: AuthRequest) {
  const ids = await resolveTemplateTeamIds(Number(req.body.scaleTemplateId))
  return req.body.teamId ? [...ids, Number(req.body.teamId)] : ids
}

router.post('/', authenticate, requireRole('admin', 'coordenador'), requireAnyTeamOwnership(resolveViaScaleTemplateBody), async (req: AuthRequest, res: Response) => {
  const { servidorId, scaleTemplateId, ativo } = req.body
  if (!servidorId || !scaleTemplateId) {
    return res.status(422).json({ message: 'Servidor e recorrência são obrigatórios' })
  }

  const [servidor, team, musica, acolitos] = await Promise.all([
    prisma.servidor.findUnique({
      where: { id: Number(servidorId) },
      select: { categorias: { select: { categoriaId: true } }, instruments: { select: { instrumentId: true } } },
    }),
    req.body.teamId ? prisma.team.findUnique({ where: { id: Number(req.body.teamId) }, select: { categoriaId: true } }) : null,
    // Same name-based lookup the scale form uses for these two special categories.
    prisma.categoriaFuncao.findFirst({ where: { nome: 'Música' }, select: { id: true } }),
    prisma.categoriaFuncao.findFirst({ where: { nome: 'Acólitos e Ancilas' }, select: { id: true } }),
  ])
  if (!servidor) return res.status(422).json({ message: 'Servidor não encontrado' })

  const result = normalizeFixedLink(req.body, {
    servidorCategoriaIds: servidor.categorias.map((c) => c.categoriaId),
    servidorInstrumentIds: servidor.instruments.map((i) => i.instrumentId),
    teamCategoriaId: team?.categoriaId ?? null,
    musicaId: musica?.id ?? null,
    acolitosId: acolitos?.id ?? null,
  })
  if ('error' in result) return res.status(422).json({ message: result.error })

  try {
    const vinculo = await prisma.vinculoFixo.create({
      data: {
        servidorId: Number(servidorId),
        scaleTemplateId: Number(scaleTemplateId),
        ...result.data,
        ativo: ativo ?? true,
      },
      include,
    })
    return res.status(201).json(vinculo)
  } catch (e) {
    // @@unique([servidorId, scaleTemplateId]): a generated scale can hold a person only once.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return res.status(422).json({ message: 'Este servidor já tem um vínculo nesta recorrência' })
    }
    throw e
  }
})

async function resolveViaExistingVinculo(req: AuthRequest) {
  const vinculo = await prisma.vinculoFixo.findUnique({
    where: { id: Number(req.params.id) },
    select: { scaleTemplateId: true },
  })
  return vinculo ? resolveTemplateTeamIds(vinculo.scaleTemplateId) : []
}

router.patch('/:id', authenticate, requireRole('admin', 'coordenador'), requireAnyTeamOwnership(resolveViaExistingVinculo), async (req: AuthRequest, res: Response) => {
  const { ativo } = req.body
  const vinculo = await prisma.vinculoFixo.update({
    where: { id: Number(req.params.id) },
    data: { ...(ativo !== undefined ? { ativo } : {}) },
    include,
  })
  return res.json(vinculo)
})

router.delete('/:id', authenticate, requireRole('admin', 'coordenador'), requireAnyTeamOwnership(resolveViaExistingVinculo), async (req: AuthRequest, res: Response) => {
  await prisma.vinculoFixo.delete({ where: { id: Number(req.params.id) } })
  return res.status(204).send()
})

export default router
