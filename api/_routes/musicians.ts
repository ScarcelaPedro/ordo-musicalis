import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../_middleware/auth'
import { requireRole } from '../_middleware/roles'

const router = Router()
const prisma = new PrismaClient()

const include = {
  instruments: { include: { instrument: true } },
  teams: { include: { team: true } },
}

router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  const { search, instrument } = _req.query as Record<string, string>
  const musicians = await prisma.musician.findMany({
    where: {
      ...(search ? { nome: { contains: search, mode: 'insensitive' } } : {}),
      ...(instrument
        ? { instruments: { some: { instrument: { nome: { contains: instrument, mode: 'insensitive' } } } } }
        : {}),
    },
    include,
    orderBy: { nome: 'asc' },
  })
  return res.json(musicians)
})

router.post('/', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { nome, telefone, email, ativo, nivel, observacoes, instruments: instrumentIds, teams: teamIds } = req.body

  const musician = await prisma.musician.create({
    data: {
      nome,
      telefone: telefone ?? null,
      email: email ?? null,
      ativo: ativo ?? true,
      nivel: nivel ?? 'apto',
      observacoes: observacoes ?? null,
      instruments: {
        create: (instrumentIds as number[]).map((id) => ({ instrumentId: id })),
      },
      teams: teamIds?.length
        ? { create: (teamIds as number[]).map((id) => ({ teamId: id })) }
        : undefined,
    },
    include,
  })
  return res.status(201).json(musician)
})

router.get('/intensidade', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { inicio, fim } = req.query as Record<string, string>
  const hoje = new Date()
  const gte = inicio ? new Date(inicio) : new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const lte = fim ? new Date(fim) : new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)

  const musicians = await prisma.musician.findMany({
    where: { ativo: true },
    select: {
      id: true,
      nome: true,
      scales: { select: { scale: { select: { dataCelebracao: true } } } },
    },
    orderBy: { nome: 'asc' },
  })

  const result = musicians
    .map((m) => {
      const datas = m.scales.map((s) => s.scale.dataCelebracao)
      const noPeriodo = datas.filter((d) => d >= gte && d <= lte).length
      const ultimaVez = datas.length
        ? new Date(Math.max(...datas.map((d) => d.getTime())))
        : null
      return { musicianId: m.id, nome: m.nome, total: noPeriodo, ultimaVez }
    })
    .sort((a, b) => b.total - a.total)

  return res.json(result)
})

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const musician = await prisma.musician.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      ...include,
      availabilities: true,
      scales: {
        include: { scale: true, instrument: true },
        orderBy: { scale: { dataCelebracao: 'desc' } },
      },
    },
  })
  if (!musician) return res.status(404).json({ message: 'Músico não encontrado' })
  return res.json(musician)
})

router.patch('/:id', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id)
  const { nome, telefone, email, ativo, nivel, observacoes, instruments: instrumentIds, teams: teamIds } = req.body

  await prisma.instrumentMusician.deleteMany({ where: { musicianId: id } })
  await prisma.musicianTeam.deleteMany({ where: { musicianId: id } })

  const musician = await prisma.musician.update({
    where: { id },
    data: {
      nome,
      telefone: telefone ?? null,
      email: email ?? null,
      ativo: ativo ?? true,
      nivel: nivel ?? 'apto',
      observacoes: observacoes ?? null,
      instruments: {
        create: (instrumentIds as number[]).map((iid) => ({ instrumentId: iid })),
      },
      teams: teamIds?.length
        ? { create: (teamIds as number[]).map((tid) => ({ teamId: tid })) }
        : undefined,
    },
    include,
  })
  return res.json(musician)
})

router.delete('/:id', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  await prisma.musician.delete({ where: { id: Number(req.params.id) } })
  return res.status(204).send()
})

export default router
