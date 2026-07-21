import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../_middleware/auth'
import { requireRole } from '../_middleware/roles'
import { requireTeamOwnership } from '../_middleware/teamScope'
import { suggestMusicians } from '../_lib/suggestMusicians'
import { sendPushToMusicians, sendPushToStaff, formatDataCurta } from '../_lib/sendPush'

const router = Router()
const prisma = new PrismaClient()

async function resolveScaleTeamId(req: AuthRequest) {
  const scale = await prisma.scale.findUnique({ where: { id: Number(req.params.id) }, select: { teamId: true } })
  return scale?.teamId ?? null
}

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
  const { mes, teamId, mine } = req.query as Record<string, string>
  const where: Record<string, unknown> = {}

  if (mes) {
    const [year, month] = mes.split('-').map(Number)
    where.dataCelebracao = {
      gte: new Date(year, month - 1, 1),
      lt: new Date(year, month, 1),
    }
  }
  if (teamId) where.teamId = Number(teamId)
  if (mine === 'true') {
    if (!req.user!.musicianId) return res.json([])
    where.musicians = { some: { musicianId: req.user!.musicianId } }
  }

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

  if (musicians?.length) {
    sendPushToMusicians(prisma, musicians.map((m: { musicianId: number }) => m.musicianId), {
      title: 'Nova escalação',
      body: `Você foi escalado(a) para ${scale.celebracao} em ${formatDataCurta(scale.dataCelebracao)} às ${scale.horario}`,
      url: `/escalas/${scale.id}`,
    }).catch((err) => console.error('push create scale', err))
  }

  return res.status(201).json(scale)
})

router.get('/sugestoes', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { data, horario, teamId, instrumentId, excludeIds } = req.query as Record<string, string>
  if (!data || !horario) {
    return res.status(422).json({ message: 'Informe data e horário' })
  }
  const excluded = excludeIds ? excludeIds.split(',').map(Number) : []
  const suggestions = await suggestMusicians(prisma, {
    data,
    horario,
    teamId: teamId ? Number(teamId) : null,
    instrumentId: instrumentId ? Number(instrumentId) : null,
    excludeIds: excluded,
  })
  return res.json(suggestions)
})

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const scale = await prisma.scale.findUnique({
    where: { id: Number(req.params.id) },
    include,
  })
  if (!scale) return res.status(404).json({ message: 'Escala não encontrada' })
  return res.json(scale)
})

router.patch('/:id', authenticate, requireRole('admin', 'coordenador'), requireTeamOwnership(resolveScaleTeamId), async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id)
  const { dataCelebracao, horario, celebracao, teamId, observacoes, status, musicians } = req.body

  // Diff em vez de apagar-e-recriar: preserva o status (confirmado/recusado/
  // substituído) de quem continua na escala, só mexe em quem entrou ou saiu.
  let addedMusicianIds: number[] = []
  if (musicians !== undefined) {
    const newList = musicians as { musicianId: number; instrumentId?: number | null }[]
    const newIds = new Set(newList.map((m) => m.musicianId))
    const existing = await prisma.scaleMusician.findMany({ where: { scaleId: id } })
    const existingIds = new Set(existing.map((e) => e.musicianId))

    const toRemove = existing.filter((e) => !newIds.has(e.musicianId))
    const toAdd = newList.filter((m) => !existingIds.has(m.musicianId))
    const toUpdate = newList.filter((m) => existingIds.has(m.musicianId))
    addedMusicianIds = toAdd.map((m) => m.musicianId)

    if (toRemove.length) {
      await prisma.scaleMusician.deleteMany({ where: { id: { in: toRemove.map((r) => r.id) } } })
    }
    for (const m of toUpdate) {
      await prisma.scaleMusician.updateMany({
        where: { scaleId: id, musicianId: m.musicianId },
        data: { instrumentId: m.instrumentId ?? null },
      })
    }
    if (toAdd.length) {
      await prisma.scaleMusician.createMany({
        data: toAdd.map((m) => ({ scaleId: id, musicianId: m.musicianId, instrumentId: m.instrumentId ?? null })),
      })
    }
  }

  const scale = await prisma.scale.update({
    where: { id },
    data: {
      ...(dataCelebracao ? { dataCelebracao: new Date(dataCelebracao) } : {}),
      ...(horario !== undefined ? { horario } : {}),
      ...(celebracao !== undefined ? { celebracao } : {}),
      ...(teamId !== undefined ? { teamId: teamId ?? null } : {}),
      ...(observacoes !== undefined ? { observacoes } : {}),
      ...(status !== undefined ? { status } : {}),
    },
    include,
  })

  if (addedMusicianIds.length) {
    sendPushToMusicians(prisma, addedMusicianIds, {
      title: 'Nova escalação',
      body: `Você foi escalado(a) para ${scale.celebracao} em ${formatDataCurta(scale.dataCelebracao)} às ${scale.horario}`,
      url: `/escalas/${scale.id}`,
    }).catch((err) => console.error('push patch scale', err))
  }

  return res.json(scale)
})

router.delete('/:id', authenticate, requireRole('admin', 'coordenador'), requireTeamOwnership(resolveScaleTeamId), async (req: AuthRequest, res: Response) => {
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
    data: { status: 'confirmado' },
  })
  return res.json(updated)
})

router.patch('/:id/recusar', authenticate, async (req: AuthRequest, res: Response) => {
  const scaleId = Number(req.params.id)
  const musicianId = req.user!.musicianId
  const { motivo } = req.body as { motivo?: string }

  if (!musicianId) {
    return res.status(403).json({ message: 'Usuário não possui perfil de músico' })
  }

  const pivot = await prisma.scaleMusician.findUnique({
    where: { scaleId_musicianId: { scaleId, musicianId } },
    include: { scale: true, musician: true },
  })
  if (!pivot) return res.status(403).json({ message: 'Músico não está nesta escala' })

  const [updated] = await prisma.$transaction([
    prisma.scaleMusician.update({
      where: { scaleId_musicianId: { scaleId, musicianId } },
      data: { status: 'recusado' },
    }),
    prisma.substituicao.create({
      data: { scaleMusicianId: pivot.id, motivo: motivo ?? null },
    }),
  ])

  sendPushToStaff(prisma, pivot.scale.teamId, {
    title: 'Recusa de escalação',
    body: `${pivot.musician.nome} não poderá servir em ${pivot.scale.celebracao} (${formatDataCurta(pivot.scale.dataCelebracao)}). Precisa de substituto.`,
    url: '/substituicoes',
  }).catch((err) => console.error('push recusar', err))

  return res.json(updated)
})

export default router
