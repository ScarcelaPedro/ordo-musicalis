import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../_middleware/auth'
import { requireRole } from '../_middleware/roles'
import { partitionCoordinatorIds } from '../_lib/communityScope'

const router = Router()
const prisma = new PrismaClient()

router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  const comunidades = await prisma.comunidade.findMany({ orderBy: { nome: 'asc' } })
  return res.json(comunidades)
})

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const comunidade = await prisma.comunidade.findUnique({ where: { id: Number(req.params.id) } })
  if (!comunidade) return res.status(404).json({ message: 'Comunidade não encontrada' })
  return res.json(comunidade)
})

router.post('/', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { nome, endereco, ativo } = req.body
  if (!nome) {
    return res.status(422).json({ message: 'Informe o nome da comunidade' })
  }
  const comunidade = await prisma.comunidade.create({
    data: { nome, endereco: endereco ?? null, ativo: ativo ?? true },
  })
  return res.status(201).json(comunidade)
})

router.patch('/:id', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { nome, endereco, ativo } = req.body
  const comunidade = await prisma.comunidade.update({
    where: { id: Number(req.params.id) },
    data: { nome, endereco, ativo },
  })
  return res.json(comunidade)
})

router.delete('/:id', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  await prisma.comunidade.delete({ where: { id: Number(req.params.id) } })
  return res.status(204).send()
})

// Community coordinators (ADR-0009) -- admin only, so nobody can grant themselves access.
const coordinatorSelect = { servidor: { select: { id: true, nome: true, email: true, userId: true } } } as const

router.get('/:id/coordenadores', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const comunidadeId = Number(req.params.id)
  const comunidade = await prisma.comunidade.findUnique({ where: { id: comunidadeId }, select: { id: true } })
  if (!comunidade) return res.status(404).json({ message: 'Comunidade não encontrada' })

  const links = await prisma.comunidadeCoordenador.findMany({
    where: { comunidadeId },
    select: coordinatorSelect,
    orderBy: { servidor: { nome: 'asc' } },
  })
  return res.json(links.map((l) => l.servidor))
})

router.put('/:id/coordenadores', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const comunidadeId = Number(req.params.id)
  const comunidade = await prisma.comunidade.findUnique({ where: { id: comunidadeId }, select: { id: true } })
  if (!comunidade) return res.status(404).json({ message: 'Comunidade não encontrada' })

  const requested = (req.body as { servidorIds?: unknown }).servidorIds
  const requestedIds = Array.isArray(requested) ? requested.map(Number).filter(Number.isInteger) : []
  const eligible = await prisma.servidor.findMany({ where: { id: { in: requestedIds } }, select: { id: true, userId: true } })
  const { valid, invalid } = partitionCoordinatorIds(requested, eligible)
  if (invalid.length) {
    return res.status(422).json({ message: 'Só servidores com acesso ao sistema (login) podem coordenar uma comunidade.', invalid })
  }

  // Replace the whole set atomically: the screen always sends the full list.
  await prisma.$transaction([
    prisma.comunidadeCoordenador.deleteMany({ where: { comunidadeId, servidorId: { notIn: valid } } }),
    prisma.comunidadeCoordenador.createMany({
      data: valid.map((servidorId) => ({ comunidadeId, servidorId })),
      skipDuplicates: true,
    }),
  ])

  const links = await prisma.comunidadeCoordenador.findMany({
    where: { comunidadeId },
    select: coordinatorSelect,
    orderBy: { servidor: { nome: 'asc' } },
  })
  return res.json(links.map((l) => l.servidor))
})

export default router
