import { Router, Response } from 'express'
import { PrismaClient, AvailabilityType } from '@prisma/client'
import { authenticate, AuthRequest } from '../_middleware/auth'
import { requireRole } from '../_middleware/roles'

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

  const { availabilities, especificas } = req.body as {
    availabilities: { diaSemana: number; periodo: string; disponivel?: boolean }[]
    especificas?: { data: string; periodo: string; disponivel?: boolean }[]
  }

  // Remove recorrentes e datas específicas anteriores e recria
  await prisma.availability.deleteMany({
    where: { musicianId, tipo: AvailabilityType.recorrente_semanal },
  })
  await prisma.availability.deleteMany({
    where: { musicianId, tipo: AvailabilityType.data_especifica },
  })

  const created = await prisma.availability.createMany({
    data: [
      ...availabilities.map((a) => ({
        musicianId,
        tipo: AvailabilityType.recorrente_semanal,
        diaSemana: a.diaSemana,
        periodo: a.periodo as 'manha' | 'tarde' | 'noite',
        disponivel: a.disponivel ?? true,
      })),
      ...(especificas ?? []).map((e) => ({
        musicianId,
        tipo: AvailabilityType.data_especifica,
        data: new Date(e.data),
        periodo: e.periodo as 'manha' | 'tarde' | 'noite',
        disponivel: e.disponivel ?? true,
      })),
    ],
  })

  const activeWindow = await prisma.availabilityWindow.findFirst({ where: { ativo: true } })
  if (activeWindow) {
    await prisma.availabilityWindowResponse.upsert({
      where: { windowId_musicianId: { windowId: activeWindow.id, musicianId } },
      update: { respondedAt: new Date() },
      create: { windowId: activeWindow.id, musicianId },
    })
  }

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
