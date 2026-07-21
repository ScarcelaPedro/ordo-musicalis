import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../_middleware/auth'
import { requireRole } from '../_middleware/roles'
import { requireTeamOwnership } from '../_middleware/teamScope'

const router = Router()
const prisma = new PrismaClient()

const include = { team: true }

router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  const templates = await prisma.scaleTemplate.findMany({
    include,
    orderBy: [{ diaSemana: 'asc' }, { horario: 'asc' }],
  })
  return res.json(templates)
})

router.post('/', authenticate, requireRole('admin', 'coordenador'), requireTeamOwnership(async (req) => req.body.teamId ? Number(req.body.teamId) : null), async (req: AuthRequest, res: Response) => {
  const { celebracao, horario, diaSemana, tipoRecorrencia, ordinal, teamId, observacoes, ativo } = req.body
  if (!celebracao || !horario || diaSemana === undefined || diaSemana === null) {
    return res.status(422).json({ message: 'Celebração, horário e dia da semana são obrigatórios' })
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
      teamId: teamId ?? null,
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

async function resolveScaleTemplateTeamId(req: AuthRequest) {
  const tpl = await prisma.scaleTemplate.findUnique({ where: { id: Number(req.params.id) }, select: { teamId: true } })
  return tpl?.teamId ?? null
}

router.patch('/:id', authenticate, requireRole('admin', 'coordenador'), requireTeamOwnership(resolveScaleTemplateTeamId), async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id)
  const { celebracao, horario, diaSemana, tipoRecorrencia, ordinal, teamId, observacoes, ativo } = req.body

  const template = await prisma.scaleTemplate.update({
    where: { id },
    data: {
      ...(celebracao !== undefined ? { celebracao } : {}),
      ...(horario !== undefined ? { horario } : {}),
      ...(diaSemana !== undefined ? { diaSemana: Number(diaSemana) } : {}),
      ...(tipoRecorrencia !== undefined ? { tipoRecorrencia } : {}),
      ordinal: tipoRecorrencia === 'mensal_ordinal' ? Number(ordinal) : null,
      ...(teamId !== undefined ? { teamId: teamId ?? null } : {}),
      ...(observacoes !== undefined ? { observacoes } : {}),
      ...(ativo !== undefined ? { ativo } : {}),
    },
    include,
  })
  return res.json(template)
})

router.delete('/:id', authenticate, requireRole('admin', 'coordenador'), requireTeamOwnership(resolveScaleTemplateTeamId), async (req: AuthRequest, res: Response) => {
  await prisma.scaleTemplate.delete({ where: { id: Number(req.params.id) } })
  return res.status(204).send()
})

function nthWeekdayOfMonth(year: number, month: number, dayOfWeek: number, n: number): number | null {
  const firstDow = new Date(year, month, 1).getDay()
  const day = 1 + ((dayOfWeek - firstDow + 7) % 7) + (n - 1) * 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return day <= daysInMonth ? day : null
}

router.post('/generate', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { mes } = req.body as { mes?: string }
  if (!mes || !/^\d{4}-\d{2}$/.test(mes)) {
    return res.status(422).json({ message: 'Informe o mês no formato YYYY-MM' })
  }
  const [year, month] = mes.split('-').map(Number)
  const monthIndex = month - 1

  const templates = await prisma.scaleTemplate.findMany({ where: { ativo: true } })

  let criadas = 0
  let puladas = 0

  for (const tpl of templates) {
    const days: number[] = []
    if (tpl.tipoRecorrencia === 'semanal') {
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
      for (let d = 1; d <= daysInMonth; d++) {
        if (new Date(year, monthIndex, d).getDay() === tpl.diaSemana) days.push(d)
      }
    } else if (tpl.ordinal) {
      const day = nthWeekdayOfMonth(year, monthIndex, tpl.diaSemana, tpl.ordinal)
      if (day) days.push(day)
    }

    for (const day of days) {
      const dataCelebracao = new Date(year, monthIndex, day)
      const exists = await prisma.scale.findFirst({
        where: { dataCelebracao, horario: tpl.horario },
      })
      if (exists) { puladas++; continue }

      const vinculos = await prisma.vinculoFixo.findMany({
        where: { scaleTemplateId: tpl.id, ativo: true },
      })

      await prisma.scale.create({
        data: {
          dataCelebracao,
          horario: tpl.horario,
          celebracao: tpl.celebracao,
          teamId: tpl.teamId,
          observacoes: tpl.observacoes,
          musicians: vinculos.length
            ? {
                create: vinculos.map((v) => ({
                  musicianId: v.musicianId,
                  instrumentId: v.instrumentId,
                })),
              }
            : undefined,
        },
      })
      criadas++
    }
  }

  return res.json({ criadas, puladas })
})

export default router
