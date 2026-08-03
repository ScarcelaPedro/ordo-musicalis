import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../_middleware/auth'
import { requireRole } from '../_middleware/roles'
import { requireTeamOwnership } from '../_middleware/teamScope'
import { suggestServidores } from '../_lib/suggestServidores'
import { sendPushToServidores, formatDataCurta } from '../_lib/sendPush'
import { sendWhatsappToServidores } from '../_lib/sendWhatsapp'

const router = Router()
const prisma = new PrismaClient()

const include = {
  scaleServidor: {
    include: { scale: { include: { team: true } }, servidor: true, instrument: true },
  },
  substituto: true,
}

async function resolveSubstituicaoTeamId(req: AuthRequest) {
  const substituicao = await prisma.substituicao.findUnique({
    where: { id: Number(req.params.id) },
    select: { scaleServidor: { select: { scale: { select: { teamId: true } } } } },
  })
  return substituicao?.scaleServidor.scale.teamId ?? null
}

router.get('/', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { status } = req.query as Record<string, string>

  const substituicoes = await prisma.substituicao.findMany({
    where: {
      status: (status as 'pendente' | 'aprovada' | 'rejeitada' | undefined) ?? 'pendente',
      ...(req.user!.role === 'coordenador'
        ? { scaleServidor: { scale: { team: { responsavelId: req.user!.servidorId ?? -1 } } } }
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
    include: { scaleServidor: { include: { scale: true } } },
  })
  if (!substituicao) return res.status(404).json({ message: 'Substituição não encontrada' })

  const { scale, instrumentId, servidorId } = substituicao.scaleServidor
  const outrosNaEscala = await prisma.scaleServidor.findMany({
    where: { scaleId: scale.id },
    select: { servidorId: true },
  })

  const suggestions = await suggestServidores(prisma, {
    data: scale.dataCelebracao.toISOString().slice(0, 10),
    horario: scale.horario,
    teamId: scale.teamId,
    instrumentId,
    excludeIds: [servidorId, ...outrosNaEscala.map((o) => o.servidorId)],
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
      include: { scaleServidor: { include: { scale: true } } },
    })
    if (!substituicao) return res.status(404).json({ message: 'Substituição não encontrada' })
    if (substituicao.status !== 'pendente') {
      return res.status(422).json({ message: 'Esta substituição já foi decidida' })
    }

    const { scaleId, instrumentId, scale } = substituicao.scaleServidor

    const [updated] = await prisma.$transaction([
      prisma.substituicao.update({
        where: { id },
        data: { status: 'aprovada', decidedAt: new Date(), substitutoId },
      }),
      prisma.scaleServidor.update({
        where: { id: substituicao.scaleServidorId },
        data: { status: 'substituido' },
      }),
      prisma.scaleServidor.upsert({
        where: { scaleId_servidorId: { scaleId, servidorId: substitutoId } },
        update: { status: 'confirmado', instrumentId: instrumentId ?? null },
        create: { scaleId, servidorId: substitutoId, instrumentId: instrumentId ?? null, status: 'confirmado' },
      }),
    ])

    sendPushToServidores(prisma, [substitutoId], {
      title: 'Você foi confirmado(a) como substituto',
      body: `Você entrou em ${scale.celebracao} em ${formatDataCurta(scale.dataCelebracao)} às ${scale.horario}`,
      url: `/escalas/${scaleId}`,
    }).catch((err) => console.error('push aprovar substituicao', err))
    sendWhatsappToServidores(prisma, [substitutoId],
      `*Você foi confirmado(a) como substituto* ✅\nVocê entrou em *${scale.celebracao}* em ${formatDataCurta(scale.dataCelebracao)} às ${scale.horario}.`
    ).catch((err) => console.error('whatsapp aprovar substituicao', err))

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
