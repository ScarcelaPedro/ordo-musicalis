import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../_middleware/auth'
import { requireRole } from '../_middleware/roles'
import { requireTeamOwnership } from '../_middleware/teamScope'

const router = Router()
const prisma = new PrismaClient()

// TODO(Fase 1): remover quando o formulário de Equipe ganhar o seletor de Categoria -- até lá,
// toda equipe criada sem categoriaId explícito cai em "Música", pra não quebrar o fluxo atual.
async function defaultCategoriaId(): Promise<number> {
  const musica = await prisma.categoriaFuncao.findFirst({ where: { nome: 'Música' } })
  if (!musica) throw new Error('Categoria padrão "Música" não encontrada')
  return musica.id
}

router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  const teams = await prisma.team.findMany({
    include: { _count: { select: { servidores: true } }, responsavel: { select: { id: true, nome: true } }, categoria: true },
    orderBy: { nome: 'asc' },
  })
  return res.json(teams)
})

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const team = await prisma.team.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      servidores: {
        include: { servidor: { select: { id: true, nome: true } } },
      },
      responsavel: { select: { id: true, nome: true } },
      categoria: true,
      scaleTemplates: {
        where: { ativo: true },
        orderBy: [{ diaSemana: 'asc' }, { horario: 'asc' }],
      },
    },
  })
  if (!team) return res.status(404).json({ message: 'Equipe não encontrada' })
  return res.json(team)
})

router.post('/', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { nome, descricao, ativo, responsavelId, categoriaId, servidores } = req.body

  const team = await prisma.team.create({
    data: {
      nome,
      descricao,
      ativo: ativo ?? true,
      responsavelId: responsavelId ?? null,
      categoriaId: categoriaId ? Number(categoriaId) : await defaultCategoriaId(),
    },
  })

  if (Array.isArray(servidores) && servidores.length > 0) {
    await prisma.servidorMinisterio.createMany({
      data: (servidores as { servidorId: number; funcao?: string }[]).map((s) => ({
        servidorId: s.servidorId,
        teamId: team.id,
        funcao: s.funcao ?? null,
      })),
      skipDuplicates: true,
    })
  }

  return res.status(201).json(team)
})

router.patch('/:id', authenticate, requireRole('admin', 'coordenador'), requireTeamOwnership(async (req) => Number(req.params.id)), async (req: AuthRequest, res: Response) => {
  const { nome, descricao, ativo, responsavelId, categoriaId, servidores } = req.body
  const teamId = Number(req.params.id)

  const team = await prisma.team.update({
    where: { id: teamId },
    data: {
      nome,
      descricao,
      ativo,
      responsavelId: responsavelId ?? null,
      ...(categoriaId !== undefined ? { categoriaId: Number(categoriaId) } : {}),
    },
  })

  if (Array.isArray(servidores)) {
    await prisma.servidorMinisterio.deleteMany({ where: { teamId } })
    if (servidores.length > 0) {
      await prisma.servidorMinisterio.createMany({
        data: (servidores as { servidorId: number; funcao?: string }[]).map((s) => ({
          servidorId: s.servidorId,
          teamId,
          funcao: s.funcao ?? null,
        })),
        skipDuplicates: true,
      })
    }
  }

  return res.json(team)
})

router.delete('/:id', authenticate, requireRole('admin', 'coordenador'), requireTeamOwnership(async (req) => Number(req.params.id)), async (req: AuthRequest, res: Response) => {
  await prisma.team.delete({ where: { id: Number(req.params.id) } })
  return res.status(204).send()
})

export default router
