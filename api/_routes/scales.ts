import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../_middleware/auth'
import { requireRole } from '../_middleware/roles'
import { requireAnyTeamOwnership } from '../_middleware/teamScope'
import { suggestServidores } from '../_lib/suggestServidores'
import { sendPushToServidores, sendPushToStaff, formatDataCurta } from '../_lib/sendPush'
import { sendWhatsappToServidores, sendWhatsappToStaff } from '../_lib/sendWhatsapp'
import { hojeBrasilia } from '../_lib/date'

const router = Router()
const prisma = new PrismaClient()

// Sem "Ministério responsável" único por escala (desde a Fase 5), a posse de uma celebração pra
// fins de permissão é "coordena algum dos ministérios de quem está escalado ali" -- inclui o
// teamId legado da própria Scale (escalas geradas por template ainda o usam) e o teamId de cada
// ScaleServidor.
async function resolveScaleTeamIds(req: AuthRequest): Promise<number[]> {
  const scale = await prisma.scale.findUnique({
    where: { id: Number(req.params.id) },
    select: { teamId: true, servidores: { select: { teamId: true } } },
  })
  if (!scale) return []
  const ids = new Set<number>()
  if (scale.teamId) ids.add(scale.teamId)
  for (const s of scale.servidores) if (s.teamId) ids.add(s.teamId)
  return Array.from(ids)
}

// TODO(Fase 2): remover quando o ScaleForm ganhar o seletor de Comunidade -- até lá, toda
// escala criada sem comunidadeId explícito cai na Matriz, pra não quebrar o fluxo atual.
async function defaultComunidadeId(): Promise<number> {
  const matriz = await prisma.comunidade.findFirst({ where: { nome: 'Matriz' } })
  if (!matriz) throw new Error('Comunidade padrão "Matriz" não encontrada')
  return matriz.id
}

const include = {
  team: true,
  comunidade: true,
  celebrante: true,
  servidores: {
    include: { servidor: true, instrument: true, team: { include: { categoria: true } }, categoria: true },
  },
  repertoire: {
    include: { items: { orderBy: { ordem: 'asc' as const } } },
  },
}

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { mes, teamId, comunidadeId, mine } = req.query as Record<string, string>
  const where: Record<string, unknown> = {}

  if (mes) {
    const [year, month] = mes.split('-').map(Number)
    where.dataCelebracao = {
      gte: new Date(year, month - 1, 1),
      lt: new Date(year, month, 1),
    }
  }
  if (teamId) where.teamId = Number(teamId)
  if (comunidadeId) where.comunidadeId = Number(comunidadeId)
  if (mine === 'true') {
    if (!req.user!.servidorId) return res.json([])
    where.servidores = { some: { servidorId: req.user!.servidorId } }
  }

  const scales = await prisma.scale.findMany({
    where,
    include: { team: true, comunidade: true, celebrante: true, servidores: { include: { servidor: true, instrument: true } } },
    orderBy: { dataCelebracao: 'asc' },
  })
  return res.json(scales)
})

router.post('/', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { dataCelebracao, horario, celebracao, teamId, comunidadeId, celebranteId, observacoes, servidores, lembreteDiasAntes } = req.body

  const scale = await prisma.scale.create({
    data: {
      dataCelebracao: new Date(dataCelebracao),
      horario,
      celebracao,
      teamId: teamId ?? null,
      comunidadeId: comunidadeId ? Number(comunidadeId) : await defaultComunidadeId(),
      celebranteId: celebranteId ?? null,
      observacoes: observacoes ?? null,
      ...(lembreteDiasAntes !== undefined ? { lembreteDiasAntes: Number(lembreteDiasAntes) } : {}),
      servidores: servidores?.length
        ? {
            create: (servidores as { servidorId: number; instrumentId?: number; teamId?: number | null; categoriaId?: number | null }[]).map((s) => ({
              servidorId: s.servidorId,
              instrumentId: s.instrumentId ?? null,
              teamId: s.teamId ?? null,
              categoriaId: s.categoriaId ?? null,
            })),
          }
        : undefined,
    },
    include,
  })

  if (servidores?.length) {
    const servidorIds = servidores.map((s: { servidorId: number }) => s.servidorId)
    sendPushToServidores(prisma, servidorIds, {
      title: 'Nova escalação',
      body: `Você foi escalado(a) para ${scale.celebracao} em ${formatDataCurta(scale.dataCelebracao)} às ${scale.horario}`,
      url: `/escalas/${scale.id}`,
    }).catch((err) => console.error('push create scale', err))
    sendWhatsappToServidores(prisma, servidorIds,
      `*Nova escalação* 🎵\nVocê foi escalado(a) para *${scale.celebracao}* em ${formatDataCurta(scale.dataCelebracao)} às ${scale.horario}.`
    ).catch((err) => console.error('whatsapp create scale', err))
  }

  return res.status(201).json(scale)
})

