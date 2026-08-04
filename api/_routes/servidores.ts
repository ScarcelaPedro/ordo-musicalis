import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../_middleware/auth'
import { requireRole } from '../_middleware/roles'

const router = Router()
const prisma = new PrismaClient()

const include = {
  instruments: { include: { instrument: true } },
  teams: { include: { team: true } },
  categorias: { include: { categoria: true } },
}

router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  const { search, instrument } = _req.query as Record<string, string>
  const servidores = await prisma.servidor.findMany({
    where: {
      ...(search ? { nome: { contains: search, mode: 'insensitive' } } : {}),
      ...(instrument
        ? { instruments: { some: { instrument: { nome: { contains: instrument, mode: 'insensitive' } } } } }
        : {}),
    },
    include,
    orderBy: { nome: 'asc' },
  })
  return res.json(servidores)
})

router.post('/', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { nome, telefone, email, ativo, nivel, observacoes, instruments: instrumentIds, teams, categorias } = req.body

  const servidor = await prisma.servidor.create({
    data: {
      nome,
      telefone: telefone ?? null,
      email: email ?? null,
      ativo: ativo ?? true,
      nivel: nivel ?? 'apto',
      observacoes: observacoes ?? null,
      instruments: {
        create: ((instrumentIds ?? []) as number[]).map((id) => ({ instrumentId: id })),
      },
      teams: teams?.length
        ? {
            create: (teams as { teamId: number; funcao?: string }[]).map((t) => ({
              teamId: t.teamId,
              funcao: t.funcao ?? null,
            })),
          }
        : undefined,
      categorias: categorias?.length
        ? { create: (categorias as number[]).map((categoriaId) => ({ categoriaId })) }
        : undefined,
    },
    include,
  })
  return res.status(201).json(servidor)
})

router.get('/intensidade', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { inicio, fim } = req.query as Record<string, string>
  const hoje = new Date()
  const gte = inicio ? new Date(inicio) : new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const lte = fim ? new Date(fim) : new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)

  const servidores = await prisma.servidor.findMany({
    where: { ativo: true },
    select: {
      id: true,
      nome: true,
      scales: { select: { scale: { select: { dataCelebracao: true } } } },
    },
    orderBy: { nome: 'asc' },
  })

  const result = servidores
    .map((s) => {
      const datas = s.scales.map((sc) => sc.scale.dataCelebracao)
      const noPeriodo = datas.filter((d) => d >= gte && d <= lte).length
      const ultimaVez = datas.length
        ? new Date(Math.max(...datas.map((d) => d.getTime())))
        : null
      return { servidorId: s.id, nome: s.nome, total: noPeriodo, ultimaVez }
    })
    .sort((a, b) => b.total - a.total)

  return res.json(result)
})

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const servidor = await prisma.servidor.findUnique({
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
  if (!servidor) return res.status(404).json({ message: 'Servidor não encontrado' })
  return res.json(servidor)
})

router.patch('/:id', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id)
  const { nome, telefone, email, ativo, nivel, observacoes, instruments: instrumentIds, teams, categorias } = req.body

  await prisma.instrumentServidor.deleteMany({ where: { servidorId: id } })
  await prisma.servidorMinisterio.deleteMany({ where: { servidorId: id } })
  await prisma.servidorCategoria.deleteMany({ where: { servidorId: id } })

  const servidor = await prisma.servidor.update({
    where: { id },
    data: {
      nome,
      telefone: telefone ?? null,
      email: email ?? null,
      ativo: ativo ?? true,
      nivel: nivel ?? 'apto',
      observacoes: observacoes ?? null,
      instruments: {
        create: ((instrumentIds ?? []) as number[]).map((iid) => ({ instrumentId: iid })),
      },
      teams: teams?.length
        ? {
            create: (teams as { teamId: number; funcao?: string }[]).map((t) => ({
              teamId: t.teamId,
              funcao: t.funcao ?? null,
            })),
          }
        : undefined,
      categorias: categorias?.length
        ? { create: (categorias as number[]).map((categoriaId) => ({ categoriaId })) }
        : undefined,
    },
    include,
  })
  return res.json(servidor)
})

router.delete('/:id', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  await prisma.servidor.delete({ where: { id: Number(req.params.id) } })
  return res.status(204).send()
})

export default router
