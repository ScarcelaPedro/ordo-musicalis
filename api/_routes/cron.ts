import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { sendPushToServidores, formatDataCurta } from '../_lib/sendPush'
import { sendWhatsappToServidores } from '../_lib/sendWhatsapp'
import { hojeBrasilia } from '../_lib/date'
import { fetchLiturgiaExterna, toLiturgiaCreateInput } from '../_lib/fetchLiturgia'

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
      servidores: { where: { status: 'convidado', lembreteEnviadoEm: null } },
    },
  })

  let enviados = 0
  const idsLembrados: number[] = []

  for (const scale of scales) {
    const restantes = diasRestantes(scale.dataCelebracao, hojeMeiaNoite)
    if (restantes < 0 || restantes > scale.lembreteDiasAntes) continue

    for (const sm of scale.servidores) {
      await sendPushToServidores(prisma, [sm.servidorId], {
        title: 'Lembrete de confirmação',
        body: `Você ainda não confirmou presença em ${scale.celebracao} (${formatDataCurta(scale.dataCelebracao)}). Faltam ${restantes} dia(s).`,
        url: `/escalas/${scale.id}`,
      })
      await sendWhatsappToServidores(prisma, [sm.servidorId],
        `*Lembrete de confirmação* ⏰\nVocê ainda não confirmou presença em *${scale.celebracao}* (${formatDataCurta(scale.dataCelebracao)}). Faltam ${restantes} dia(s).`
      )
      idsLembrados.push(sm.id)
      enviados++
    }
  }

  if (idsLembrados.length) {
    await prisma.scaleServidor.updateMany({
      where: { id: { in: idsLembrados } },
      data: { lembreteEnviadoEm: new Date() },
    })
  }

  return res.json({ lembretesEnviados: enviados })
})

const DIAS_JANELA_LITURGIA = 60
// Limite de buscas externas sequenciais por execução, pra não estourar o timeout da function
// -- rodando diariamente, a janela inteira acaba preenchida em poucos dias mesmo assim.
const LIMITE_BUSCAS_POR_EXECUCAO = 20

router.get('/liturgia-sync', async (req: Request, res: Response) => {
  if (!verifyCronSecret(req, res)) return

  const hoje = hojeBrasilia()
  const datas: Date[] = []
  for (let i = 0; i < DIAS_JANELA_LITURGIA; i++) {
    const d = new Date(hoje)
    d.setUTCDate(d.getUTCDate() + i)
    datas.push(d)
  }

  const existentes = await prisma.liturgia.findMany({
    where: { data: { in: datas } },
    select: { data: true },
  })
  const jaSincronizadas = new Set(existentes.map((l) => l.data.toISOString().slice(0, 10)))
  const faltando = datas.filter((d) => !jaSincronizadas.has(d.toISOString().slice(0, 10)))

  let sincronizadas = 0
  let falhas = 0
  for (const data of faltando.slice(0, LIMITE_BUSCAS_POR_EXECUCAO)) {
    const buscada = await fetchLiturgiaExterna(data)
    if (!buscada) {
      falhas++
      continue
    }
    await prisma.liturgia.create({ data: toLiturgiaCreateInput(buscada) })
    sincronizadas++
  }

  return res.json({ sincronizadas, falhas, restantes: Math.max(0, faltando.length - LIMITE_BUSCAS_POR_EXECUCAO - falhas), janelaDias: DIAS_JANELA_LITURGIA })
})

export default router
