import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../_middleware/auth'
import { requireRole } from '../_middleware/roles'

const router = Router()
const prisma = new PrismaClient()

router.get('/resumo', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const { inicio, fim } = req.query as Record<string, string>
  const hoje = new Date()
  const gte = inicio ? new Date(inicio) : new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const lte = fim ? new Date(fim) : new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)

  const scales = await prisma.scale.findMany({
    where: { dataCelebracao: { gte, lte } },
    select: {
      id: true,
      team: { select: { id: true, nome: true } },
      musicians: { select: { status: true } },
    },
  })

  const substituicoesPendentes = await prisma.substituicao.count({
    where: { status: 'pendente', scaleMusician: { scale: { dataCelebracao: { gte, lte } } } },
  })

  let totalEscalacoes = 0
  let confirmadas = 0
  const porMinisterio = new Map<string, { teamId: number | null; nome: string; celebracoes: number; escalacoes: number; confirmadas: number }>()

  for (const scale of scales) {
    const key = scale.team ? String(scale.team.id) : 'sem-ministerio'
    const nome = scale.team?.nome ?? 'Sem ministério'
    if (!porMinisterio.has(key)) {
      porMinisterio.set(key, { teamId: scale.team?.id ?? null, nome, celebracoes: 0, escalacoes: 0, confirmadas: 0 })
    }
    const bucket = porMinisterio.get(key)!
    bucket.celebracoes += 1

    for (const sm of scale.musicians) {
      totalEscalacoes += 1
      bucket.escalacoes += 1
      if (sm.status === 'confirmado') {
        confirmadas += 1
        bucket.confirmadas += 1
      }
    }
  }

  const resumoMinisterios = Array.from(porMinisterio.values())
    .map((b) => ({
      ...b,
      taxaConfirmacao: b.escalacoes > 0 ? Math.round((b.confirmadas / b.escalacoes) * 100) : 0,
    }))
    .sort((a, b) => b.celebracoes - a.celebracoes)

  return res.json({
    periodo: { inicio: gte, fim: lte },
    totalCelebracoes: scales.length,
    totalEscalacoes,
    confirmadas,
    pendentesConfirmacao: totalEscalacoes - confirmadas,
    taxaConfirmacao: totalEscalacoes > 0 ? Math.round((confirmadas / totalEscalacoes) * 100) : 0,
    substituicoesPendentes,
    porMinisterio: resumoMinisterios,
  })
})

export default router
