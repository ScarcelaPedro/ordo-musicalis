// Scale team synchronization (TASK-0130, ADR-0009), shared by `PATCH /scales/:id` (staff, full
// edit) and `PUT /scales/:id/servidores` (team only, also for community coordinators) so both
// paths behave identically.
//
// Diff instead of delete-and-recreate: keeps the status (confirmed/declined/replaced) of whoever
// stays on the scale and only touches who joined or left.
import { PrismaClient, FuncaoLiturgica } from '@prisma/client'
import { sendPushToServidores, formatDataCurta } from './sendPush'
import { sendWhatsappToServidores } from './sendWhatsapp'

export interface ScaleServidorInput {
  servidorId: number
  instrumentId?: number | null
  teamId?: number | null
  categoriaId?: number | null
  funcaoLiturgica?: FuncaoLiturgica | null
}

export interface ScaleServidorDiff<E> {
  toAdd: ScaleServidorInput[]
  toRemove: E[]
  toUpdate: ScaleServidorInput[]
}

/** Pure diff by server id between what is stored and the list that was sent. */
export function diffScaleServidores<E extends { servidorId: number }>(existing: E[], next: ScaleServidorInput[]): ScaleServidorDiff<E> {
  const nextIds = new Set(next.map((s) => s.servidorId))
  const existingIds = new Set(existing.map((e) => e.servidorId))
  return {
    toAdd: next.filter((s) => !existingIds.has(s.servidorId)),
    toRemove: existing.filter((e) => !nextIds.has(e.servidorId)),
    toUpdate: next.filter((s) => existingIds.has(s.servidorId)),
  }
}

function assignmentData(s: ScaleServidorInput) {
  return {
    instrumentId: s.instrumentId ?? null,
    teamId: s.teamId ?? null,
    categoriaId: s.categoriaId ?? null,
    funcaoLiturgica: s.funcaoLiturgica ?? null,
  }
}

/** Applies the diff to the database and returns the ids of the servers that were added. */
export async function applyScaleServidores(prisma: PrismaClient, scaleId: number, next: ScaleServidorInput[]): Promise<number[]> {
  const existing = await prisma.scaleServidor.findMany({ where: { scaleId } })
  const { toAdd, toRemove, toUpdate } = diffScaleServidores(existing, next)

  if (toRemove.length) {
    await prisma.scaleServidor.deleteMany({ where: { id: { in: toRemove.map((r) => r.id) } } })
  }
  for (const s of toUpdate) {
    await prisma.scaleServidor.updateMany({ where: { scaleId, servidorId: s.servidorId }, data: assignmentData(s) })
  }
  if (toAdd.length) {
    await prisma.scaleServidor.createMany({
      data: toAdd.map((s) => ({ scaleId, servidorId: s.servidorId, ...assignmentData(s) })),
    })
  }
  return toAdd.map((s) => s.servidorId)
}

/** Push + WhatsApp to servers newly added to a scale (fire and forget, errors only logged). */
export function notifyAddedServidores(
  prisma: PrismaClient,
  scale: { id: number; celebracao: string; dataCelebracao: Date; horario: string },
  addedServidorIds: number[],
) {
  if (!addedServidorIds.length) return
  sendPushToServidores(prisma, addedServidorIds, {
    title: 'Nova escalação',
    body: `Você foi escalado(a) para ${scale.celebracao} em ${formatDataCurta(scale.dataCelebracao)} às ${scale.horario}`,
    url: `/escalas/${scale.id}`,
  }).catch((err) => console.error('push patch scale', err))
  sendWhatsappToServidores(prisma, addedServidorIds,
    `*Nova escalação* 🎵\nVocê foi escalado(a) para *${scale.celebracao}* em ${formatDataCurta(scale.dataCelebracao)} às ${scale.horario}.`
  ).catch((err) => console.error('whatsapp patch scale', err))
}
