import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  const instruments = await prisma.instrument.findMany({ orderBy: { nome: 'asc' } })
  return res.json(instruments)
})

export default router
