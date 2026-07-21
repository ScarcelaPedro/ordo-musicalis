import webpush from 'web-push'
import { PrismaClient } from '@prisma/client'

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
const vapidConfigured = Boolean(vapidPublicKey && vapidPrivateKey)

if (vapidConfigured) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? 'mailto:admin@example.com',
    vapidPublicKey!,
    vapidPrivateKey!
  )
}

export interface PushPayload {
  title: string
  body: string
  url?: string
}

export function formatDataCurta(d: Date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(d)
}

export async function sendPushToUsers(prisma: PrismaClient, userIds: number[], payload: PushPayload) {
  if (!vapidConfigured || !userIds.length) return

  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId: { in: userIds } } })

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        )
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
        } else {
          console.error('Falha ao enviar push:', err?.statusCode, err?.body ?? err)
        }
      }
    })
  )
}

export async function sendPushToMusicians(prisma: PrismaClient, musicianIds: number[], payload: PushPayload) {
  if (!vapidConfigured || !musicianIds.length) return
  const musicians = await prisma.musician.findMany({
    where: { id: { in: musicianIds }, userId: { not: null } },
    select: { userId: true },
  })
  await sendPushToUsers(prisma, musicians.map((m) => m.userId!), payload)
}

export async function sendPushToStaff(prisma: PrismaClient, teamId: number | null, payload: PushPayload) {
  if (!vapidConfigured) return
  const admins = await prisma.user.findMany({ where: { role: 'admin' }, select: { id: true } })
  const userIds = new Set(admins.map((a) => a.id))

  if (teamId) {
    const team = await prisma.team.findUnique({ where: { id: teamId }, select: { responsavel: { select: { userId: true } } } })
    if (team?.responsavel?.userId) userIds.add(team.responsavel.userId)
  }

  await sendPushToUsers(prisma, Array.from(userIds), payload)
}
