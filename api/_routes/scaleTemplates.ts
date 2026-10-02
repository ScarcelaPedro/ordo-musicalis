import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../_middleware/auth'
import { requireRole } from '../_middleware/roles'
import { requireAnyTeamOwnership } from '../_middleware/teamScope'
import { buildFixedAssignments, occurrenceDays } from '../_lib/recurrence'

const router = Router()
const prisma = new PrismaClient()

const include = { team: true, comunidade: { select: { id: true, nome: true } } }

router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  const templates = await prisma.scaleTemplate.findMany({
    include,
    orderBy: [{ diaSemana: 'asc' }, { horario: 'asc' }],
  })
  return res.json(templates)
})

async function comunidadeExists(id: unknown) {
  if (id === null || id === undefined || id === '') return false
  return !!(await prisma.comunidade.findUnique({ where: { id: Number(id) }, select: { id: true } }))
}

// Same rule as manual scales (TASK-0117, ADR-0006): any coordenador may create a recurrence;
// there is no single "ministry of the recurrence" anymore.
router.post('/', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { celebracao, horario, diaSemana, tipoRecorrencia, ordinal, comunidadeId, observacoes, ativo } = req.body
  if (!celebracao || !horario || diaSemana === undefined || diaSemana === null) {
    return res.status(422).json({ message: 'Celebração, horário e dia da semana são obrigatórios' })
  }
  if (!(await comunidadeExists(comunidadeId))) {
    return res.status(422).json({ message: 'Selecione a comunidade da celebração' })
  }
  if (tipoRecorrencia === 'mensal_ordinal' && !ordinal) {
    return res.status(422).json({ message: 'Informe qual semana do mês (1ª a 5ª) para recorrência mensal' })
  }

  const template = await prisma.scaleTemplate.create({
    data: {
      celebracao,
      horario,
      diaSemana: Number(diaSemana),
      tipoRecorrencia: tipoRecorrencia ?? 'semanal',
      ordinal: tipoRecorrencia === 'mensal_ordinal' ? Number(ordinal) : null,
      comunidadeId: Number(comunidadeId),
      observacoes: observacoes ?? null,
      ativo: ativo ?? true,
    },
    include,
  })
  return res.status(201).json(template)
})

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const template = await prisma.scaleTemplate.findUnique({ where: { id: Number(req.params.id) }, include })
  if (!template) return res.status(404).json({ message: 'Recorrência não encontrada' })
  return res.json(template)
})

// Ownership for coordenadores: the legacy template ministry plus the ministry of every fixed
// link -- mirrors resolveScaleTeamIds in scales.ts.
export async function resolveTemplateTeamIds(templateId: number) {
  const tpl = await prisma.scaleTemplate.findUnique({
    where: { id: templateId },
    select: { teamId: true, vinculosFixos: { select: { teamId: true } } },
  })
  if (!tpl) return []
  const ids = [tpl.teamId, ...tpl.vinculosFixos.map((v) => v.teamId)].filter((id): id is number => id != null)
  return [...new Set(ids)]
}

const requireTemplateOwnership = requireAnyTeamOwnership((req) => resolveTemplateTeamIds(Number(req.params.id)))

router.patch('/:id', authenticate, requireRole('admin', 'coordenador'), requireTemplateOwnership, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id)
  const { celebracao, horario, diaSemana, tipoRecorrencia, ordinal, comunidadeId, observacoes, ativo } = req.body
  if (comunidadeId !== undefined && !(await comunidadeExists(comunidadeId))) {
    return res.status(422).json({ message: 'Selecione a comunidade da celebração' })
  }

  const template = await prisma.scaleTemplate.update({
    where: { id },
    data: {
      ...(celebracao !== undefined ? { celebracao } : {}),
      ...(horario !== undefined ? { horario } : {}),
      ...(diaSemana !== undefined ? { diaSemana: Number(diaSemana) } : {}),
      ...(tipoRecorrencia !== undefined ? { tipoRecorrencia } : {}),
      ordinal: tipoRecorrencia === 'mensal_ordinal' ? Number(ordinal) : null,
      ...(comunidadeId !== undefined ? { comunidadeId: Number(comunidadeId) } : {}),
      ...(observacoes !== undefined ? { observacoes } : {}),
      ...(ativo !== undefined ? { ativo } : {}),
    },
    include,
  })
  return res.json(template)
})

router.delete('/:id', authenticate, requireRole('admin', 'coordenador'), requireTemplateOwnership, async (req: AuthRequest, res: Response) => {
  await prisma.scaleTemplate.delete({ where: { id: Number(req.params.id) } })
  return res.status(204).send()
})

router.post('/generate', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { mes } = req.body as { mes?: string }
  if (!mes || !/^\d{4}-\d{2}$/.test(mes)) {
    return res.status(422).json({ message: 'Informe o mês no formato YYYY-MM' })
  }
  const [year, month] = mes.split('-').map(Number)
  const monthIndex = month - 1

  const templates = await prisma.scaleTemplate.findMany({
    where: { ativo: true },
    include: { vinculosFixos: { where: { ativo: true } } },
  })

  // Only for legacy recurrences whose community could not be backfilled (ADR-0006): same
  // default the generator always used.
  const fallbackComunidade =
    (await prisma.comunidade.findFirst({ where: { nome: 'Matriz' }, orderBy: { id: 'asc' } })) ??
    (await prisma.comunidade.findFirst({ orderBy: { id: 'asc' } }))
  if (!fallbackComunidade) {
    return res.status(422).json({ message: 'Cadastre ao menos uma comunidade antes de gerar escalas' })
  }

  let criadas = 0
  let puladas = 0

  for (const tpl of templates) {
    const comunidadeId = tpl.comunidadeId ?? fallbackComunidade.id
    const servidores = buildFixedAssignments(tpl.vinculosFixos, tpl.teamId)

    for (const day of occurrenceDays(year, monthIndex, tpl)) {
      const dataCelebracao = new Date(year, monthIndex, day)
      // Two communities may have a celebration at the same time, so the community is part of
      // what makes a generated scale a duplicate.
      const exists = await prisma.scale.findFirst({
        where: { dataCelebracao, horario: tpl.horario, comunidadeId },
      })
      if (exists) { puladas++; continue }

      await prisma.scale.create({
        data: {
          dataCelebracao,
          horario: tpl.horario,
          celebracao: tpl.celebracao,
          teamId: tpl.teamId,
          comunidadeId,
          observacoes: tpl.observacoes,
          servidores: servidores.length ? { create: servidores } : undefined,
        },
      })
      criadas++
    }
  }

  return res.json({ criadas, puladas })
})

export default router
