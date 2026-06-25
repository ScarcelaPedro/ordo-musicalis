import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireRole } from '../middleware/roles'

const router = Router()
const prisma = new PrismaClient()

const include = {
  team: true,
  musicians: {
    include: { musician: true, instrument: true },
  },
  repertoire: {
    include: { items: { orderBy: { ordem: 'asc' as const } } },
  },
}

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { mes, teamId } = req.query as Record<string, string>
  const where: Record<string, unknown> = {}

  if (mes) {
    const [year, month] = mes.split('-').map(Number)
    where.dataCelebracao = {
      gte: new Date(year, month - 1, 1),
      lt: new Date(year, month, 1),
    }
  }
  if (teamId) where.teamId = Number(teamId)

  const scales = await prisma.scale.findMany({
    where,
    include: { team: true, musicians: { include: { musician: true, instrument: true } } },
    orderBy: { dataCelebracao: 'asc' },
  })
  return res.json(scales)
})

router.post('/', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { dataCelebracao, horario, celebracao, teamId, observacoes, musicians } = req.body

  const scale = await prisma.scale.create({
    data: {
      dataCelebracao: new Date(dataCelebracao),
      horario,
      celebracao,
      teamId: teamId ?? null,
      observacoes: observacoes ?? null,
      musicians: musicians?.length
        ? {
            create: (musicians as { musicianId: number; instrumentId?: number }[]).map((m) => ({
              musicianId: m.musicianId,
              instrumentId: m.instrumentId ?? null,
            })),
          }
        : undefined,
    },
    include,
  })
  return res.status(201).json(scale)
})

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const scale = await prisma.scale.findUnique({
    where: { id: Number(req.params.id) },
    include,
  })
  if (!scale) return res.status(404).json({ message: 'Escala não encontrada' })
  return res.json(scale)
})

router.patch('/:id', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id)
  const { dataCelebracao, horario, celebracao, teamId, observacoes, status, musicians } = req.body

  if (musicians !== undefined) {
    await prisma.scaleMusician.deleteMany({ where: { scaleId: id } })
  }

  const scale = await prisma.scale.update({
    where: { id },
    data: {
      ...(dataCelebracao ? { dataCelebracao: new Date(dataCelebracao) } : {}),
      ...(horario !== undefined ? { horario } : {}),
      ...(celebracao !== undefined ? { celebracao } : {}),
      teamId: teamId ?? null,
      ...(observacoes !== undefined ? { observacoes } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(musicians?.length
        ? {
            musicians: {
              create: (musicians as { musicianId: number; instrumentId?: number }[]).map((m) => ({
                musicianId: m.musicianId,
                instrumentId: m.instrumentId ?? null,
              })),
            },
          }
        : {}),
    },
    include,
  })
  return res.json(scale)
})

router.delete('/:id', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  await prisma.scale.delete({ where: { id: Number(req.params.id) } })
  return res.status(204).send()
})

router.patch('/:id/confirmar', authenticate, async (req: AuthRequest, res: Response) => {
  const scaleId = Number(req.params.id)
  const musicianId = req.user!.musicianId

  if (!musicianId) {
    return res.status(403).json({ message: 'Usuário não possui perfil de músico' })
  }

  const pivot = await prisma.scaleMusician.findUnique({
    where: { scaleId_musicianId: { scaleId, musicianId } },
  })
  if (!pivot) return res.status(403).json({ message: 'Músico não está nesta escala' })

  const updated = await prisma.scaleMusician.update({
    where: { scaleId_musicianId: { scaleId, musicianId } },
    data: { confirmado: true },
  })
  return res.json(updated)
})

export default router
