import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../_middleware/auth'
import { requireRole } from '../_middleware/roles'
import { requireTeamOwnership } from '../_middleware/teamScope'
import { suggestMusicians } from '../_lib/suggestMusicians'
import { sendPushToMusicians, formatDataCurta } from '../_lib/sendPush'

const router = Router()
const prisma = new PrismaClient()

const include = {
  scaleMusician: {
    include: { scale: { include: { team: true } }, musician: true, instrument: true },
  },
  substituto: true,
}

async function resolveSubstituicaoTeamId(req: AuthRequest) {
  const substituicao = await prisma.substituicao.findUnique({
    where: { id: Number(req.params.id) },
    select: { scaleMusician: { select: { scale: { select: { teamId: true } } } } },
  })
  return substituicao?.scaleMusician.scale.teamId ?? null
}

router.get('/', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { status } = req.query as Record<string, string>

  const substituicoes = await prisma.substituicao.findMany({
    where: {
      status: (status as 'pendente' | 'aprovada' | 'rejeitada' | undefined) ?? 'pendente',
      ...(req.user!.role === 'coordenador'
        ? { scaleMusician: { scale: { team: { responsavelId: req.user!.musicianId ?? -1 } } } }
        : {}),
    },
    include,
    orderBy: { createdAt: 'desc' },
  })
  return res.json(substituicoes)
})

router.get('/:id/sugestoes', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const substituicao = await prisma.substituicao.findUnique({
    where: { id: Number(req.params.id) },
    include: { scaleMusician: { include: { scale: true } } },
  })
  if (!substituicao) return res.status(404).json({ message: 'Substituição não encontrada' })

  const { scale, instrumentId, musicianId } = substituicao.scaleMusician
  const outrosNaEscala = await prisma.scaleMusician.findMany({
    where: { scaleId: scale.id },
    select: { musicianId: true },
  })

  const suggestions = await suggestMusicians(prisma, {
    data: scale.dataCelebracao.toISOString().slice(0, 10),
    horario: scale.horario,
    teamId: scale.teamId,
    instrumentId,
    excludeIds: [musicianId, ...outrosNaEscala.map((o) => o.musicianId)],
  })
  return res.json(suggestions)
})

router.patch(
  '/:id/aprovar',
  authenticate,
  requireRole('admin', 'coordenador'),
  requireTeamOwnership(resolveSubstituicaoTeamId),
  async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id)
    const { substitutoId } = req.body as { substitutoId: number }
    if (!substitutoId) return res.status(422).json({ message: 'Informe o substituto' })

    const substituicao = await prisma.substituicao.findUnique({
      where: { id },
      include: { scaleMusician: { include: { scale: true } } },
    })
    if (!substituicao) return res.status(404).json({ message: 'Substituição não encontrada' })
    if (substituicao.status !== 'pendente') {
      return res.status(422).json({ message: 'Esta substituição já foi decidida' })
    }

    const { scaleId, instrumentId, scale } = substituicao.scaleMusician

    const [updated] = await prisma.$transaction([
      prisma.substituicao.update({
        where: { id },
        data: { status: 'aprovada', decidedAt: new Date(), substitutoId },
      }),
      prisma.scaleMusician.update({
        where: { id: substituicao.scaleMusicianId },
        data: { status: 'substituido' },
      }),
      prisma.scaleMusician.upsert({
        where: { scaleId_musicianId: { scaleId, musicianId: substitutoId } },
        update: { status: 'confirmado', instrumentId: instrumentId ?? null },
        create: { scaleId, musicianId: substitutoId, instrumentId: instrumentId ?? null, status: 'confirmado' },
      }),
    ])

    sendPushToMusicians(prisma, [substitutoId], {
      title: 'Você foi confirmado(a) como substituto',
      body: `Você entrou em ${scale.celebracao} em ${formatDataCurta(scale.dataCelebracao)} às ${scale.horario}`,
      url: `/escalas/${scaleId}`,
    }).catch((err) => console.error('push aprovar substituicao', err))

    return res.json(updated)
  }
)

router.patch(
  '/:id/rejeitar',
  authenticate,
  requireRole('admin', 'coordenador'),
  requireTeamOwnership(resolveSubstituicaoTeamId),
  async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id)
    const substituicao = await prisma.substituicao.findUnique({ where: { id } })
    if (!substituicao) return res.status(404).json({ message: 'Substituição não encontrada' })
    if (substituicao.status !== 'pendente') {
      return res.status(422).json({ message: 'Esta substituição já foi decidida' })
    }

    const updated = await prisma.substituicao.update({
      where: { id },
      data: { status: 'rejeitada', decidedAt: new Date() },
    })
    return res.json(updated)
  }
)

export default router
