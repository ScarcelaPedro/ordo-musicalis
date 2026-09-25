import { Router, Response, Request } from 'express'
import { PrismaClient } from '@prisma/client'
import { publicScaleSelect } from '../_lib/publicScaleSelect'

const router = Router()
const prisma = new PrismaClient()

router.get('/scales', async (req: Request, res: Response) => {
  const { mes, teamId, comunidadeId } = req.query as Record<string, string>
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

  const scales = await prisma.scale.findMany({
    where,
    select: publicScaleSelect,
    orderBy: { dataCelebracao: 'asc' },
  })
  return res.json(scales)
})

router.get('/comunidades', async (_req: Request, res: Response) => {
  const comunidades = await prisma.comunidade.findMany({
    where: { ativo: true },
    select: { id: true, nome: true },
    orderBy: { nome: 'asc' },
  })
  return res.json(comunidades)
})

export default router
