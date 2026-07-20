import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../_middleware/auth'
import { requireRole } from '../_middleware/roles'

const router = Router()
const prisma = new PrismaClient()

const include = {
  instruments: { include: { instrument: true } },
  teams: { include: { team: true } },
}

router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  const { search, instrument } = _req.query as Record<string, string>
  const musicians = await prisma.musician.findMany({
    where: {
      ...(search ? { nome: { contains: search, mode: 'insensitive' } } : {}),
      ...(instrument
        ? { instruments: { some: { instrument: { nome: { contains: instrument, mode: 'insensitive' } } } } }
        : {}),
    },
    include,
    orderBy: { nome: 'asc' },
  })
  return res.json(musicians)
})

router.post('/', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { nome, telefone, email, ativo, nivel, observacoes, instruments: instrumentIds, teams: teamIds } = req.body

  const musician = await prisma.musician.create({
    data: {
      nome,
      telefone: telefone ?? null,
      email: email ?? null,
      ativo: ativo ?? true,
      nivel: nivel ?? 'apto',
      observacoes: observacoes ?? null,
      instruments: {
        create: (instrumentIds as number[]).map((id) => ({ instrumentId: id })),
      },
      teams: teamIds?.length
        ? { create: (teamIds as number[]).map((id) => ({ teamId: id })) }
        : undefined,
    },
    include,
  })
  return res.status(201).json(musician)
})

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const musician = await prisma.musician.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      ...include,
      availabilities: true,
      scales: {
        include: { scale: true, instrument: true },
        orderBy: { scale: { dataCelebracao: 'desc' } },
      },
    },
  })
  if (!musician) return res.status(404).json({ message: 'Músico não encontrado' })
  return res.json(musician)
})

router.patch('/:id', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id)
  const { nome, telefone, email, ativo, nivel, observacoes, instruments: instrumentIds, teams: teamIds } = req.body

  await prisma.instrumentMusician.deleteMany({ where: { musicianId: id } })
  await prisma.musicianTeam.deleteMany({ where: { musicianId: id } })

  const musician = await prisma.musician.update({
    where: { id },
    data: {
      nome,
      telefone: telefone ?? null,
      email: email ?? null,
      ativo: ativo ?? true,
      nivel: nivel ?? 'apto',
      observacoes: observacoes ?? null,
      instruments: {
        create: (instrumentIds as number[]).map((iid) => ({ instrumentId: iid })),
      },
      teams: teamIds?.length
        ? { create: (teamIds as number[]).map((tid) => ({ teamId: tid })) }
        : undefined,
    },
    include,
  })
  return res.json(musician)
})

router.delete('/:id', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  await prisma.musician.delete({ where: { id: Number(req.params.id) } })
  return res.status(204).send()
})

export default router
