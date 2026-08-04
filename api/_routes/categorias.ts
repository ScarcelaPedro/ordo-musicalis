import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../_middleware/auth'
import { requireRole } from '../_middleware/roles'

const router = Router()
const prisma = new PrismaClient()

router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  const categorias = await prisma.categoriaFuncao.findMany({ orderBy: { ordem: 'asc' } })
  return res.json(categorias)
})

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const categoria = await prisma.categoriaFuncao.findUnique({ where: { id: Number(req.params.id) } })
  if (!categoria) return res.status(404).json({ message: 'Categoria não encontrada' })
  return res.json(categoria)
})

router.post('/', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { nome, ordem, ativo } = req.body
  if (!nome) {
    return res.status(422).json({ message: 'Informe o nome da categoria' })
  }
  const categoria = await prisma.categoriaFuncao.create({
    data: { nome, ordem: ordem ?? 0, ativo: ativo ?? true },
  })
  return res.status(201).json(categoria)
})

router.patch('/:id', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { nome, ordem, ativo } = req.body
  const categoria = await prisma.categoriaFuncao.update({
    where: { id: Number(req.params.id) },
    data: { nome, ordem, ativo },
  })
  return res.json(categoria)
})

router.delete('/:id', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  await prisma.categoriaFuncao.delete({ where: { id: Number(req.params.id) } })
  return res.status(204).send()
})

export default router
