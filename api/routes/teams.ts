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

router.post('/', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { nome, descricao, ativo } = req.body
  const team = await prisma.team.create({ data: { nome, descricao, ativo: ativo ?? true } })
  return res.status(201).json(team)
})

router.patch('/:id', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { nome, descricao, ativo } = req.body
  const team = await prisma.team.update({
    where: { id: Number(req.params.id) },
    data: { nome, descricao, ativo },
  })
  return res.json(team)
})

router.delete('/:id', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  await prisma.team.delete({ where: { id: Number(req.params.id) } })
  return res.status(204).send()
})

export default router
