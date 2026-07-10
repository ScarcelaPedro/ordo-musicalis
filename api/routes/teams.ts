import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireRole } from '../middleware/roles'

const router = Router()
const prisma = new PrismaClient()

router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  const teams = await prisma.team.findMany({
    include: { _count: { select: { musicians: true } } },
    orderBy: { nome: 'asc' },
  })
  return res.json(teams)
})

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const team = await prisma.team.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      musicians: {
        include: { musician: { select: { id: true, nome: true } } },
      },
    },
  })
  if (!team) return res.status(404).json({ message: 'Equipe não encontrada' })
  return res.json(team)
})

router.post('/', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { nome, descricao, ativo, musicians } = req.body
  const team = await prisma.team.create({ data: { nome, descricao, ativo: ativo ?? true } })

  if (Array.isArray(musicians) && musicians.length > 0) {
    await prisma.musicianTeam.createMany({
      data: musicians.map((musicianId: number) => ({ musicianId, teamId: team.id })),
      skipDuplicates: true,
    })
  }

  return res.status(201).json(team)
})

router.patch('/:id', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { nome, descricao, ativo, musicians } = req.body
  const teamId = Number(req.params.id)

  const team = await prisma.team.update({
    where: { id: teamId },
    data: { nome, descricao, ativo },
  })

  if (Array.isArray(musicians)) {
    await prisma.musicianTeam.deleteMany({ where: { teamId } })
    if (musicians.length > 0) {
      await prisma.musicianTeam.createMany({
        data: musicians.map((musicianId: number) => ({ musicianId, teamId })),
        skipDuplicates: true,
      })
    }
  }

  return res.json(team)
})

router.delete('/:id', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  await prisma.team.delete({ where: { id: Number(req.params.id) } })
  return res.status(204).send()
})

export default router