router.get('/sugestoes', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { data, horario, teamId, instrumentId, excludeIds } = req.query as Record<string, string>
  if (!data || !horario) {
    return res.status(422).json({ message: 'Informe data e horário' })
  }
  const excluded = excludeIds ? excludeIds.split(',').map(Number) : []
  const suggestions = await suggestServidores(prisma, {
    data,
    horario,
    teamId: teamId ? Number(teamId) : null,
    instrumentId: instrumentId ? Number(instrumentId) : null,
    excludeIds: excluded,
  })
  return res.json(suggestions)
})

router.get('/pendentes', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const hoje = hojeBrasilia()

  const pendencias = await prisma.scaleServidor.findMany({
    where: {
      status: 'convidado',
      scale: { dataCelebracao: { gte: hoje } },
      // Escopo por ministério da própria escalação (não da escala inteira) -- cada
      // ScaleServidor carrega o seu, já que uma celebração pode reunir várias categorias.
      ...(req.user!.role === 'coordenador'
        ? { team: { responsavelId: req.user!.servidorId ?? -1 } }
        : {}),
    },
    include: {
      servidor: { select: { id: true, nome: true } },
      scale: { select: { id: true, celebracao: true, dataCelebracao: true, horario: true } },
    },
    orderBy: { scale: { dataCelebracao: 'asc' } },
  })

  const result = pendencias.map((p) => {
    const diasRestantes = Math.round((p.scale.dataCelebracao.getTime() - hoje.getTime()) / 86400000)
    return {
      scaleServidorId: p.id,
      servidorId: p.servidor.id,
      servidorNome: p.servidor.nome,
      scaleId: p.scale.id,
      celebracao: p.scale.celebracao,
      dataCelebracao: p.scale.dataCelebracao,
      horario: p.scale.horario,
      diasRestantes,
    }
  })

  return res.json(result)
})

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const scale = await prisma.scale.findUnique({
    where: { id: Number(req.params.id) },
    include,
  })
  if (!scale) return res.status(404).json({ message: 'Escala não encontrada' })
  return res.json(scale)
})

router.patch('/:id', authenticate, requireRole('admin', 'coordenador'), requireAnyTeamOwnership(resolveScaleTeamIds), async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id)
  const { dataCelebracao, horario, celebracao, teamId, comunidadeId, celebranteId, observacoes, status, servidores, lembreteDiasAntes } = req.body

  // Diff em vez de apagar-e-recriar: preserva o status (confirmado/recusado/
  // substituído) de quem continua na escala, só mexe em quem entrou ou saiu.
  let addedServidorIds: number[] = []
  if (servidores !== undefined) {
    const newList = servidores as { servidorId: number; instrumentId?: number | null; teamId?: number | null; categoriaId?: number | null }[]
    const newIds = new Set(newList.map((s) => s.servidorId))
    const existing = await prisma.scaleServidor.findMany({ where: { scaleId: id } })
    const existingIds = new Set(existing.map((e) => e.servidorId))

    const toRemove = existing.filter((e) => !newIds.has(e.servidorId))
    const toAdd = newList.filter((s) => !existingIds.has(s.servidorId))
    const toUpdate = newList.filter((s) => existingIds.has(s.servidorId))
    addedServidorIds = toAdd.map((s) => s.servidorId)

    if (toRemove.length) {
      await prisma.scaleServidor.deleteMany({ where: { id: { in: toRemove.map((r) => r.id) } } })
    }
    for (const s of toUpdate) {
      await prisma.scaleServidor.updateMany({
        where: { scaleId: id, servidorId: s.servidorId },
        data: { instrumentId: s.instrumentId ?? null, teamId: s.teamId ?? null, categoriaId: s.categoriaId ?? null },
      })
    }
    if (toAdd.length) {
      await prisma.scaleServidor.createMany({
        data: toAdd.map((s) => ({ scaleId: id, servidorId: s.servidorId, instrumentId: s.instrumentId ?? null, teamId: s.teamId ?? null, categoriaId: s.categoriaId ?? null })),
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
      ...(comunidadeId !== undefined ? { comunidadeId: Number(comunidadeId) } : {}),
      ...(celebranteId !== undefined ? { celebranteId: celebranteId ?? null } : {}),
      ...(observacoes !== undefined ? { observacoes } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(lembreteDiasAntes !== undefined ? { lembreteDiasAntes: Number(lembreteDiasAntes) } : {}),
    },
    include,
  })

  if (addedServidorIds.length) {
    sendPushToServidores(prisma, addedServidorIds, {
      title: 'Nova escalação',
      body: `Você foi escalado(a) para ${scale.celebracao} em ${formatDataCurta(scale.dataCelebracao)} às ${scale.horario}`,
      url: `/escalas/${scale.id}`,
    }).catch((err) => console.error('push patch scale', err))
    sendWhatsappToServidores(prisma, addedServidorIds,
      `*Nova escalação* 🎵\nVocê foi escalado(a) para *${scale.celebracao}* em ${formatDataCurta(scale.dataCelebracao)} às ${scale.horario}.`
    ).catch((err) => console.error('whatsapp patch scale', err))
  }

  return res.json(scale)
})

