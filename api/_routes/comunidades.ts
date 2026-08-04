import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../_middleware/auth'
import { requireRole } from '../_middleware/roles'

const router = Router()
const prisma = new PrismaClient()

router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  const comunidades = await prisma.comunidade.findMany({ orderBy: { nome: 'asc' } })
  return res.json(comunidades)
})

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const comunidade = await prisma.comunidade.findUnique({ where: { id: Number(req.params.id) } })
  if (!comunidade) return res.status(404).json({ message: 'Comunidade não encontrada' })
  return res.json(comunidade)
})

router.post('/', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { nome, endereco, ativo } = req.body
  if (!nome) {
    return res.status(422).json({ message: 'Informe o nome da comunidade' })
  }
  const comunidade = await prisma.comunidade.create({
    data: { nome, endereco: endereco ?? null, ativo: ativo ?? true },
  })
  return res.status(201).json(comunidade)
})

router.patch('/:id', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { nome, endereco, ativo } = req.body
  const comunidade = await prisma.comunidade.update({
    where: { id: Number(req.params.id) },
    data: { nome, endereco, ativo },
  })
  return res.json(comunidade)
})

router.delete('/:id', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  await prisma.comunidade.delete({ where: { id: Number(req.params.id) } })
  return res.status(204).send()
})

export default router
