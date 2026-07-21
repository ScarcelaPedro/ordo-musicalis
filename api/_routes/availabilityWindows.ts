import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../_middleware/auth'
import { requireRole } from '../_middleware/roles'

const router = Router()
const prisma = new PrismaClient()

router.get('/', authenticate, requireRole('admin', 'coordenador'), async (_req: AuthRequest, res: Response) => {
  const windows = await prisma.availabilityWindow.findMany({ orderBy: { mes: 'desc' } })
  return res.json(windows)
})

router.get('/atual', authenticate, async (_req: AuthRequest, res: Response) => {
  const window = await prisma.availabilityWindow.findFirst({
    where: { ativo: true },
    orderBy: { createdAt: 'desc' },
  })
  return res.json(window ?? null)
})

router.post('/', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { mes, prazo } = req.body as { mes?: string; prazo?: string }
  if (!mes || !/^\d{4}-\d{2}$/.test(mes) || !prazo) {
    return res.status(422).json({ message: 'Informe o mês (YYYY-MM) e o prazo' })
  }
  const window = await prisma.availabilityWindow.create({
    data: { mes, prazo: new Date(prazo), ativo: true },
  })
  return res.status(201).json(window)
})

router.patch('/:id', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { prazo, ativo } = req.body as { prazo?: string; ativo?: boolean }
  const window = await prisma.availabilityWindow.update({
    where: { id: Number(req.params.id) },
    data: {
      ...(prazo !== undefined ? { prazo: new Date(prazo) } : {}),
      ...(ativo !== undefined ? { ativo } : {}),
    },
  })
  return res.json(window)
})

router.get('/:id/pendentes', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const windowId = Number(req.params.id)
  const respondidos = await prisma.availabilityWindowResponse.findMany({
    where: { windowId },
    select: { musicianId: true },
  })
  const respondidosIds = respondidos.map((r) => r.musicianId)

  const pendentes = await prisma.musician.findMany({
    where: { ativo: true, id: { notIn: respondidosIds } },
    select: { id: true, nome: true, email: true },
    orderBy: { nome: 'asc' },
  })
  return res.json(pendentes)
})

export default router