router.delete('/:id', authenticate, requireRole('admin', 'coordenador'), requireAnyTeamOwnership(resolveScaleTeamIds), async (req: AuthRequest, res: Response) => {
  await prisma.scale.delete({ where: { id: Number(req.params.id) } })
  return res.status(204).send()
})

router.patch('/:id/confirmar', authenticate, async (req: AuthRequest, res: Response) => {
  const scaleId = Number(req.params.id)
  const servidorId = req.user!.servidorId

  if (!servidorId) {
    return res.status(403).json({ message: 'Usuário não possui perfil de servidor' })
  }

  const pivot = await prisma.scaleServidor.findUnique({
    where: { scaleId_servidorId: { scaleId, servidorId } },
  })
  if (!pivot) return res.status(403).json({ message: 'Servidor não está nesta escala' })

  const updated = await prisma.scaleServidor.update({
    where: { scaleId_servidorId: { scaleId, servidorId } },
    data: { status: 'confirmado' },
  })
  return res.json(updated)
})

router.patch('/:id/recusar', authenticate, async (req: AuthRequest, res: Response) => {
  const scaleId = Number(req.params.id)
  const servidorId = req.user!.servidorId
  const { motivo } = req.body as { motivo?: string }

  if (!servidorId) {
    return res.status(403).json({ message: 'Usuário não possui perfil de servidor' })
  }

  const pivot = await prisma.scaleServidor.findUnique({
    where: { scaleId_servidorId: { scaleId, servidorId } },
    include: { scale: true, servidor: true },
  })
  if (!pivot) return res.status(403).json({ message: 'Servidor não está nesta escala' })

  const [updated] = await prisma.$transaction([
    prisma.scaleServidor.update({
      where: { scaleId_servidorId: { scaleId, servidorId } },
      data: { status: 'recusado' },
    }),
    prisma.substituicao.create({
      data: { scaleServidorId: pivot.id, motivo: motivo ?? null },
    }),
  ])

  // Notifica o responsável pelo ministério da própria escalação (não "o" ministério da
  // escala, que não existe mais como conceito único) -- mais preciso e funciona mesmo pra
  // escalações sem ministério algum (só admin é avisado nesse caso).
  sendPushToStaff(prisma, pivot.teamId, {
    title: 'Recusa de escalação',
    body: `${pivot.servidor.nome} não poderá servir em ${pivot.scale.celebracao} (${formatDataCurta(pivot.scale.dataCelebracao)}). Precisa de substituto.`,
    url: '/substituicoes',
  }).catch((err) => console.error('push recusar', err))
  sendWhatsappToStaff(prisma, pivot.teamId,
    `*Recusa de escalação* ⚠️\n${pivot.servidor.nome} não poderá servir em *${pivot.scale.celebracao}* (${formatDataCurta(pivot.scale.dataCelebracao)}). Precisa de substituto.`
  ).catch((err) => console.error('whatsapp recusar', err))

  return res.json(updated)
})

export default router
