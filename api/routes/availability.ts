import { Router, Response } from 'express'
import { PrismaClient, AvailabilityType } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireRole } from '../middleware/roles'

const router = Router()
const prisma = new PrismaClient()

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const musicianId = req.user!.musicianId
  if (!musicianId) return res.status(403).json({ message: 'Usuário não possui perfil de músico' })

  const availabilities = await prisma.availability.findMany({
    where: { musicianId },
    orderBy: [{ tipo: 'asc' }, { diaSemana: 'asc' }],
  })
  return res.json(availabilities)
})

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const musicianId = req.user!.musicianId
  if (!musicianId) return res.status(403).json({ message: 'Usuário não possui perfil de músico' })

  const { availabilities } = req.body as {
    availabilities: { diaSemana: number; periodo: string; disponivel?: boolean }[]
  }

  // Remove recorrentes anteriores e recria
  await prisma.availability.deleteMany({
    where: { musicianId, tipo: AvailabilityType.recorrente_semanal },
  })

  const created = await prisma.availability.createMany({
    data: availabilities.map((a) => ({
      musicianId,
      tipo: AvailabilityType.recorrente_semanal,
      diaSemana: a.diaSemana,
      periodo: a.periodo as 'manha' | 'tarde' | 'noite',
      disponivel: a.disponivel ?? true,
    })),
  })
  return res.status(201).json({ count: created.count })
})

router.get('/panel', authenticate, requireRole('admin', 'coordenador'), async (_req: AuthRequest, res: Response) => {
  const availabilities = await prisma.availability.findMany({
    include: { musician: { select: { id: true, nome: true } } },
    orderBy: [{ musician: { nome: 'asc' } }, { diaSemana: 'asc' }],
  })
  return res.json(availabilities)
})

export default router
