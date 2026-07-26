import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { sendPushToMusicians, formatDataCurta } from '../_lib/sendPush'
import { hojeBrasilia } from '../_lib/date'

const router = Router()
const prisma = new PrismaClient()

function verifyCronSecret(req: Request, res: Response): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    res.status(401).json({ message: 'Não autorizado' })
    return false
  }
  return true
}

function diasRestantes(data: Date, hojeMeiaNoite: Date): number {
  const msPorDia = 1000 * 60 * 60 * 24
  const dataUTC = Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate())
  return Math.round((dataUTC - hojeMeiaNoite.getTime()) / msPorDia)
}

router.get('/lembretes', async (req: Request, res: Response) => {
  if (!verifyCronSecret(req, res)) return

  const hojeMeiaNoite = hojeBrasilia()
  const limite = new Date(hojeMeiaNoite)
  limite.setUTCDate(limite.getUTCDate() + 30)

  const scales = await prisma.scale.findMany({
    where: { dataCelebracao: { gte: hojeMeiaNoite, lte: limite }, lembreteDiasAntes: { gt: 0 } },
    include: {
      musicians: { where: { status: 'convidado', lembreteEnviadoEm: null } },
    },
  })

  let enviados = 0
  const idsLembrados: number[] = []

  for (const scale of scales) {
    const restantes = diasRestantes(scale.dataCelebracao, hojeMeiaNoite)
    if (restantes < 0 || restantes > scale.lembreteDiasAntes) continue

    for (const sm of scale.musicians) {
      await sendPushToMusicians(prisma, [sm.musicianId], {
        title: 'Lembrete de confirmação',
        body: `Você ainda não confirmou presença em ${scale.celebracao} (${formatDataCurta(scale.dataCelebracao)}). Faltam ${restantes} dia(s).`,
        url: `/escalas/${scale.id}`,
      })
      idsLembrados.push(sm.id)
      enviados++
    }
  }

  if (idsLembrados.length) {
    await prisma.scaleMusician.updateMany({
      where: { id: { in: idsLembrados } },
      data: { lembreteEnviadoEm: new Date() },
    })
  }

  return res.json({ lembretesEnviados: enviados })
})

export default router
