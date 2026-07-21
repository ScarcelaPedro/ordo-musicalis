import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../_middleware/auth'

const router = Router()
const prisma = new PrismaClient()

router.get('/vapid-public-key', (_req: Request, res: Response) => {
  return res.json({ publicKey: process.env.VAPID_PUBLIC_KEY ?? null })
})

router.post('/subscribe', authenticate, async (req: AuthRequest, res: Response) => {
  const { endpoint, keys } = req.body as { endpoint: string; keys: { p256dh: string; auth: string } }
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(422).json({ message: 'Inscrição de push inválida' })
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { userId: req.user!.id, p256dh: keys.p256dh, auth: keys.auth },
    create: { userId: req.user!.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
  })
  return res.status(201).json({ ok: true })
})

router.delete('/subscribe', authenticate, async (req: AuthRequest, res: Response) => {
  const { endpoint } = req.body as { endpoint: string }
  if (!endpoint) return res.status(422).json({ message: 'Informe o endpoint' })

  await prisma.pushSubscription.deleteMany({ where: { endpoint, userId: req.user!.id } })
  return res.status(204).send()
})

export default router
