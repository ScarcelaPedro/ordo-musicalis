import { Router, Response } from 'express'
import { PrismaClient, FuncaoLiturgica } from '@prisma/client'
import { authenticate, AuthRequest } from '../_middleware/auth'
import { requireRole } from '../_middleware/roles'
import { requireAnyTeamOwnership } from '../_middleware/teamScope'
import { suggestServidores } from '../_lib/suggestServidores'
import { sendPushToServidores, sendPushToStaff, formatDataCurta } from '../_lib/sendPush'
import { sendWhatsappToServidores, sendWhatsappToStaff } from '../_lib/sendWhatsapp'
import { hojeBrasilia } from '../_lib/date'
import { celebrationNameFor } from '../_lib/deaconCelebration'
import { applyScaleServidores, notifyAddedServidores, ScaleServidorInput } from '../_lib/scaleServidoresSync'
import { canManageScaleServers, canUseSchedulingTools } from '../_lib/communityScope'

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

async function enforceDeaconCelebration(celebracao: string | undefined, celebranteId: number | null | undefined): Promise<string | undefined> {
  if (!celebranteId) return celebracao
  const celebrante = await prisma.celebrante.findUnique({ where: { id: Number(celebranteId) }, select: { nome: true } })
  return celebrationNameFor(celebracao, celebrante?.nome)
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
      celebracao: (await enforceDeaconCelebration(celebracao, celebranteId)) ?? celebracao,
      teamId: teamId ?? null,
      comunidadeId: comunidadeId ? Number(comunidadeId) : await defaultComunidadeId(),
      celebranteId: celebranteId ?? null,
      observacoes: observacoes ?? null,
      ...(lembreteDiasAntes !== undefined ? { lembreteDiasAntes: Number(lembreteDiasAntes) } : {}),
      servidores: servidores?.length
        ? {
            create: (servidores as { servidorId: number; instrumentId?: number; teamId?: number | null; categoriaId?: number | null; funcaoLiturgica?: FuncaoLiturgica | null }[]).map((s) => ({
              servidorId: s.servidorId,
              instrumentId: s.instrumentId ?? null,
              teamId: s.teamId ?? null,
              categoriaId: s.categoriaId ?? null,
              funcaoLiturgica: s.funcaoLiturgica ?? null,
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

// Read-only helper used by the team step of the scale form -- also for community coordinators.
router.get('/sugestoes', authenticate, async (req: AuthRequest, res: Response) => {
  if (!canUseSchedulingTools(req.user!)) return res.status(403).json({ message: 'Sem permissão para esta ação' })
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

  // Team diff + notifications live in _lib/scaleServidoresSync (shared with PUT /:id/servidores).
  let addedServidorIds: number[] = []
  if (servidores !== undefined) {
    addedServidorIds = await applyScaleServidores(prisma, id, servidores as ScaleServidorInput[])
  }

  // Deacons cannot celebrate Masses (ADR-0008): re-check whenever the celebrant or the name changes,
  // falling back to the stored value of whichever one was not sent.
  let finalCelebracao: string | undefined = celebracao
  if (celebranteId !== undefined || celebracao !== undefined) {
    const current = await prisma.scale.findUnique({ where: { id }, select: { celebracao: true, celebranteId: true } })
    finalCelebracao = await enforceDeaconCelebration(
      celebracao ?? current?.celebracao,
      celebranteId !== undefined ? celebranteId : current?.celebranteId,
    )
    if (finalCelebracao === current?.celebracao && celebracao === undefined) finalCelebracao = undefined
  }

  const scale = await prisma.scale.update({
    where: { id },
    data: {
      ...(dataCelebracao ? { dataCelebracao: new Date(dataCelebracao) } : {}),
      ...(horario !== undefined ? { horario } : {}),
      ...(finalCelebracao !== undefined ? { celebracao: finalCelebracao } : {}),
      ...(teamId !== undefined ? { teamId: teamId ?? null } : {}),
      ...(comunidadeId !== undefined ? { comunidadeId: Number(comunidadeId) } : {}),
      ...(celebranteId !== undefined ? { celebranteId: celebranteId ?? null } : {}),
      ...(observacoes !== undefined ? { observacoes } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(lembreteDiasAntes !== undefined ? { lembreteDiasAntes: Number(lembreteDiasAntes) } : {}),
    },
    include,
  })

  notifyAddedServidores(prisma, scale, addedServidorIds)

  return res.json(scale)
})

// Team-only edit (TASK-0130, ADR-0009): accepts ONLY the list of servers, so a community coordinator
// can never touch date, status, celebrant or move the scale to another community. Access is decided
// with the community STORED in the database (canManageScaleServers).
router.put('/:id/servidores', authenticate, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id)
  const stored = await prisma.scale.findUnique({ where: { id }, select: { id: true, comunidadeId: true } })
  if (!stored) return res.status(404).json({ message: 'Escala não encontrada' })

  const user = req.user!
  let ownsAnyScaleTeam = false
  if (user.role === 'coordenador' && user.servidorId) {
    const teamIds = await resolveScaleTeamIds(req)
    if (teamIds.length) {
      const owned = await prisma.team.count({ where: { id: { in: teamIds }, responsavelId: user.servidorId } })
      ownsAnyScaleTeam = owned > 0
    }
  }
  if (!canManageScaleServers(user, stored, ownsAnyScaleTeam)) {
    return res.status(403).json({ message: 'Você só pode editar a equipe de celebrações das comunidades que coordena ou com algum ministério seu escalado' })
  }

  const { servidores } = req.body as { servidores?: unknown }
  if (!Array.isArray(servidores)) return res.status(422).json({ message: 'Informe a lista de servidores' })
  const list = servidores as ScaleServidorInput[]
  if (list.some((s) => !Number.isInteger(Number(s?.servidorId)))) {
    return res.status(422).json({ message: 'Servidor inválido na lista' })
  }
  const servidorIds = [...new Set(list.map((s) => Number(s.servidorId)))]
  const categoriaIds = [...new Set(list.map((s) => s.categoriaId).filter((c): c is number => c != null))]
  const [servidoresFound, categoriasFound] = await Promise.all([
    prisma.servidor.count({ where: { id: { in: servidorIds } } }),
    prisma.categoriaFuncao.count({ where: { id: { in: categoriaIds } } }),
  ])
  if (servidoresFound !== servidorIds.length || categoriasFound !== categoriaIds.length) {
    return res.status(422).json({ message: 'Servidor ou função inexistente na lista' })
  }

  const addedServidorIds = await applyScaleServidores(prisma, id, list.map((s) => ({ ...s, servidorId: Number(s.servidorId) })))
  const scale = await prisma.scale.findUniqueOrThrow({ where: { id }, include })
  notifyAddedServidores(prisma, scale, addedServidorIds)
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
