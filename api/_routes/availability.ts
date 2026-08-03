import { Router, Response } from 'express'
import { PrismaClient, AvailabilityType } from '@prisma/client'
import { authenticate, AuthRequest } from '../_middleware/auth'
import { requireRole } from '../_middleware/roles'

const router = Router()
const prisma = new PrismaClient()

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const servidorId = req.user!.servidorId
  if (!servidorId) return res.status(403).json({ message: 'Usuário não possui perfil de servidor' })

  const availabilities = await prisma.availability.findMany({
    where: { servidorId },
    orderBy: [{ tipo: 'asc' }, { diaSemana: 'asc' }],
  })
  return res.json(availabilities)
})

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const servidorId = req.user!.servidorId
  if (!servidorId) return res.status(403).json({ message: 'Usuário não possui perfil de servidor' })

  const { availabilities, especificas } = req.body as {
    availabilities: { diaSemana: number; periodo: string; disponivel?: boolean }[]
    especificas?: { data: string; periodo: string; disponivel?: boolean }[]
  }

  // Remove recorrentes e datas específicas anteriores e recria
  await prisma.availability.deleteMany({
    where: { servidorId, tipo: AvailabilityType.recorrente_semanal },
  })
  await prisma.availability.deleteMany({
    where: { servidorId, tipo: AvailabilityType.data_especifica },
  })

  const created = await prisma.availability.createMany({
    data: [
      ...availabilities.map((a) => ({
        servidorId,
        tipo: AvailabilityType.recorrente_semanal,
        diaSemana: a.diaSemana,
        periodo: a.periodo as 'manha' | 'tarde' | 'noite',
        disponivel: a.disponivel ?? true,
      })),
      ...(especificas ?? []).map((e) => ({
        servidorId,
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
      where: { windowId_servidorId: { windowId: activeWindow.id, servidorId } },
      update: { respondedAt: new Date() },
      create: { windowId: activeWindow.id, servidorId },
    })
  }

  return res.status(201).json({ count: created.count })
})

router.get('/panel', authenticate, requireRole('admin', 'coordenador'), async (_req: AuthRequest, res: Response) => {
  const availabilities = await prisma.availability.findMany({
    include: { servidor: { select: { id: true, nome: true } } },
    orderBy: [{ servidor: { nome: 'asc' } }, { diaSemana: 'asc' }],
  })
  return res.json(availabilities)
})

export default router
