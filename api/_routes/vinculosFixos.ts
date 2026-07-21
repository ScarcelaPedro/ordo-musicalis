import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../_middleware/auth'
import { requireRole } from '../_middleware/roles'
import { requireTeamOwnership } from '../_middleware/teamScope'

const router = Router()
const prisma = new PrismaClient()

const include = {
  musician: { select: { id: true, nome: true } },
  instrument: { select: { id: true, nome: true } },
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

async function resolveViaScaleTemplateBody(req: AuthRequest) {
  const tpl = await prisma.scaleTemplate.findUnique({
    where: { id: Number(req.body.scaleTemplateId) },
    select: { teamId: true },
  })
  return tpl?.teamId ?? null
}

router.post('/', authenticate, requireRole('admin', 'coordenador'), requireTeamOwnership(resolveViaScaleTemplateBody), async (req: AuthRequest, res: Response) => {
  const { musicianId, instrumentId, scaleTemplateId, ativo } = req.body
  if (!musicianId || !scaleTemplateId) {
    return res.status(422).json({ message: 'Músico e recorrência são obrigatórios' })
  }

  const vinculo = await prisma.vinculoFixo.create({
    data: {
      musicianId: Number(musicianId),
      instrumentId: instrumentId ?? null,
      scaleTemplateId: Number(scaleTemplateId),
      ativo: ativo ?? true,
    },
    include,
  })
  return res.status(201).json(vinculo)
})

async function resolveViaExistingVinculo(req: AuthRequest) {
  const vinculo = await prisma.vinculoFixo.findUnique({
    where: { id: Number(req.params.id) },
    select: { scaleTemplate: { select: { teamId: true } } },
  })
  return vinculo?.scaleTemplate.teamId ?? null
}

router.patch('/:id', authenticate, requireRole('admin', 'coordenador'), requireTeamOwnership(resolveViaExistingVinculo), async (req: AuthRequest, res: Response) => {
  const { instrumentId, ativo } = req.body
  const vinculo = await prisma.vinculoFixo.update({
    where: { id: Number(req.params.id) },
    data: {
      ...(instrumentId !== undefined ? { instrumentId } : {}),
      ...(ativo !== undefined ? { ativo } : {}),
    },
    include,
  })
  return res.json(vinculo)
})

router.delete('/:id', authenticate, requireRole('admin', 'coordenador'), requireTeamOwnership(resolveViaExistingVinculo), async (req: AuthRequest, res: Response) => {
  await prisma.vinculoFixo.delete({ where: { id: Number(req.params.id) } })
  return res.status(204).send()
})

export default router
