import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../_middleware/auth'
import { requireRole } from '../_middleware/roles'

const router = Router()
const prisma = new PrismaClient()

router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  const celebrantes = await prisma.celebrante.findMany({ orderBy: { nome: 'asc' } })
  return res.json(celebrantes)
})

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const celebrante = await prisma.celebrante.findUnique({ where: { id: Number(req.params.id) } })
  if (!celebrante) return res.status(404).json({ message: 'Celebrante não encontrado' })
  return res.json(celebrante)
})

router.post('/', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { nome, telefone, email, ativo } = req.body
  if (!nome) {
    return res.status(422).json({ message: 'Informe o nome do celebrante' })
  }
  const celebrante = await prisma.celebrante.create({
    data: { nome, telefone: telefone ?? null, email: email ?? null, ativo: ativo ?? true },
  })
  return res.status(201).json(celebrante)
})

router.patch('/:id', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { nome, telefone, email, ativo } = req.body
  const celebrante = await prisma.celebrante.update({
    where: { id: Number(req.params.id) },
    data: { nome, telefone, email, ativo },
  })
  return res.json(celebrante)
})

router.delete('/:id', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  await prisma.celebrante.delete({ where: { id: Number(req.params.id) } })
  return res.status(204).send()
})

export default router
