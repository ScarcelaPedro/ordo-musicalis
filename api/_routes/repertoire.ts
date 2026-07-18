import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../_middleware/auth'
import { requireRole } from '../_middleware/roles'

const router = Router({ mergeParams: true })
const prisma = new PrismaClient()

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const scaleId = Number(req.params.scaleId)
  const repertoire = await prisma.repertoire.findUnique({
    where: { scaleId },
    include: { items: { orderBy: { ordem: 'asc' } } },
  })
  return res.json(repertoire ?? null)
})

router.put('/', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const scaleId = Number(req.params.scaleId)
  const { titulo, observacoes } = req.body

  const repertoire = await prisma.repertoire.upsert({
    where: { scaleId },
    update: { titulo, observacoes: observacoes ?? null },
    create: { scaleId, titulo, observacoes: observacoes ?? null },
    include: { items: { orderBy: { ordem: 'asc' } } },
  })
  return res.json(repertoire)
})

export default router
