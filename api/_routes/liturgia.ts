import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../_middleware/auth'
import { requireRole } from '../_middleware/roles'
import { fetchLiturgiaExterna, toLiturgiaCreateInput } from '../_lib/fetchLiturgia'

const router = Router()
const prisma = new PrismaClient()

function parseDataParam(raw: unknown): Date | null {
  if (typeof raw !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null
  const [ano, mes, dia] = raw.split('-').map(Number)
  const data = new Date(Date.UTC(ano, mes - 1, dia))
  return Number.isNaN(data.getTime()) ? null : data
}

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  if (typeof req.query.mes === 'string') {
    if (!/^\d{4}-\d{2}$/.test(req.query.mes)) {
      return res.status(422).json({ message: 'Informe o mês no formato YYYY-MM' })
    }
    const [ano, mes] = req.query.mes.split('-').map(Number)
    const inicio = new Date(Date.UTC(ano, mes - 1, 1))
    const fim = new Date(Date.UTC(ano, mes, 1))
    const liturgias = await prisma.liturgia.findMany({
      where: { data: { gte: inicio, lt: fim } },
      orderBy: { data: 'asc' },
    })
    return res.json(liturgias)
  }

  const data = parseDataParam(req.query.data)
  if (!data) {
    return res.status(422).json({ message: 'Informe a data no formato YYYY-MM-DD' })
  }

  let liturgia = await prisma.liturgia.findUnique({ where: { data } })
  if (!liturgia) {
    const buscada = await fetchLiturgiaExterna(data)
    if (!buscada) {
      return res.status(404).json({ message: 'Liturgia não disponível para esta data' })
    }
    liturgia = await prisma.liturgia.create({ data: toLiturgiaCreateInput(buscada) })
  }
  return res.json(liturgia)
})

router.patch('/:data', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const data = parseDataParam(req.params.data)
  if (!data) {
    return res.status(422).json({ message: 'Informe a data no formato YYYY-MM-DD' })
  }

  const {
    liturgia, cor, temGloria, temCredo, antifonaEntrada, coleta,
    primeiraLeitura, salmo, segundaLeitura, evangelho,
    oferendas, antifonaComunhao, oracaoComunhao,
  } = req.body

  const existente = await prisma.liturgia.findUnique({ where: { data } })
  const atualizado = await prisma.liturgia.upsert({
    where: { data },
    create: {
      data,
      liturgia: liturgia ?? existente?.liturgia ?? '',
      cor: cor ?? existente?.cor ?? 'Verde',
      temGloria: temGloria ?? false,
      temCredo: temCredo ?? false,
      antifonaEntrada, coleta, primeiraLeitura, salmo, segundaLeitura, evangelho,
      oferendas, antifonaComunhao, oracaoComunhao,
      editadoManualmente: true,
    },
    update: {
      ...(liturgia !== undefined && { liturgia }),
      ...(cor !== undefined && { cor }),
      ...(temGloria !== undefined && { temGloria }),
      ...(temCredo !== undefined && { temCredo }),
      ...(antifonaEntrada !== undefined && { antifonaEntrada }),
      ...(coleta !== undefined && { coleta }),
      ...(primeiraLeitura !== undefined && { primeiraLeitura }),
      ...(salmo !== undefined && { salmo }),
      ...(segundaLeitura !== undefined && { segundaLeitura }),
      ...(evangelho !== undefined && { evangelho }),
      ...(oferendas !== undefined && { oferendas }),
      ...(antifonaComunhao !== undefined && { antifonaComunhao }),
      ...(oracaoComunhao !== undefined && { oracaoComunhao }),
      editadoManualmente: true,
    },
  })
  return res.json(atualizado)
})

export default router
